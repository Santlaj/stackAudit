import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { AppError } from "../../common/errors/index.js";
import { githubService } from "../github/index.js";
import { getAiProvider } from "../../infrastructure/ai/index.js";
import { logger } from "../../utils/logger.js";
import { matchingService } from "./matching.service.js";
import { issueIngestionService } from "./issue-ingestion.service.js";

export class DiscoveryService {
  async getProfile(userId: string) {
    const profile = await prisma.developer_profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new AppError("Profile not found", 404, "PROFILE_NOT_FOUND");
    }
    return profile;
  }

  async getMatches(userId: string) {
    return prisma.issue_match.findMany({
      where: { userId },
      orderBy: { matchScore: "desc" },
      take: 30,
      include: { githubIssue: true },
    });
  }

  /**
   * The core Matching Engine: Finds repositories & issues suitable for the developer.
   * 
   * Changes from v1:
   * - Accepts separate `languages` and `frameworks` arrays
   * - Checks DB coverage before querying — enqueues async ingestion if sparse
   * - Uses upsert on (userId, githubIssueId) to prevent duplicate matches
   * - Filtering now actually works via repoLanguages JSON + difficulty
   */
  async discoverMatchesForUser(
    userId: string,
    languages?: string[],
    frameworks?: string[],
    difficulty?: string
  ) {
    logger.info("Starting discovery for user", { userId, languages, frameworks, difficulty });

    const profile = await this.getProfile(userId);
    let partialCoverage = false;

    // ─── Coverage check ───
    // Before filtering, verify we have adequate issue data for the selected languages
    if (languages && languages.length > 0) {
      const coverage = await issueIngestionService.getLanguageCoverage(languages);
      const uncoveredLangs = languages.filter(l => (coverage[l] || 0) < 5);

      if (uncoveredLangs.length > 0) {
        logger.info("Sparse coverage detected, enqueueing targeted ingestion", { uncoveredLangs });
        partialCoverage = true;
        
        // Enqueue targeted ingestion for uncovered languages via BullMQ
        // Import dynamically to avoid circular deps if queue not yet initialized
        try {
          const { enqueueTargetedIngestion } = await import("../../infrastructure/queue/index.js");
          for (const lang of uncoveredLangs) {
            await enqueueTargetedIngestion(lang, difficulty);
          }
        } catch (err) {
          logger.warn("Failed to enqueue targeted ingestion — queue may not be initialized", { error: err });
          // Fall through — we'll still return whatever we have
        }
      }
    }

    // ─── Find & Score candidates ───
    const matchesFound: any[] = [];
    let topMatches: any[] = [];

    try {
      const candidates = await matchingService.findCandidates(profile, languages, frameworks, difficulty);
      
      for (const issue of candidates) {
        const matchResult = matchingService.scoreMatch(profile, issue, languages, frameworks, difficulty);

        matchesFound.push({
          userId,
          repository: issue.repository,
          issueNumber: issue.issueNumber,
          issueTitle: issue.title,
          issueUrl: issue.url,
          githubIssueId: issue.id,
          complexity: issue.difficultyEstimate || "Unknown",
          contributionType: issue.issueType || "Unknown", 
          technologies: issue.repoLanguage ? [issue.repoLanguage] : [],
          matchScore: matchResult.score,
          reasons: matchResult.reasons,
          gaps: matchResult.gaps,
          status: "DISCOVERED"
        });
      }
      
      matchesFound.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      topMatches = matchesFound.slice(0, 30);

      // ─── Upsert matches (prevents duplicates) ───
      await prisma.$transaction(async (tx) => {
        for (const matchData of topMatches) {
          if (!matchData.githubIssueId) continue;

          const existing = await tx.issue_match.findFirst({
            where: {
              userId: matchData.userId,
              githubIssueId: matchData.githubIssueId,
            }
          });

          if (existing) {
            await tx.issue_match.update({
              where: { id: existing.id },
              data: {
                // Refresh scoring data but don't reset SAVED/VIEWED status
                repository: matchData.repository,
                issueNumber: matchData.issueNumber,
                issueTitle: matchData.issueTitle,
                issueUrl: matchData.issueUrl,
                complexity: matchData.complexity,
                contributionType: matchData.contributionType,
                technologies: matchData.technologies,
                matchScore: matchData.matchScore,
                reasons: matchData.reasons,
                gaps: matchData.gaps,
              }
            });
          } else {
            await tx.issue_match.create({
              data: matchData
            });
          }
        }
      });
      
    } catch (err) {
      logger.error("Failed to execute discovery matching", { userId, error: err });
      throw new AppError("Failed to discover issues", 500, "DISCOVERY_FAILED");
    }

    // Return EXACTLY the matches that were just processed for the current filter
    const issueIds = topMatches.map((m: any) => m.githubIssueId).filter(Boolean) as string[];
    const matches = await prisma.issue_match.findMany({
      where: {
        userId,
        githubIssueId: { in: issueIds }
      },
      orderBy: { matchScore: 'desc' }
    });

    return { matches, partialCoverage };
  }

  /**
   * On-Demand AI Evaluation: Deep analysis leveraging deterministic context
   */
  async evaluateMatchContext(issueMatchId: string, githubToken?: string) {
    logger.info("Evaluating match context", { issueMatchId });

    // 1. Fetch the match and user profile
    const match = await prisma.issue_match.findUnique({ 
      where: { id: issueMatchId },
      include: { githubIssue: true }
    });
    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    
    const profile = await this.getProfile(match.userId);

    // 2. Fetch repository context (Description & README)
    const [owner, repo] = match.repository.split("/");
    let repoContext = "No repository context available.";
    
    try {
      const repoInfo = await githubService.getRepositoryInfo(owner, repo, githubToken);
      let readme = "";
      try {
        const readmeData = await githubService.getFileContent(owner, repo, "README.md", githubToken);
        readme = readmeData?.content.substring(0, 1000) || ""; 
      } catch {
        // ignore
      }
      repoContext = `Description: ${repoInfo?.description || "None"}\nREADME Snippet:\n${readme}`;
    } catch (err) {
      logger.warn("Failed to fetch repo context for AI", { repository: match.repository });
    }

    const issueBody = match.githubIssue?.body || "No issue body available.";

    // 3. Prompt AI for deep evaluation
    const aiProvider = getAiProvider();
    const systemContext = `You are a Developer-Issue Matchmaker AI.
Evaluate how well an open-source issue matches a developer's profile and extract contribution context.
Return a JSON object ONLY with the following exact keys:
{
  "matchReason": string (1-2 sentences explaining why this fits, beyond the basic technical match),
  "missingSignals": string (What domain knowledge they might lack or what makes this specifically challenging),
  "learningRelevance": string (What they will learn by doing this),
  "architecturalContext": string (Brief context on the architecture relevant to this issue),
  "relevantFiles": string[] (Array of specific file names or modules that likely need to be changed),
  "implementationApproach": string (A short suggested approach to fixing the issue)
}`;

    const prompt = `Developer Profile:
Skills: ${[...((profile as any).observedLanguages || []), ...((profile as any).currentFocus || [])].join(", ")}
Experience: ${(profile as any).preferredComplexity || "Unknown"}
Interests: ${[...((profile as any).learningGoals || []), ...((profile as any).preferredContributionTypes || [])].join(", ")}

Issue Context:
Repository: ${match.repository}
Issue Title: ${match.issueTitle}
Issue Body: ${issueBody.substring(0, 1500)}
Technologies: ${match.technologies.join(", ")}
Repository Context: ${repoContext}

Deterministic System Evaluation (Already Calculated):
Score: ${match.matchScore}/100
Reasons: ${match.reasons.join(", ")}
Gaps: ${match.gaps.join(", ")}

Extract context and provide the deeper semantic evaluation based on the above context. DO NOT override deterministic facts.`;

    try {
      const result = await aiProvider.analyze({
        prompt,
        systemContext,
        temperature: 0.2,
      });

      // 4. Parse AI Response
      const jsonStr = result.content.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      
      // 5. Update the Match in the DB
      const updatedMatch = await prisma.issue_match.update({
        where: { id: issueMatchId },
        data: {
          matchReason: parsed.matchReason || "This issue appears to be a reasonable starting point.",
          missingSignals: parsed.missingSignals || "None identified.",
          learningRelevance: parsed.learningRelevance || "General open-source contribution experience.",
          status: "VIEWED"
        },
        include: { githubIssue: true }
      });

      return {
        ...updatedMatch,
        architecturalContext: parsed.architecturalContext,
        relevantFiles: parsed.relevantFiles,
        implementationApproach: parsed.implementationApproach
      };
    } catch (error) {
      logger.error("Failed to evaluate match with AI", { issueMatchId, error });
      throw new AppError("Failed to evaluate match and extract context", 500, "AI_EVALUATION_FAILED");
    }
  }
  async toggleSaveMatch(issueMatchId: string, userId: string) {
    const match = await prisma.issue_match.findUnique({
      where: { id: issueMatchId }
    });
    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    if (match.userId !== userId) throw new AppError("Unauthorized", 403, "UNAUTHORIZED");

    const newStatus = match.status === "SAVED" ? "DISCOVERED" : "SAVED";

    return prisma.issue_match.update({
      where: { id: issueMatchId },
      data: { status: newStatus },
      include: { githubIssue: true }
    });
  }

  async getSavedMatches(userId: string) {
    return prisma.issue_match.findMany({
      where: {
        userId,
        status: { in: ["SAVED", "ANALYZED", "STARTED"] }
      },
      orderBy: { updatedAt: "desc" },
      include: { githubIssue: true }
    });
  }

  async updateMatchStatus(issueMatchId: string, userId: string, newStatus: string) {
    const match = await prisma.issue_match.findUnique({
      where: { id: issueMatchId }
    });
    
    if (!match) throw new AppError("Match not found", 404, "MATCH_NOT_FOUND");
    if (match.userId !== userId) throw new AppError("Unauthorized", 403, "UNAUTHORIZED");

    const validTransitions: Record<string, string[]> = {
      "DISCOVERED": ["EXPLORED", "VIEWED", "SAVED"],
      "EXPLORED": ["SAVED", "STARTED"],
      "VIEWED": ["SAVED", "STARTED"],
      "SAVED": ["DISCOVERED", "ANALYZED", "STARTED"],
      "ANALYZED": ["STARTED", "SAVED"],
      "STARTED": ["SAVED", "PR_SUBMITTED"], // Can unsave to drop it
      "PR_SUBMITTED": ["MERGED"],
      "MERGED": []
    };

    const allowed = validTransitions[match.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(`Invalid state transition from ${match.status} to ${newStatus}`, 400, "INVALID_TRANSITION");
    }

    return prisma.issue_match.update({
      where: { id: issueMatchId },
      data: { status: newStatus },
      include: { githubIssue: true }
    });
  }
}

export const discoveryService = new DiscoveryService();
