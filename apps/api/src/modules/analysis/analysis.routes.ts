import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { startAnalysis, streamAnalysis } from "./analysis.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/:matchId/start", startAnalysis);
router.get("/:matchId/stream", streamAnalysis);

export const analysisRoutes = router;
