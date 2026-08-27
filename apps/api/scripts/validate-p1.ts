import { PrismaClient } from "@prisma/client";
import { issueIngestionService } from "../src/modules/discovery/issue-ingestion.service.js";
import { discoveryService } from "../src/modules/discovery/discovery.service.js";
import { logger } from "../src/utils/logger.js";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

async function main() {
  console.log("=== P1 Validation: Explainable Matching Engine ===");

  // 1. Get the first user
  const user = await prisma.account.findFirst({
    where: { providerId: "github" },
    include: { user: true },
  });

  if (!user) {
    console.error("No GitHub user found in database. Please login via UI first.");
    process.exit(1);
  }

  const userId = user.userId;
  const token = user.accessToken;

  console.log(`\nFound User: ${user.user.name} (${userId})`);

  // 2. Fetch the developer profile
  const profile = await prisma.developer_profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    console.error("No developer profile found. Please run profile ingestion first.");
    process.exit(1);
  }

  console.log(`\nDeveloper Profile Profile:`);
  console.log(`- Languages: ${profile.recentLanguages?.join(", ")}`);
  console.log(`- Complexity: ${profile.preferredComplexity}`);
  console.log(`- Types: ${profile.preferredContributionTypes?.join(", ")}`);

  // 3. Ingest some fresh issues to populate the new Activity and PR fields
  console.log("\n--- Re-ingesting 10 issues to populate Repository Activity / PR Rates ---");
  try {
    const ingestResult = await issueIngestionService.ingestIssuesForUser(userId, token!);
    console.log(`Ingested ${ingestResult.ingestedCount} issues.`);
  } catch (err: any) {
    console.error("Ingestion failed", err.message);
  }

  // 4. Run Deterministic Matching
  console.log("\n--- Running Deterministic Discovery ---");
  
  // Clear old matches for a clean test
  await prisma.issue_match.deleteMany({ where: { userId } });
  
  const matches = await discoveryService.discoverMatchesForUser(userId);
  console.log(`Found ${matches.length} matches in local DB.`);

  console.log("\nTop 5 Matches:");
  for (const match of matches.slice(0, 5)) {
    console.log(`\n[Score: ${match.matchScore}] ${match.repository}#${match.issueNumber} - ${match.issueTitle}`);
    console.log(`  Reasons:`);
    match.reasons.forEach((r: string) => console.log(`   + ${r}`));
    console.log(`  Gaps:`);
    match.gaps.forEach((g: string) => console.log(`   - ${g}`));
    
    // Test AI semantic evaluation on the top match
    if (match.id === matches[0].id) {
      console.log(`\n--- Running AI Evaluation on Top Match ---`);
      const evaluated = await discoveryService.evaluateMatchContext(match.id, token!);
      console.log(`  Match Reason: ${evaluated.matchReason}`);
      console.log(`  Missing Signals: ${evaluated.missingSignals}`);
      console.log(`  Learning: ${evaluated.learningRelevance}`);
    }
  }

  console.log("\n=== P1 Validation Complete ===");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
