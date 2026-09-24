import { auth } from "../../infrastructure/auth/index.js";
import type { Request } from "express";
import type { SessionData } from "./auth.types.js";

// Retrieves the current session from the request headers.
// Returns null if no valid session exists.
export const getSession = async (
  req: Request,
): Promise<SessionData | null> => {
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach(v => headers.append(key, v));
    } else if (val) {
      headers.set(key, val);
    }
  });

  const session = await auth.api.getSession({
    headers,
  });

  return session as SessionData | null;
};
