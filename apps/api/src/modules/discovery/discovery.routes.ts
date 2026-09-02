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
router.get("/match/:matchId", discoveryController.getMatch);
router.post("/evaluate/:matchId", discoveryController.evaluateMatch);
router.get("/saved", discoveryController.getSavedMatches);
router.patch("/save/:matchId", discoveryController.toggleSaveMatch);
router.patch("/matches/:matchId/status", discoveryController.updateMatchStatus);

// Development Routes (P0 Validation)
router.post("/dev/ingest-issues", discoveryController.ingestIssues);

export { router as discoveryRoutes };
