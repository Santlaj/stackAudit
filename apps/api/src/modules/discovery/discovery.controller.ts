import { Request, Response, NextFunction } from "express";
import { discoveryService } from "./discovery.service.js";
import { successResponse } from "../../utils/api-response.js";
import { prisma } from "../../infrastructure/prisma/prisma.client.js";

export class DiscoveryController {


  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const profile = await discoveryService.getProfile(userId as string);
      successResponse(res, profile, "Developer profile retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async discoverIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, techStack, difficulty } = req.body;
      const matches = await discoveryService.discoverMatchesForUser(
        userId as string, 
        techStack as string[], 
        difficulty as string
      );
      successResponse(res, matches, "Discovery complete", 200);
    } catch (error) {
      next(error);
    }
  }

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const matches = await discoveryService.getMatches(userId as string);
      successResponse(res, matches, "Matches retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async evaluateMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const account = await prisma.account.findFirst({ where: { userId: req.user!.id, providerId: "github" } });
      const githubToken = account?.accessToken || "";
      const match = await discoveryService.evaluateMatchContext(matchId, githubToken);
      successResponse(res, match, "Match evaluated successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const discoveryController = new DiscoveryController();
