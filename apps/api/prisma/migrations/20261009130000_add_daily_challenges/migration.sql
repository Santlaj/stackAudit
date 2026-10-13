-- CreateTable
CREATE TABLE "daily_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeDate" DATE NOT NULL,
    "githubIssueId" TEXT NOT NULL,
    "matchId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "completedAt" TIMESTAMP(3),
    "checklist" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenges_userId_challengeDate_key" ON "daily_challenges"("userId", "challengeDate");

-- CreateIndex
CREATE INDEX "daily_challenges_userId_challengeDate_idx" ON "daily_challenges"("userId", "challengeDate");

-- CreateIndex
CREATE INDEX "daily_challenges_githubIssueId_idx" ON "daily_challenges"("githubIssueId");

-- AddForeignKey
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_githubIssueId_fkey" FOREIGN KEY ("githubIssueId") REFERENCES "github_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "issue_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
