import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { developer_profile, github_issue } from "@prisma/client";

export class MatchingService {
  /**
   * Find candidate issues for a developer from the local database.
   */
  async findCandidates(profile: developer_profile, techStack?: string[], difficulty?: string) {
    const whereClause: any = { 
      state: "open",
      staleness: { not: "abandoned" }
    };
    
    return prisma.github_issue.findMany({
      where: whereClause,
      take: 250, // Limit candidate pool for performance
      orderBy: [
        { repoStars: 'desc' }, // Favor popular repos as initial heuristic
        { ingestedAt: 'desc' }
      ]
    });
  }

  /**
   * Deterministic scoring engine.
   * Returns a normalized score 0-100 and structured reasons/gaps.
   */
  scoreMatch(profile: developer_profile, issue: github_issue, techStack?: string[], difficulty?: string) {
    let score = 0;
    const reasons: string[] = [];
    const gaps: string[] = [];
    
    // Use explicit techStack if provided, fallback to profile
    const targetLanguages = techStack && techStack.length > 0 
      ? techStack.map(l => l.toLowerCase()) 
      : [
          ...(profile.recentLanguages || []), 
          ...(profile.observedLanguages || []),
          ...(profile.currentFocus || [])
        ].map(l => l.toLowerCase());

    const targetDifficulty = difficulty 
      ? difficulty.toLowerCase() 
      : (profile.preferredComplexity || "").toLowerCase();

    // ─── 1. Language Match (Weight: 35%) ───
    if (issue.repoLanguage && targetLanguages.includes(issue.repoLanguage.toLowerCase())) {
      score += 35;
      reasons.push(`The primary language (${issue.repoLanguage}) matches your technology stack.`);
    } else if (issue.repoLanguage) {
      gaps.push(`The primary language is ${issue.repoLanguage}, which isn't in your active stack.`);
    } else {
      gaps.push(`The repository language is not specified.`);
    }

    // ─── 2. Difficulty Match (Weight: 20%) ───
    const diff = issue.difficultyEstimate;
    
    if (diff && targetDifficulty) {
      if (diff.toLowerCase() === targetDifficulty) {
        score += 20;
        reasons.push(`This is a ${diff}-friendly issue, matching your preference.`);
      } else {
        gaps.push(`Issue difficulty (${diff}) does not perfectly align with your preference (${targetDifficulty}).`);
      }
    } else if (!diff) {
      gaps.push(`The issue difficulty is not explicitly known.`);
    }

    // ─── 3. Contribution Type (Weight: 15%) ───
    const type = issue.issueType; 
    const prefTypes = (profile.preferredContributionTypes || []).map(t => t.toLowerCase());
    
    if (type && prefTypes.some(pt => pt.includes(type) || type.includes(pt))) {
      score += 15;
      reasons.push(`This is a ${type} issue, which matches your preferred contribution types.`);
    } else if (type) {
      gaps.push(`The issue is a ${type}, which is not in your preferred contribution types.`);
    } else {
      gaps.push(`The contribution type is unclear.`);
    }

    // ─── 4. Repository Activity (Weight: 10%) ───
    if (issue.repoActivityLevel === "active") {
      score += 10;
      reasons.push(`Repository is highly active and actively maintained.`);
    } else if (issue.repoActivityLevel === "moderate") {
      score += 5;
      reasons.push(`Repository has moderate activity.`);
    } else if (issue.repoActivityLevel === "inactive") {
      gaps.push(`Repository appears inactive. Reviewing PRs may be slow.`);
    } else {
      gaps.push(`Repository activity is low or unknown.`);
    }

    // ─── 5. Issue Freshness (Weight: 10%) ───
    if (issue.staleness === "fresh") {
      score += 10;
      reasons.push(`The issue is recently created or updated.`);
    } else if (issue.staleness === "aging") {
      score += 5;
      reasons.push(`The issue has been open for a while but isn't stale.`);
    } else if (issue.staleness === "stale") {
      gaps.push(`The issue is stale and might be outdated.`);
    } else {
      gaps.push(`Issue freshness is unknown.`);
    }

    // ─── 6. PR Acceptance Rate (Weight: 10%) ───
    if (issue.repoPrAcceptanceRate !== null && issue.repoPrAcceptanceRate !== undefined) {
      if (issue.repoPrAcceptanceRate > 70) {
        score += 10;
        reasons.push(`High PR acceptance rate (${Math.round(issue.repoPrAcceptanceRate)}%), meaning contributions are likely to be merged.`);
      } else if (issue.repoPrAcceptanceRate > 40) {
        score += 5;
      } else {
        gaps.push(`Low PR acceptance rate (${Math.round(issue.repoPrAcceptanceRate)}%). Your contribution might take longer to review.`);
      }
    } else {
      gaps.push(`PR acceptance rate is unknown.`);
    }

    // Normalize
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    return { score, reasons, gaps };
  }
}

export const matchingService = new MatchingService();
