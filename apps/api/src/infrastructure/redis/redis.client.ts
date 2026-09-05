import { Redis } from "ioredis";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// Redis Client singleton
// Storing the client on `globalThis` prevents connection leaks in development.

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    family: 0, // Auto-select IPv4/IPv6
  });

redis.on("error", (error: any) => {
  // Upstash serverless Redis forcibly disconnects idle clients after 5 minutes (300s).
  // Because rediss:// implicitly enables TLS in ioredis, and it reconnects successfully,
  // this is expected and recoverable behavior. We log it as a warning rather than an error.
  if (error.message?.includes("ECONNRESET")) {
    logger.warn("Redis Connection Reset (Idle Timeout)", { error: error.message });
  } else {
    logger.error("Redis Connection Error", { error: error.message });
  }
});

redis.on("connect", () => {
  logger.info("Redis Connected Successfully", { module: "redis" });
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
