import { exec } from "child_process";
import { promisify } from "util";
import { rm, mkdtemp, stat } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { logger } from "../../utils/logger.js";
import { AppError } from "../../common/errors/index.js";

const execAsync = promisify(exec);

export class RepositoryFetcherService {
  private readonly MAX_CLONE_TIME_MS = 60000; // 60 seconds

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
        // To fetch a specific commit efficiently:
        // git init -> git remote add -> git fetch --depth 1 origin <sha> -> git checkout FETCH_HEAD
        await execAsync(`git init`, { cwd: tempDir, timeout: 5000 });
        await execAsync(`git remote add origin ${repoUrl}`, { cwd: tempDir, timeout: 5000 });
        await execAsync(`git fetch --depth 1 origin ${commitSha}`, { cwd: tempDir, timeout: this.MAX_CLONE_TIME_MS });
        await execAsync(`git checkout FETCH_HEAD`, { cwd: tempDir, timeout: 10000 });
      } else {
        // Simple shallow clone
        await execAsync(`git clone --depth 1 ${repoUrl} .`, { cwd: tempDir, timeout: this.MAX_CLONE_TIME_MS });
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
        await rm(tempDir, { recursive: true, force: true });
        logger.info(`Cleaned up temporary directory: ${tempDir}`);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        logger.error(`Failed to clean up directory ${tempDir}`, { error: error.message });
      }
    }
  }
}

export const repositoryFetcherService = new RepositoryFetcherService();
