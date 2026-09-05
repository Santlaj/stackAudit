import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { RepositoryStatus } from "../repository-status";
import { IssueMatch } from "@/lib/api";

const mockMatch: IssueMatch = {
  id: "test-match-status",
  repository: "vuejs/core",
  issueNumber: 500,
  issueTitle: "Test Issue",
  issueUrl: "https://github.com/vuejs/core/issues/500",
  technologies: ["TypeScript"],
  status: "DISCOVERED",
  issueUpdatedAt: "2026-02-20T10:00:00Z",
  repositoryActivity: {
    status: "active",
    lastActivityAt: "2026-02-20T10:00:00Z",
    openIssues: 412,
    stars: 45000,
    prAcceptanceRate: 82,
  },
};

describe("RepositoryStatus Component", () => {
  it("renders correct title and all available backend fields", () => {
    render(<RepositoryStatus match={mockMatch} />);

    expect(screen.getByText("Repository Status")).toBeInTheDocument();
    expect(screen.getByText("412")).toBeInTheDocument();
    expect(screen.getByText("45,000")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });
});
