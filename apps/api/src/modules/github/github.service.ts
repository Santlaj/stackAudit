import { createGithubClient } from "../../infrastructure/github/index.js";
import { AppError, InternalError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";

export class GithubService {
  /**
   * Fetch the authenticated user's profile information
   */
  async getAuthenticatedUser(token: string) {
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

      const { data } = await client.search.issuesAndPullRequests({
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

export const githubService = new GithubService();
