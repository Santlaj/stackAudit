import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { AnalyzeHeader } from "../analyze-header";
import { IssueMatch } from "@/lib/api";

// Mock next/navigation useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockMatch: IssueMatch = {
  id: "test-match-header-1",
  repository: "facebook/react",
  issueNumber: 28401,
  issueTitle: "Fix hydration mismatch warning in Server Components",
  issueUrl: "https://github.com/facebook/react/issues/28401",
  technologies: ["TypeScript", "JavaScript"],
  complexity: "Intermediate",
  matchScore: 92,
  status: "DISCOVERED",
  commentsCount: 14,
  repositoryActivity: {
    status: "active",
    lastActivityAt: "2026-03-01T00:00:00Z",
    openIssues: 350,
    stars: 220000,
    prAcceptanceRate: 85,
  },
};

describe("AnalyzeHeader Component", () => {
  it("renders repository breadcrumb, issue number, and title", () => {
    render(<AnalyzeHeader match={mockMatch} />);

    expect(screen.getByText("facebook/react")).toBeInTheDocument();
    expect(screen.getByText("28401")).toBeInTheDocument();
    expect(screen.getByText("Fix hydration mismatch warning in Server Components")).toBeInTheDocument();
  });

  it("renders difficulty and technology badges", () => {
    render(<AnalyzeHeader match={mockMatch} />);

    expect(screen.getByText("Intermediate")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders composite match score pill and GitHub link", () => {
    render(<AnalyzeHeader match={mockMatch} />);

    expect(screen.getByText("92% Match")).toBeInTheDocument();
    
    const githubLink = screen.getByRole("link", { name: /view original issue on github/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/facebook/react/issues/28401");
  });
});
