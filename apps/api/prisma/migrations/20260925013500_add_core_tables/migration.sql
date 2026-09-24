-- CreateTable
CREATE TABLE "developer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubLogin" TEXT,
    "observedLanguages" TEXT[],
    "recentLanguages" TEXT[],
    "publicRepoCount" INTEGER NOT NULL DEFAULT 0,
    "totalContributions" INTEGER NOT NULL DEFAULT 0,
    "githubBio" TEXT,
    "githubCompany" TEXT,
    "githubLocation" TEXT,
    "repositoryTopics" TEXT[],
    "languageBytes" JSONB,
    "commitCount" INTEGER NOT NULL DEFAULT 0,
    "prCount" INTEGER NOT NULL DEFAULT 0,
    "issueCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "inferredSkills" JSONB,
    "currentFocus" TEXT[],
    "learningGoals" TEXT[],
    "preferredArea" TEXT,
    "preferredComplexity" TEXT,
    "preferredContributionTypes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_issues" (
    "id" TEXT NOT NULL,
    "githubId" BIGINT NOT NULL,
    "repository" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "issueCreatedAt" TIMESTAMP(3) NOT NULL,
    "issueUpdatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "labels" TEXT[],
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "reactionsTotal" INTEGER NOT NULL DEFAULT 0,
    "assigneeCount" INTEGER NOT NULL DEFAULT 0,
    "linkedPrCount" INTEGER NOT NULL DEFAULT 0,
    "repoLanguage" TEXT,
    "repoLanguages" JSONB,
    "repoTopics" TEXT[],
    "repoDescription" TEXT,
    "repoStars" INTEGER NOT NULL DEFAULT 0,
    "repoOpenIssues" INTEGER NOT NULL DEFAULT 0,
    "repoActivityLevel" TEXT,
    "repoLastPushedAt" TIMESTAMP(3),
    "repoLastUpdatedAt" TIMESTAMP(3),
    "repoPrAcceptanceRate" DOUBLE PRECISION,
    "staleness" TEXT,
    "activityLevel" TEXT,
    "difficultyEstimate" TEXT,
    "issueType" TEXT,
    "isGoodFirstIssue" BOOLEAN NOT NULL DEFAULT false,
    "isHelpWanted" BOOLEAN NOT NULL DEFAULT false,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_matches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "issueTitle" TEXT NOT NULL,
    "issueUrl" TEXT NOT NULL,
    "githubIssueId" TEXT,
    "complexity" TEXT,
    "contributionType" TEXT,
    "technologies" TEXT[],
    "matchScore" INTEGER,
    "matchReason" TEXT,
    "missingSignals" TEXT,
    "learningRelevance" TEXT,
    "reasons" TEXT[],
    "gaps" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'DISCOVERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_analyses" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "commitSha" TEXT,
    "context" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "repository_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developer_profiles_userId_key" ON "developer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "github_issues_githubId_key" ON "github_issues"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "github_issues_repository_issueNumber_key" ON "github_issues"("repository", "issueNumber");

-- CreateIndex
CREATE INDEX "github_issues_repository_idx" ON "github_issues"("repository");

-- CreateIndex
CREATE INDEX "github_issues_repoLanguage_idx" ON "github_issues"("repoLanguage");

-- CreateIndex
CREATE INDEX "github_issues_difficultyEstimate_idx" ON "github_issues"("difficultyEstimate");

-- CreateIndex
CREATE INDEX "github_issues_staleness_idx" ON "github_issues"("staleness");

-- CreateIndex
CREATE INDEX "github_issues_state_idx" ON "github_issues"("state");

-- CreateIndex
CREATE INDEX "github_issues_state_staleness_difficultyEstimate_idx" ON "github_issues"("state", "staleness", "difficultyEstimate");

-- CreateIndex
CREATE UNIQUE INDEX "issue_matches_userId_githubIssueId_key" ON "issue_matches"("userId", "githubIssueId");

-- CreateIndex
CREATE INDEX "issue_matches_userId_idx" ON "issue_matches"("userId");

-- CreateIndex
CREATE INDEX "issue_matches_repository_idx" ON "issue_matches"("repository");

-- CreateIndex
CREATE INDEX "issue_matches_githubIssueId_idx" ON "issue_matches"("githubIssueId");

-- CreateIndex
CREATE UNIQUE INDEX "repository_analyses_matchId_key" ON "repository_analyses"("matchId");

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_matches" ADD CONSTRAINT "issue_matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_matches" ADD CONSTRAINT "issue_matches_githubIssueId_fkey" FOREIGN KEY ("githubIssueId") REFERENCES "github_issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_analyses" ADD CONSTRAINT "repository_analyses_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "issue_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
