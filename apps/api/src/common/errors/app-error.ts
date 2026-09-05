// Base error class for all application errors.
// Every custom error extends this class so the error middleware
// can identify known errors and return the correct HTTP status.

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 400 — Client sent invalid or malformed input.
export class ValidationError extends AppError {
  constructor(message: string, errorCode = "VALIDATION_ERROR") {
    super(message, 400, errorCode);
  }
}

// 401 — Client is not authenticated.
export class UnauthorizedError extends AppError {
  constructor(
    message = "Authentication required",
    errorCode = "AUTH_UNAUTHORIZED",
  ) {
    super(message, 401, errorCode);
  }
}

// 403 — Client is authenticated but lacks permission.
export class ForbiddenError extends AppError {
  constructor(message = "Access denied", errorCode = "AUTH_FORBIDDEN") {
    super(message, 403, errorCode);
  }
}

// 404 — Requested resource does not exist.
export class NotFoundError extends AppError {
  constructor(message: string, errorCode = "RESOURCE_NOT_FOUND") {
    super(message, 404, errorCode);
  }
}

// 409 — Request conflicts with existing state.
export class ConflictError extends AppError {
  constructor(message: string, errorCode = "RESOURCE_CONFLICT") {
    super(message, 409, errorCode);
  }
}

// 500 — Unexpected server-side failure. isOperational is false
// because these represent bugs, not expected user errors.
export class InternalError extends AppError {
  constructor(
    message = "An unexpected error occurred",
    errorCode = "INTERNAL_ERROR",
  ) {
    super(message, 500, errorCode, false);
  }
}

// 429 / 403 — GitHub API rate limit exceeded.
export class GithubRateLimitError extends AppError {
  public readonly resetAt: number; // Timestamp in milliseconds

  constructor(
    resetAt: number,
    message = "GitHub API rate limit exceeded",
    errorCode = "GITHUB_RATE_LIMIT",
  ) {
    super(message, 429, errorCode);
    this.resetAt = resetAt;
  }
}
