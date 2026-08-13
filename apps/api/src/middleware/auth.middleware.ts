import type { Request, Response, NextFunction } from "express";
import { getSession } from "../modules/auth/auth.service.js";
import { UnauthorizedError } from "../common/errors/index.js";

// Protects routes that require authentication.
// Validates the session and attaches the user to the request object.
// Throws UnauthorizedError if no valid session exists.

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const session = await getSession(req);

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  req.user = session.user;
  next();
};
