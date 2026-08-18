import { Router } from "express";
import { analysisController } from "./analysis.controller.js";

const router = Router();

router.post("/repo/:owner/:repo", analysisController.triggerRepositoryAnalysis);

// Retrieve audit history
router.get("/:id", analysisController.getAuditById);
router.get("/repo/:owner/:repo", analysisController.getAuditsByRepo);

export const analysisRoutes = router;
