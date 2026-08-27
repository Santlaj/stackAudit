import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { githubService } from "../github/index.js";
import { AppError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";

// Threshold for "recently active" repos — 6 months
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 180;

export class ProfileService {
  /**
   * Ingests real Developer Profile data via GitHub module.
   * 
   * Uses enriched repository data, per-repo language byte counts,
   * and actual contribution events to build an accurate profile.
   */
  async ingestGitHubProfile(userId: string, token: string) {
    logger.info("Ingesting GitHub profile for user", { userId });

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    try {
      // 1. Fetch authenticated user for basic profile data
      const githubUser = await githubService.getAuthenticatedUser(token);
      if (!githubUser) {
        throw new AppError("Could not fetch GitHub user", 500, "GITHUB_USER_FETCH_FAILED");
      }

      // 2. Fetch enriched repositories (sorted by push date, top 50)
      const repos = await githubService.getUserRepositoriesEnriched(token, 50) || [];
      
      // 3. Fetch language byte breakdown for top 10 repos (by push date)
      //    Only include non-fork repos owned by the user
      const ownedRepos = repos.filter(r => !r.fork && r.owner === githubUser.login);
      const languageBytes = await githubService.getUserLanguageBreakdown(
        ownedRepos.slice(0, 10).map(r => ({ fullName: r.fullName })),
        token,
        10
      );

      // 4. Fetch real contribution statistics
      const contributionStats = await githubService.getUserContributionStats(token, githubUser.login);

      // 5. Derive observed languages from byte counts (sorted by bytes, descending)
      const observedLanguages = Object.entries(languageBytes)
        .sort(([, a], [, b]) => b - a)
        .map(([lang]) => lang);

      // 6. Derive recent languages from repos pushed in last 6 months
      const sixMonthsAgo = new Date(Date.now() - SIX_MONTHS_MS);
      const recentRepos = repos.filter(r => {
        const pushed = r.pushedAt ? new Date(r.pushedAt) : null;
        return pushed && pushed > sixMonthsAgo && !r.fork;
      });
      const recentLanguageSet = new Set<string>();
      for (const repo of recentRepos) {
        if (repo.language) recentLanguageSet.add(repo.language);
      }
      const recentLanguages = [...recentLanguageSet];

      // 7. Aggregate repository topics
      const topicSet = new Set<string>();
      for (const repo of repos) {
        if (repo.topics) {
          for (const topic of repo.topics) {
            topicSet.add(topic);
          }
        }
      }
      const repositoryTopics = [...topicSet];

      // 8. Infer skills from language bytes + contribution recency
      //    Uses byte-level data instead of simple repo count
      const inferredSkills = this.inferSkillsFromLanguageBytes(languageBytes, recentLanguages);

      // 9. Compute total contributions as a meaningful number
      const totalContributions = 
        contributionStats.commitCount + 
        contributionStats.prCount + 
        contributionStats.issueCount + 
        contributionStats.reviewCount;

      // 10. Upsert the profile
      const profile = await prisma.developer_profile.upsert({
        where: { userId },
        update: {
          githubLogin: githubUser.login,
          observedLanguages,
          recentLanguages,
          publicRepoCount: githubUser.publicRepos || 0,
          totalContributions,
          githubBio: githubUser.bio,
          githubCompany: githubUser.company,
          githubLocation: githubUser.location,
          repositoryTopics,
          languageBytes,
          commitCount: contributionStats.commitCount,
          prCount: contributionStats.prCount,
          issueCount: contributionStats.issueCount,
          reviewCount: contributionStats.reviewCount,
          lastActiveAt: contributionStats.lastActiveAt,
          inferredSkills,
        },
        create: {
          userId,
          githubLogin: githubUser.login,
          observedLanguages,
          recentLanguages,
          publicRepoCount: githubUser.publicRepos || 0,
          totalContributions,
          githubBio: githubUser.bio,
          githubCompany: githubUser.company,
          githubLocation: githubUser.location,
          repositoryTopics,
          languageBytes,
          commitCount: contributionStats.commitCount,
          prCount: contributionStats.prCount,
          issueCount: contributionStats.issueCount,
          reviewCount: contributionStats.reviewCount,
          lastActiveAt: contributionStats.lastActiveAt,
          inferredSkills,
          // Initialize empty user-confirmed fields
          currentFocus: [],
          learningGoals: [],
          preferredContributionTypes: [],
        },
      } as any);

      logger.info("GitHub profile ingested successfully", {
        userId,
        languagesFound: observedLanguages.length,
        recentLanguages: recentLanguages.length,
        totalContributions,
        topicsFound: repositoryTopics.length,
      });

      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error("Failed to ingest GitHub profile", { error, userId });
      throw new AppError("Failed to ingest GitHub profile", 500, "PROFILE_INGESTION_FAILED");
    }
  }

  /**
   * Infer skill levels from language byte counts and recency.
   * 
   * Instead of counting repos (which gives "10 repos with TypeScript = Advanced"),
   * this uses actual byte volume and whether the language was used recently.
   * 
   * Thresholds:
   * - Advanced:     > 100KB of code AND used in recent repos
   * - Intermediate: > 20KB of code OR used in recent repos
   * - Beginner:     any presence
   */
  private inferSkillsFromLanguageBytes(
    languageBytes: Record<string, number>,
    recentLanguages: string[]
  ): Record<string, string> {
    const skills: Record<string, string> = {};
    const recentSet = new Set(recentLanguages.map(l => l.toLowerCase()));

    for (const [lang, bytes] of Object.entries(languageBytes)) {
      const isRecent = recentSet.has(lang.toLowerCase());
      const kb = bytes / 1024;

      if (kb > 100 && isRecent) {
        skills[lang] = "Advanced";
      } else if (kb > 20 || isRecent) {
        skills[lang] = "Intermediate";
      } else {
        skills[lang] = "Beginner";
      }
    }

    return skills;
  }

  /**
   * Update the user-confirmed intent and preferences
   */
  async updateUserPreferences(userId: string, data: {
    currentFocus?: string[];
    learningGoals?: string[];
    preferredArea?: string;
    preferredComplexity?: string;
    preferredContributionTypes?: string[];
  }) {
    return prisma.developer_profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    } as any);
  }

  async getProfile(userId: string) {
    const profile = await prisma.developer_profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new AppError("Profile not found", 404, "PROFILE_NOT_FOUND");
    }
    return profile;
  }
}

export const profileService = new ProfileService();

