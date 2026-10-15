import { Worker, Job } from "bullmq";
import { redis } from "../redis/index.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { prisma } from "../prisma/prisma.client.js";

/**
 * Worker to process repository analysis jobs with controlled concurrency.
 * Ensures maximum 2 analyses (1 in development) run in parallel, preventing
 * memory exhaustion and AI rate-limiting.
 */
export function startAnalysisWorker() {
  const concurrency = env.NODE_ENV === "development" ? 1 : 2;

  const worker = new Worker(
    "repository-analysis",
    async (job: Job) => {
      const { analysisId, matchId } = job.data;
      logger.info(`Starting analysis job ${job.id}`, { analysisId, matchId });

      const match = await prisma.issue_match.findUnique({
        where: { id: matchId },
        include: { githubIssue: true, analysis: true, user: { include: { profile: true } } },
      });

      if (!match) {
        logger.error(`Match ${matchId} not found for analysis ${analysisId}`);
        await prisma.repository_analysis.update({
          where: { id: analysisId },
          data: { status: "FAILED", error: "Match record not found." },
        });
        return;
      }

      const { analysisService } = await import("../../modules/analysis/analysis.service.js");
      await analysisService.runAnalysisPipeline(analysisId, match);
    },
    {
      connection: redis,
      prefix: `{stackaudit_${env.NODE_ENV}}`,
      concurrency,
      drainDelay: 60, // Wait 60s when queue is empty (conserves serverless Redis requests)
      stalledInterval: 300000, // 5 minutes
      limiter: {
        max: 2,
        duration: 2000,
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info("Analysis job completed successfully", { jobId: job?.id });
  });

  worker.on("failed", (job, err) => {
    logger.error("Analysis job failed in worker", {
      jobId: job?.id,
      error: err.message,
    });
  });

  worker.on("error", (err: any) => {
    logger.warn("Analysis worker Redis connection warning", { error: err.message });
  });

  logger.info(`Repository analysis worker started with concurrency: ${concurrency}`, {
    module: "queue",
  });

  return worker;
}
