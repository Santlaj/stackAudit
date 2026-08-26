import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert";
import { GroqProvider } from "./groq.provider.js";
import { env } from "../../config/env.js";
import { AppError, InternalError } from "../../common/errors/index.js";

describe("GroqProvider", () => {
  beforeEach(() => {
    // Reset env vars before each test to ensure isolation
    env.GROQ_API_KEY = "test-api-key";
    env.GROQ_MODEL = "test-model";
    
    // Mock global fetch
    global.fetch = mock.fn();
  });

  it("should initialize correctly when configuration is valid", () => {
    const provider = new GroqProvider();
    assert.ok(provider);
  });

  it("should throw InternalError if GROQ_API_KEY is missing", () => {
    env.GROQ_API_KEY = "";
    assert.throws(() => new GroqProvider(), (err: any) => {
      return err instanceof InternalError && err.message === "GROQ_API_KEY is not configured";
    });
  });

  it("should successfully return analysis result on valid response", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "This is a test analysis",
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      }),
    };
    
    (global.fetch as any).mock.mockImplementationOnce(() => Promise.resolve(mockResponse));

    const provider = new GroqProvider();
    const result = await provider.analyze({
      prompt: "Analyze this code",
      systemContext: "System prompt",
    });

    assert.strictEqual(result.content, "This is a test analysis");
    assert.deepStrictEqual(result.usage, {
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
    
    // Verify fetch arguments
    const calls = (global.fetch as any).mock.calls;
    assert.strictEqual(calls.length, 1);
    const [url, options] = calls[0].arguments;
    assert.strictEqual(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.strictEqual(options.headers.Authorization, "Bearer test-api-key");
    assert.strictEqual(JSON.parse(options.body).model, "test-model");
  });

  it("should handle authentication failure (401)", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: "Invalid API Key" },
      }),
    };
    
    (global.fetch as any).mock.mockImplementationOnce(() => Promise.resolve(mockResponse));

    const provider = new GroqProvider();
    
    await assert.rejects(
      async () => await provider.analyze({ prompt: "test" }),
      (err: any) => err instanceof AppError && err.errorCode === "AI_AUTH_ERROR"
    );
  });

  it("should handle rate limit exceeded (429)", async () => {
    const mockResponse = {
      ok: false,
      status: 429,
      json: async () => ({
        error: { message: "Too many requests" },
      }),
    };
    
    (global.fetch as any).mock.mockImplementationOnce(() => Promise.resolve(mockResponse));

    const provider = new GroqProvider();
    
    await assert.rejects(
      async () => await provider.analyze({ prompt: "test" }),
      (err: any) => err instanceof AppError && err.errorCode === "AI_RATE_LIMIT"
    );
  });

  it("should handle provider unavailable (500+)", async () => {
    const mockResponse = {
      ok: false,
      status: 503,
      json: async () => ({
        error: { message: "Service Unavailable" },
      }),
    };
    
    (global.fetch as any).mock.mockImplementationOnce(() => Promise.resolve(mockResponse));

    const provider = new GroqProvider();
    
    await assert.rejects(
      async () => await provider.analyze({ prompt: "test" }),
      (err: any) => err instanceof AppError && err.errorCode === "AI_UNAVAILABLE"
    );
  });

  it("should handle malformed AI response", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        // Missing choices array
        usage: {},
      }),
    };
    
    (global.fetch as any).mock.mockImplementationOnce(() => Promise.resolve(mockResponse));

    const provider = new GroqProvider();
    
    await assert.rejects(
      async () => await provider.analyze({ prompt: "test" }),
      (err: any) => err instanceof AppError && err.errorCode === "AI_MALFORMED_RESPONSE"
    );
  });

  it("should handle network failure", async () => {
    (global.fetch as any).mock.mockImplementationOnce(() => Promise.reject(new Error("Network Error")));

    const provider = new GroqProvider();
    
    await assert.rejects(
      async () => await provider.analyze({ prompt: "test" }),
      (err: any) => err instanceof InternalError && err.errorCode === "AI_PROVIDER_ERROR"
    );
  });
});
