import { env } from "./config/env.js";
import app from "./app.js";
import { logger } from "./utils/logger.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`, {
    module: "server",
    port: PORT,
    environment: env.NODE_ENV,
  });
});