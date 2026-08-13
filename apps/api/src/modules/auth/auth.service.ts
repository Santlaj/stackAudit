import { auth } from "../../infrastructure/auth/index.js";
import type { Request } from "express";
import type { SessionData } from "./auth.types.js";

// Retrieves the current session from the request headers.
// Returns null if no valid session exists.
export const getSession = async (
  req: Request,
): Promise<SessionData | null> => {
  const session = await auth.api.getSession({
    headers: req.headers as unknown as Headers,
  });

  return session as SessionData | null;
};
