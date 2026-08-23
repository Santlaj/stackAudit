import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateUserSchema } from "./user.validation.js";
import { getMe, updateMe, ingestGitHubProfile, updatePreferences } from "./user.controller.js";

const userRouter = Router();

// All user routes require authentication.
userRouter.use(requireAuth);

// GET  /api/users/me — Get my profile
userRouter.get("/me", getMe);

// PATCH /api/users/me — Update my profile
userRouter.patch("/me", validate({ body: updateUserSchema }), updateMe);

// POST /api/users/profile/ingest — Ingest GitHub developer profile
userRouter.post("/profile/ingest", ingestGitHubProfile);

// PATCH /api/users/profile/preferences — Update user learning goals and preferences
userRouter.patch("/profile/preferences", updatePreferences);

export default userRouter;
