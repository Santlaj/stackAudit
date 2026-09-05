import test from "node:test";
import assert from "node:assert";
import { GithubService } from "./github.service.js";
import { GithubRateLimitError } from "../../common/errors/index.js";

function createOctokitError(status: number, headers: any, message = "API Error") {
  const error: any = new Error(message);
  error.status = status;
  error.response = { status, headers };
  return error;
}

test("GithubService rate limit classification", async (t) => {
  const service = new GithubService();
  const handleError = (service as any).handleError.bind(service);

  await t.test("Ordinary 403 (Forbidden) is NOT a rate limit", () => {
    const error = createOctokitError(403, {});
    assert.throws(() => handleError(error, "context"), (err: any) => {
      return !(err instanceof GithubRateLimitError) && err.statusCode === 401; 
    });
  });

  await t.test("Primary rate limit (remaining = 0)", () => {
    const error = createOctokitError(403, {
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": "1710000000",
    });
    assert.throws(() => handleError(error, "context"), (err: any) => {
      return err instanceof GithubRateLimitError && err.resetAt === 1710000000000;
    });
  });

  await t.test("Secondary rate limit (retry-after)", () => {
    const error = createOctokitError(403, {
      "retry-after": "60",
    });
    const now = Date.now();
    assert.throws(() => handleError(error, "context"), (err: any) => {
      const diff = err.resetAt - (now + 60000);
      return err instanceof GithubRateLimitError && Math.abs(diff) < 1000;
    });
  });

  await t.test("Secondary rate limit by message", () => {
    const error = createOctokitError(403, {}, "You have exceeded a secondary rate limit.");
    const now = Date.now();
    assert.throws(() => handleError(error, "context"), (err: any) => {
      const diff = err.resetAt - (now + 60000);
      return err instanceof GithubRateLimitError && Math.abs(diff) < 1000;
    });
  });
});
