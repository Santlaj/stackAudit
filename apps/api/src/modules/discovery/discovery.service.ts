import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { AppError } from "../../common/errors/index.js";
import { githubService } from "../github/index.js";
import { getAiProvider } from "../../infrastructure/ai/index.js";
import { logger } from "../../utils/logger.js";

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
    });
  }

  /**
   * The core Matching Engine: Finds repositories & issues suitable for the developer
   */
  async discoverMatchesForUser(userId: string, techStack?: string[], difficulty?: string) {
    logger.info("Starting deterministic discovery for user", { userId, techStack, difficulty });

    const profile = await this.getProfile(userId).catch(() => null);

    // 1. Gather signals from profile or explicit preferences
    let searchLanguages: string[] = [];
    
    if (techStack && techStack.length > 0) {
      searchLanguages = techStack;
    } else if (profile) {
      // @ts-ignore
      const allSkills: string[] = [...(profile.observedLanguages || []), ...(profile.currentFocus || [])];
      const uniqueSkills = [...new Set(allSkills)];
      searchLanguages = uniqueSkills.slice(0, 3); // Max 3 languages to search at once
    } else {
      searchLanguages = ["JavaScript"]; // Safe default
    }

    const matchesFound = [];

    // Map difficulty to GitHub labels
    let searchLabels = ["good first issue"];
    if (difficulty === "intermediate") searchLabels = ["help wanted"];
    if (difficulty === "advanced") searchLabels = ["help wanted", "enhancement"];

    // 2. Deterministic Search via GitHub API
    try {
      const issues = await githubService.searchIssues(searchLanguages, searchLabels, undefined, 10);
      
      if (issues) {
        for (const issue of issues) {
          // Check if we already matched this issue
          const existing = await prisma.issue_match.findFirst({
            where: { userId, repository: issue.repository, issueNumber: issue.number },
          });

          if (existing) continue;

          // 3. Save as raw DISCOVERED match
          // We will NOT evaluate with AI here to save cost and time. AI is deferred.
          const match = await prisma.issue_match.create({
            data: {
              userId,
              repository: issue.repository,
              issueNumber: issue.number,
              issueTitle: issue.title,
              issueUrl: issue.url,
              complexity: "Good First Issue", // Derived deterministically from label
              contributionType: "Unknown", 
              technologies: searchLanguages,
              matchScore: 50, // Base deterministic score
              status: "DISCOVERED"
            } as any,
          });
          matchesFound.push(match);
        }
      }
    } catch (err) {
      logger.error("Failed to execute deterministic search", { userId, error: err });
    }

    return matchesFound;
  }

  /**
   * On-Demand AI Evaluation: Deep analysis of a specific discovered issue
   */
  async evaluateMatchContext(issueMatchId: string, githubToken?: string) {
    logger.info("Evaluating match context", { issueMatchId });

    // 1. Fetch the match and user profile
    const match = await prisma.issue_match.findUnique({ where: { id: issueMatchId } });
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
        readme = readmeData?.content.substring(0, 1000) || ""; // Keep it short to save tokens
      } catch {
        // README might not exist or be named differently, ignore
      }
      repoContext = `Description: ${repoInfo?.description || "None"}\nREADME Snippet:\n${readme}`;
    } catch (err) {
      logger.warn("Failed to fetch repo context for AI", { repository: match.repository });
    }

    // 3. Prompt AI for deep evaluation
    const aiProvider = getAiProvider();
    const systemContext = `You are a Developer-Issue Matchmaker AI.
Evaluate how well an open-source issue matches a developer's profile.
Return a JSON object ONLY with the following exact keys:
{
  "matchScore": number (0-100, where 100 is a perfect fit),
  "matchReason": string (1-2 sentences explaining why this fits),
  "missingSignals": string (What skills they might lack or what makes this challenging),
  "learningRelevance": string (What they will learn by doing this)
}`;

    // @ts-ignore - Prisma types need to be regenerated
    const prompt = `Developer Profile:
Skills: ${[...(profile.observedLanguages || []), ...(profile.currentFocus || [])].join(", ")}
Experience: ${profile.preferredComplexity || "Unknown"}
Interests: ${[...(profile.learningGoals || []), ...(profile.preferredContributionTypes || [])].join(", ")}

Issue Context:
Repository: ${match.repository}
Issue Title: ${match.issueTitle}
Technologies: ${match.technologies.join(", ")}
Repository Context: ${repoContext}`;

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
      // @ts-ignore - Prisma types need to be regenerated
      const updatedMatch = await prisma.issue_match.update({
        where: { id: issueMatchId },
        data: {
          matchScore: Number(parsed.matchScore) || 50,
          matchReason: parsed.matchReason || "This issue appears to be a reasonable starting point.",
          missingSignals: parsed.missingSignals || "None identified.",
          learningRelevance: parsed.learningRelevance || "General open-source contribution experience.",
          status: "VIEWED"
        } as any,
      });

      return updatedMatch;
    } catch (error) {
      logger.error("Failed to evaluate match with AI", { issueMatchId, error });
      throw new AppError("Failed to evaluate match", 500, "AI_EVALUATION_FAILED");
    }
  }


}

export const discoveryService = new DiscoveryService();
