import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { AppError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";
import { repositoryFetcherService } from "./repository-fetcher.service.js";
import { graphifyService } from "./graphify.service.js";
import { groqSynthesisService } from "./groq.service.js";

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
      analysis = await prisma.repository_analysis.create({
        data: {
          matchId,
          status: "QUEUED"
        }
      });
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
          implementationApproach: "1. Reproduce the issue locally\\n2. Trace the behavior through the relevant files\\n3. Identify the required change\\n4. Implement and test your fix",
          knowledgeGaps: []
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
