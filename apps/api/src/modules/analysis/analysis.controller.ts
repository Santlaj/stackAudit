import { Request, Response } from "express";
import { analysisService } from "./analysis.service.js";
import { logger } from "../../utils/logger.js";

export const startAnalysis = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { matchId } = req.params as { matchId: string };

  const analysis = await analysisService.startAnalysis(matchId, userId);
  res.status(200).json({ data: analysis });
};

export const streamAnalysis = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { matchId } = req.params as { matchId: string };

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); 

  let isClientConnected = true;
  req.on("close", () => {
    isClientConnected = false;
  });

  const sendEvent = (data: any) => {
    if (isClientConnected) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    let lastStatus = "";

    // Poll the DB for state changes until complete or disconnected
    while (isClientConnected) {
      const analysis = await analysisService.getAnalysisState(matchId, userId);
      
      if (!analysis) {
        sendEvent({ status: "NOT_STARTED" });
        res.end();
        break;
      }

      // Send update if status changed or if it's the very first event
      if (analysis.status !== lastStatus) {
        lastStatus = analysis.status;
        sendEvent(analysis);
      }

      // Terminate stream if we reached a terminal state
      if (analysis.status === "COMPLETED" || analysis.status === "FAILED") {
        res.end();
        break;
      }

      // Poll interval
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error: any) {
    logger.error("SSE stream error", { error: error.message });
    sendEvent({ error: error.message });
    res.end();
  }
};
