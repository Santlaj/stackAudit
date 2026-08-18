import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { AnalysisService } from "./analysis.service.js";
import { getAiProvider } from "../../infrastructure/ai/index.js";
import { AppError } from "../../common/errors/index.js";

// Mock the AI factory module
mock.module("../../infrastructure/ai/index.js", {
  namedExports: {
    getAiProvider: mock.fn(),
  },
});

describe("AnalysisService", () => {
  const mockAiProvider = {
    analyze: mock.fn(),
  };

  beforeEach(() => {
    // Setup the mock provider for each test
    (getAiProvider as any).mock.mockImplementation(() => mockAiProvider);
  });

  afterEach(() => {
    mockAiProvider.analyze.mock.resetCalls();
  });

  it("should analyze code successfully using the injected AI provider", async () => {
    mockAiProvider.analyze.mock.mockImplementationOnce(() => 
      Promise.resolve({ content: "This is a mocked analysis result" })
    );

    const service = new AnalysisService();
    const result = await service.analyzeCode("const a = 1;");

    assert.strictEqual(result.summary, "Analysis completed successfully.");
    assert.strictEqual(result.rawAnalysis, "This is a mocked analysis result");
    
    const analyzeCalls = mockAiProvider.analyze.mock.calls;
    assert.strictEqual(analyzeCalls.length, 1);
    const request = analyzeCalls[0].arguments[0];
    
    assert.ok(request.prompt.includes("const a = 1;"));
    assert.ok(request.systemContext.includes("expert software architect"));
  });

  it("should throw AppError if code input is empty", async () => {
    const service = new AnalysisService();
    
    await assert.rejects(
      async () => await service.analyzeCode("   "),
      (err: any) => err instanceof AppError && err.errorCode === "ANALYSIS_INVALID_INPUT"
    );

    // AI Provider should not have been called
    assert.strictEqual(mockAiProvider.analyze.mock.calls.length, 0);
  });

  it("should propagate errors from the AI Provider", async () => {
    const expectedError = new AppError("AI rate limit", 502, "AI_RATE_LIMIT");
    mockAiProvider.analyze.mock.mockImplementationOnce(() => Promise.reject(expectedError));

    const service = new AnalysisService();
    
    await assert.rejects(
      async () => await service.analyzeCode("valid code"),
      (err: any) => err === expectedError
    );
  });
});
