import { Router } from "express";
import { githubController } from "./github.controller.js";

const router = Router();

router.get("/repo/:owner/:repo", githubController.getRepoInfo);
router.get("/repo/:owner/:repo/contents/*path", githubController.getFileContent);

export const githubRoutes = router;
