import { exec } from "child_process";
import { promisify } from "util";
import { rm, mkdtemp, stat } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { logger } from "../../utils/logger.js";
import { AppError } from "../../common/errors/index.js";

const execAsync = promisify(exec);

export class RepositoryFetcherService {
  private readonly MAX_CLONE_TIME_MS = 45000; // 45 seconds max to prevent server lockups

  /**
   * Fast-path: Fetches the repository file tree and manifest files in ~300ms directly
   * from the GitHub Git Trees API without writing to disk or running git clone.
   */
  async fetchRepositoryTreeFast(owner: string, repo: string, token?: string): Promise<{
    filePaths: string[];
    packageJson?: string;
    readme?: string;
  } | null> {
    try {
      const { createGithubClient } = await import("../../infrastructure/github/github.client.js");
      const octokit = createGithubClient(token);

      const treeResponse = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: "HEAD",
        recursive: "1",
      });

      if (!treeResponse.data.tree || treeResponse.data.tree.length === 0) {
        return null;
      }

      const filePaths = treeResponse.data.tree
        .filter((item) => item.type === "blob" && item.path)
        .map((item) => item.path!);

      let packageJson: string | undefined;
      let readme: string | undefined;

      const hasPackageJson = filePaths.some(p => p === "package.json");
      const readmePath = filePaths.find(p => /^readme(\.md)?$/i.test(p));

      const manifestPromises: Promise<void>[] = [];

      if (hasPackageJson) {
        manifestPromises.push(
          fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/package.json`, {
            signal: AbortSignal.timeout(3000),
          })
            .then(res => res.ok ? res.text() : undefined)
            .then(text => { packageJson = text; })
            .catch(() => {})
        );
      }

      if (readmePath) {
        manifestPromises.push(
          fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${readmePath}`, {
            signal: AbortSignal.timeout(3000),
          })
            .then(res => res.ok ? res.text() : undefined)
            .then(text => { readme = text; })
            .catch(() => {})
        );
      }

      await Promise.all(manifestPromises);

      logger.info(`[FastRepoFetcher] Successfully retrieved ${filePaths.length} file paths via GitHub API in memory for ${owner}/${repo}`);
      return {
        filePaths,
        packageJson,
        readme,
      };
    } catch (err: any) {
      logger.info(`Fast tree inspection skipped for ${owner}/${repo}: ${err.message}. Falling back to shallow clone.`);
      return null;
    }
  }

  /**
   * Clones a repository into a temporary directory.
   * Returns the path to the directory. It is the caller's responsibility to call cleanup.
   */
  async fetchRepository(owner: string, repo: string, commitSha?: string): Promise<string> {
    const tempDirPrefix = join(tmpdir(), `stackaudit-repo-${owner}-${repo}-`);
    const tempDir = await mkdtemp(tempDirPrefix);
    
    // Safety check on inputs
    if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
      await this.cleanup(tempDir);
      throw new AppError("Invalid repository owner or name", 400, "INVALID_REPO_FORMAT");
    }

    if (commitSha && !/^[a-f0-9]{4,40}$/.test(commitSha)) {
      await this.cleanup(tempDir);
      throw new AppError("Invalid commit SHA", 400, "INVALID_COMMIT_SHA");
    }

    const repoUrl = `https://github.com/${owner}/${repo}.git`;
    logger.info(`Fetching repository ${repoUrl} into ${tempDir}`);

    try {
      if (commitSha) {
        await execAsync(`git init`, { cwd: tempDir, timeout: 10000, maxBuffer: 10 * 1024 * 1024 });
        await execAsync(`git config core.longpaths true`, { cwd: tempDir, timeout: 5000 });
        await execAsync(`git remote add origin ${repoUrl}`, { cwd: tempDir, timeout: 10000, maxBuffer: 10 * 1024 * 1024 });
        await execAsync(`git fetch --depth 1 origin ${commitSha}`, { cwd: tempDir, timeout: this.MAX_CLONE_TIME_MS, maxBuffer: 50 * 1024 * 1024 });
        await execAsync(`git checkout FETCH_HEAD`, { cwd: tempDir, timeout: 30000, maxBuffer: 50 * 1024 * 1024 });
      } else {
        // Fast shallow clone: single-branch and no-tags keeps payload minimal on memory-constrained servers
        await execAsync(`git -c core.longpaths=true clone --depth 1 --single-branch --no-tags ${repoUrl} .`, { cwd: tempDir, timeout: this.MAX_CLONE_TIME_MS, maxBuffer: 50 * 1024 * 1024 });
      }
      
      return tempDir;
    } catch (error: any) {
      logger.error(`Failed to fetch repository ${owner}/${repo}`, { error: error.message });
      await this.cleanup(tempDir);
      throw new AppError("Failed to fetch repository", 500, "REPO_FETCH_FAILED");
    }
  }

  /**
   * Safely removes the temporary directory
   */
  async cleanup(tempDir: string): Promise<void> {
    if (!tempDir || tempDir === "/") return; // Safety guard
    
    try {
      const stats = await stat(tempDir);
      if (stats.isDirectory()) {
        await rm(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
        logger.info(`Cleaned up temporary directory: ${tempDir}`);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        logger.warn(`Failed to clean up directory ${tempDir} after 5 attempts.`, { error: error.message, code: error.code });
      }
    }
  }
}

export const repositoryFetcherService = new RepositoryFetcherService();
