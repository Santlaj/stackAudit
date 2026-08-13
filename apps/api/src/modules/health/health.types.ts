export interface HealthResponse {
  status: string;
  message: string;
  database: string;
  uptime: number;
}