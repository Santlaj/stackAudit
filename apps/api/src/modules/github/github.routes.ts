import { Router } from "express";
import { githubController } from "./github.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// Protect github routes
router.use(requireAuth);

router.get("/repo/:owner/:repo", githubController.getRepoInfo);
router.get("/repo/:owner/:repo/contents/*path", githubController.getFileContent);

export const githubRoutes = router;
