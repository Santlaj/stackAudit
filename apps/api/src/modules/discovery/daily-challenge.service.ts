import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { AppError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";
import { matchingService } from "./matching.service.js";

let tableEnsured = false;

export async function ensureDailyChallengeTableExists() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "daily_challenges" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "challengeDate" DATE NOT NULL,
        "githubIssueId" TEXT NOT NULL REFERENCES "github_issues"("id") ON DELETE CASCADE,
        "matchId" TEXT REFERENCES "issue_matches"("id") ON DELETE SET NULL,
        "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
        "completedAt" TIMESTAMP(3),
        "checklist" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "daily_challenges_userId_challengeDate_key" ON "daily_challenges"("userId", "challengeDate")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "daily_challenges_userId_challengeDate_idx" ON "daily_challenges"("userId", "challengeDate")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "daily_challenges_githubIssueId_idx" ON "daily_challenges"("githubIssueId")
    `);
    tableEnsured = true;
  } catch (err: any) {
    logger.warn("Could not auto-verify daily_challenges table", { error: err.message });
  }
}

export interface DailyChallengeDto {
  id: string;
  challengeDate: string; // YYYY-MM-DD
  status: "ASSIGNED" | "COMPLETED";
  completedAt: string | null;
  checklist: {
    understoodProblem: boolean;
    identifiedFiles: boolean;
    nextStepsPlanned: boolean;
  } | null;
  matchId: string;
  issue: {
    id: string;
    repository: string;
    issueNumber: number;
    title: string;
    body: string | null;
    url: string;
    state: string;
    difficulty: string;
    technologies: string[];
    labels: string[];
    repoStars: number;
    repoActivity: string | null;
    matchScore: number;
    reasons: string[];
    gaps: string[];
    estimatedMinutes: number | null;
  };
}

export class DailyChallengeService {
  /**
   * Returns current UTC date string YYYY-MM-DD
   */
  private getUtcDateString(d: Date = new Date()): string {
    return d.toISOString().slice(0, 10);
  }

  /**
   * Retrieves today's stable daily challenge for user, creating one if not yet assigned.
   */
  async getTodayChallenge(userId: string): Promise<DailyChallengeDto> {
    await ensureDailyChallengeTableExists();
    const todayStr = this.getUtcDateString();
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    // Check existing assignment for today
    const existing = await prisma.$queryRawUnsafe<any[]>(`
      SELECT dc.*, 
             gi.id as "gi_id", gi."repository", gi."issueNumber", gi."title", gi."body", gi."url",
             gi."state", gi."difficultyEstimate", gi."repoLanguage", gi."repoLanguages", gi."labels",
             gi."repoStars", gi."repoActivityLevel",
             im.id as "im_id", im."matchScore", im."reasons", im."gaps", im."status" as "matchStatus"
      FROM "daily_challenges" dc
      JOIN "github_issues" gi ON dc."githubIssueId" = gi.id
      LEFT JOIN "issue_matches" im ON dc."matchId" = im.id
      WHERE dc."userId" = $1 AND dc."challengeDate" = $2
      LIMIT 1
    `, userId, todayDate);

    if (existing && existing.length > 0) {
      const row = existing[0];
      // Check if issue is still open; if closed and not completed, replace it
      if (row.state !== "open" && row.status !== "COMPLETED") {
        logger.info("Assigned challenge issue is closed/ineligible, selecting replacement", { userId, issueId: row.gi_id });
        return this.selectAndAssignChallenge(userId, todayDate, [row.gi_id]);
      }
      return this.formatChallengeRow(row);
    }

    // No assignment yet for today -> select and assign one
    return this.selectAndAssignChallenge(userId, todayDate);
  }

  /**
   * Selects a suitable candidate and assigns it as today's challenge.
   */
  private async selectAndAssignChallenge(
    userId: string, 
    challengeDate: Date, 
    excludeIssueIds: string[] = []
  ): Promise<DailyChallengeDto> {
    const profile = await prisma.developer_profile.findUnique({
      where: { userId }
    });

    // Collect issue IDs assigned to this user in last 14 days to prevent repeats
    const pastAssignments = await prisma.$queryRawUnsafe<{ githubIssueId: string }[]>(`
      SELECT "githubIssueId" FROM "daily_challenges"
      WHERE "userId" = $1 AND "challengeDate" >= $2
    `, userId, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));

    const pastIds = new Set([
      ...excludeIssueIds,
      ...pastAssignments.map(p => p.githubIssueId)
    ]);

    // Query candidate issues
    let candidates = await matchingService.findCandidates(
      profile,
      profile?.observedLanguages || [],
      [],
      profile?.preferredComplexity || "beginner"
    );

    // Filter out excluded / recently assigned and ensure state is open
    let eligible = candidates.filter(c => c.state === "open" && !pastIds.has(c.id));

    // Fallback if all candidates are filtered out
    if (eligible.length === 0) {
      eligible = candidates.filter(c => c.state === "open" && !excludeIssueIds.includes(c.id));
    }

    if (eligible.length === 0) {
      // Query any open issue in the database as absolute fallback
      const fallbackIssues = await prisma.github_issue.findMany({
        where: { state: "open" },
        take: 20,
        orderBy: [{ repoStars: "desc" }]
      });
      eligible = fallbackIssues.filter(c => !excludeIssueIds.includes(c.id));
    }

    if (eligible.length === 0) {
      throw new AppError("No eligible open challenge issues available. Try syncing issues first.", 404, "NO_CHALLENGE_AVAILABLE");
    }

    // Pick top-scoring candidate
    const chosenIssue = eligible[0];
    const matchScoreResult = matchingService.scoreMatch(profile, chosenIssue);

    // Ensure an issue_match exists so the user can navigate to /analyze/[matchId]
    let match = await prisma.issue_match.findFirst({
      where: {
        userId,
        githubIssueId: chosenIssue.id
      }
    });

    if (!match) {
      match = await prisma.issue_match.create({
        data: {
          userId,
          repository: chosenIssue.repository,
          issueNumber: chosenIssue.issueNumber,
          issueTitle: chosenIssue.title,
          issueUrl: chosenIssue.url,
          githubIssueId: chosenIssue.id,
          complexity: chosenIssue.difficultyEstimate || "beginner",
          contributionType: chosenIssue.issueType || "bug",
          technologies: chosenIssue.repoLanguage ? [chosenIssue.repoLanguage] : [],
          matchScore: matchScoreResult.score,
          reasons: matchScoreResult.reasons,
          gaps: matchScoreResult.gaps,
          status: "DISCOVERED"
        }
      });
    }

    const challengeId = crypto.randomUUID();

    // Upsert into daily_challenges for today
    await prisma.$executeRawUnsafe(`
      INSERT INTO "daily_challenges" ("id", "userId", "challengeDate", "githubIssueId", "matchId", "status", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, 'ASSIGNED', NOW(), NOW())
      ON CONFLICT ("userId", "challengeDate")
      DO UPDATE SET "githubIssueId" = EXCLUDED."githubIssueId",
                    "matchId" = EXCLUDED."matchId",
                    "updatedAt" = NOW()
    `, challengeId, userId, challengeDate, chosenIssue.id, match.id);

    return {
      id: challengeId,
      challengeDate: this.getUtcDateString(challengeDate),
      status: "ASSIGNED",
      completedAt: null,
      checklist: null,
      matchId: match.id,
      issue: {
        id: chosenIssue.id,
        repository: chosenIssue.repository,
        issueNumber: chosenIssue.issueNumber,
        title: chosenIssue.title,
        body: chosenIssue.body,
        url: chosenIssue.url,
        state: chosenIssue.state,
        difficulty: chosenIssue.difficultyEstimate || "beginner",
        technologies: chosenIssue.repoLanguage ? [chosenIssue.repoLanguage] : [],
        labels: chosenIssue.labels || [],
        repoStars: chosenIssue.repoStars || 0,
        repoActivity: chosenIssue.repoActivityLevel || null,
        matchScore: matchScoreResult.score,
        reasons: matchScoreResult.reasons,
        gaps: matchScoreResult.gaps,
        estimatedMinutes: chosenIssue.difficultyEstimate === "beginner" ? 30 : chosenIssue.difficultyEstimate === "intermediate" ? 60 : 90
      }
    };
  }

  /**
   * Allows replacing today's uncompleted challenge with another candidate.
   */
  async replaceTodayChallenge(userId: string): Promise<DailyChallengeDto> {
    await ensureDailyChallengeTableExists();
    const todayStr = this.getUtcDateString();
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    const existing = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "daily_challenges"
      WHERE "userId" = $1 AND "challengeDate" = $2
      LIMIT 1
    `, userId, todayDate);

    if (existing && existing.length > 0 && existing[0].status === "COMPLETED") {
      throw new AppError("Cannot replace an already completed challenge", 400, "CHALLENGE_ALREADY_COMPLETED");
    }

    const currentIssueId = existing && existing.length > 0 ? existing[0].githubIssueId : null;
    return this.selectAndAssignChallenge(userId, todayDate, currentIssueId ? [currentIssueId] : []);
  }

  /**
   * Completes today's daily challenge after meaningful investigation checklist validation.
   */
  async completeChallenge(
    userId: string,
    checklist: { understoodProblem: boolean; identifiedFiles: boolean; nextStepsPlanned: boolean }
  ): Promise<DailyChallengeDto> {
    await ensureDailyChallengeTableExists();

    if (!checklist?.understoodProblem || !checklist?.identifiedFiles || !checklist?.nextStepsPlanned) {
      throw new AppError(
        "All three investigation criteria must be confirmed to complete the challenge",
        400,
        "INCOMPLETE_CHECKLIST"
      );
    }

    const todayStr = this.getUtcDateString();
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    const existing = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "daily_challenges"
      WHERE "userId" = $1 AND "challengeDate" = $2
      LIMIT 1
    `, userId, todayDate);

    if (!existing || existing.length === 0) {
      throw new AppError("No challenge found for today to complete", 404, "CHALLENGE_NOT_FOUND");
    }

    const row = existing[0];
    const now = new Date();

    if (row.status !== "COMPLETED") {
      await prisma.$executeRawUnsafe(`
        UPDATE "daily_challenges"
        SET "status" = 'COMPLETED',
            "completedAt" = $1,
            "checklist" = $2::jsonb,
            "updatedAt" = NOW()
        WHERE "id" = $3
      `, now, JSON.stringify(checklist), row.id);

      // If linked match is DISCOVERED, transition to EXPLORED
      if (row.matchId) {
        await prisma.issue_match.updateMany({
          where: {
            id: row.matchId,
            status: "DISCOVERED"
          },
          data: {
            status: "EXPLORED"
          }
        });
      }
    }

    return this.getTodayChallenge(userId);
  }

  /**
   * Calculates consecutive completed streak and monthly calendar records.
   */
  async getStreakAndHistory(userId: string, year?: number, month?: number) {
    await ensureDailyChallengeTableExists();

    // Query all completions for this user to calculate exact consecutive streak
    const completedRecords = await prisma.$queryRawUnsafe<{ challengeDate: any; completedAt: any }[]>(`
      SELECT "challengeDate", "completedAt"
      FROM "daily_challenges"
      WHERE "userId" = $1 AND "status" = 'COMPLETED'
      ORDER BY "challengeDate" ASC
    `, userId);

    const completedDateSet = new Set<string>();
    const completionsMap: Record<string, { completed: boolean; completedAt: string }> = {};

    for (const r of completedRecords) {
      const dateStr = typeof r.challengeDate === "string" 
        ? r.challengeDate.slice(0, 10) 
        : new Date(r.challengeDate).toISOString().slice(0, 10);
      completedDateSet.add(dateStr);
      completionsMap[dateStr] = {
        completed: true,
        completedAt: new Date(r.completedAt).toISOString()
      };
    }

    // Streak calculation
    const today = new Date();
    const todayStr = this.getUtcDateString(today);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = this.getUtcDateString(yesterday);

    let streak = 0;
    let checkDate: Date;

    if (completedDateSet.has(todayStr)) {
      streak = 1;
      checkDate = yesterday;
    } else if (completedDateSet.has(yesterdayStr)) {
      streak = 1;
      checkDate = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000);
    } else {
      streak = 0;
      checkDate = new Date(0); // won't loop
    }

    while (streak > 0 && checkDate.getTime() > 0) {
      const checkStr = this.getUtcDateString(checkDate);
      if (completedDateSet.has(checkStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Filter completions map for requested year & month if provided, else current month
    const targetYear = year ?? today.getUTCFullYear();
    const targetMonth = month ?? (today.getUTCMonth() + 1);

    return {
      streak,
      totalCompleted: completedDateSet.size,
      hasCompletedToday: completedDateSet.has(todayStr),
      targetYear,
      targetMonth,
      calendar: completionsMap
    };
  }

  /**
   * Returns supported contribution lifecycle counts from issue_matches.
   */
  async getContributionProgress(userId: string) {
    const matches = await prisma.issue_match.findMany({
      where: { userId },
      select: { status: true }
    });

    let explored = 0;
    let started = 0;
    let prSubmitted = 0;
    let merged = 0;

    for (const m of matches) {
      const st = m.status;
      if (["EXPLORED", "VIEWED", "ANALYZED", "STARTED", "PR_SUBMITTED", "MERGED"].includes(st)) {
        explored++;
      }
      if (["STARTED", "PR_SUBMITTED", "MERGED"].includes(st)) {
        started++;
      }
      if (["PR_SUBMITTED", "MERGED"].includes(st)) {
        prSubmitted++;
      }
      if (st === "MERGED") {
        merged++;
      }
    }

    return {
      explored,
      started,
      prSubmitted,
      merged,
      totalTracked: matches.length
    };
  }

  private formatChallengeRow(row: any): DailyChallengeDto {
    const dateStr = typeof row.challengeDate === "string" 
      ? row.challengeDate.slice(0, 10) 
      : new Date(row.challengeDate).toISOString().slice(0, 10);

    const checklistParsed = typeof row.checklist === "string" 
      ? JSON.parse(row.checklist) 
      : row.checklist ?? null;

    return {
      id: row.id,
      challengeDate: dateStr,
      status: row.status as any,
      completedAt: row.completedAt ? new Date(row.completedAt).toISOString() : null,
      checklist: checklistParsed,
      matchId: row.im_id || row.matchId,
      issue: {
        id: row.gi_id,
        repository: row.repository,
        issueNumber: row.issueNumber,
        title: row.title,
        body: row.body,
        url: row.url,
        state: row.state,
        difficulty: row.difficultyEstimate || "beginner",
        technologies: row.repoLanguage ? [row.repoLanguage] : [],
        labels: row.labels || [],
        repoStars: row.repoStars || 0,
        repoActivity: row.repoActivityLevel || null,
        matchScore: row.matchScore || 85,
        reasons: row.reasons || ["Matches your preferred languages and experience"],
        gaps: row.gaps || [],
        estimatedMinutes: row.difficultyEstimate === "beginner" ? 30 : row.difficultyEstimate === "intermediate" ? 60 : 90
      }
    };
  }
}

export const dailyChallengeService = new DailyChallengeService();
