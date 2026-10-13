import { Request, Response, NextFunction } from "express";
import { discoveryService } from "./discovery.service.js";
import { issueIngestionService } from "./issue-ingestion.service.js";
import { issueReconciliationService } from "./issue-reconciliation.service.js";
import { dailyChallengeService } from "./daily-challenge.service.js";
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
    createdAt: match.createdAt,
    updatedAt: match.updatedAt,
    // Issue detail fields from the linked github_issue
    issueState: match.githubIssue?.state ?? null,
    issueBody: match.githubIssue?.body ?? null,
    issueCreatedAt: match.githubIssue?.issueCreatedAt ?? null,
    issueUpdatedAt: match.githubIssue?.issueUpdatedAt ?? null,
    issueLabels: match.githubIssue?.labels ?? [],
    commentsCount: match.githubIssue?.commentsCount ?? 0,
    reactionsTotal: match.githubIssue?.reactionsTotal ?? 0,
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

  async toggleSaveMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params as { matchId: string };
      const userId = req.user!.id;
      const updatedMatch = await discoveryService.toggleSaveMatch(matchId, userId);
      successResponse(res, formatMatchDto(updatedMatch), "Match save status toggled", 200);
    } catch (error) {
      next(error);
    }
  }

  async getSavedMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const matches = await discoveryService.getSavedMatches(userId);
      successResponse(res, { matches: matches.map(formatMatchDto) }, "Saved matches retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateMatchStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params as { matchId: string };
      const { status } = req.body;
      const userId = req.user!.id;
      
      if (!status) {
        return res.status(400).json({ success: false, message: "Status is required" });
      }

      const updatedMatch = await discoveryService.updateMatchStatus(matchId, userId, status);
      successResponse(res, formatMatchDto(updatedMatch), "Match status updated", 200);
    } catch (error) {
      next(error);
    }
  }

  async discoverIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, languages, frameworks, difficulty } = req.body;
      const { matches, partialCoverage } = await discoveryService.discoverMatchesForUser(
        userId as string, 
        languages as string[],
        frameworks as string[],
        difficulty as string
      );
      successResponse(res, {
        matches: matches.map((m: any) => formatMatchDto(m)),
        partialCoverage
      }, "Discovery complete", 200);
    } catch (error) {
      next(error);
    }
  }

  async getMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const matches = await discoveryService.getMatches(userId as string);
      successResponse(res, matches.map((m: any) => formatMatchDto(m)), "Matches retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async getMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params as { matchId: string };
      const match = await prisma.issue_match.findUnique({
        where: { id: matchId },
        include: { githubIssue: true },
      });
      if (!match) {
        return res.status(404).json({ success: false, message: "Match not found" });
      }

      // Tier 1: JIT Verification against GitHub API
      const userGithubAccount = await prisma.account.findFirst({
        where: { userId: req.user?.id, providerId: "github" },
        select: { accessToken: true },
      });
      const jitResult = await issueReconciliationService.verifyMatchJit(
        match,
        userGithubAccount?.accessToken || undefined
      );

      // Reflect live verified state in response
      if (match.githubIssue) {
        match.githubIssue.state = jitResult.state;
        match.githubIssue.assigneeCount = jitResult.assigneeCount;
      }
      if (jitResult.isClosed) {
        match.status = "CLOSED";
      }

      const dto: any = formatMatchDto(match);
      dto.isRecentlyClosed = jitResult.isRecentlyClosed;

      successResponse(res, dto, "Match retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async evaluateMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params as { matchId: string };
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

  // ─── Daily Contribution Challenge Endpoints ───

  async getDailyChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challenge = await dailyChallengeService.getTodayChallenge(userId);
      successResponse(res, challenge, "Daily challenge retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async replaceDailyChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challenge = await dailyChallengeService.replaceTodayChallenge(userId);
      successResponse(res, challenge, "Daily challenge replaced", 200);
    } catch (error) {
      next(error);
    }
  }

  async completeDailyChallenge(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { checklist } = req.body;
      const updated = await dailyChallengeService.completeChallenge(userId, checklist);
      successResponse(res, updated, "Daily challenge completed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  async getDailyChallengeHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
      const history = await dailyChallengeService.getStreakAndHistory(userId, year, month);
      successResponse(res, history, "Daily challenge streak and history retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async getContributionProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const progress = await dailyChallengeService.getContributionProgress(userId);
      successResponse(res, progress, "Contribution progress retrieved", 200);
    } catch (error) {
      next(error);
    }
  }

  async getTechnologyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await discoveryService.getTechnologyStats(userId);
      successResponse(res, stats, "Technology statistics retrieved", 200);
    } catch (error) {
      next(error);
    }
  }
}

export const discoveryController = new DiscoveryController();
