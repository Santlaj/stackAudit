import { prisma } from "../apps/api/src/infrastructure/prisma/prisma.client.js";
import { matchingService } from "../apps/api/src/modules/discovery/matching.service.js";

async function run() {
  const profile = await prisma.developer_profile.findFirst();
  if (!profile) {
    console.error("No developer profile found");
    process.exit(1);
  }

  console.log(`Using Developer Profile for user: ${profile.userId}`);
  console.log(`Observed Languages: ${profile.observedLanguages}`);
  console.log(`Preferred Complexity: ${profile.preferredComplexity}`);
  console.log(`Preferred Contribution Types: ${profile.preferredContributionTypes}`);

  const candidates = await matchingService.findCandidates(profile);
  console.log(`\nTotal candidates retrieved: ${candidates.length}`);

  let scoresOver80 = 0;
  let scores60to79 = 0;
  let scores40to59 = 0;
  let scoresUnder40 = 0;

  const results = candidates.map(issue => {
    const match = matchingService.scoreMatch(profile, issue);
    
    if (match.score >= 80) scoresOver80++;
    else if (match.score >= 60) scores60to79++;
    else if (match.score >= 40) scores40to59++;
    else scoresUnder40++;

    return {
      issue,
      score: match.score,
      reasons: match.reasons,
      gaps: match.gaps
    };
  }).sort((a, b) => b.score - a.score);

  console.log(`\nScores >= 80: ${scoresOver80}`);
  console.log(`Scores 60–79: ${scores60to79}`);
  console.log(`Scores 40–59: ${scores40to59}`);
  console.log(`Scores < 40: ${scoresUnder40}`);

  console.log("\nTop 20 Matches:");
  results.slice(0, 20).forEach((res, i) => {
    console.log(`\n[${i + 1}] ${res.issue.repository}#${res.issue.issueNumber} - ${res.issue.title}`);
    console.log(`Final Score: ${res.score}`);
    console.log(`Reasons: ${res.reasons.join(", ")}`);
    console.log(`Gaps: ${res.gaps.join(", ")}`);
  });

  process.exit(0);
}

run().catch(console.error);
