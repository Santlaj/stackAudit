import { Octokit } from "@octokit/rest";

import { env } from "../../config/env.js";

/**
 * Creates an instance of the GitHub API client.
 * 
 * We use a factory function rather than a singleton because
 * different requests might have different OAuth tokens (if a user
 * is logged in) or use a generic token for unauthenticated users.
 * 
 * @param token - Optional GitHub OAuth token for authenticated requests
 */
export const createGithubClient = (token?: string): Octokit => {
  return new Octokit({
    auth: token || env.GITHUB_TOKEN,
    userAgent: "StackAudit/1.0",
    request: {
      fetch: async (url: string, options: any) => {
        // Fast-fail timeout to force Node's Happy Eyeballs to fallback to IPv4 if IPv6 hangs
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          if (error.name === "AbortError" || error.message.includes("timeout")) {
            // If the first attempt hangs (likely broken IPv6), retry.
            // In Node 22, retrying often hits the cached fallback IP.
            return fetch(url, options); 
          }
          throw error;
        }
      }
    }
  });
};
