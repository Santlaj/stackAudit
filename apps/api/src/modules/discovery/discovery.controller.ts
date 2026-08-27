import { Request, Response, NextFunction } from "express";
import { discoveryService } from "./discovery.service.js";
import { issueIngestionService } from "./issue-ingestion.service.js";
import { successResponse } from "../../utils/api-response.js";
import { prisma } from "../../infrastructure/prisma/prisma.client.js";

function formatMatchDto(match: any) {
  return {
    id: match.id,
    repository: match.repository,
    issueNumber: match.issueNumber,
    issueTitle: match.issueTitle,
    issueUrl: match.issueUrl,
    complexity: match.complexity,
    contributionType: match.contributionType,
    technologies: match.technologies,
    matchScore: match.matchScore,
    matchReason: match.matchReason,
    missingSignals: match.missingSignals,
    learningRelevance: match.learningRelevance,
    reasons: match.reasons,
    gaps: match.gaps,
    architecturalContext: match.architecturalContext,
    relevantFiles: match.relevantFiles,
    implementationApproach: match.implementationApproach,
    status: match.status,
    repositoryActivity: match.githubIssue ? {
      status: match.githubIssue.repoActivityLevel || "unknown",
      lastActivityAt: match.githubIssue.repoLastUpdatedAt || match.githubIssue.repoLastPushedAt || null,
      openIssues: match.githubIssue.repoOpenIssues ?? null,
      stars: match.githubIssue.repoStars ?? null,
      prAcceptanceRate: match.githubIssue.repoPrAcceptanceRate ?? null
    } : null
  };
}

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
      successResponse(res, matches.map(m => formatMatchDto(m)), "Discovery complete", 200);
    } catch (error) {
      next(error);
    }
  }

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const matches = await discoveryService.getMatches(userId as string);
      successResponse(res, matches.map(m => formatMatchDto(m)), "Matches retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async evaluateMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const account = await prisma.account.findFirst({ where: { userId: req.user!.id, providerId: "github" } });
      const githubToken = account?.accessToken || "";
      const match = await discoveryService.evaluateMatchContext(matchId as string, githubToken);
      successResponse(res, formatMatchDto(match), "Match evaluated successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async ingestIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const account = await prisma.account.findFirst({ where: { userId, providerId: "github" } });
      const githubToken = account?.accessToken || undefined;
      
      const result = await issueIngestionService.ingestIssuesForUser(userId, githubToken);
      successResponse(res, result, "Issue ingestion complete", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const discoveryController = new DiscoveryController();
