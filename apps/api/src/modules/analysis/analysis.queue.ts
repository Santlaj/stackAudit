import { Queue, Worker, Job } from "bullmq";
import { redis } from "../../infrastructure/redis/redis.client.js";
import { analysisService } from "./analysis.service.js";
import { logger } from "../../utils/logger.js";

const QUEUE_NAME = "repository-analysis";

export const analysisQueue = new Queue(QUEUE_NAME, {
  connection: redis,
});

export const analysisWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { owner, repo, token, userId, auditId } = job.data;
    logger.info(`Processing analysis job ${job.id}`, { auditId, owner, repo });

    try {
      // Call a new internal method that performs the heavy lifting
      await analysisService.processAnalysisJob(auditId, owner, repo, token);
    } catch (error: any) {
      logger.error(`Analysis job ${job.id} failed`, { error: error.message });
      throw error; // BullMQ will handle retries or move to failed queue
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 repos simultaneously
  }
);

analysisWorker.on("completed", (job) => {
  logger.info(`Analysis job ${job.id} completed successfully`);
});

analysisWorker.on("failed", (job, err) => {
  logger.error(`Analysis job ${job?.id} failed with error`, { error: err.message });
});
