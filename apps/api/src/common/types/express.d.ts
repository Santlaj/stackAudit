import type { SessionUser } from "../modules/auth/auth.types.js";

// Extend Express Request to include the authenticated user.
// After requireAuth middleware runs, req.user is guaranteed to exist.

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}
