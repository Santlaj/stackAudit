import express from "express";
import healthRouter from "./modules/health/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";

const app = express();
app.use(requestLogger);

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Feature modules
app.use("/api/health", healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;