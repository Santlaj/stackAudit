import { HEALTH_MESSAGE, HEALTH_STATUS } from "./health.constants.js";
import { HealthResponse } from "./health.types.js";
import { prisma } from "../../infrastructure/prisma/index.js";

export const getHealthStatus = async (): Promise<HealthResponse> => {
  let dbStatus = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "disconnected";
  }

  return {
    status: HEALTH_STATUS,
    message: HEALTH_MESSAGE,
    database: dbStatus,
    uptime: process.uptime(),
  };
};