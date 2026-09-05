import { Worker, Job, DelayedError } from "bullmq";
import { redis } from "../redis/index.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { issueIngestionService } from "../../modules/discovery/issue-ingestion.service.js";
import { prisma } from "../prisma/prisma.client.js";
import { GithubRateLimitError } from "../../common/errors/index.js";

/**
 * Broad set of languages to ingest during background sweep.
 * Covers the most popular languages on GitHub by repository count.
 */
const SWEEP_LANGUAGES = [
  "TypeScript", "JavaScript", "Python", "Java", "C", "C++", "C#",
  "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart",
  "Scala", "Shell", "Lua", "R", "Elixir", "Haskell", "Perl",
  "Objective-C", "HTML", "CSS", "Vue", "Svelte",
];

/**
 * Delay between language ingestions to stay within GitHub rate limits.
 * GitHub search API: 30 requests/min unauthenticated, 30 requests/min authenticated.
 * Each language does ~3 searches (3 label sets), so ~2 seconds between languages
 * keeps us well under the limit.
 */
const INTER_LANGUAGE_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get a GitHub token for background jobs.
 * Uses GITHUB_TOKEN env var first, then falls back to any user's OAuth token.
 */
async function getBackgroundToken(): Promise<string | undefined> {
  // Prefer a dedicated bot/app token from env
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }

  // Fall back to any available user OAuth token (dev convenience)
  try {
    const account = await prisma.account.findFirst({
      where: { providerId: "github", accessToken: { not: null } },
      select: { accessToken: true },
    });
    return account?.accessToken || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Process a broad-sweep job: iterate over all SWEEP_LANGUAGES
 * and ingest issues for each.
 */
async function processBroadSweep(job: Job, token?: string) {
  logger.info("Starting broad-sweep ingestion job", { jobId: job.id });
  const githubToken = await getBackgroundToken();
  
  let totalIngested = 0;
  let processedLangs = 0;
  const startIndex = job.data.resumeFromLanguageIndex || 0;

  for (let i = startIndex; i < SWEEP_LANGUAGES.length; i++) {
    const language = SWEEP_LANGUAGES[i];
    try {
      const result = await issueIngestionService.ingestIssuesForLanguage(language, githubToken);
      totalIngested += result.ingestedCount;
      processedLangs++;

      // Report progress
      await job.updateProgress(Math.round(((i + 1) / SWEEP_LANGUAGES.length) * 100));
      
      logger.info(`Ingested ${result.ingestedCount} issues for ${language}`, {
        language,
        ingestedCount: result.ingestedCount,
        progress: `${i + 1}/${SWEEP_LANGUAGES.length}`,
      });

      // Rate limit delay between languages
      if (i < SWEEP_LANGUAGES.length - 1) {
        await sleep(INTER_LANGUAGE_DELAY_MS);
      }
    } catch (err) {
      if (err instanceof GithubRateLimitError) {
        logger.warn("Broad sweep paused due to rate limit, saving progress", {
          language,
          resetAt: new Date(err.resetAt).toISOString()
        });
        
        await job.updateData({
          ...job.data,
          resumeFromLanguageIndex: i,
        });
        
        const retryAt = err.resetAt + 1000;
        if (token) {
          await job.moveToDelayed(retryAt, token);
          throw new DelayedError();
        } else {
          throw err;
        }
      }
      logger.warn(`Failed to ingest issues for ${language}, continuing sweep`, { error: err });
    }
  }

  logger.info("Broad-sweep ingestion complete", { totalIngested, processedLangs });
  return { totalIngested, processedLangs };
}

/**
 * Process a targeted ingestion job: ingest issues for a specific language.
 */
async function processTargeted(job: Job, token?: string) {
  const { language, difficulty } = job.data;
  logger.info("Starting targeted ingestion", { language, difficulty, jobId: job.id });
  
  const githubToken = await getBackgroundToken();
  
  try {
    const result = await issueIngestionService.ingestIssuesForLanguage(language, githubToken, difficulty);
    logger.info("Targeted ingestion complete", { language, ...result });
    return result;
  } catch (err) {
    if (err instanceof GithubRateLimitError) {
      logger.warn("Targeted ingestion paused due to rate limit", { language, resetAt: new Date(err.resetAt).toISOString() });
      const retryAt = err.resetAt + 1000;
      if (token) {
        await job.moveToDelayed(retryAt, token);
        throw new DelayedError();
      }
    }
    throw err;
  }
}

/**
 * Create and start the ingestion worker.
 */
export function startIngestionWorker() {
  const worker = new Worker(
    "issue-ingestion",
    async (job: Job, token?: string) => {
      switch (job.name) {
        case "broad-sweep":
          return processBroadSweep(job, token);
        case "targeted":
          return processTargeted(job, token);
        default:
          logger.warn("Unknown job type", { jobName: job.name });
      }
    },
    {
      connection: redis,
      prefix: `{stackaudit_${env.NODE_ENV}}`,
      concurrency: 1, // One job at a time to respect rate limits
      limiter: {
        max: 1,
        duration: 1000,
      },
    }
  );

  worker.on("completed", (job) => {
    logger.info("Ingestion job completed", { jobId: job?.id, name: job?.name });
  });

  worker.on("failed", (job, err) => {
    logger.error("Ingestion job failed", { jobId: job?.id, name: job?.name, error: err.message });
  });

  logger.info("Ingestion worker started", { module: "queue" });
  return worker;
}
