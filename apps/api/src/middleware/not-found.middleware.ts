import type { Request, Response } from "express";
import { errorResponse } from "../utils/api-response.js";

// Catches requests to routes that don't exist.
// Mounted after all route handlers in app.ts.

export function notFoundHandler(_req: Request, res: Response): void {
  errorResponse(res, "ROUTE_NOT_FOUND", "The requested route does not exist", 404);
}