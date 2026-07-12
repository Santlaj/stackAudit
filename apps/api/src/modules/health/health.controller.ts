import { Request, Response } from "express";
import { getHealthStatus } from "./health.service.js";
import { successResponse } from "../../utils/api-response.js";

export const getHealth = (_req: Request, res: Response): void => {
  const healthStatus = getHealthStatus();

  successResponse(
    res,
    healthStatus,
    "StackAudit API is running",
  );
};