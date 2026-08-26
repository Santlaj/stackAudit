import type { Request, Response } from "express";
import { successResponse } from "../../utils/api-response.js";
import * as userService from "./user.service.js";
import { profileService } from "./profile.service.js";
import type { UpdateUserInput } from "./user.types.js";
import { AppError } from "../../common/errors/app-error.js";

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

import { prisma } from "../../infrastructure/prisma/prisma.client.js";

// POST /api/users/profile/ingest
export const ingestGitHubProfile = async (req: Request, res: Response, next: any): Promise<void> => {
  try {
    const account = await prisma.account.findFirst({ where: { userId: req.user!.id, providerId: "github" } });
    const githubToken = account?.accessToken;
    
    if (!githubToken) {
      throw new AppError("GitHub account is not connected", 400, "GITHUB_NOT_CONNECTED");
    }
    
    const profile = await profileService.ingestGitHubProfile(req.user!.id, githubToken);
    successResponse(res, profile, "GitHub profile ingested successfully");
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/profile/preferences
export const updatePreferences = async (req: Request, res: Response, next: any): Promise<void> => {
  try {
    const data = req.body;
    const profile = await profileService.updateUserPreferences(req.user!.id, data);
    successResponse(res, profile, "User preferences updated");
  } catch (error) {
    next(error);
  }
};

// GET /api/users/profile
export const getProfile = async (req: Request, res: Response, next: any): Promise<void> => {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    successResponse(res, profile, "Developer profile retrieved");
  } catch (error) {
    next(error);
  }
};
