export interface AIAnalysisRequest {
  prompt: string;
  systemContext?: string;
  temperature?: number;
}

export interface AIAnalysisResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Defines the strict contract that any AI provider must adhere to.
 * By using this interface, our business layer (Analysis Module)
 * remains completely oblivious to the underlying AI implementation.
 */
export interface AIProvider {
  /**
   * Analyzes a repository's raw engineering data and returns a structured
   * markdown or JSON string containing insights.
   *
   * @param request - The analysis request containing prompt and configuration.
   */
  analyze(request: AIAnalysisRequest): Promise<AIAnalysisResult>;
}
