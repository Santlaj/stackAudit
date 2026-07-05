import express from "express";
import healthRouter from "./modules/health/index.js";

const app = express();

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Feature modules
app.use("/api/health", healthRouter);

export default app;