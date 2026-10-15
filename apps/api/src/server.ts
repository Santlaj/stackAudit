import { env } from "./config/env.js";
import app from "./app.js";
import { logger } from "./utils/logger.js";
import { startIngestionWorker, startAnalysisWorker, registerBroadSweepJob, triggerInitialIngestionIfNeeded, registerReconciliationJob } from "./infrastructure/queue/index.js";

// Ensure BigInts are correctly serialized to strings instead of throwing an error
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const PORT = env.PORT;

app.listen(PORT, async () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`, {
    module: "server",
    port: PORT,
    environment: env.NODE_ENV,
  });

  // Start background workers and repeatable jobs safely (without crashing web server if Redis limits are exceeded)
  try {
    startIngestionWorker();
    startAnalysisWorker();
    
    // In production, register recurring background jobs.
    // In development, skip automated repeatable sweeps by default to prevent exhausting serverless Redis quota.
    if (env.NODE_ENV === "production" || process.env.ENABLE_BACKGROUND_SWEEP === "true") {
      await registerBroadSweepJob();
      await registerReconciliationJob();
      await triggerInitialIngestionIfNeeded();
    } else {
      logger.info("Recurring background sweep jobs paused in development to protect Redis quota", {
        module: "queue",
      });
    }
  } catch (queueErr: any) {
    logger.warn(`Background queue initialization deferred/skipped: ${queueErr.message}`, {
      module: "queue",
    });
  }
});