import { prisma } from "../../infrastructure/prisma/prisma.client.js";

export interface BadgeDto {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
  current: number;
  target: number;
}

interface IssueAggregate {
  key: string;
  repository: string;
  status: string;
  technologies: string[];
  repoLanguage: string | null;
  hasAnalysis: boolean;
  earliestTimestamp: Date;
}

const STATUS_RANK: Record<string, number> = {
  MERGED: 6,
  PR_SUBMITTED: 5,
  STARTED: 4,
  ANALYZED: 3,
  SAVED: 2,
  EXPLORED: 1,
  VIEWED: 1,
  DISCOVERED: 0,
};

export class BadgeService {
  /**
   * Evaluates and returns all 9 deterministic developer contribution badges for a user.
   * Derives eligibility strictly from existing issue_match and repository_analysis records.
   */
  async getUserBadges(userId: string): Promise<BadgeDto[]> {
    const matches = await prisma.issue_match.findMany({
      where: { userId },
      include: {
        analysis: {
          select: { status: true, completedAt: true }
        },
        githubIssue: {
          select: { repoLanguage: true }
        }
      },
      orderBy: { updatedAt: "asc" }
    });

    // Deduplicate by distinct issue identity
    // (rule: Avoid duplicate counting of the same issue/match)
    const issueMap = new Map<string, IssueAggregate>();

    for (const match of matches) {
      const repoNorm = (match.repository || "").trim().toLowerCase();
      const issueKey = match.githubIssueId 
        ? `gh:${match.githubIssueId}`
        : repoNorm && match.issueNumber
        ? `repo:${repoNorm}#${match.issueNumber}`
        : match.issueUrl 
        ? `url:${match.issueUrl.trim().toLowerCase()}`
        : `id:${match.id}`;

      const existing = issueMap.get(issueKey);
      const matchRank = STATUS_RANK[match.status] || 0;
      const existingRank = existing ? (STATUS_RANK[existing.status] || 0) : -1;

      // Extract tech items
      const techs: string[] = [];
      if (Array.isArray(match.technologies)) {
        for (const t of match.technologies) {
          if (typeof t === "string" && t.trim()) {
            techs.push(t.trim().toLowerCase());
          }
        }
      }

      const matchDate = match.updatedAt || match.createdAt;

      if (!existing) {
        issueMap.set(issueKey, {
          key: issueKey,
          repository: repoNorm,
          status: match.status,
          technologies: techs,
          repoLanguage: match.githubIssue?.repoLanguage?.trim().toLowerCase() || null,
          hasAnalysis: match.analysis !== null,
          earliestTimestamp: matchDate,
        });
      } else {
        // Upgrade status to highest reached
        if (matchRank > existingRank) {
          existing.status = match.status;
        }
        // Union technologies
        for (const t of techs) {
          if (!existing.technologies.includes(t)) {
            existing.technologies.push(t);
          }
        }
        if (!existing.repoLanguage && match.githubIssue?.repoLanguage) {
          existing.repoLanguage = match.githubIssue.repoLanguage.trim().toLowerCase();
        }
        if (match.analysis !== null) {
          existing.hasAnalysis = true;
        }
        if (matchDate < existing.earliestTimestamp) {
          existing.earliestTimestamp = matchDate;
        }
      }
    }

    const uniqueIssues = Array.from(issueMap.values()).sort(
      (a, b) => a.earliestTimestamp.getTime() - b.earliestTimestamp.getTime()
    );

    // 1. Qualifying contributions: STARTED, PR_SUBMITTED, MERGED
    const qualifyingIssues = uniqueIssues.filter(i => 
      ["STARTED", "PR_SUBMITTED", "MERGED"].includes(i.status)
    );

    // 2. PR submitted or merged
    const prIssues = uniqueIssues.filter(i => 
      ["PR_SUBMITTED", "MERGED"].includes(i.status)
    );

    // 3. Merged
    const mergedIssues = uniqueIssues.filter(i => 
      i.status === "MERGED"
    );

    // 4. Explored issues: matches actively explored/viewed/analyzed/saved/started
    const exploredIssues = uniqueIssues.filter(i => 
      ["EXPLORED", "VIEWED", "ANALYZED", "SAVED", "STARTED", "PR_SUBMITTED", "MERGED"].includes(i.status) ||
      i.hasAnalysis
    );

    // 5. Explored repositories: distinct repositories across explored issues
    const exploredRepos = new Set(
      exploredIssues.map(i => i.repository).filter(Boolean)
    );

    // 6. Qualifying repositories: distinct repositories across qualifying STARTED+ issues
    const qualifyingRepos = new Set(
      qualifyingIssues.map(i => i.repository).filter(Boolean)
    );

    // 7. Distinct technologies across qualifying STARTED+ issues
    const qualifyingTechs = new Set<string>();
    for (const issue of qualifyingIssues) {
      for (const t of issue.technologies) {
        qualifyingTechs.add(t);
      }
      if (issue.repoLanguage) {
        qualifyingTechs.add(issue.repoLanguage);
      }
    }

    function safeToIsoString(d: any): string | null {
      if (!d) return null;
      try {
        const date = d instanceof Date ? d : new Date(d);
        return isNaN(date.getTime()) ? null : date.toISOString();
      } catch {
        return null;
      }
    }

    // Earliest qualifying timestamps for earnedAt
    const firstContribDate = qualifyingIssues.length > 0 
      ? safeToIsoString(qualifyingIssues[0].earliestTimestamp) 
      : null;

    const firstPrDate = prIssues.length > 0 
      ? safeToIsoString(prIssues[0].earliestTimestamp) 
      : null;

    const mergedDate = mergedIssues.length > 0 
      ? safeToIsoString(mergedIssues[0].earliestTimestamp) 
      : null;

    const contrib5Date = qualifyingIssues.length >= 5 
      ? safeToIsoString(qualifyingIssues[4].earliestTimestamp) 
      : null;

    const contrib10Date = qualifyingIssues.length >= 10 
      ? safeToIsoString(qualifyingIssues[9].earliestTimestamp) 
      : null;

    const explorerDate = exploredIssues.length >= 5
      ? safeToIsoString(exploredIssues[4].earliestTimestamp)
      : null;

    // Derived timestamp for 5 explored repositories
    let repoExplorerDate: string | null = null;
    const seenExploredRepos = new Set<string>();
    for (const issue of exploredIssues) {
      if (issue.repository) seenExploredRepos.add(issue.repository);
      if (seenExploredRepos.size >= 5) {
        repoExplorerDate = safeToIsoString(issue.earliestTimestamp);
        break;
      }
    }

    // Derived timestamp for 3 distinct technologies
    let multiStackDate: string | null = null;
    const seenTechs = new Set<string>();
    for (const issue of qualifyingIssues) {
      for (const t of issue.technologies) seenTechs.add(t);
      if (issue.repoLanguage) seenTechs.add(issue.repoLanguage);
      if (seenTechs.size >= 3) {
        multiStackDate = safeToIsoString(issue.earliestTimestamp);
        break;
      }
    }

    // Derived timestamp for 3 qualifying repositories
    let repoContribDate: string | null = null;
    const seenQualifyingRepos = new Set<string>();
    for (const issue of qualifyingIssues) {
      if (issue.repository) seenQualifyingRepos.add(issue.repository);
      if (seenQualifyingRepos.size >= 3) {
        repoContribDate = safeToIsoString(issue.earliestTimestamp);
        break;
      }
    }

    return [
      {
        id: "FIRST_CONTRIBUTION",
        name: "First Contribution",
        description: "Started your first contribution.",
        earned: qualifyingIssues.length >= 1,
        earnedAt: firstContribDate,
        current: Math.min(qualifyingIssues.length, 1),
        target: 1
      },
      {
        id: "FIRST_PR",
        name: "First PR",
        description: "Submitted your first pull request.",
        earned: prIssues.length >= 1,
        earnedAt: firstPrDate,
        current: Math.min(prIssues.length, 1),
        target: 1
      },
      {
        id: "MERGED",
        name: "Merged",
        description: "Get your first PR merged.",
        earned: mergedIssues.length >= 1,
        earnedAt: mergedDate,
        current: Math.min(mergedIssues.length, 1),
        target: 1
      },
      {
        id: "CONTRIBUTOR_5",
        name: "Contributor ×5",
        description: "Start 5 contributions.",
        earned: qualifyingIssues.length >= 5,
        earnedAt: contrib5Date,
        current: Math.min(qualifyingIssues.length, 5),
        target: 5
      },
      {
        id: "CONTRIBUTOR_10",
        name: "Contributor ×10",
        description: "Start 10 contributions.",
        earned: qualifyingIssues.length >= 10,
        earnedAt: contrib10Date,
        current: Math.min(qualifyingIssues.length, 10),
        target: 10
      },
      {
        id: "ISSUE_EXPLORER",
        name: "Issue Explorer",
        description: "Explore at least 5 different issues.",
        earned: exploredIssues.length >= 5,
        earnedAt: explorerDate,
        current: Math.min(exploredIssues.length, 5),
        target: 5
      },
      {
        id: "REPOSITORY_EXPLORER",
        name: "Repository Explorer",
        description: "Analyze or explore at least 5 different repositories.",
        earned: exploredRepos.size >= 5,
        earnedAt: repoExplorerDate,
        current: Math.min(exploredRepos.size, 5),
        target: 5
      },
      {
        id: "MULTI_STACK",
        name: "Multi-Stack",
        description: "Contribute across at least 3 different technologies.",
        earned: qualifyingTechs.size >= 3,
        earnedAt: multiStackDate,
        current: Math.min(qualifyingTechs.size, 3),
        target: 3
      },
      {
        id: "REPOSITORY_CONTRIBUTOR",
        name: "Repository Contributor",
        description: "Reach STARTED or beyond in at least 3 different repositories.",
        earned: qualifyingRepos.size >= 3,
        earnedAt: repoContribDate,
        current: Math.min(qualifyingRepos.size, 3),
        target: 3
      }
    ];
  }
}

export const badgeService = new BadgeService();
