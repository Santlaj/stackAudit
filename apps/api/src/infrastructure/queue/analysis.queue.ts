import { Queue } from "bullmq";
import { redis } from "../redis/index.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

/**
 * Repository Analysis Queue
 * 
 * Manages background repository cloning, Graphify context extraction,
 * and AI synthesis with controlled concurrency to prevent CPU spikes and rate limit exhaustion.
 */
export const analysisQueue = new Queue("repository-analysis", {
  connection: redis,
  prefix: `{stackaudit_${env.NODE_ENV}}`,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 20 },
  },
});

logger.info("Repository analysis queue initialized", { module: "queue" });

/**
 * Enqueue a repository analysis job with controlled concurrency.
 */
export async function enqueueAnalysisJob(analysisId: string, matchId: string) {
  const jobId = `analysis-${analysisId}`;
  await analysisQueue.add(
    "run-analysis",
    { analysisId, matchId },
    {
      jobId,
      removeOnComplete: true,
    }
  );
  logger.info(`Enqueued repository analysis job for analysisId: ${analysisId}`, {
    analysisId,
    matchId,
    jobId,
  });
}
