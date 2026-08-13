import type { Request, Response } from "express";
import { successResponse } from "../../utils/api-response.js";
import * as userService from "./user.service.js";
import type { UpdateUserInput } from "./user.types.js";

// GET /api/users/me — Returns the authenticated user's profile.
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getUserProfile(req.user!.id);

  successResponse(res, user, "Profile retrieved");
};

// PATCH /api/users/me — Updates the authenticated user's profile.
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as UpdateUserInput;
  const user = await userService.updateUserProfile(req.user!.id, data);

  successResponse(res, user, "Profile updated");
};
