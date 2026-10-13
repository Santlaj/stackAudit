import { Queue } from "bullmq";
import { redis } from "../redis/index.js";
import { env } from "../../config/env.js";
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
  prefix: `{stackaudit_${env.NODE_ENV}}`,
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
  try {
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
  } catch (err: any) {
    logger.warn(`Failed to register broad-sweep job (Redis rate limit or offline): ${err.message}`);
  }
}

/**
 * Register the repeatable active issue reconciliation job (Tier 2/3).
 * Verifies active saved issues and daily challenges against GitHub.
 */
export async function registerReconciliationJob() {
  try {
    const existing = await ingestionQueue.getRepeatableJobs();
    for (const job of existing) {
      if (job.name === "reconcile-issues") {
        await ingestionQueue.removeRepeatableByKey(job.key);
      }
    }

    await ingestionQueue.add("reconcile-issues", {}, {
      repeat: {
        pattern: "0 */12 * * *", // Every 12 hours
      },
      jobId: "reconcile-issues-repeatable",
    });
    logger.info("Registered issue reconciliation repeatable job (every 12 hours)", { module: "queue" });
  } catch (err: any) {
    logger.warn(`Failed to register issue reconciliation job (Redis rate limit or offline): ${err.message}`);
  }
}

/**
 * Trigger an immediate broad-sweep if the DB is sparse.
 * Called on first server boot.
 */
export async function triggerInitialIngestionIfNeeded() {
  try {
    // Dynamic import to avoid circular dependency issues at module load time
    const { prisma } = await import("../prisma/prisma.client.js");
    
    const issueCount = await prisma.github_issue.count({ where: { state: "open" } });
    
    // In development, if we already have any issues stored in the DB, do not run broad sweep on boot
    const minThreshold = env.NODE_ENV === "development" ? 1 : 100;

    if (issueCount < minThreshold) {
      // Check if a broad sweep is already waiting or active
      const activeJobs = await ingestionQueue.getActiveCount();
      const waitingJobs = await ingestionQueue.getWaitingCount();
      if (activeJobs > 0 || waitingJobs > 0) {
        logger.info("Broad-sweep ingestion job already active/waiting, skipping duplicate boot trigger");
        return;
      }

      logger.info("Sparse issue DB detected, triggering initial broad-sweep", { issueCount });
      await ingestionQueue.add("broad-sweep", { immediate: true }, {
        jobId: "broad-sweep-boot",
      });
    } else {
      logger.info("Issue DB already contains open issues, skipping boot ingestion", { issueCount });
    }
  } catch (err: any) {
    logger.warn(`Failed to check initial ingestion status (Redis rate limit or offline): ${err.message}`);
  }
}
