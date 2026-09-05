import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { handleHeartbeat, handleGetDailyActivity } from "./activity.controller.js";

const activityRouter = Router();

// All activity routes strictly require authentication
activityRouter.use(requireAuth);

// POST /api/activity/heartbeat — Record active-time heartbeat
activityRouter.post("/heartbeat", handleHeartbeat);

// GET /api/activity/daily — Get daily activity history (default: 365 days)
activityRouter.get("/daily", handleGetDailyActivity);

export default activityRouter;
