import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { redis } from "../../infrastructure/redis/redis.client.js";
import { githubService } from "../github/index.js";
import { logger } from "../../utils/logger.js";

export interface JitVerificationResult {
  isClosed: boolean;
  state: string;
  closedAt?: Date | null;
  assigneeCount: number;
  isRecentlyClosed: boolean;
}

export class IssueReconciliationService {
  /**
   * Tier 1: Just-In-Time (JIT) Verification on User Interaction.
   * 
   * When a user opens or starts analyzing an issue:
   * 1. Checks Redis cache with 15-min TTL to avoid duplicate calls.
   * 2. If uncached, checks live state against GitHub API.
   * 3. If closed/deleted, soft-closes in DB (state="closed", status="CLOSED")
   *    and removes it from all active discovery feeds automatically.
   */
  async verifyMatchJit(match: any, token?: string): Promise<JitVerificationResult> {
    const repository = match.repository;
    const issueNumber = match.issueNumber;

    if (!repository || !issueNumber) {
      return {
        isClosed: false,
        state: "open",
        assigneeCount: 0,
        isRecentlyClosed: false,
      };
    }

    const cacheKey = `cache:jit:verify:${repository}#${issueNumber}`;

    // 1. Check Redis cache first (15-minute TTL)
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          isClosed: parsed.state === "closed",
          state: parsed.state,
          closedAt: parsed.closedAt ? new Date(parsed.closedAt) : null,
          assigneeCount: parsed.assigneeCount || 0,
          isRecentlyClosed: parsed.isRecentlyClosed || false,
        };
      }
    } catch {
      // Redis fallback — proceed to live check
    }

    // 2. Query live state from GitHub
    const [owner, repo] = repository.split("/");
    let isClosed = false;
    let closedAt: Date | null = null;
    let assigneeCount = 0;
    let liveState = "open";

    try {
      const liveDetail = await githubService.getIssueDetail(owner, repo, issueNumber, token);
      if (!liveDetail || liveDetail.state === "closed") {
        isClosed = true;
        liveState = "closed";
        closedAt = liveDetail?.closedAt || new Date();
        assigneeCount = liveDetail?.assigneeCount || 0;
      } else {
        liveState = "open";
        assigneeCount = liveDetail.assigneeCount || 0;
      }
    } catch (err: any) {
      // If GitHub returns 404 (issue deleted or repo privatized), treat as closed
      if (err?.status === 404 || err?.message?.includes("404")) {
        logger.warn(`Issue ${repository}#${issueNumber} not found on GitHub (404), marking closed.`);
        isClosed = true;
        liveState = "closed";
        closedAt = new Date();
      } else {
        // Transient network error: fall back to current DB state without breaking UX
        return {
          isClosed: match.githubIssue?.state === "closed",
          state: match.githubIssue?.state || "open",
          assigneeCount: match.githubIssue?.assigneeCount || 0,
          isRecentlyClosed: false,
        };
      }
    }

    const wasOpenInDb = match.githubIssue?.state !== "closed";
    const isRecentlyClosed = isClosed && wasOpenInDb;

    // 3. If closed on GitHub, update PostgreSQL database (Soft-Close)
    if (isClosed) {
      logger.info(`[JIT-Reconcile] Issue ${repository}#${issueNumber} is CLOSED on GitHub. Updating DB.`);
      try {
        await prisma.github_issue.updateMany({
          where: { repository, issueNumber },
          data: {
            state: "closed",
            closedAt: closedAt || new Date(),
            assigneeCount,
            lastSyncedAt: new Date(),
          },
        });

        await prisma.issue_match.updateMany({
          where: { repository, issueNumber },
          data: { status: "CLOSED" },
        });
      } catch (dbErr: any) {
        logger.warn("Failed to persist JIT closed status to DB", { error: dbErr.message });
      }

      // Cache closed state for 1 hour
      redis
        .setex(
          cacheKey,
          3600,
          JSON.stringify({
            state: "closed",
            closedAt,
            assigneeCount,
            isRecentlyClosed,
          })
        )
        .catch(() => {});
    } else {
      // Cache open state for 15 minutes (900 seconds)
      redis
        .setex(
          cacheKey,
          900,
          JSON.stringify({
            state: "open",
            closedAt: null,
            assigneeCount,
            isRecentlyClosed: false,
          })
        )
        .catch(() => {});
    }

    return {
      isClosed,
      state: liveState,
      closedAt,
      assigneeCount,
      isRecentlyClosed,
    };
  }

  /**
   * Tier 2 / 3: Batched Scheduled Reconciliation.
   * 
   * Runs in background via BullMQ:
   * Reconciles hot/active issues (Saved issues, Daily Challenges, and aging issues)
   * to ensure no user is assigned or recommended an issue that got resolved on GitHub.
   */
  async reconcileActiveIssues(token?: string): Promise<{ checked: number; closed: number }> {
    logger.info("[Reconciliation] Starting scheduled active issues reconciliation...");

    // 1. Gather all active targets
    // Target A: Saved matches
    const savedMatches = await prisma.issue_match.findMany({
      where: { status: "SAVED" },
      select: { repository: true, issueNumber: true },
      take: 50,
    });

    // Target B: Active Daily Challenges
    const activeChallenges = await prisma.daily_challenge.findMany({
      where: { status: { in: ["ASSIGNED", "IN_PROGRESS", "ACCEPTED"] } },
      select: {
        match: { select: { repository: true, issueNumber: true } },
      },
      take: 50,
    });

    // Target C: Open issues in DB not verified in last 48 hours
    const staleCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const staleIssues = await prisma.github_issue.findMany({
      where: {
        state: "open",
        lastSyncedAt: { lt: staleCutoff },
      },
      select: { repository: true, issueNumber: true },
      take: 50,
    });

    // Deduplicate issues by "owner/repo#issueNumber"
    const issueMap = new Map<string, { repository: string; issueNumber: number }>();

    for (const m of savedMatches) {
      issueMap.set(`${m.repository}#${m.issueNumber}`, m);
    }
    for (const c of activeChallenges) {
      if (c.match) {
        issueMap.set(`${c.match.repository}#${c.match.issueNumber}`, c.match);
      }
    }
    for (const s of staleIssues) {
      issueMap.set(`${s.repository}#${s.issueNumber}`, s);
    }

    const uniqueTargets = Array.from(issueMap.values()).slice(0, 75); // Batch max 75 per run
    logger.info(`[Reconciliation] Identified ${uniqueTargets.length} active issues to verify`);

    let checked = 0;
    let closed = 0;

    for (const target of uniqueTargets) {
      const [owner, repo] = target.repository.split("/");
      try {
        const liveDetail = await githubService.getIssueDetail(owner, repo, target.issueNumber, token);
        checked++;

        if (!liveDetail || liveDetail.state === "closed") {
          closed++;
          logger.info(`[Reconciliation] Reconciled closed issue: ${target.repository}#${target.issueNumber}`);

          await prisma.github_issue.updateMany({
            where: { repository: target.repository, issueNumber: target.issueNumber },
            data: {
              state: "closed",
              closedAt: liveDetail?.closedAt || new Date(),
              lastSyncedAt: new Date(),
            },
          });

          await prisma.issue_match.updateMany({
            where: { repository: target.repository, issueNumber: target.issueNumber },
            data: { status: "CLOSED" },
          });
        } else {
          // Touch lastSyncedAt
          await prisma.github_issue.updateMany({
            where: { repository: target.repository, issueNumber: target.issueNumber },
            data: { lastSyncedAt: new Date() },
          });
        }
      } catch (err: any) {
        if (err?.status === 404) {
          closed++;
          await prisma.github_issue.updateMany({
            where: { repository: target.repository, issueNumber: target.issueNumber },
            data: { state: "closed", closedAt: new Date(), lastSyncedAt: new Date() },
          });
          await prisma.issue_match.updateMany({
            where: { repository: target.repository, issueNumber: target.issueNumber },
            data: { status: "CLOSED" },
          });
        }
      }

      // Small pacing delay to respect GitHub rate limits (300ms)
      await new Promise((r) => setTimeout(r, 300));
    }

    logger.info(`[Reconciliation] Complete. Checked ${checked} issues, marked ${closed} as closed.`);
    return { checked, closed };
  }
}

export const issueReconciliationService = new IssueReconciliationService();
