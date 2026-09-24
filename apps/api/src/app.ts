import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import healthRouter from "./modules/health/index.js";
import { authRouter } from "./modules/auth/index.js";
import { userRouter } from "./modules/user/index.js";
import { githubRoutes } from "./modules/github/github.routes.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { requestLogger } from "./middleware/request-logger.middleware.js";

const app = express();

// Trust reverse proxy (Render, Vercel, Cloudflare) so req.protocol and client IP are accurate
app.set("trust proxy", 1);

// Global middleware
app.use((req, res, next) => {
  const normalizedFrontendUrl = env.FRONTEND_URL.replace(/\/$/, "");
  const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", env.FRONTEND_URL, normalizedFrontendUrl];
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes(`${origin}/`))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  const requestHeaders = req.headers["access-control-request-headers"];
  res.setHeader(
    "Access-Control-Allow-Headers",
    typeof requestHeaders === "string" ? requestHeaders : "Content-Type,Authorization,Cookie,X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(requestLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { discoveryRoutes } from "./modules/discovery/index.js";
import { analysisRoutes } from "./modules/analysis/analysis.routes.js";

import { requireAuth } from "./middleware/auth.middleware.js";
import { getUserBadges } from "./modules/badges/badge.controller.js";
import activityRouter from "./modules/activity/activity.routes.js";

// Feature modules
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.get("/api/profile/badges", requireAuth, getUserBadges);
app.use("/api/activity", activityRouter);
app.use("/api/github", githubRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/analysis", analysisRoutes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;