import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MatchBadge } from "../match-badge";
import { IssueMatch } from "@/lib/api";

const mockMatch: IssueMatch = {
  id: "test-match-popover",
  repository: "owner/repo",
  issueNumber: 101,
  issueTitle: "Test Issue",
  issueUrl: "https://github.com/owner/repo/issues/101",
  technologies: ["TypeScript"],
  complexity: "Good First Issue",
  matchScore: 89,
  status: "DISCOVERED",
  reasons: [
    "Primary language TypeScript matches your skills.",
    "Good First Issue fits beginner experience preference.",
  ],
  repositoryActivity: {
    status: "active",
    lastActivityAt: null,
    openIssues: 12,
    stars: 5400,
    prAcceptanceRate: 78,
  },
};

describe("MatchBadge & Popover Component", () => {
  it("renders trigger button with composite match score", () => {
    render(<MatchBadge match={mockMatch} knowledgeGaps={["Understanding of Surefire plugin"]} />);

    const trigger = screen.getByRole("button", { name: /match score: 89%/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens popover on click/tap and displays reasons and gaps without fabricating numbers", () => {
    render(<MatchBadge match={mockMatch} knowledgeGaps={["Understanding of Surefire plugin"]} />);

    const trigger = screen.getByRole("button", { name: /match score: 89%/i });
    fireEvent.click(trigger);

    // Popover dialog opens
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Contains real reasons
    expect(screen.getByText(/primary language typescript matches your skills/i)).toBeInTheDocument();
    expect(screen.getByText(/good first issue fits beginner experience/i)).toBeInTheDocument();

    // Contains real knowledge gap
    expect(screen.getByText("Understanding of Surefire plugin")).toBeInTheDocument();

    // Contains signal labels
    expect(screen.getByText("89% Overall")).toBeInTheDocument();
  });
});
