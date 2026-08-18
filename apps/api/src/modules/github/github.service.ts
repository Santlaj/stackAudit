import { createGithubClient } from "../../infrastructure/github/index.js";
import { AppError, InternalError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";

export class GithubService {
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
