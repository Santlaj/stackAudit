// Auth route paths and error codes.

export const AUTH_ROUTES = {
  BASE: "/api/auth",
} as const;

export const AUTH_ERRORS = {
  SESSION_NOT_FOUND: "AUTH_SESSION_NOT_FOUND",
  SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  GITHUB_CALLBACK_FAILED: "AUTH_GITHUB_CALLBACK_FAILED",
} as const;
