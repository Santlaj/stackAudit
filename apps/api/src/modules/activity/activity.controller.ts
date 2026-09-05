import { Request, Response, NextFunction } from "express";
import { activityService } from "./activity.service.js";
import { successResponse } from "../../utils/api-response.js";

/**
 * POST /api/activity/heartbeat
 * Records an active-time heartbeat for the authenticated session user.
 */
export async function handleHeartbeat(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await activityService.recordHeartbeat(userId);
    successResponse(res, result, "Heartbeat recorded successfully", 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/activity/daily?days=365
 * Retrieves the authenticated user's daily active time records.
 */
export async function handleGetDailyActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const daysParam = req.query.days ? parseInt(req.query.days as string, 10) : 365;
    const activity = await activityService.getDailyActivity(userId, daysParam);
    successResponse(res, { activity }, "Daily activity retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
}
