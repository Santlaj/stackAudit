import { Router } from "express";
import { discoveryController } from "./discovery.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// Protect all discovery routes
router.use(requireAuth);

// Routes for Developer Profile
router.get("/profile/:userId", discoveryController.getProfile);

// Routes for Discovery & Matching
router.post("/discover", discoveryController.discoverIssues);
router.get("/matches/:userId", discoveryController.getMatches);
router.post("/evaluate/:matchId", discoveryController.evaluateMatch);

export { router as discoveryRoutes };
