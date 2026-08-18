import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";
import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./ai.interface.js";
import { logger } from "../../utils/logger.js";
import { InternalError } from "../../common/errors/index.js";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new InternalError("GEMINI_API_KEY is not configured", "AI_CONFIG_ERROR");
    }
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    try {
      // Using gemini-2.5-flash as it's the fastest and most cost-effective for text analysis
      const model = this.client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: request.systemContext,
      });

      const result = await model.generateContent(request.prompt);
      const response = await result.response;

      return {
        content: response.text(),
      };
    } catch (error: any) {
      logger.error("Gemini AI Analysis Failed", { error: error.message, operation: "analyze" });
      throw new InternalError("Failed to analyze repository with Gemini.", "AI_PROVIDER_ERROR");
    }
  }
}
