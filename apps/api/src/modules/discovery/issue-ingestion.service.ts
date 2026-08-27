import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { githubService, type EnrichedIssueResult } from "../github/github.service.js";
import { deriveAllSignals } from "../github/signal.service.js";
import { AppError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";

/**
 * Issue Ingestion Service
 * 
 * Responsible for discovering, enriching, and persisting GitHub issues
 * into the github_issue table. This provides the raw issue dataset
 * that the matching engine (P1) will operate on.
 * 
 * Key design decisions:
 * - Issues are stored independently of any user match (shared data)
 * - Signal derivation happens on ingest, not on read
 * - Upserts by (repository, issueNumber) to prevent duplicates
 * - Repository context (language, stars) is fetched once per repo per batch
 */
export class IssueIngestionService {
  /**
   * Discover and ingest issues relevant to a user's profile.
   * 
   * Reads the user's developer_profile to determine languages and preferences,
   * then searches GitHub for matching issues and persists them with derived signals.
   * 
   * @returns The number of issues ingested or updated
   */
  async ingestIssuesForUser(userId: string, token?: string) {
    logger.info("Starting issue ingestion for user", { userId });

    // 1. Load user profile for language/preference context
    const profile = await prisma.developer_profile.findUnique({
      where: { userId },
    });

    let searchLanguages: string[] = [];

    if (profile) {
      // Prefer recent languages, fall back to observed
      // @ts-ignore - Prisma types may need regeneration
      const recent: string[] = profile.recentLanguages || [];
      // @ts-ignore
      const observed: string[] = profile.observedLanguages || [];
      // @ts-ignore
      const focus: string[] = profile.currentFocus || [];
      
      const combined = [...new Set([...focus, ...recent, ...observed])];
      searchLanguages = combined.slice(0, 3); // Max 3 for API efficiency
    }

    // We don't fall back to JavaScript if the profile is genuinely empty.
    // However, if the user explicitly provided search languages during discovery,
    // they should be handled by the frontend passing them down.
    // For general background ingestion without techStack selected, we search without language filters
    // or rely on the frontend to require techStack selection.

    // 2. Determine label sets based on user preferences
    // @ts-ignore
    const complexity = profile?.preferredComplexity || "beginner";
    const labelSets = this.getLabelSetsForComplexity(complexity);

    // 3. Search with multiple label sets for broader coverage
    let allIssues: EnrichedIssueResult[] = [];

    for (const labels of labelSets) {
      try {
        const issues = await githubService.searchIssuesEnriched(
          searchLanguages,
          labels,
          token,
          15
        );
        allIssues.push(...issues);
      } catch (err) {
        logger.warn("Failed to search with label set", { labels, error: err });
      }
    }

    // 4. Deduplicate by githubId
    const uniqueIssues = this.deduplicateIssues(allIssues);
    logger.info(`Found ${uniqueIssues.length} unique issues to ingest`, { userId });

    // 5. Fetch repository context (batched, one per unique repo)
    const repoContextCache = new Map<string, Awaited<ReturnType<typeof githubService.getRepositoryContext>>>();

    for (const issue of uniqueIssues) {
      if (!repoContextCache.has(issue.repository)) {
        const [owner, repo] = issue.repository.split("/");
        const context = await githubService.getRepositoryContext(owner, repo, token);
        repoContextCache.set(issue.repository, context);
      }
    }

    // 6. Derive signals and upsert each issue
    let ingestedCount = 0;

    for (const issue of uniqueIssues) {
      try {
        const repoContext = repoContextCache.get(issue.repository) || { 
          language: null, 
          stars: 0, 
          openIssues: 0,
          pushedAt: null,
          updatedAt: null,
          prAcceptanceRate: null,
          activityLevel: "inactive"
        };
        const signals = deriveAllSignals(issue);

        await prisma.github_issue.upsert({
          where: {
            repository_issueNumber: {
              repository: issue.repository,
              issueNumber: issue.issueNumber,
            },
          },
          update: {
            title: issue.title,
            body: issue.body,
            url: issue.url,
            state: issue.state,
            issueUpdatedAt: issue.issueUpdatedAt,
            closedAt: issue.closedAt,
            labels: issue.labels,
            commentsCount: issue.commentsCount,
            reactionsTotal: issue.reactionsTotal,
            assigneeCount: issue.assigneeCount,
            linkedPrCount: issue.linkedPrCount,
            repoLanguage: repoContext.language,
            repoStars: repoContext.stars,
            repoOpenIssues: repoContext.openIssues,
            repoActivityLevel: repoContext.activityLevel,
            repoLastPushedAt: repoContext.pushedAt,
            repoLastUpdatedAt: repoContext.updatedAt,
            repoPrAcceptanceRate: repoContext.prAcceptanceRate,
            // Recompute derived signals on update
            staleness: signals.staleness,
            activityLevel: signals.activityLevel,
            difficultyEstimate: signals.difficultyEstimate,
            issueType: signals.issueType,
            isGoodFirstIssue: signals.isGoodFirstIssue,
            isHelpWanted: signals.isHelpWanted,
            lastSyncedAt: new Date(),
          },
          create: {
            githubId: BigInt(issue.githubId),
            repository: issue.repository,
            issueNumber: issue.issueNumber,
            title: issue.title,
            body: issue.body,
            url: issue.url,
            state: issue.state,
            issueCreatedAt: issue.issueCreatedAt,
            issueUpdatedAt: issue.issueUpdatedAt,
            closedAt: issue.closedAt,
            labels: issue.labels,
            commentsCount: issue.commentsCount,
            reactionsTotal: issue.reactionsTotal,
            assigneeCount: issue.assigneeCount,
            linkedPrCount: issue.linkedPrCount,
            repoLanguage: repoContext.language,
            repoStars: repoContext.stars,
            repoOpenIssues: repoContext.openIssues,
            repoActivityLevel: repoContext.activityLevel,
            repoLastPushedAt: repoContext.pushedAt,
            repoLastUpdatedAt: repoContext.updatedAt,
            repoPrAcceptanceRate: repoContext.prAcceptanceRate,
            staleness: signals.staleness,
            activityLevel: signals.activityLevel,
            difficultyEstimate: signals.difficultyEstimate,
            issueType: signals.issueType,
            isGoodFirstIssue: signals.isGoodFirstIssue,
            isHelpWanted: signals.isHelpWanted,
          },
        } as any);

        ingestedCount++;
      } catch (err) {
        logger.warn(`Failed to upsert issue ${issue.repository}#${issue.issueNumber}`, { error: err });
      }
    }

    logger.info("Issue ingestion complete", { userId, ingestedCount, totalFound: uniqueIssues.length });
    return { ingestedCount, totalFound: uniqueIssues.length };
  }

  /**
   * Re-fetch and update a single issue's data and signals.
   * Used when a user views an issue and we want fresh data.
   */
  async syncIssue(repository: string, issueNumber: number, token?: string) {
    const [owner, repo] = repository.split("/");

    // Fetch fresh issue data
    const issueData = await githubService.getIssueDetail(owner, repo, issueNumber, token);
    if (!issueData) {
      throw new AppError(`Issue ${repository}#${issueNumber} not found`, 404, "ISSUE_NOT_FOUND");
    }

    // Fetch fresh repo context
    const repoContext = await githubService.getRepositoryContext(owner, repo, token);

    // Derive fresh signals
    const signals = deriveAllSignals(issueData);

    // Upsert
    const updated = await prisma.github_issue.upsert({
      where: {
        repository_issueNumber: {
          repository: issueData.repository,
          issueNumber: issueData.issueNumber,
        },
      },
      update: {
        title: issueData.title,
        body: issueData.body,
        url: issueData.url,
        state: issueData.state,
        issueUpdatedAt: issueData.issueUpdatedAt,
        closedAt: issueData.closedAt,
        labels: issueData.labels,
        commentsCount: issueData.commentsCount,
        reactionsTotal: issueData.reactionsTotal,
        assigneeCount: issueData.assigneeCount,
        linkedPrCount: issueData.linkedPrCount,
        repoLanguage: repoContext.language,
        repoStars: repoContext.stars,
        repoOpenIssues: repoContext.openIssues,
        repoActivityLevel: repoContext.activityLevel,
        repoLastPushedAt: repoContext.pushedAt,
        repoLastUpdatedAt: repoContext.updatedAt,
        repoPrAcceptanceRate: repoContext.prAcceptanceRate,
        staleness: signals.staleness,
        activityLevel: signals.activityLevel,
        difficultyEstimate: signals.difficultyEstimate,
        issueType: signals.issueType,
        isGoodFirstIssue: signals.isGoodFirstIssue,
        isHelpWanted: signals.isHelpWanted,
        lastSyncedAt: new Date(),
      },
      create: {
        githubId: BigInt(issueData.githubId),
        repository: issueData.repository,
        issueNumber: issueData.issueNumber,
        title: issueData.title,
        body: issueData.body,
        url: issueData.url,
        state: issueData.state,
        issueCreatedAt: issueData.issueCreatedAt,
        issueUpdatedAt: issueData.issueUpdatedAt,
        closedAt: issueData.closedAt,
        labels: issueData.labels,
        commentsCount: issueData.commentsCount,
        reactionsTotal: issueData.reactionsTotal,
        assigneeCount: issueData.assigneeCount,
        linkedPrCount: issueData.linkedPrCount,
        repoLanguage: repoContext.language,
        repoStars: repoContext.stars,
        repoOpenIssues: repoContext.openIssues,
        repoActivityLevel: repoContext.activityLevel,
        repoLastPushedAt: repoContext.pushedAt,
        repoLastUpdatedAt: repoContext.updatedAt,
        repoPrAcceptanceRate: repoContext.prAcceptanceRate,
        staleness: signals.staleness,
        activityLevel: signals.activityLevel,
        difficultyEstimate: signals.difficultyEstimate,
        issueType: signals.issueType,
        isGoodFirstIssue: signals.isGoodFirstIssue,
        isHelpWanted: signals.isHelpWanted,
      },
    } as any);

    return updated;
  }

  /**
   * Query the github_issue table with filters.
   * Used by the matching engine (P1) to find candidate issues.
   */
  async getIssuesForMatching(filters: {
    languages?: string[];
    difficulty?: string;
    staleness?: string[];
    issueType?: string;
    goodFirstIssueOnly?: boolean;
    helpWantedOnly?: boolean;
    limit?: number;
  }) {
    const where: any = {
      state: "open",
    };

    if (filters.languages && filters.languages.length > 0) {
      where.repoLanguage = { in: filters.languages };
    }
    if (filters.difficulty) {
      where.difficultyEstimate = filters.difficulty;
    }
    if (filters.staleness && filters.staleness.length > 0) {
      where.staleness = { in: filters.staleness };
    }
    if (filters.issueType) {
      where.issueType = filters.issueType;
    }
    if (filters.goodFirstIssueOnly) {
      where.isGoodFirstIssue = true;
    }
    if (filters.helpWantedOnly) {
      where.isHelpWanted = true;
    }

    return prisma.github_issue.findMany({
      where,
      orderBy: [
        { isGoodFirstIssue: "desc" },
        { issueUpdatedAt: "desc" },
      ],
      take: filters.limit || 50,
    } as any);
  }

  // ─── Private Helpers ──────────────────────────────

  /**
   * Map user's preferred complexity to GitHub label search sets.
   * Returns multiple label sets for broader coverage.
   */
  private getLabelSetsForComplexity(complexity: string): string[][] {
    switch (complexity.toLowerCase()) {
      case "beginner":
        return [
          ["good first issue"],
          ["beginner"],
          ["help wanted"],
        ];
      case "intermediate":
        return [
          ["help wanted"],
          ["good first issue"],
          ["enhancement"],
        ];
      case "advanced":
        return [
          ["help wanted"],
          ["enhancement"],
          ["bug"],
        ];
      default:
        return [
          ["good first issue"],
          ["help wanted"],
        ];
    }
  }

  /**
   * Deduplicate issues by githubId.
   */
  private deduplicateIssues(issues: EnrichedIssueResult[]): EnrichedIssueResult[] {
    const seen = new Set<number>();
    const unique: EnrichedIssueResult[] = [];

    for (const issue of issues) {
      if (!seen.has(issue.githubId)) {
        seen.add(issue.githubId);
        unique.push(issue);
      }
    }

    return unique;
  }
}

export const issueIngestionService = new IssueIngestionService();
