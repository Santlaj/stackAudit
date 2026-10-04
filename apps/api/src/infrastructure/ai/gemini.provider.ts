import { env } from "../../config/env.js";
import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./ai.interface.js";
import { logger } from "../../utils/logger.js";
import { AppError, InternalError } from "../../common/errors/index.js";

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey?: string, model?: string) {
    const key = apiKey || env.GEMINI_API_KEY;
    if (!key) {
      throw new InternalError("GEMINI_API_KEY is not configured", "AI_CONFIG_ERROR");
    }
    this.apiKey = key;
    this.model = model || env.GEMINI_MODEL || "gemini-1.5-flash";
  }

  get providerName(): string {
    return `Gemini (${this.model})`;
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    logger.info("Sending request to Google Gemini", { model: this.model, operation: "analyze" });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const payload: any = {
        contents: [
          {
            role: "user",
            parts: [{ text: request.prompt }],
          },
        ],
        generationConfig: {
          temperature: request.temperature ?? 0.1,
          responseMimeType: "application/json",
        },
      };

      if (request.systemContext) {
        payload.systemInstruction = {
          parts: [{ text: request.systemContext }],
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = (await response.json()) as any;

      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        throw new AppError("Malformed or empty AI response from Gemini", 502, "AI_MALFORMED_RESPONSE", true);
      }

      const durationMs = Date.now() - startTime;
      logger.info("Gemini request successful", {
        model: this.model,
        operation: "analyze",
        durationMs,
      });

      const usageMetadata = data.usageMetadata;
      return {
        content: text,
        usage: usageMetadata
          ? {
              promptTokens: usageMetadata.promptTokenCount ?? 0,
              completionTokens: usageMetadata.candidatesTokenCount ?? 0,
              totalTokens: usageMetadata.totalTokenCount ?? 0,
            }
          : undefined,
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Gemini AI Analysis Failed", {
        error: error.message,
        operation: "analyze",
        failureCategory: "network_or_internal",
      });
      throw new InternalError("Failed to analyze repository with Gemini.", "AI_PROVIDER_ERROR");
    }
  }

  private async handleError(response: Response): Promise<never> {
    const status = response.status;
    let errorMessage = "Unknown Gemini API error";
    try {
      const errorData = (await response.json()) as any;
      if (errorData.error && errorData.error.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      errorMessage = response.statusText;
    }

    const failureCategory =
      status === 429
        ? "rate_limit"
        : status === 401 || status === 403
        ? "authentication"
        : "provider_error";

    logger.error("Gemini API Error", { status, message: errorMessage, operation: "analyze", failureCategory });

    if (status === 401 || status === 403) {
      throw new AppError("Gemini authentication failed", 502, "AI_AUTH_ERROR", true);
    }
    if (status === 429) {
      throw new AppError("Gemini rate limit exceeded", 502, "AI_RATE_LIMIT", true);
    }
    if (status >= 500) {
      throw new AppError("Gemini service is currently unavailable", 502, "AI_UNAVAILABLE", true);
    }

    throw new AppError(`Gemini request failed: ${errorMessage}`, 502, "AI_REQUEST_FAILED", true);
  }
}
