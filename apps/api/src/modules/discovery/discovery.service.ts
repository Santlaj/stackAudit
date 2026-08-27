import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { AppError } from "../../common/errors/index.js";
import { githubService } from "../github/index.js";
import { getAiProvider } from "../../infrastructure/ai/index.js";
import { logger } from "../../utils/logger.js";
import { matchingService } from "./matching.service.js";

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
      include: { githubIssue: true },
    });
  }

  /**
   * The core Matching Engine: Finds repositories & issues suitable for the developer
   * Now uses the local database of ingested github_issues.
   */
  async discoverMatchesForUser(userId: string, techStack?: string[], difficulty?: string) {
    logger.info("Starting deterministic matching for user", { userId, techStack, difficulty });

    const profile = await this.getProfile(userId);
    const matchesFound = [];

    try {
      // 1. Find candidates from local DB
      const candidates = await matchingService.findCandidates(profile, techStack, difficulty);
      
      // 2. Score each candidate
      for (const issue of candidates) {
        // 3. Score deterministically
        const matchResult = matchingService.scoreMatch(profile, issue, techStack, difficulty);

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
      const topMatches = matchesFound.slice(0, 50);

      await prisma.$transaction(async (tx) => {
        // Only clear previously DISCOVERED matches. Save VIEWED or SAVED matches.
        await tx.issue_match.deleteMany({
          where: { userId, status: "DISCOVERED" }
        });
        
        for (const matchData of topMatches) {
          await tx.issue_match.create({ data: matchData });
        }
      });
      
    } catch (err) {
      logger.error("Failed to execute deterministic matching", { userId, error: err });
      throw new AppError("Failed to discover issues", 500, "DISCOVERY_FAILED");
    }

    return this.getMatches(userId);
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
Skills: ${[...(profile.observedLanguages || []), ...(profile.currentFocus || [])].join(", ")}
Experience: ${profile.preferredComplexity || "Unknown"}
Interests: ${[...(profile.learningGoals || []), ...(profile.preferredContributionTypes || [])].join(", ")}

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
}

export const discoveryService = new DiscoveryService();
