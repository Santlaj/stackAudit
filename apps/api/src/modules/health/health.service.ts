import { HEALTH_MESSAGE, HEALTH_STATUS } from "./health.constants.js";
import { HealthResponse } from "./health.types.js";

export const getHealthStatus = (): HealthResponse => {
  return {
    status: HEALTH_STATUS,
    message: HEALTH_MESSAGE,
  };
};