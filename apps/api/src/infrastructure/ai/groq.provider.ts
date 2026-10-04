import { env } from "../../config/env.js";
import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./ai.interface.js";
import { logger } from "../../utils/logger.js";
import { AppError, InternalError } from "../../common/errors/index.js";

interface KeyState {
  key: string;
  cooldownUntil: number;
}

export class GroqProvider implements AIProvider {
  private readonly keys: KeyState[] = [];
  private keyIndex = 0;
  private readonly model: string;
  private readonly baseUrl = "https://api.groq.com/openai/v1/chat/completions";

  constructor(apiKey?: string, model?: string) {
    const rawKeys: string[] = [];

    if (apiKey) {
      rawKeys.push(apiKey);
    } else if (env.GROQ_API_KEYS) {
      rawKeys.push(
        ...env.GROQ_API_KEYS.split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      );
    } else if (env.GROQ_API_KEY) {
      rawKeys.push(env.GROQ_API_KEY);
    }

    if (rawKeys.length === 0) {
      throw new InternalError("GROQ_API_KEY is not configured", "AI_CONFIG_ERROR");
    }

    this.keys = rawKeys.map((key) => ({ key, cooldownUntil: 0 }));
    this.model = model || env.GROQ_MODEL || "qwen/qwen3.6-27b";
  }

  get providerName(): string {
    return `Groq (${this.model})`;
  }

  private getNextAvailableKey(): string | null {
    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.keyIndex + i) % this.keys.length;
      const keyState = this.keys[idx];
      if (keyState.cooldownUntil <= now) {
        this.keyIndex = (idx + 1) % this.keys.length;
        return keyState.key;
      }
    }
    return null;
  }

  private markKeyCooldown(key: string, cooldownMs = 60000): void {
    const keyState = this.keys.find((k) => k.key === key);
    if (keyState) {
      keyState.cooldownUntil = Date.now() + cooldownMs;
      logger.warn(`Groq API key placed in cooldown for ${cooldownMs / 1000}s`, {
        model: this.model,
      });
    }
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const startTime = Date.now();
    let lastError: any = null;

    // Try available keys in rotation
    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const activeKey = this.getNextAvailableKey();
      if (!activeKey) {
        throw new AppError("All Groq API keys are currently rate-limited", 429, "AI_RATE_LIMIT", true);
      }

      logger.info("Sending request to Groq", {
        model: this.model,
        operation: "analyze",
        keySlot: attempt + 1,
      });

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
          response_format: { type: "json_object" },
        };

        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${activeKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          if (response.status === 429) {
            this.markKeyCooldown(activeKey, 60000); // 1 min cooldown
            lastError = new AppError("AI Provider rate limit exceeded", 429, "AI_RATE_LIMIT", true);
            // If more keys exist, continue loop to try next key immediately
            if (this.keys.length > 1) {
              continue;
            }
          }
          await this.handleError(response);
        }

        const data = (await response.json()) as any;

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new AppError("Malformed AI response from Groq", 502, "AI_MALFORMED_RESPONSE", true);
        }

        const durationMs = Date.now() - startTime;
        logger.info("Groq request successful", {
          model: this.model,
          operation: "analyze",
          durationMs,
        });

        return {
          content: data.choices[0].message.content,
          usage: data.usage
            ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
              }
            : undefined,
        };
      } catch (error: any) {
        if (error instanceof AppError && error.errorCode === "AI_RATE_LIMIT" && this.keys.length > 1) {
          lastError = error;
          continue;
        }
        if (error instanceof AppError) {
          throw error;
        }
        logger.error("Groq AI Analysis Failed", {
          error: error.message,
          operation: "analyze",
          failureCategory: "network_or_internal",
        });
        throw new InternalError("Failed to analyze repository with Groq.", "AI_PROVIDER_ERROR");
      }
    }

    throw lastError || new AppError("Groq AI Provider request failed", 502, "AI_REQUEST_FAILED", true);
  }

  private async handleError(response: Response): Promise<never> {
    const status = response.status;
    let errorMessage = "Unknown Groq API error";
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
    logger.error("Groq API Error", {
      status,
      message: errorMessage,
      operation: "analyze",
      failureCategory,
    });

    if (status === 401 || status === 403) {
      throw new AppError("AI Provider authentication failed", 502, "AI_AUTH_ERROR", true);
    }
    if (status === 429) {
      throw new AppError("AI Provider rate limit exceeded", 429, "AI_RATE_LIMIT", true);
    }
    if (status >= 500) {
      throw new AppError("AI Provider is currently unavailable", 502, "AI_UNAVAILABLE", true);
    }

    throw new AppError(`AI Provider request failed: ${errorMessage}`, 502, "AI_REQUEST_FAILED", true);
  }
}
