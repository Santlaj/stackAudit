import { PrismaClient } from '@prisma/client';
import { profileService } from '../src/modules/user/profile.service.js';
import { issueIngestionService } from '../src/modules/discovery/issue-ingestion.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting P0 Validation Script...");

  const account = await prisma.account.findFirst({
    where: { providerId: 'github', accessToken: { not: null } }
  });

  if (!account) {
    console.error("❌ No GitHub account found with an access token in the database.");
    console.log("Please log into StackAudit via GitHub so an account token is saved.");
    process.exit(1);
  }

  const userId = account.userId;
  const token = account.accessToken!;

  console.log(`✅ Found authenticated GitHub user: ${userId}`);

  // 1. Validate Developer Ingestion
  console.log("\n--- Validating Developer Ingestion ---");
  try {
    const profile = await profileService.ingestGitHubProfile(userId, token);
    console.log("Developer Profile ingested successfully:");
    console.log(JSON.stringify(profile, null, 2));
  } catch (err) {
    console.error("❌ Developer ingestion failed:", err);
  }

  // 2. Validate Issue Ingestion
  console.log("\n--- Validating Issue Ingestion ---");
  try {
    const ingestResult = await issueIngestionService.ingestIssuesForUser(userId, token);
    console.log("Issue Ingestion Result:", ingestResult);
  } catch (err) {
    console.error("❌ Issue ingestion failed:", err);
  }

  // 3. Inspect 5-10 real github_issue records
  console.log("\n--- Inspecting GitHub Issues ---");
  const issues = await prisma.github_issue.findMany({ take: 8, orderBy: { ingestedAt: 'desc' } });
  
  if (issues.length === 0) {
    console.log("No issues found in the database.");
  } else {
    for (const issue of issues) {
      console.log(`\nIssue: ${issue.repository}#${issue.issueNumber} - ${issue.title}`);
      console.log(`  staleness: ${issue.staleness}`);
      console.log(`  activityLevel: ${issue.activityLevel}`);
      console.log(`  difficultyEstimate: ${issue.difficultyEstimate}`);
      console.log(`  issueType: ${issue.issueType}`);
      console.log(`  isGoodFirstIssue: ${issue.isGoodFirstIssue}`);
      console.log(`  isHelpWanted: ${issue.isHelpWanted}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
