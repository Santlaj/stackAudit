import { env } from "./config/env.js";
import app from "./app.js";
import { logger } from "./utils/logger.js";
import { startIngestionWorker, registerBroadSweepJob, triggerInitialIngestionIfNeeded } from "./infrastructure/queue/index.js";

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

  // Start background workers
  startIngestionWorker();
  
  // Register recurring ingestion job (every 6 hours)
  await registerBroadSweepJob();
  
  // Trigger immediate ingestion if DB is sparse (first boot)
  await triggerInitialIngestionIfNeeded();
});