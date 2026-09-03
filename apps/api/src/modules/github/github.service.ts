import { createGithubClient } from "../../infrastructure/github/index.js";
import { AppError, InternalError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";

export class GithubService {
  /**
   * Fetch the authenticated user's profile information
   */
  async getAuthenticatedUser(token: string) {
    if (!token) {
      throw new AppError("A valid GitHub token is required for this operation", 401, "GITHUB_UNAUTHORIZED");
    }
    try {
      const client = createGithubClient(token);
      const { data } = await client.users.getAuthenticated();
      
      return {
        login: data.login,
        name: data.name,
        bio: data.bio,
        company: data.company,
        location: data.location,
        publicRepos: data.public_repos,
        followers: data.followers,
      };
    } catch (error: any) {
      this.handleError(error, "Failed to fetch authenticated user profile");
    }
  }

  /**
   * Fetch repositories for the authenticated user to infer skills
   */
  async getUserRepositories(token: string, perPage = 30) {
    if (!token) {
      throw new AppError("A valid GitHub token is required for this operation", 401, "GITHUB_UNAUTHORIZED");
    }
    try {
      const client = createGithubClient(token);
      const { data } = await client.repos.listForAuthenticatedUser({
        sort: "updated",
        direction: "desc",
        per_page: perPage,
      });

      return data.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        fork: repo.fork,
        updatedAt: repo.updated_at,
      }));
    } catch (error: any) {
      this.handleError(error, "Failed to fetch user repositories");
    }
  }
  /**
   * Fetch repository metadata (e.g. description, stars, default branch)
   */
  async getRepositoryInfo(owner: string, repo: string, token?: string) {
    try {
      const client = createGithubClient(token);
      const { data } = await client.repos.get({
        owner,
        repo,
      });

      return {
        id: data.id,
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        url: data.html_url,
        defaultBranch: data.default_branch,
        visibility: data.visibility,
        language: data.language,
      };
    } catch (error: any) {
      this.handleError(error, `Failed to fetch repository info for ${owner}/${repo}`);
    }
  }

  /**
   * Fetch the contents of a specific file in the repository
   */
  async getFileContent(owner: string, repo: string, path: string, token?: string) {
    try {
      const client = createGithubClient(token);
      const { data } = await client.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(data) || data.type !== "file" || !("content" in data)) {
        throw new AppError(`Path ${path} is not a valid file`, 400, "GITHUB_INVALID_FILE");
      }

      // Content is base64 encoded by GitHub API
      const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

      return {
        path: data.path,
        content: decodedContent,
        sha: data.sha,
        size: data.size,
      };
    } catch (error: any) {
      this.handleError(error, `Failed to fetch file ${path} for ${owner}/${repo}`);
    }
  }

  /**
   * Fetch the repository tree structure
   */
  async getRepositoryTree(owner: string, repo: string, treeSha: string, token?: string) {
    try {
      const client = createGithubClient(token);
      const { data } = await client.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: "true", // Note: must be string "true" in Octokit
      });

      return data.tree;
    } catch (error: any) {
      this.handleError(error, `Failed to fetch tree for ${owner}/${repo}@${treeSha}`);
    }
  }

  /**
   * Fetch beginner-friendly issues (good first issue / help wanted) from the repository
   */
  async getGoodFirstIssues(owner: string, repo: string, token?: string) {
    try {
      const client = createGithubClient(token);
      const { data } = await client.issues.listForRepo({
        owner,
        repo,
        state: "open",
        labels: "good first issue",
        per_page: 5,
      });

      return data.map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        labels: issue.labels.map((l: any) => typeof l === "string" ? l : l.name),
        createdAt: issue.created_at,
        commentsCount: issue.comments,
      }));
    } catch (error: any) {
      logger.warn(`Failed to fetch good-first-issues for ${owner}/${repo}`, { error: error.message });
      return [];
    }
  }

  /**
   * Deterministically search GitHub for contribution opportunities
   */
  async searchIssues(languages: string[], labels: string[] = ["good first issue"], token?: string, maxResults = 10) {
    try {
      const client = createGithubClient(token);
      
      // Build the query string
      let query = "is:issue is:open no:assignee";
      
      if (labels.length > 0) {
        query += " " + labels.map(l => `label:"${l}"`).join(" ");
      }
      
      if (languages.length > 0) {
        // Use the primary language for the query to keep it simple and effective
        query += ` language:${languages[0]}`; 
      }

      const { data } = await client.request("GET /search/issues", {
        q: query,
        sort: "updated",
        order: "desc",
        per_page: maxResults,
      });

      return data.items.map((issue: any) => {
        // Extract repo full name from the URL 
        // issue.repository_url is like "https://api.github.com/repos/owner/repo"
        const repoUrlParts = issue.repository_url.split("/");
        const repoFullName = `${repoUrlParts[repoUrlParts.length - 2]}/${repoUrlParts[repoUrlParts.length - 1]}`;

        return {
          id: issue.id,
          number: issue.number,
          title: issue.title,
          url: issue.html_url,
          repository: repoFullName,
          labels: issue.labels.map((l: any) => typeof l === "string" ? l : l.name),
          createdAt: issue.created_at,
          commentsCount: issue.comments,
        };
      });
    } catch (error: any) {
      this.handleError(error, "Failed to search GitHub issues");
    }
  }

  // ─── Enriched Developer Data (P0) ──────────────────

  /**
   * Fetch repositories with enriched metadata for profile ingestion.
   * Returns topics, description, push date, size, and issue counts
   * in addition to the basic fields.
   */
  async getUserRepositoriesEnriched(token: string, perPage = 50) {
    if (!token) {
      throw new AppError("A valid GitHub token is required for this operation", 401, "GITHUB_UNAUTHORIZED");
    }
    try {
      const client = createGithubClient(token);
      const { data } = await client.repos.listForAuthenticatedUser({
        sort: "pushed",
        direction: "desc",
        per_page: perPage,
      });

      return data.map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        fork: repo.fork,
        size: repo.size,
        topics: repo.topics || [],
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        openIssuesCount: repo.open_issues_count,
        hasIssues: repo.has_issues,
        owner: repo.owner?.login,
      }));
    } catch (error: any) {
      this.handleError(error, "Failed to fetch enriched user repositories");
    }
  }

  /**
   * Fetch per-repo language byte counts for the user's top repos.
   * Calls GET /repos/{owner}/{repo}/languages for each repo.
   * 
   * @param repos - Array of { fullName: "owner/repo" } to fetch languages for
   * @param token - GitHub OAuth token
   * @param limit - Max repos to fetch (default 10 to conserve rate limit)
   * @returns Aggregated language bytes: { "TypeScript": 500000, "Python": 120000 }
   */
  async getUserLanguageBreakdown(
    repos: Array<{ fullName: string }>,
    token: string,
    limit = 10
  ): Promise<Record<string, number>> {
    if (!token) {
      throw new AppError("A valid GitHub token is required for this operation", 401, "GITHUB_UNAUTHORIZED");
    }

    const client = createGithubClient(token);
    const aggregated: Record<string, number> = {};
    const reposToFetch = repos.slice(0, limit);

    for (const repo of reposToFetch) {
      const [owner, name] = repo.fullName.split("/");
      try {
        const { data } = await client.repos.listLanguages({ owner, repo: name });
        for (const [lang, bytes] of Object.entries(data)) {
          aggregated[lang] = (aggregated[lang] || 0) + (bytes as number);
        }
      } catch (error: any) {
        // Non-fatal: skip repos where language fetch fails (e.g., empty repos)
        logger.warn(`Failed to fetch languages for ${repo.fullName}`, { error: error.message });
      }
    }

    return aggregated;
  }

  /**
   * Fetch real contribution statistics from the user's public events.
   * Uses GET /users/{username}/events to count commits, PRs, issues, reviews
   * from the last 90 days.
   * 
   * GitHub only returns the most recent 300 events (max 10 pages of 30),
   * so this is an approximation for active users.
   */
  async getUserContributionStats(token: string, username: string) {
    if (!token) {
      throw new AppError("A valid GitHub token is required for this operation", 401, "GITHUB_UNAUTHORIZED");
    }

    const client = createGithubClient(token);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const stats = {
      commitCount: 0,
      prCount: 0,
      issueCount: 0,
      reviewCount: 0,
      lastActiveAt: null as Date | null,
    };

    try {
      // Fetch up to 3 pages (90 events) — balance between data and rate limit
      for (let page = 1; page <= 3; page++) {
        const { data } = await client.activity.listPublicEventsForUser({
          username,
          per_page: 30,
          page,
        });

        if (data.length === 0) break;

        for (const event of data) {
          const eventDate = new Date(event.created_at || "");
          if (eventDate < ninetyDaysAgo) break;

          // Track most recent activity
          if (!stats.lastActiveAt || eventDate > stats.lastActiveAt) {
            stats.lastActiveAt = eventDate;
          }

          switch (event.type) {
            case "PushEvent":
              // Each PushEvent can contain multiple commits
              stats.commitCount += (event.payload as any)?.commits?.length || 1;
              break;
            case "PullRequestEvent":
              if ((event.payload as any)?.action === "opened") {
                stats.prCount += 1;
              }
              break;
            case "IssuesEvent":
              if ((event.payload as any)?.action === "opened") {
                stats.issueCount += 1;
              }
              break;
            case "PullRequestReviewEvent":
              stats.reviewCount += 1;
              break;
          }
        }
      }
    } catch (error: any) {
      // Non-fatal: if events API fails, return zeroed stats
      logger.warn("Failed to fetch user contribution events", { username, error: error.message });
    }

    return stats;
  }

  // ─── Enriched Issue Data (P0) ──────────────────────

  /**
   * Search GitHub for issues with the full signal set needed for quality matching.
   * 
   * Runs multiple searches (one per language) and deduplicates results.
   * Captures body, reactions, assignees, and repository context.
   * Filters out pull requests that appear in issue search results.
   */
  async searchIssuesEnriched(
    languages: string[],
    labels: string[] = ["good first issue"],
    token?: string,
    perLanguageLimit = 15
  ) {
    const client = createGithubClient(token);
    const seenIds = new Set<number>();
    const results: EnrichedIssueResult[] = [];

    // Search for each language separately to get broader coverage
    const searchLanguages = languages.length > 0 ? languages.slice(0, 3) : [""];

    for (const language of searchLanguages) {
      try {
        let query = "is:issue is:open";
        
        if (labels.length > 0) {
          query += " " + labels.map(l => `label:"${l}"`).join(" ");
        }
        if (language) {
          query += ` language:${language}`;
        }

        const { data } = await client.request("GET /search/issues", {
          q: query,
          sort: "updated",
          order: "desc",
          per_page: perLanguageLimit,
        });

        for (const item of data.items) {
          // Skip PRs that appear in search results
          if ((item as any).pull_request) continue;
          // Deduplicate across language searches
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);

          const repoUrlParts = item.repository_url.split("/");
          const repository = `${repoUrlParts[repoUrlParts.length - 2]}/${repoUrlParts[repoUrlParts.length - 1]}`;

          results.push({
            githubId: item.id,
            repository,
            issueNumber: item.number,
            title: item.title,
            body: item.body?.substring(0, 4000) || null, // Truncate for storage
            url: item.html_url,
            state: item.state || "open",
            issueCreatedAt: new Date(item.created_at),
            issueUpdatedAt: new Date(item.updated_at),
            closedAt: item.closed_at ? new Date(item.closed_at) : null,
            labels: item.labels.map((l: any) => typeof l === "string" ? l : l.name).filter(Boolean),
            commentsCount: item.comments || 0,
            reactionsTotal: (item as any).reactions?.total_count || 0,
            assigneeCount: item.assignees?.length || (item.assignee ? 1 : 0),
            linkedPrCount: 0, // Not available from search, would need timeline API
          });
        }
      } catch (error: any) {
        logger.warn(`Failed to search enriched issues for language: ${language}`, { error: error.message });
      }
    }

    return results;
  }

  /**
   * Fetch full detail for a single issue.
   * Used when a user wants to drill into a specific issue.
   */
  async getIssueDetail(owner: string, repo: string, issueNumber: number, token?: string) {
    try {
      const client = createGithubClient(token);
      const { data } = await client.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });

      return {
        githubId: data.id,
        repository: `${owner}/${repo}`,
        issueNumber: data.number,
        title: data.title,
        body: data.body?.substring(0, 4000) || null,
        url: data.html_url,
        state: data.state || "open",
        issueCreatedAt: new Date(data.created_at),
        issueUpdatedAt: new Date(data.updated_at),
        closedAt: data.closed_at ? new Date(data.closed_at) : null,
        labels: data.labels.map((l: any) => typeof l === "string" ? l : l.name).filter(Boolean),
        commentsCount: data.comments || 0,
        reactionsTotal: (data as any).reactions?.total_count || 0,
        assigneeCount: data.assignees?.length || (data.assignee ? 1 : 0),
        linkedPrCount: 0,
      };
    } catch (error: any) {
      this.handleError(error, `Failed to fetch issue #${issueNumber} for ${owner}/${repo}`);
    }
  }

  /**
   * Fetch basic repository context for enriching issue data.
   * Returns only the fields needed for issue signal derivation.
   */
  async getRepositoryContext(owner: string, repo: string, token?: string) {
    try {
      const client = createGithubClient(token);
      
      const [repoRes, prRes, langRes, topicsRes] = await Promise.allSettled([
        client.repos.get({ owner, repo }),
        client.request("GET /search/issues", {
          q: `repo:${owner}/${repo} is:pr is:closed`,
          per_page: 30, // Sample the last 30 closed PRs
        }),
        client.repos.listLanguages({ owner, repo }),
        client.repos.getAllTopics({ owner, repo }),
      ]);

      if (repoRes.status === "rejected") {
        throw new Error(repoRes.reason);
      }

      const repoData = repoRes.value.data;
      
      // Full language byte-breakdown (e.g. { "Java": 150000, "HTML": 80000 })
      const languages: Record<string, number> = langRes.status === "fulfilled"
        ? (langRes.value.data as Record<string, number>)
        : {};

      // Repository topics (e.g. ["react", "nextjs", "api"])
      const topics: string[] = topicsRes.status === "fulfilled"
        ? (topicsRes.value.data.names || [])
        : [];

      // Calculate PR acceptance rate
      let prAcceptanceRate: number | null = null;
      let prCount = 0;
      let mergedCount = 0;

      if (prRes.status === "fulfilled") {
        const prs = prRes.value.data.items;
        prCount = prs.length;
        if (prCount > 0) {
          mergedCount = prs.filter((item: any) => item.pull_request?.merged_at).length;
          prAcceptanceRate = (mergedCount / prCount) * 100;
        }
      }

      // Determine activity level based on pushed_at and PR activity
      let activityLevel = "low";
      const now = new Date();
      const pushedDate = new Date(repoData.pushed_at || repoData.updated_at || now);
      const daysSincePush = (now.getTime() - pushedDate.getTime()) / (1000 * 3600 * 24);

      if (daysSincePush > 365) {
        activityLevel = "inactive";
      } else if (daysSincePush < 30 && prCount > 5) {
        activityLevel = "active";
      } else if (daysSincePush < 90) {
        activityLevel = "moderate";
      }

      return {
        language: repoData.language,
        languages,
        topics,
        description: repoData.description || null,
        stars: repoData.stargazers_count,
        openIssues: repoData.open_issues_count,
        pushedAt: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
        updatedAt: repoData.updated_at ? new Date(repoData.updated_at) : null,
        prAcceptanceRate,
        activityLevel
      };
    } catch (error: any) {
      logger.warn(`Failed to fetch repo context for ${owner}/${repo}`, { error: error.message });
      return { 
        language: null, 
        languages: {} as Record<string, number>,
        topics: [] as string[],
        description: null,
        stars: 0, 
        openIssues: 0,
        pushedAt: null,
        updatedAt: null,
        prAcceptanceRate: null,
        activityLevel: "inactive"
      };
    }
  }


  /**
   * Map GitHub API errors to AppError
   */
  private handleError(error: any, contextMessage: string): never {
    const status = error.status || error.response?.status;
    const message = error.message || "Unknown GitHub API error";

    logger.error("GitHub API Error", { 
      status, 
      message, 
      contextMessage 
    });

    if (status === 404) {
      throw new AppError("Repository or resource not found on GitHub", 404, "GITHUB_NOT_FOUND");
    }
    if (status === 401 || status === 403) {
      throw new AppError("GitHub API authentication failed or rate limit exceeded", 401, "GITHUB_UNAUTHORIZED");
    }

    throw new InternalError("An unexpected error occurred while communicating with GitHub", "GITHUB_INTERNAL_ERROR");
  }
}

/**
 * Shape of an enriched issue result from searchIssuesEnriched / getIssueDetail.
 * Maps directly to github_issue table fields.
 */
export interface EnrichedIssueResult {
  githubId: number;
  repository: string;
  issueNumber: number;
  title: string;
  body: string | null;
  url: string;
  state: string;
  issueCreatedAt: Date;
  issueUpdatedAt: Date;
  closedAt: Date | null;
  labels: string[];
  commentsCount: number;
  reactionsTotal: number;
  assigneeCount: number;
  linkedPrCount: number;
}

export const githubService = new GithubService();

