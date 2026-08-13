// Structured JSON logger.
// Outputs structured logs in production, human-readable logs in development.

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  module?: string;
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV !== "production";

function formatLog(entry: LogEntry): string {
  if (isDevelopment) {
    const prefix = `[${entry.level.toUpperCase()}]`;
    const module = entry.module ? ` [${entry.module}]` : "";
    return `${prefix}${module} ${entry.message}`;
  }

  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      if (isDevelopment) console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>): void => {
    log("info", message, meta);
  },

  warn: (message: string, meta?: Record<string, unknown>): void => {
    log("warn", message, meta);
  },

  error: (message: string, meta?: Record<string, unknown>): void => {
    log("error", message, meta);
  },

  debug: (message: string, meta?: Record<string, unknown>): void => {
    log("debug", message, meta);
  },
};