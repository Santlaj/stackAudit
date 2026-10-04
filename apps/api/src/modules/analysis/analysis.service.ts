import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { redis } from "../../infrastructure/redis/redis.client.js";
import { AppError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";
import { repositoryFetcherService } from "./repository-fetcher.service.js";
import { graphifyService } from "./graphify.service.js";
import { groqSynthesisService } from "./groq.service.js";
import { discoveryService } from "../discovery/discovery.service.js";

export class AnalysisService {
  /**
   * Triggers or instantly resolves the repository analysis pipeline for a given issue match.
   * Utilizes global multi-tier caching (Redis + PostgreSQL) so any issue analyzed once
   * is instantly accessible across all users with 0 redundant AI calls.
   */
  async startAnalysis(matchId: string, userId: string) {
    logger.info(`Starting analysis request for match: ${matchId}`);

    const match = await prisma.issue_match.findUnique({
      where: { id: matchId },
      include: { githubIssue: true, analysis: true, user: { include: { profile: true } } },
    });

    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    if (match.userId !== userId) throw new AppError("Unauthorized", 403, "UNAUTHORIZED");

    // 1. If THIS user's match already has a completed analysis, return it immediately
    if (match.analysis && match.analysis.status === "COMPLETED") {
      return match.analysis;
    }

    // 2. If an analysis for this match is already actively executing, return it
    if (match.analysis && !["FAILED", "NOT_STARTED", "COMPLETED"].includes(match.analysis.status)) {
      return match.analysis;
    }

    // ─── TIER 1 & TIER 2: GLOBAL ISSUE CACHE CHECK ───────────────────
    const issueCacheKey = `cache:analysis:issue:${match.repository}#${match.issueNumber}`;
    let cachedData: { context: any; commitSha?: string | null } | null = null;

    // Check Redis (Tier 1)
    try {
      const rawRedis = await redis.get(issueCacheKey);
      if (rawRedis) {
        cachedData = JSON.parse(rawRedis);
        logger.info(`⚡ Global Cache HIT (Redis): Instant analysis for ${match.repository}#${match.issueNumber}`);
      }
    } catch (e: any) {
      logger.warn("Redis cache read skipped/failed", { error: e.message });
    }

    // Check PostgreSQL across all users (Tier 2)
    if (!cachedData) {
      try {
        const globalCompleted = await prisma.repository_analysis.findFirst({
          where: {
            match: {
              repository: match.repository,
              issueNumber: match.issueNumber,
            },
            status: "COMPLETED",
          },
          select: {
            context: true,
            commitSha: true,
          },
          orderBy: { completedAt: "desc" },
        });

        if (globalCompleted && globalCompleted.context) {
          cachedData = {
            context: globalCompleted.context,
            commitSha: globalCompleted.commitSha,
          };
          logger.info(`⚡ Global Cache HIT (DB): Instant analysis for ${match.repository}#${match.issueNumber}`);

          // Populate Redis for 7 days
          redis
            .setex(issueCacheKey, 60 * 60 * 24 * 7, JSON.stringify(cachedData))
            .catch(() => {});
        }
      } catch (dbErr: any) {
        logger.warn("DB global analysis lookup failed", { error: dbErr.message });
      }
    }

    // If cached analysis was found anywhere globally:
    if (cachedData && cachedData.context) {
      const savedAnalysis = await prisma.repository_analysis.upsert({
        where: { matchId },
        create: {
          matchId,
          status: "COMPLETED",
          context: cachedData.context,
          commitSha: cachedData.commitSha ?? null,
          completedAt: new Date(),
        },
        update: {
          status: "COMPLETED",
          context: cachedData.context,
          commitSha: cachedData.commitSha ?? null,
          completedAt: new Date(),
          error: null,
        },
      });

      try {
        await discoveryService.establishAnalyzedStatus(matchId);
      } catch {}

      return savedAnalysis;
    }

    // ─── TIER 3: IN-FLIGHT DEDUPLICATION ──────────────────────────────
    // Check if another user already has an active pipeline running for this exact issue
    const inFlightPipeline = await prisma.repository_analysis.findFirst({
      where: {
        match: {
          repository: match.repository,
          issueNumber: match.issueNumber,
        },
        status: {
          in: [
            "QUEUED",
            "REPOSITORY_LOADING",
            "REPOSITORY_LOADED",
            "GRAPH_BUILDING",
            "ARCHITECTURE_ANALYZED",
            "RELEVANT_FILES_IDENTIFIED",
            "CONTEXT_SYNTHESIZED",
          ],
        },
      },
    });

    let analysis = match.analysis;
    if (!analysis) {
      try {
        analysis = await prisma.repository_analysis.create({
          data: {
            matchId,
            status: "QUEUED",
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          analysis = await prisma.repository_analysis.findUnique({ where: { matchId } });
          return analysis!;
        }
        throw error;
      }
    } else {
      analysis = await prisma.repository_analysis.update({
        where: { id: analysis.id },
        data: { status: "QUEUED", error: null },
      });
    }

    // If an analysis pipeline is already in progress elsewhere for this exact issue,
    // don't launch a duplicate pipeline — the active one will sync to this record on completion.
    if (inFlightPipeline) {
      logger.info(`Attached to existing in-flight pipeline for ${match.repository}#${match.issueNumber}`);
      return analysis;
    }

    // Run pipeline in background for this newly discovered issue
    this.runAnalysisPipeline(analysis.id, match).catch((err) => {
      logger.error(`Analysis pipeline crashed heavily for ${analysis.id}`, { error: err.message });
      prisma.repository_analysis
        .update({
          where: { id: analysis.id },
          data: { status: "FAILED", error: "Internal pipeline crash" },
        })
        .catch((e: any) => logger.error("Failed to mark analysis as FAILED", e));
    });

    return analysis;
  }

  private async updateStatus(analysisId: string, status: string, additionalData: any = {}) {
    logger.info(`Analysis ${analysisId} status: ${status}`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.repository_analysis.update({
          where: { id: analysisId },
          data: { status, ...additionalData },
        });
        return;
      } catch (err: any) {
        logger.warn(`Failed to update status on attempt ${attempt}: ${err.message}`);
        if (attempt === 3) throw err;
        await prisma.$connect().catch(() => {});
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
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
      // 1. Fetch Repository (with graceful fallback for massive repos like Kibana)
      await this.updateStatus(analysisId, "REPOSITORY_LOADING");
      try {
        tempDir = await repositoryFetcherService.fetchRepository(owner, repo);
        await this.updateStatus(analysisId, "REPOSITORY_LOADED");
      } catch (fetchErr: any) {
        logger.warn(`Git clone failed or repo too large for ${owner}/${repo}: ${fetchErr.message}. Proceeding with issue-level semantic analysis.`);
      }

      // 2. Build Graph & Extract Context (or graceful fallback)
      let graphifyContext = {
        architectureContext: `Repository: ${owner}/${repo}`,
        relevantFiles: [] as any[],
        rawOutput: "Repository source analysis conducted at issue scope.",
      };

      if (tempDir) {
        try {
          await this.updateStatus(analysisId, "GRAPH_BUILDING");
          await graphifyService.buildGraph(tempDir);
          await this.updateStatus(analysisId, "ARCHITECTURE_ANALYZED");

          graphifyContext = await graphifyService.extractContext(tempDir, issue.title, issue.body || "");
          await this.updateStatus(analysisId, "RELEVANT_FILES_IDENTIFIED");
        } catch (graphErr: any) {
          logger.warn(`Graph building failed for ${owner}/${repo}: ${graphErr.message}, proceeding with fallback context.`);
        }
      }

      // 4. Synthesize AI Explanation via Fallback Chain
      const profileStr = JSON.stringify({
        observedLanguages: match.user.profile?.observedLanguages,
        currentFocus: match.user.profile?.currentFocus,
        preferredComplexity: match.user.profile?.preferredComplexity,
      });
      const matchDataStr = JSON.stringify({
        matchScore: match.matchScore,
        complexity: match.complexity,
        contributionType: match.contributionType,
        reasons: match.reasons,
        gaps: match.gaps,
        missingSignals: match.missingSignals,
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
        logger.warn(`AI synthesis failed across chain, providing fallback synthesis.`, { error: err.message });
        groqContext = {
          whyFilesMatter:
            "We were unable to generate AI insights for these files at this time, but they have been identified as relevant by structural analysis.",
          whatToUnderstandFirst: "Review the identified relevant files and the issue description.",
          implementationApproach:
            "1. Understand: Grasp the issue report and expected behavior\n2. Trace: Locate relevant code in repository\n3. Identify: Compare input against code expectations\n4. Plan: Formulate smallest safe change\n5. Validate: Run verification tests and prepare PR",
          knowledgeGaps: [],
          guideSteps: {
            understand: {
              title: "Understand the issue",
              guidance: "Review the issue description and system behavior to understand the reported problem.",
              goal: "Understand the problem and user-visible behavior before inspecting the implementation.",
              investigationQuestion: "What specific behavior is failing or requested in the issue report?",
            },
            trace: {
              title: "Trace the behavior",
              guidance: "Locate where the relevant behavior is handled in the codebase.",
              goal: "Follow the call chain through identified source files to pinpoint where the logic branches.",
              investigationQuestion: "Which function or module handles this behavior according to the repository structure?",
              evidence: [],
            },
            identify: {
              title: "Identify the failure",
              guidance: "Compare actual inputs with code assumptions to isolate the defect.",
              goal: "Isolate the exact condition or incorrect assumption causing the issue.",
              investigationQuestion: "What assumption does the current code make that fails on the reported case?",
              evidence: [],
            },
            plan: {
              title: "Plan the change",
              guidance: "Design the smallest safe change and determine required tests.",
              goal: "Formulate a minimal, backwards-compatible change without breaking existing behavior.",
              investigationQuestions: [
                "What is the smallest behavior that needs to change?",
                "What existing behavior must remain unchanged?",
              ],
            },
            validate: {
              title: "Validate your contribution",
              guidance: "Run the project tests and prepare a clear Pull Request description.",
              goal: "Prove your contribution works and passes repository verification checks.",
              commands: [],
              doneCriteria: [
                "The affected case behaves correctly",
                "Existing tests pass without regressions",
                "PR description explains the problem, investigation, change, and validation",
              ],
            },
          },
        };
        await this.updateStatus(analysisId, "CONTEXT_SYNTHESIZED", {
          error: "AI synthesis unavailable. Showing structural context only.",
        });
      }

      // 5. Complete
      const fullContext = {
        graphify: graphifyContext,
        synthesis: groqContext,
      };

      await this.updateStatus(analysisId, "COMPLETED", {
        completedAt: new Date(),
        context: fullContext,
      });

      // Populate Redis Global Cache (7-day TTL)
      const issueCacheKey = `cache:analysis:issue:${match.repository}#${match.issueNumber}`;
      redis
        .setex(
          issueCacheKey,
          60 * 60 * 24 * 7,
          JSON.stringify({
            context: fullContext,
            commitSha: null,
          })
        )
        .catch(() => {});

      // Synchronize any other users waiting on the exact same issue
      await this.syncSiblingAnalyses(match.repository, match.issueNumber, fullContext);

      // Establish ANALYZED status for this match
      try {
        await discoveryService.establishAnalyzedStatus(match.id);
      } catch (err: any) {
        logger.warn(`Failed to update issue_match status to ANALYZED for match ${match.id}`, {
          error: err.message,
        });
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
   * Synchronizes all sibling matches for the same repository and issueNumber
   * that were waiting on an in-flight analysis pipeline.
   */
  private async syncSiblingAnalyses(repository: string, issueNumber: number, context: any) {
    try {
      const pendingSiblings = await prisma.repository_analysis.findMany({
        where: {
          match: {
            repository,
            issueNumber,
          },
          status: { not: "COMPLETED" },
        },
        select: { id: true, matchId: true },
      });

      for (const sibling of pendingSiblings) {
        await prisma.repository_analysis.update({
          where: { id: sibling.id },
          data: {
            status: "COMPLETED",
            context,
            completedAt: new Date(),
            error: null,
          },
        });
        try {
          await discoveryService.establishAnalyzedStatus(sibling.matchId);
        } catch {}
      }

      if (pendingSiblings.length > 0) {
        logger.info(`Synchronized ${pendingSiblings.length} sibling analysis records for ${repository}#${issueNumber}`);
      }
    } catch (e: any) {
      logger.warn("Failed to sync sibling analyses", { error: e.message });
    }
  }

  /**
   * Retrieves the current analysis state.
   */
  async getAnalysisState(matchId: string, userId: string) {
    const match = await prisma.issue_match.findUnique({
      where: { id: matchId },
      include: { analysis: true },
    });

    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    if (match.userId !== userId) throw new AppError("Unauthorized", 403, "UNAUTHORIZED");

    return match.analysis;
  }
}

export const analysisService = new AnalysisService();
