import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DailyChallengePanel } from "../daily-challenge-panel";
import * as api from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof api>("@/lib/api");
  return {
    ...actual,
    completeDailyChallenge: vi.fn(),
    replaceDailyChallenge: vi.fn(),
  };
});

describe("DailyChallengePanel Component", () => {
  const mockChallenge: api.DailyChallenge = {
    id: "dc-123",
    challengeDate: "2026-10-13",
    status: "ASSIGNED",
    completedAt: null,
    checklist: null,
    matchId: "match-456",
    issue: {
      id: "issue-789",
      repository: "facebook/react",
      issueNumber: 2841,
      title: "Improve component tree hydration error reporting",
      body: "Hydration mismatch should highlight offending DOM node.",
      url: "https://github.com/facebook/react/issues/2841",
      state: "open",
      difficulty: "beginner",
      technologies: ["JavaScript", "React"],
      labels: ["good first issue"],
      repoStars: 220000,
      repoActivity: "active",
      matchScore: 92,
      reasons: ["Matches your React & JavaScript focus"],
      gaps: [],
      estimatedMinutes: 30,
    },
  };

  const mockHistory: api.ChallengeHistory = {
    streak: 3,
    totalCompleted: 14,
    hasCompletedToday: false,
    targetYear: 2026,
    targetMonth: 10,
    calendar: {
      "2026-10-10": { completed: true, completedAt: "2026-10-10T12:00:00Z" },
      "2026-10-11": { completed: true, completedAt: "2026-10-11T12:00:00Z" },
      "2026-10-12": { completed: true, completedAt: "2026-10-12T12:00:00Z" },
    },
  };

  const mockProgress: api.ContributionProgress = {
    explored: 12,
    started: 4,
    prSubmitted: 2,
    merged: 1,
    totalTracked: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders daily challenge details, streak, calendar, and progress", () => {
    render(
      <DailyChallengePanel
        challenge={mockChallenge}
        history={mockHistory}
        progress={mockProgress}
        onChallengeUpdated={vi.fn()}
        onHistoryUpdated={vi.fn()}
        loadingChallenge={false}
      />
    );

    // Challenge header & issue
    expect(screen.getByText("Daily Challenge")).toBeInTheDocument();
    expect(screen.getByText("facebook/react")).toBeInTheDocument();
    expect(screen.getByText(/improve component tree hydration error reporting/i)).toBeInTheDocument();
    expect(screen.getByText(/why it matches:/i)).toBeInTheDocument();

    // Streak
    expect(screen.getByText("Challenge Streak")).toBeInTheDocument();
    expect(screen.getByText("3 days")).toBeInTheDocument();

    // Progress
    expect(screen.getByText("Contribution Progress")).toBeInTheDocument();
    expect(screen.getByText("Explored")).toBeInTheDocument();
    expect(screen.getByText("PR Submitted")).toBeInTheDocument();
  });

  it("requires all 3 investigation checklist items before enabling completion button", async () => {
    const onChallengeUpdated = vi.fn();
    const onHistoryUpdated = vi.fn();

    render(
      <DailyChallengePanel
        challenge={mockChallenge}
        history={mockHistory}
        progress={mockProgress}
        onChallengeUpdated={onChallengeUpdated}
        onHistoryUpdated={onHistoryUpdated}
        loadingChallenge={false}
      />
    );

    const completeBtn = screen.getByRole("button", { name: /complete daily challenge/i });
    expect(completeBtn).toBeDisabled();

    // Check first checkbox
    const cb1 = screen.getByLabelText(/i understand what the issue is asking for/i);
    fireEvent.click(cb1);
    expect(completeBtn).toBeDisabled();

    // Check second checkbox
    const cb2 = screen.getByLabelText(/i identified the relevant files or code area/i);
    fireEvent.click(cb2);
    expect(completeBtn).toBeDisabled();

    // Check third checkbox
    const cb3 = screen.getByLabelText(/i know what i would investigate or validate next/i);
    fireEvent.click(cb3);

    // Now button should be enabled!
    expect(completeBtn).not.toBeDisabled();

    // Mock API success
    const completedChallenge = {
      ...mockChallenge,
      status: "COMPLETED" as const,
      completedAt: new Date().toISOString(),
      checklist: { understoodProblem: true, identifiedFiles: true, nextStepsPlanned: true },
    };
    vi.mocked(api.completeDailyChallenge).mockResolvedValue(completedChallenge);

    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(api.completeDailyChallenge).toHaveBeenCalledWith({
        understoodProblem: true,
        identifiedFiles: true,
        nextStepsPlanned: true,
      });
      expect(onChallengeUpdated).toHaveBeenCalledWith(completedChallenge);
      expect(onHistoryUpdated).toHaveBeenCalled();
    });
  });
});
