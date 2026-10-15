import { Router } from "express";
import { discoveryController } from "./discovery.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// Protect all discovery routes
router.use(requireAuth);

// Routes for Developer Profile
router.get("/profile/:userId", discoveryController.getProfile);

// Routes for Discovery & Matching
router.get("/technologies", discoveryController.getTechnologyStats);
router.get("/progress", discoveryController.getContributionProgress);
router.post("/discover", discoveryController.discoverIssues);
router.get("/matches/:userId", discoveryController.getMatches);
router.get("/match/:matchId", discoveryController.getMatch);
router.post("/evaluate/:matchId", discoveryController.evaluateMatch);
router.get("/saved", discoveryController.getSavedMatches);
router.get("/history", discoveryController.getContributionHistory);
router.patch("/save/:matchId", discoveryController.toggleSaveMatch);
router.patch("/matches/:matchId/status", discoveryController.updateMatchStatus);

// Routes for Daily Contribution Challenge
router.get("/daily-challenge", discoveryController.getDailyChallenge);
router.post("/daily-challenge/replace", discoveryController.replaceDailyChallenge);
router.post("/daily-challenge/complete", discoveryController.completeDailyChallenge);
router.get("/daily-challenge/history", discoveryController.getDailyChallengeHistory);

// Development Routes (P0 Validation)
router.post("/dev/ingest-issues", discoveryController.ingestIssues);

export { router as discoveryRoutes };
