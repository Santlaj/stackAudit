import type { Request, Response } from "express";
import { getSession } from "./auth.service.js";
import { successResponse } from "../../utils/api-response.js";
import { UnauthorizedError } from "../../common/errors/index.js";

// GET /api/auth/session — Returns the current user's session.
export const getCurrentSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const session = await getSession(req);

  if (!session) {
    throw new UnauthorizedError("No active session");
  }

  successResponse(res, session, "Session retrieved");
};
