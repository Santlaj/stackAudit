import { test } from "node:test";
import assert from "node:assert";
import { matchingService } from "./matching.service.js";
import { developer_profile, github_issue } from "@prisma/client";

const mockProfile: developer_profile = {
  id: "test",
  userId: "user1",
  githubLogin: "testuser",
  observedLanguages: [],
  recentLanguages: [],
  publicRepoCount: 0,
  totalContributions: 0,
  githubBio: null,
  githubCompany: null,
  githubLocation: null,
  repositoryTopics: [],
  languageBytes: null,
  commitCount: 0,
  prCount: 0,
  issueCount: 0,
  reviewCount: 0,
  lastActiveAt: null,
  inferredSkills: null,
  currentFocus: ["TypeScript"],
  learningGoals: [],
  preferredArea: null,
  preferredComplexity: "beginner",
  preferredContributionTypes: ["bug", "feature"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockIssue: github_issue = {
  id: "issue1",
  githubId: 1n,
  repository: "owner/repo",
  issueNumber: 1,
  title: "Test Issue",
  body: null,
  url: "http://example.com",
  state: "open",
  issueCreatedAt: new Date(),
  issueUpdatedAt: new Date(),
  closedAt: null,
  labels: [],
  commentsCount: 0,
  reactionsTotal: 0,
  assigneeCount: 0,
  linkedPrCount: 0,
  repoLanguage: "TypeScript",
  repoStars: 100,
  repoOpenIssues: 10,
  repoActivityLevel: "active",
  repoLastPushedAt: null,
  repoLastUpdatedAt: null,
  repoPrAcceptanceRate: 80,
  staleness: "fresh",
  activityLevel: null,
  difficultyEstimate: "beginner",
  repoTopics: [],
  repoLanguages: null,
  repoDescription: null,
  issueType: "bug",
  isGoodFirstIssue: false,
  isHelpWanted: false,
  ingestedAt: new Date(),
  lastSyncedAt: new Date(),
};

test("scoreMatch - perfect match returns 100", () => {
  const result = matchingService.scoreMatch(mockProfile, mockIssue);
  
  // Language (35) + Difficulty (20) + Type (15) + Repo (10) + Fresh (10) + PR (10) = 100
  assert.strictEqual(result.score, 100);
});

test("scoreMatch - missing data = 0 points for that category", () => {
  const emptyIssue = { ...mockIssue, repoLanguage: null, difficultyEstimate: null, issueType: null, repoActivityLevel: null, staleness: null, repoPrAcceptanceRate: null };
  const result = matchingService.scoreMatch(mockProfile, emptyIssue);
  assert.strictEqual(result.score, 0);
  assert.ok(result.gaps.length >= 6);
});

test("scoreMatch - mismatched data does not exceed maximum points", () => {
  const mismatchedIssue = { ...mockIssue, repoLanguage: "Python", difficultyEstimate: "advanced", issueType: "docs", repoActivityLevel: "inactive", staleness: "abandoned", repoPrAcceptanceRate: 20 };
  const result = matchingService.scoreMatch(mockProfile, mismatchedIssue);
  assert.strictEqual(result.score, 0); // Python (0), Advanced (0), Docs (0), inactive (0), abandoned (0), PR 20% (0)
});

test("scoreMatch - score cannot exceed 100 or be below 0", () => {
  const result = matchingService.scoreMatch(mockProfile, mockIssue);
  assert.ok(result.score <= 100 && result.score >= 0);
});

test("scoreMatch - explicit techStack overrides profile", () => {
  const result = matchingService.scoreMatch(mockProfile, mockIssue, ["Python"]); // Not TS
  // Missing Language (0) + Diff (20) + Type (15) + Repo (10) + Fresh (10) + PR (10) = 65
  assert.strictEqual(result.score, 65);
});
