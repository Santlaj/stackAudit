import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateUserSchema } from "./user.validation.js";
import { getMe, updateMe, ingestGitHubProfile, updatePreferences, getProfile } from "./user.controller.js";
import { getUserBadges } from "../badges/badge.controller.js";

const userRouter = Router();

// All user routes require authentication.
userRouter.use(requireAuth);

// GET  /api/users/me — Get my profile
userRouter.get("/me", getMe);

// GET  /api/users/badges — Get authenticated user's deterministic contribution badges
userRouter.get("/badges", getUserBadges);
userRouter.get("/profile/badges", getUserBadges);

// PATCH /api/users/me — Update my profile
userRouter.patch("/me", validate({ body: updateUserSchema }), updateMe);

// POST /api/users/profile/ingest — Ingest GitHub developer profile
userRouter.post("/profile/ingest", ingestGitHubProfile);

// GET /api/users/profile — Get developer profile
userRouter.get("/profile", getProfile);

// PATCH /api/users/profile — Update user learning goals and preferences
userRouter.patch("/profile", updatePreferences);

// PATCH /api/users/profile/preferences — legacy route alias
userRouter.patch("/profile/preferences", updatePreferences);

export default userRouter;
