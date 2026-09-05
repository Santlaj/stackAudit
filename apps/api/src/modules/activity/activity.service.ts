import crypto from "node:crypto";
import { prisma } from "../../infrastructure/prisma/prisma.client.js";
import { redis } from "../../infrastructure/redis/redis.client.js";
import { logger } from "../../utils/logger.js";

// In-memory fallback if Redis is unavailable
const inMemoryHeartbeats = new Map<string, number>();

// Minimum elapsed ms between accepted heartbeats (tolerance below 30s)
const MIN_HEARTBEAT_INTERVAL_MS = 20_000;
const HEARTBEAT_INCREMENT_SECONDS = 30;

let tableEnsured = false;

async function ensureTableExists() {
  if (tableEnsured) return;
  try {
    // Execute each DDL command individually (Postgres does not allow multiple commands in prepared statements)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "daily_activity" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "activityDate" DATE NOT NULL,
        "activeSeconds" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "daily_activity_userId_activityDate_key" ON "daily_activity"("userId", "activityDate")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "daily_activity_userId_activityDate_idx" ON "daily_activity"("userId", "activityDate")
    `);
    tableEnsured = true;
  } catch (err: any) {
    logger.warn("Could not auto-verify daily_activity table", { error: err.message });
  }
}

export interface ActivityDayDto {
  date: string; // YYYY-MM-DD (canonical UTC)
  activeSeconds: number;
}

export class ActivityService {
  /**
   * Records an active-time heartbeat for the authenticated user.
   * Contributes bounded 30 seconds of active time if rate-limit constraints are met.
   */
  async recordHeartbeat(userId: string): Promise<{ accepted: boolean; activeSeconds: number; reason?: string }> {
    try {
      await ensureTableExists();

      const now = Date.now();
      const redisKey = `heartbeat:last:${userId}`;
      let isRateLimited = false;

      try {
        const lastTs = await Promise.race([
          redis.get(redisKey),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 200))
        ]);
        if (lastTs && now - Number(lastTs) < MIN_HEARTBEAT_INTERVAL_MS) {
          isRateLimited = true;
        } else {
          redis.set(redisKey, now, "EX", 120).catch(() => {});
        }
      } catch {
        // In-memory fallback (instant, resilient, zero external network delay)
        const lastTs = inMemoryHeartbeats.get(userId);
        if (lastTs && now - lastTs < MIN_HEARTBEAT_INTERVAL_MS) {
          isRateLimited = true;
        } else {
          inMemoryHeartbeats.set(userId, now);
        }
      }

      if (isRateLimited) {
        return { accepted: false, activeSeconds: 0, reason: "Too frequent" };
      }

      // Canonical UTC Date (YYYY-MM-DD)
      const todayUtcStr = new Date(now).toISOString().slice(0, 10);
      const activityDate = new Date(`${todayUtcStr}T00:00:00.000Z`);

      if ((prisma as any).daily_activity?.upsert) {
        try {
          const record = await (prisma as any).daily_activity.upsert({
            where: {
              userId_activityDate: {
                userId,
                activityDate,
              },
            },
            create: {
              userId,
              activityDate,
              activeSeconds: HEARTBEAT_INCREMENT_SECONDS,
            },
            update: {
              activeSeconds: { increment: HEARTBEAT_INCREMENT_SECONDS },
            },
          });
          return { accepted: true, activeSeconds: record.activeSeconds };
        } catch (e: any) {
          logger.warn("Prisma upsert fallback to raw query", { error: e.message });
        }
      }

      // Robust SQL upsert fallback
      const id = crypto.randomUUID();
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO "daily_activity" ("id", "userId", "activityDate", "activeSeconds", "createdAt", "updatedAt")
        VALUES ($1, $2, $3::date, $4, NOW(), NOW())
        ON CONFLICT ("userId", "activityDate")
        DO UPDATE SET "activeSeconds" = "daily_activity"."activeSeconds" + EXCLUDED."activeSeconds", "updatedAt" = NOW()
      `,
        id,
        userId,
        todayUtcStr,
        HEARTBEAT_INCREMENT_SECONDS
      );

      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT "activeSeconds" FROM "daily_activity" WHERE "userId" = $1 AND "activityDate" = $2::date`,
        userId,
        todayUtcStr
      );

      return {
        accepted: true,
        activeSeconds: rows[0]?.activeSeconds || HEARTBEAT_INCREMENT_SECONDS,
      };
    } catch (err: any) {
      logger.error("Heartbeat recording failed", { error: err.message });
      return { accepted: false, activeSeconds: 0, reason: err.message };
    }
  }

  /**
   * Returns daily active-time records for the authenticated user within the requested days window.
   */
  async getDailyActivity(userId: string, days: number = 365): Promise<ActivityDayDto[]> {
    try {
      await ensureTableExists();

      const clampedDays = Math.min(Math.max(Number(days) || 365, 1), 730);
      const startDateStr = new Date(Date.now() - (clampedDays - 1) * 86_400_000)
        .toISOString()
        .slice(0, 10);
      const startDate = new Date(`${startDateStr}T00:00:00.000Z`);

      if ((prisma as any).daily_activity?.findMany) {
        try {
          const rows = await (prisma as any).daily_activity.findMany({
            where: {
              userId,
              activityDate: { gte: startDate },
            },
            orderBy: { activityDate: "asc" },
            select: { activityDate: true, activeSeconds: true },
          });

          return rows.map((r: any) => ({
            date: r.activityDate instanceof Date 
              ? r.activityDate.toISOString().slice(0, 10) 
              : String(r.activityDate).slice(0, 10),
            activeSeconds: r.activeSeconds,
          }));
        } catch (e: any) {
          logger.warn("Prisma findMany fallback to raw query", { error: e.message });
        }
      }

      const rows: any[] = await prisma.$queryRawUnsafe(
        `
        SELECT TO_CHAR("activityDate", 'YYYY-MM-DD') as date, "activeSeconds"
        FROM "daily_activity"
        WHERE "userId" = $1 AND "activityDate" >= $2::date
        ORDER BY "activityDate" ASC
      `,
        userId,
        startDateStr
      );

      return (rows || []).map((r) => ({
        date: r.date,
        activeSeconds: Number(r.activeSeconds) || 0,
      }));
    } catch (err: any) {
      logger.error("getDailyActivity query failed", { error: err.message });
      return [];
    }
  }
}

export const activityService = new ActivityService();
