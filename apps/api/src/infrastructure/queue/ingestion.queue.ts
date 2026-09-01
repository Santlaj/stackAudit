import { Queue } from "bullmq";
import { redis } from "../redis/index.js";
import { logger } from "../../utils/logger.js";

/**
 * Issue Ingestion Queue
 * 
 * Handles background ingestion of GitHub issues across languages.
 * 
 * Job types:
 *   - "broad-sweep": Cycles through ~25-30 common languages, ingesting issues for each.
 *   - "targeted":    For a specific language that has low/zero DB coverage.
 */
export const ingestionQueue = new Queue("issue-ingestion", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 20 },
  },
});

logger.info("Issue ingestion queue initialized", { module: "queue" });

/**
 * Enqueue a targeted ingestion job for a specific language.
 * Called by discovery service when a language has no DB coverage.
 */
export async function enqueueTargetedIngestion(language: string, difficulty?: string) {
  const jobId = `targeted-${language.toLowerCase()}-${Date.now()}`;
  await ingestionQueue.add("targeted", { language, difficulty }, { jobId });
  logger.info("Enqueued targeted ingestion", { language, difficulty, jobId });
}

/**
 * Register the repeatable broad-sweep job.
 * Called once on server startup.
 */
export async function registerBroadSweepJob() {
  // Remove any existing repeatable to avoid duplicates on restart
  const existing = await ingestionQueue.getRepeatableJobs();
  for (const job of existing) {
    if (job.name === "broad-sweep") {
      await ingestionQueue.removeRepeatableByKey(job.key);
    }
  }

  await ingestionQueue.add("broad-sweep", {}, {
    repeat: {
      pattern: "0 */6 * * *", // Every 6 hours
    },
    jobId: "broad-sweep-repeatable",
  });
  logger.info("Registered broad-sweep repeatable job (every 6 hours)", { module: "queue" });
}

/**
 * Trigger an immediate broad-sweep if the DB is sparse.
 * Called on first server boot.
 */
export async function triggerInitialIngestionIfNeeded() {
  // Dynamic import to avoid circular dependency issues at module load time
  const { prisma } = await import("../prisma/prisma.client.js");
  
  const issueCount = await prisma.github_issue.count({ where: { state: "open" } });
  
  if (issueCount < 100) {
    logger.info("Sparse issue DB detected, triggering immediate broad-sweep", { issueCount });
    await ingestionQueue.add("broad-sweep", { immediate: true }, {
      jobId: `broad-sweep-boot-${Date.now()}`,
    });
  } else {
    logger.info("Issue DB has adequate coverage, skipping boot ingestion", { issueCount });
  }
}
