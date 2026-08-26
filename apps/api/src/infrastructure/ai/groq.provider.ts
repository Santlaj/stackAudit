import { env } from "../../config/env.js";
import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./ai.interface.js";
import { logger } from "../../utils/logger.js";
import { AppError, InternalError } from "../../common/errors/index.js";

export class GroqProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = "https://api.groq.com/openai/v1/chat/completions";

  constructor() {
    if (!env.GROQ_API_KEY) {
      throw new InternalError("GROQ_API_KEY is not configured", "AI_CONFIG_ERROR");
    }
    this.apiKey = env.GROQ_API_KEY;
    this.model = env.GROQ_MODEL || "openai/gpt-oss-120b";
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    logger.info("Sending request to Groq", { model: this.model, operation: "analyze" });

    try {
      const messages = [];
      if (request.systemContext) {
        messages.push({ role: "system", content: request.systemContext });
      }
      messages.push({ role: "user", content: request.prompt });

      const payload: any = {
        model: this.model,
        messages,
        temperature: request.temperature ?? 0.2,
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json() as any;

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new AppError("Malformed AI response from Groq", 502, "AI_MALFORMED_RESPONSE", true);
      }

      const durationMs = Date.now() - startTime;
      logger.info("Groq request successful", { 
        model: this.model, 
        operation: "analyze", 
        durationMs 
      });

      return {
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Groq AI Analysis Failed", { error: error.message, operation: "analyze", failureCategory: "network_or_internal" });
      throw new InternalError("Failed to analyze repository with Groq.", "AI_PROVIDER_ERROR");
    }
  }

  private async handleError(response: Response): Promise<never> {
    const status = response.status;
    let errorMessage = "Unknown Groq API error";
    try {
      const errorData = await response.json() as any;
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      errorMessage = response.statusText;
    }

    const failureCategory = status === 429 ? "rate_limit" : (status === 401 || status === 403) ? "authentication" : "provider_error";
    logger.error("Groq API Error", { status, message: errorMessage, operation: "analyze", failureCategory });

    if (status === 401 || status === 403) {
      throw new AppError("AI Provider authentication failed", 502, "AI_AUTH_ERROR", true);
    }
    if (status === 429) {
      throw new AppError("AI Provider rate limit exceeded", 502, "AI_RATE_LIMIT", true);
    }
    if (status >= 500) {
      throw new AppError("AI Provider is currently unavailable", 502, "AI_UNAVAILABLE", true);
    }
    
    throw new AppError("AI Provider request failed", 502, "AI_REQUEST_FAILED", true);
  }
}
