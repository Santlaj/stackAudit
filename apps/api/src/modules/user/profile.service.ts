import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { githubService } from "../github/index.js";
import { AppError } from "../../common/errors/index.js";
import { logger } from "../../utils/logger.js";

export class ProfileService {
  /**
   * Ingests real Developer Profile data via GitHub module.
   */
  async ingestGitHubProfile(userId: string, token: string) {
    logger.info("Ingesting GitHub profile for user", { userId });

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    try {
      // 1. Fetch Authenticated User
      const githubUser = await githubService.getAuthenticatedUser(token);
      if (!githubUser) {
        throw new AppError("Could not fetch GitHub user", 500, "GITHUB_USER_FETCH_FAILED");
      }

      // 2. Fetch User's Repositories to infer skills
      const repos = await githubService.getUserRepositories(token, 50);
      
      const languageCounts: Record<string, number> = {};
      let totalContributions = 0;

      if (repos) {
        for (const repo of repos) {
          if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
          }
          // A very rough estimate of "contributions" just for the observed profile
          totalContributions += 1;
        }
      }

      // Infer skills roughly from language counts
      const observedLanguages = Object.keys(languageCounts);
      const inferredSkills = Object.fromEntries(
        Object.entries(languageCounts).map(([lang, count]) => [
          lang,
          count > 10 ? "Advanced" : count > 3 ? "Intermediate" : "Beginner"
        ])
      );

      // 3. Upsert the profile
      // @ts-ignore - Prisma types need to be regenerated
      const profile = await prisma.developer_profile.upsert({
        where: { userId },
        update: {
          observedLanguages,
          publicRepoCount: githubUser.publicRepos || 0,
          totalContributions,
          githubBio: githubUser.bio,
          githubCompany: githubUser.company,
          githubLocation: githubUser.location,
          inferredSkills,
        },
        create: {
          userId,
          observedLanguages,
          publicRepoCount: githubUser.publicRepos || 0,
          totalContributions,
          githubBio: githubUser.bio,
          githubCompany: githubUser.company,
          githubLocation: githubUser.location,
          inferredSkills,
          // Initialize empty user-confirmed fields
          currentFocus: [],
          learningGoals: [],
          preferredContributionTypes: [],
        },
      } as any);

      return profile;
    } catch (error) {
      logger.error("Failed to ingest GitHub profile", { error, userId });
      throw new AppError("Failed to ingest GitHub profile", 500, "PROFILE_INGESTION_FAILED");
    }
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
