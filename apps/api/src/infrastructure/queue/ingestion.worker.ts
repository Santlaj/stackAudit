import { Worker, Job } from "bullmq";
import { redis } from "../redis/index.js";
import { logger } from "../../utils/logger.js";
import { issueIngestionService } from "../../modules/discovery/issue-ingestion.service.js";
import { prisma } from "../prisma/prisma.client.js";

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
async function processBroadSweep(job: Job) {
  logger.info("Starting broad-sweep ingestion job", { jobId: job.id });
  const token = await getBackgroundToken();
  
  let totalIngested = 0;
  let processedLangs = 0;

  for (const language of SWEEP_LANGUAGES) {
    try {
      const result = await issueIngestionService.ingestIssuesForLanguage(language, token);
      totalIngested += result.ingestedCount;
      processedLangs++;

      // Report progress
      await job.updateProgress(Math.round((processedLangs / SWEEP_LANGUAGES.length) * 100));
      
      logger.info(`Ingested ${result.ingestedCount} issues for ${language}`, {
        language,
        ingestedCount: result.ingestedCount,
        progress: `${processedLangs}/${SWEEP_LANGUAGES.length}`,
      });

      // Rate limit delay between languages
      if (processedLangs < SWEEP_LANGUAGES.length) {
        await sleep(INTER_LANGUAGE_DELAY_MS);
      }
    } catch (err) {
      logger.warn(`Failed to ingest issues for ${language}, continuing sweep`, { error: err });
    }
  }

  logger.info("Broad-sweep ingestion complete", { totalIngested, processedLangs });
  return { totalIngested, processedLangs };
}

/**
 * Process a targeted ingestion job: ingest issues for a specific language.
 */
async function processTargeted(job: Job) {
  const { language, difficulty } = job.data;
  logger.info("Starting targeted ingestion", { language, difficulty, jobId: job.id });
  
  const token = await getBackgroundToken();
  const result = await issueIngestionService.ingestIssuesForLanguage(language, token, difficulty);
  
  logger.info("Targeted ingestion complete", { language, ...result });
  return result;
}

/**
 * Create and start the ingestion worker.
 */
export function startIngestionWorker() {
  const worker = new Worker(
    "issue-ingestion",
    async (job: Job) => {
      switch (job.name) {
        case "broad-sweep":
          return processBroadSweep(job);
        case "targeted":
          return processTargeted(job);
        default:
          logger.warn("Unknown job type", { jobName: job.name });
      }
    },
    {
      connection: redis,
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
