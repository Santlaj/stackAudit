import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { AppError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";
import { repositoryFetcherService } from "./repository-fetcher.service.js";
import { graphifyService } from "./graphify.service.js";
import { groqSynthesisService } from "./groq.service.js";
import { discoveryService } from "../discovery/discovery.service.js";

export class AnalysisService {
  /**
   * Triggers the repository analysis pipeline for a given issue match.
   */
  async startAnalysis(matchId: string, userId: string) {
    logger.info(`Starting analysis for match: ${matchId}`);

    const match = await prisma.issue_match.findUnique({
      where: { id: matchId },
      include: { githubIssue: true, analysis: true, user: { include: { profile: true } } }
    });

    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    if (match.userId !== userId) throw new AppError("Unauthorized", 403, "UNAUTHORIZED");

    // Simple cache validation: if already completed and we don't strictly need a new commit SHA yet
    if (match.analysis && match.analysis.status === "COMPLETED") {
      return match.analysis;
    }

    if (match.analysis && !["FAILED", "NOT_STARTED", "COMPLETED"].includes(match.analysis.status)) {
      // Already running
      return match.analysis;
    }

    let analysis = match.analysis;
    if (!analysis) {
      try {
        analysis = await prisma.repository_analysis.create({
          data: {
            matchId,
            status: "QUEUED"
          }
        });
      } catch (error: any) {
        // P2002: Unique constraint failed
        if (error.code === 'P2002') {
          // A concurrent request (like React StrictMode double-fire) already created it.
          // Fetch the existing analysis and return it without spawning a duplicate pipeline.
          analysis = await prisma.repository_analysis.findUnique({ where: { matchId } });
          return analysis!;
        }
        throw error;
      }
    } else {
      analysis = await prisma.repository_analysis.update({
        where: { id: analysis.id },
        data: { status: "QUEUED", error: null }
      });
    }

    // Run pipeline in background
    this.runAnalysisPipeline(analysis.id, match).catch(err => {
      logger.error(`Analysis pipeline crashed heavily for ${analysis.id}`, { error: err.message });
      prisma.repository_analysis.update({
        where: { id: analysis.id },
        data: { status: "FAILED", error: "Internal pipeline crash" }
      }).catch((e: any) => logger.error("Failed to mark analysis as FAILED", e));
    });

    return analysis;
  }

  private async updateStatus(analysisId: string, status: string, additionalData: any = {}) {
    logger.info(`Analysis ${analysisId} status: ${status}`);
    await prisma.repository_analysis.update({
      where: { id: analysisId },
      data: { status, ...additionalData }
    });
  }

  private async runAnalysisPipeline(analysisId: string, match: any) {
    const issue = match.githubIssue;
    if (!issue) {
      await this.updateStatus(analysisId, "FAILED", { error: "No github issue linked." });
      return;
    }

    const [owner, repo] = match.repository.split("/");
    let tempDir = null;

    try {
      // 1. Fetch Repository
      await this.updateStatus(analysisId, "REPOSITORY_LOADING");
      // Note: for P3, we skip fetching a specific commitSha unless provided, 
      // relying on default branch head for speed.
      tempDir = await repositoryFetcherService.fetchRepository(owner, repo);
      await this.updateStatus(analysisId, "REPOSITORY_LOADED");

      // 2. Build Graph
      await this.updateStatus(analysisId, "GRAPH_BUILDING");
      await graphifyService.buildGraph(tempDir);
      await this.updateStatus(analysisId, "ARCHITECTURE_ANALYZED");

      // 3. Extract Factual Context
      const graphifyContext = await graphifyService.extractContext(tempDir, issue.title, issue.body || "");
      await this.updateStatus(analysisId, "RELEVANT_FILES_IDENTIFIED");

      // 4. Synthesize AI Explanation
      const profileStr = JSON.stringify({
        observedLanguages: match.user.profile?.observedLanguages,
        currentFocus: match.user.profile?.currentFocus,
        preferredComplexity: match.user.profile?.preferredComplexity
      });
      const matchDataStr = JSON.stringify({
        matchScore: match.matchScore,
        complexity: match.complexity,
        contributionType: match.contributionType,
        reasons: match.reasons,
        gaps: match.gaps,
        missingSignals: match.missingSignals
      });

      let groqContext: any;
      try {
        groqContext = await groqSynthesisService.synthesizeContext(
          issue.title,
          issue.body || "",
          graphifyContext,
          profileStr,
          matchDataStr,
          issue.id
        );
        await this.updateStatus(analysisId, "CONTEXT_SYNTHESIZED");
      } catch (err: any) {
        logger.warn(`Groq synthesis failed, providing fallback synthesis.`, { error: err.message });
        groqContext = {
          whyFilesMatter: "We were unable to generate AI insights for these files at this time, but they have been identified as relevant by structural analysis.",
          whatToUnderstandFirst: "Review the identified relevant files and the issue description.",
          implementationApproach: "1. Understand: Grasp the issue report and expected behavior\n2. Trace: Locate relevant code in repository\n3. Identify: Compare input against code expectations\n4. Plan: Formulate smallest safe change\n5. Validate: Run verification tests and prepare PR",
          knowledgeGaps: [],
          guideSteps: {
            understand: {
              title: "Understand the issue",
              guidance: "Review the issue description and system behavior to understand the reported problem.",
              goal: "Understand the problem and user-visible behavior before inspecting the implementation.",
              investigationQuestion: "What specific behavior is failing or requested in the issue report?"
            },
            trace: {
              title: "Trace the behavior",
              guidance: "Locate where the relevant behavior is handled in the codebase.",
              goal: "Follow the call chain through identified source files to pinpoint where the logic branches.",
              investigationQuestion: "Which function or module handles this behavior according to the repository structure?",
              evidence: []
            },
            identify: {
              title: "Identify the failure",
              guidance: "Compare actual inputs with code assumptions to isolate the defect.",
              goal: "Isolate the exact condition or incorrect assumption causing the issue.",
              investigationQuestion: "What assumption does the current code make that fails on the reported case?",
              evidence: []
            },
            plan: {
              title: "Plan the change",
              guidance: "Design the smallest safe change and determine required tests.",
              goal: "Formulate a minimal, backwards-compatible change without breaking existing behavior.",
              investigationQuestions: [
                "What is the smallest behavior that needs to change?",
                "What existing behavior must remain unchanged?"
              ]
            },
            validate: {
              title: "Validate your contribution",
              guidance: "Run the project tests and prepare a clear Pull Request description.",
              goal: "Prove your contribution works and passes repository verification checks.",
              commands: [],
              doneCriteria: [
                "The affected case behaves correctly",
                "Existing tests pass without regressions",
                "PR description explains the problem, investigation, change, and validation"
              ]
            }
          }
        };
        await this.updateStatus(analysisId, "CONTEXT_SYNTHESIZED", { error: "AI synthesis unavailable. Showing structural context only." });
      }

      // 5. Complete
      await this.updateStatus(analysisId, "COMPLETED", {
        completedAt: new Date(),
        context: {
          graphify: graphifyContext,
          synthesis: groqContext
        }
      });

      // Trusted internal path: establish ANALYZED status without exposing it to client-facing endpoints
      try {
        await discoveryService.establishAnalyzedStatus(match.id);
      } catch (err: any) {
        logger.warn(`Failed to update issue_match status to ANALYZED for match ${match.id}`, { error: err.message });
      }

    } catch (error: any) {
      logger.error(`Analysis failed for ${analysisId}`, { error: error.message });
      await this.updateStatus(analysisId, "FAILED", { error: error.message });
    } finally {
      if (tempDir) {
        await repositoryFetcherService.cleanup(tempDir);
      }
    }
  }

  /**
   * Retrieves the current analysis state.
   */
  async getAnalysisState(matchId: string, userId: string) {
    const match = await prisma.issue_match.findUnique({
      where: { id: matchId },
      include: { analysis: true }
    });

    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    if (match.userId !== userId) throw new AppError("Unauthorized", 403, "UNAUTHORIZED");

    return match.analysis;
  }
}

export const analysisService = new AnalysisService();
