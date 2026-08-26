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

redis.on("error", (error) => {
  logger.error("Redis Connection Error", { error: error.message });
});

redis.on("connect", () => {
  logger.info("Redis Connected Successfully", { module: "redis" });
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
