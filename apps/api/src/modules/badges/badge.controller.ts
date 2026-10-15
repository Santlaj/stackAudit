import { Request, Response, NextFunction } from "express";
import { badgeService } from "./badge.service.js";
import { successResponse } from "../../utils/api-response.js";

export async function getUserBadges(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req.query.userId as string) || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
    }
    const badges = await badgeService.getUserBadges(userId);
    successResponse(res, badges, "User badges retrieved successfully", 200);
  } catch (error) {
    next(error);
  }
}
