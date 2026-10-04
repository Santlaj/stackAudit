import { env } from "../../config/env.js";
import { AIProvider, AIAnalysisRequest, AIAnalysisResult } from "./ai.interface.js";
import { GroqProvider } from "./groq.provider.js";
import { GeminiProvider } from "./gemini.provider.js";
import { logger } from "../../utils/logger.js";
import { AppError } from "../../common/errors/index.js";

interface ProviderEntry {
  name: string;
  provider: AIProvider;
}

export class FallbackAIProvider implements AIProvider {
  private readonly providers: ProviderEntry[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const hasGroq = Boolean(env.GROQ_API_KEY || env.GROQ_API_KEYS);
    const hasGemini = Boolean(env.GEMINI_API_KEY);

    // 1. Primary: Groq 27B (High Quality, Fast)
    if (hasGroq) {
      try {
        const groqPrimary = new GroqProvider(undefined, env.GROQ_MODEL || "qwen/qwen3.6-27b");
        this.providers.push({
          name: groqPrimary.providerName,
          provider: groqPrimary,
        });
      } catch (e: any) {
        logger.warn("Failed to initialize Groq primary 27B provider", { error: e.message });
      }

      // Backup 27B variant
      try {
        const groq27bBackup = new GroqProvider(undefined, "qwen/qwen3.8-27b");
        this.providers.push({
          name: "Groq (qwen/qwen3.8-27b)",
          provider: groq27bBackup,
        });
      } catch (e: any) {
        logger.warn("Failed to initialize Groq 27B backup provider", { error: e.message });
      }
    }

    // 2. High-Capacity Secondary: Google Gemini 1.5 Flash (1M TPM free tier)
    if (hasGemini) {
      try {
        const geminiPrimary = new GeminiProvider(undefined, env.GEMINI_MODEL || "gemini-1.5-flash");
        this.providers.push({
          name: geminiPrimary.providerName,
          provider: geminiPrimary,
        });
      } catch (e: any) {
        logger.warn("Failed to initialize Gemini primary provider", { error: e.message });
      }
    }

    // 3. Fast High-Throughput Fallback: Groq 8B Instant (500k TPD, 30k TPM)
    if (hasGroq) {
      try {
        const groqFast = new GroqProvider(undefined, "llama-3.1-8b-instant");
        this.providers.push({
          name: "Groq (llama-3.1-8b-instant)",
          provider: groqFast,
        });
      } catch (e: any) {
        logger.warn("Failed to initialize Groq fast fallback provider", { error: e.message });
      }
    }

    // 4. Ultra-Fast Fallback: Gemini 1.5 Flash 8B
    if (hasGemini) {
      try {
        const gemini8b = new GeminiProvider(undefined, "gemini-1.5-flash-8b");
        this.providers.push({
          name: "Gemini (gemini-1.5-flash-8b)",
          provider: gemini8b,
        });
      } catch (e: any) {
        logger.warn("Failed to initialize Gemini 8B fallback provider", { error: e.message });
      }
    }

    logger.info(`AI Fallback Chain initialized with ${this.providers.length} providers`, {
      chain: this.providers.map((p) => p.name),
    });
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    if (this.providers.length === 0) {
      throw new AppError("No AI providers configured or available", 500, "NO_AI_PROVIDERS");
    }

    let lastError: any = null;

    for (let i = 0; i < this.providers.length; i++) {
      const entry = this.providers[i];
      const isLast = i === this.providers.length - 1;

      try {
        logger.info(`[AI Chain] Attempting analysis with provider: ${entry.name} (${i + 1}/${this.providers.length})`);
        const result = await entry.provider.analyze(request);
        logger.info(`[AI Chain] Provider ${entry.name} completed successfully.`);
        return result;
      } catch (error: any) {
        lastError = error;
        const status = error.statusCode || error.status || (error.errorCode === "AI_RATE_LIMIT" ? 429 : 500);
        logger.warn(`[AI Chain] Provider ${entry.name} failed: ${error.message} (status: ${status}). ${isLast ? "No more providers in chain." : "Failing over to next provider..."}`);
        
        // If it's a critical fatal non-recoverable error in prompt structure or something other than provider issue, continue to next provider anyway
        continue;
      }
    }

    logger.error("[AI Chain] All AI providers in fallback chain failed", {
      lastError: lastError?.message,
    });

    throw lastError || new AppError("All AI providers in fallback chain failed", 502, "AI_CHAIN_EXHAUSTED");
  }
}
