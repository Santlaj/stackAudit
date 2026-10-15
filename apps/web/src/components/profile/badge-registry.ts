/**
 * StackAudit Badge Registry
 * 
 * Maps backend badge IDs to their display metadata and image assets.
 * Only badges with real images in /public/badges/ are included here.
 * 
 * To add a new badge:
 * 1. Place the badge image in apps/web/public/badges/<filename>.png
 * 2. Add a new entry below mapping the backend badge ID to the image path
 * 3. The badge will automatically appear in the profile when earned
 */

export interface BadgeRegistryEntry {
  /** The backend badge ID (must match BadgeService output) */
  id: string;
  /** Git command name displayed on the badge */
  gitCommand: string;
  /** Short human-readable achievement title */
  achievementTitle: string;
  /** Path to the badge image relative to /public, or null if using artwork fallback */
  imagePath: string | null;
  /** One-line description of what the achievement represents */
  achievementDescription: string;
}

/**
 * Deterministic 9-Badge Registry.
 * All 9 badges supported by StackAudit are registered here.
 * Badges with PNG files in /public/badges/ use real images; others use SVG artwork.
 */
export const BADGE_REGISTRY: BadgeRegistryEntry[] = [
  {
    id: "FIRST_CONTRIBUTION",
    gitCommand: "git commit",
    achievementTitle: "First Verified Contribution",
    imagePath: "/badges/First Verified Contribution.png?v=2",
    achievementDescription: "Made your first verified open-source contribution.",
  },
  {
    id: "FIRST_PR",
    gitCommand: "git push",
    achievementTitle: "First PR Submitted",
    imagePath: "/badges/First PR submitted.png?v=2",
    achievementDescription: "Submitted your first pull request to an open-source project.",
  },
  {
    id: "MERGED",
    gitCommand: "git merge",
    achievementTitle: "First PR Merged",
    imagePath: null,
    achievementDescription: "Had your first pull request successfully merged into an open-source project.",
  },
  {
    id: "CONTRIBUTOR_5",
    gitCommand: "git cherry-pick",
    achievementTitle: "Contributor ×5",
    imagePath: null,
    achievementDescription: "Started and actively pursued 5 different open-source contributions.",
  },
  {
    id: "CONTRIBUTOR_10",
    gitCommand: "git rebase",
    achievementTitle: "10 Merged PRs",
    imagePath: "/badges/Git Rebase.png?v=2",
    achievementDescription: "Had 10 pull requests merged across open-source repositories.",
  },
  {
    id: "ISSUE_EXPLORER",
    gitCommand: "git bisect",
    achievementTitle: "Issue Investigator",
    imagePath: "/badges/Git Bisect.png?v=2",
    achievementDescription: "Investigated 10 meaningful issues across open-source repositories.",
  },
  {
    id: "REPOSITORY_EXPLORER",
    gitCommand: "Repository Analyst",
    achievementTitle: "Repository Analyst",
    imagePath: "/badges/Repository Analyst.png?v=2",
    achievementDescription: "Analyzed and explored 5 different open-source repositories.",
  },
  {
    id: "MULTI_STACK",
    gitCommand: "git branch",
    achievementTitle: "Multi-Stack Contributor",
    imagePath: null,
    achievementDescription: "Contributed across at least 3 distinct technology ecosystems.",
  },
  {
    id: "REPOSITORY_CONTRIBUTOR",
    gitCommand: "git remote",
    achievementTitle: "Repository Contributor",
    imagePath: null,
    achievementDescription: "Reached active contributor status across at least 3 distinct repositories.",
  },
];

/** Quick lookup: badge ID → registry entry */
export const BADGE_REGISTRY_MAP = new Map(
  BADGE_REGISTRY.map((entry) => [entry.id, entry])
);
