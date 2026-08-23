"use client";

import { useState } from "react";

interface RepoInputProps {
  onSubmit: (owner: string, repo: string) => void;
  isLoading: boolean;
}

export default function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function parseRepoUrl(input: string): { owner: string; repo: string } | null {
    const trimmed = input.trim();

    // Match: owner/repo
    const slashMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
    if (slashMatch) return { owner: slashMatch[1], repo: slashMatch[2] };

    // Match: https://github.com/owner/repo
    const urlMatch = trimmed.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/?/
    );
    if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };

    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseRepoUrl(value);
    if (!parsed) {
      setError("Enter a valid GitHub URL or owner/repo format");
      return;
    }

    onSubmit(parsed.owner, parsed.repo);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-accent-light rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-300" />
        <div className="relative flex items-center bg-card border border-card-border rounded-xl overflow-hidden">
          {/* GitHub icon */}
          <div className="pl-4 text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github.com/owner/repo or owner/repo"
            className="flex-1 bg-transparent px-4 py-4 text-foreground placeholder-muted/50 outline-none text-base"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="mr-2 px-6 py-2.5 bg-accent hover:bg-accent-light text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Queuing
              </span>
            ) : (
              "Audit"
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-error text-center">{error}</p>
      )}
    </form>
  );
}
