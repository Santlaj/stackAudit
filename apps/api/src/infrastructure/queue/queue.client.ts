import { Queue } from "bullmq";
import { redis } from "../redis/index.js";
import { logger } from "../../utils/logger.js";

// Background Job Queues
// We separate queues based on the business capability they serve.

// Example: Queue for processing GitHub repository intelligence
export const analysisQueue = new Queue("analysis-queue", {
  connection: redis,
});

logger.info("BullMQ Queues initialized", { module: "queue" });
