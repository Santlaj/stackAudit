import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../infrastructure/auth/index.js";
import { getCurrentSession } from "./auth.controller.js";

const authRouter = Router();

// Custom session endpoint for our API consumers.
authRouter.get("/session", getCurrentSession);

// Catch-all: delegates everything else to Better Auth's built-in handler.
// This covers: /api/auth/sign-in/github, /api/auth/callback/github,
authRouter.use(toNodeHandler(auth));

export default authRouter;
