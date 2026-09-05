-- CreateTable
CREATE TABLE "daily_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityDate" DATE NOT NULL,
    "activeSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_activity_userId_activityDate_key" ON "daily_activity"("userId", "activityDate");

-- CreateIndex
CREATE INDEX "daily_activity_userId_activityDate_idx" ON "daily_activity"("userId", "activityDate");

-- AddForeignKey
ALTER TABLE "daily_activity" ADD CONSTRAINT "daily_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
