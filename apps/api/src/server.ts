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
    
    // Register recurring ingestion job (every 6 hours)
    await registerBroadSweepJob();

    // Register recurring active issue reconciliation job (every 12 hours)
    await registerReconciliationJob();
    
    // Trigger immediate ingestion if DB is sparse (first boot)
    await triggerInitialIngestionIfNeeded();
  } catch (queueErr: any) {
    logger.warn(`Background queue initialization deferred/skipped: ${queueErr.message}`, {
      module: "queue",
    });
  }
});