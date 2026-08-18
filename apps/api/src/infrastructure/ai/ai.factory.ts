import { AIProvider } from "./ai.interface.js";
import { GroqProvider } from "./groq.provider.js";
// import { GeminiProvider } from "./gemini.provider.js";

/**
 * Factory to resolve the active AI Provider.
 * We are currently using Groq as the primary provider.
 */
export const getAiProvider = (): AIProvider => {
  return new GroqProvider();
};
