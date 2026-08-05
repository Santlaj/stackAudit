import type { Response } from "express";

// Handbook §81, §120, §123 — Consistent API response format.

// ─── Type Definitions ───────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ─── Response Helpers ───────────────────────────────

// Send a success response with optional metadata.
export function successResponse<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, unknown>,
): void {
  const body: {
    success: true;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
  } = {
    success: true,
    message,
    data,
  };

  if (meta) {
    body.meta = meta;
  }

  res.status(statusCode).json(body);
}

// Send a paginated success response.
// Use this for any endpoint that returns a list (repositories, users, etc.).
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = "Success",
): void {
  res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
    },
  });
}

// Send an error response manually (e.g., from the 404 handler).
// For most cases, throw an AppError and let the error middleware handle it.
export function errorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}