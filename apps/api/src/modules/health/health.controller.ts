import { Request, Response } from "express";
import { getHealthStatus } from "./health.service.js";
import { successResponse } from "../../utils/api-response.js";

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const healthStatus = await getHealthStatus();

  successResponse(
    res,
    healthStatus,
    "StackAudit API is running",
  );
};