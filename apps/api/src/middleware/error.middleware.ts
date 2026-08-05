import type { ErrorRequestHandler } from "express";
import { AppError } from "../common/errors/index.js";
import { logger } from "../utils/logger.js";

/**
 * Global error handler.
 *
 * Catches all errors thrown in route handlers and middleware.
 * Returns a consistent error response format (Handbook §81).
 *
 * Two types of errors:
 * 1. AppError (our custom errors) — return the correct status + error code
 * 2. Unknown errors (bugs) — return 500 and log for investigation
 */
export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  // Our custom errors — we know exactly what happened
  if (error instanceof AppError) {
    if (!error.isOperational) {
      logger.error(`${error.errorCode}: ${error.message}`);
    }

    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
      },
    });

    return;
  }

  // Unknown errors — something unexpected broke
  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error(`UNEXPECTED: ${message}`);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
};