import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert";
import { GithubService } from "./github.service.js";
import { AppError } from "../../common/errors/index.js";
import { createGithubClient } from "../../infrastructure/github/index.js";

// Mock the github infrastructure module
mock.module("../../infrastructure/github/index.js", {
  namedExports: {
    createGithubClient: mock.fn(),
  },
});

describe("GithubService", () => {
  const mockReposGet = mock.fn();
  const mockReposGetContent = mock.fn();

  beforeEach(() => {
    // Reset mocks
    mockReposGet.mock.resetCalls();
    mockReposGetContent.mock.resetCalls();

    // Setup the mock client
    (createGithubClient as any).mock.mockImplementation(() => ({
      repos: {
        get: mockReposGet,
        getContent: mockReposGetContent,
      },
    }));
  });

  it("should fetch repository info successfully", async () => {
    (mockReposGet as any).mock.mockImplementationOnce(() => 
      Promise.resolve({
        data: {
          id: 123,
          name: "test-repo",
          full_name: "owner/test-repo",
          description: "A test repository",
          html_url: "https://github.com/owner/test-repo",
          default_branch: "main",
          visibility: "public",
          language: "TypeScript",
        }
      })
    );

    const service = new GithubService();
    const info = await service.getRepositoryInfo("owner", "test-repo");

    assert.strictEqual(info?.name, "test-repo");
    assert.strictEqual(info?.fullName, "owner/test-repo");
    assert.strictEqual(info?.defaultBranch, "main");
  });

  it("should handle repository not found error", async () => {
    const error: any = new Error("Not Found");
    error.status = 404;
    
    (mockReposGet as any).mock.mockImplementationOnce(() => Promise.reject(error));

    const service = new GithubService();
    
    await assert.rejects(
      async () => await service.getRepositoryInfo("owner", "unknown-repo"),
      (err: any) => err instanceof AppError && err.errorCode === "GITHUB_NOT_FOUND"
    );
  });

  it("should fetch file content and decode base64 correctly", async () => {
    const rawContent = "console.log('Hello, World!');";
    const base64Content = Buffer.from(rawContent).toString("base64");

    (mockReposGetContent as any).mock.mockImplementationOnce(() => 
      Promise.resolve({
        data: {
          type: "file",
          path: "index.js",
          content: base64Content,
          sha: "abc123sha",
          size: 29,
        }
      })
    );

    const service = new GithubService();
    const file = await service.getFileContent("owner", "test-repo", "index.js");

    assert.strictEqual(file?.path, "index.js");
    assert.strictEqual(file?.content, rawContent);
    assert.strictEqual(file?.sha, "abc123sha");
  });

  it("should handle fetching a path that is not a file", async () => {
    (mockReposGetContent as any).mock.mockImplementationOnce(() => 
      Promise.resolve({
        data: [
          { type: "file", path: "file1.js" },
          { type: "dir", path: "src" }
        ]
      })
    );

    const service = new GithubService();
    
    await assert.rejects(
      async () => await service.getFileContent("owner", "test-repo", "src"),
      (err: any) => err instanceof AppError && err.errorCode === "GITHUB_INVALID_FILE"
    );
  });
});
