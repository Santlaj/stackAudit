import { AIProvider } from "./ai.interface.js";
import { FallbackAIProvider } from "./fallback.provider.js";

// Singleton instance to preserve provider key-rotation states and cooldowns across calls
let fallbackProviderInstance: FallbackAIProvider | null = null;

/**
 * Factory to resolve the active AI Provider.
 * Returns the resilient FallbackAIProvider chain (Groq 27B -> Gemini 1.5 Flash -> Groq 8B -> Gemini 8B).
 */
export const getAiProvider = (): AIProvider => {
  if (!fallbackProviderInstance) {
    fallbackProviderInstance = new FallbackAIProvider();
  }
  return fallbackProviderInstance;
};
