import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ContributionBadges } from "../contribution-badges";
import * as api from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof api>("@/lib/api");
  return {
    ...actual,
    fetchBadges: vi.fn(),
  };
});

const mockBadgesList: api.BadgeDto[] = [
  {
    id: "FIRST_CONTRIBUTION",
    name: "First Contribution",
    description: "Started your first contribution.",
    earned: true,
    earnedAt: "2025-01-12T10:00:00.000Z",
    current: 1,
    target: 1,
  },
  {
    id: "FIRST_PR",
    name: "First PR",
    description: "Submitted your first pull request.",
    earned: true,
    earnedAt: "2025-02-03T14:30:00.000Z",
    current: 1,
    target: 1,
  },
  {
    id: "MERGED",
    name: "Merged",
    description: "Get your first PR merged.",
    earned: false,
    earnedAt: null,
    current: 0,
    target: 1,
  },
  {
    id: "CONTRIBUTOR_5",
    name: "Contributor ×5",
    description: "Start 5 contributions.",
    earned: false,
    earnedAt: null,
    current: 3,
    target: 5,
  },
  {
    id: "CONTRIBUTOR_10",
    name: "Contributor ×10",
    description: "Start 10 contributions.",
    earned: false,
    earnedAt: null,
    current: 3,
    target: 10,
  },
  {
    id: "ISSUE_EXPLORER",
    name: "Issue Explorer",
    description: "Explore at least 5 different issues.",
    earned: false,
    earnedAt: null,
    current: 4,
    target: 5,
  },
  {
    id: "REPOSITORY_EXPLORER",
    name: "Repository Explorer",
    description: "Analyze or explore at least 5 different repositories.",
    earned: false,
    earnedAt: null,
    current: 2,
    target: 5,
  },
  {
    id: "MULTI_STACK",
    name: "Multi-Stack",
    description: "Contribute across at least 3 different technologies.",
    earned: false,
    earnedAt: null,
    current: 1,
    target: 3,
  },
  {
    id: "REPOSITORY_CONTRIBUTOR",
    name: "Repository Contributor",
    description: "Reach STARTED or beyond in at least 3 different repositories.",
    earned: false,
    earnedAt: null,
    current: 1,
    target: 3,
  },
];

describe("ContributionBadges Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading indicator while fetching badges", () => {
    vi.mocked(api.fetchBadges).mockImplementation(() => new Promise(() => {}));
    render(<ContributionBadges />);

    expect(screen.getByText(/evaluating contribution badges/i)).toBeInTheDocument();
  });

  it("displays error message if badge fetch fails", async () => {
    vi.mocked(api.fetchBadges).mockRejectedValue(new Error("Network connection error"));
    render(<ContributionBadges />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load badges/i)).toBeInTheDocument();
      expect(screen.getByText(/network connection error/i)).toBeInTheDocument();
    });
  });

  it("renders all 9 badges with correct earned count and progress values", async () => {
    vi.mocked(api.fetchBadges).mockResolvedValue(mockBadgesList);
    render(<ContributionBadges />);

    await waitFor(() => {
      expect(screen.getByText("Contribution Badges")).toBeInTheDocument();
    });

    // 2 earned out of 9
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/9 Earned/i)).toBeInTheDocument();

    // Verify badge titles
    expect(screen.getByText("First Contribution")).toBeInTheDocument();
    expect(screen.getByText("First PR")).toBeInTheDocument();
    expect(screen.getByText("Merged")).toBeInTheDocument();
    expect(screen.getByText("Contributor ×5")).toBeInTheDocument();
    expect(screen.getByText("Contributor ×10")).toBeInTheDocument();
    expect(screen.getByText("Issue Explorer")).toBeInTheDocument();
    expect(screen.getByText("Repository Explorer")).toBeInTheDocument();
    expect(screen.getByText("Multi-Stack")).toBeInTheDocument();
    expect(screen.getByText("Repository Contributor")).toBeInTheDocument();

    // Verify earned badges have "Earned" label
    const earnedLabels = screen.getAllByText("Earned");
    expect(earnedLabels.length).toBe(2);

    // Verify progress values for unearned badges
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
    expect(screen.getByText("3 / 10")).toBeInTheDocument();
    expect(screen.getByText("4 / 5")).toBeInTheDocument();
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    expect(screen.getAllByText("1 / 3").length).toBe(2);

    // Verify link to Discover Issues
    const discoverLink = screen.getByRole("link", { name: /discover issues/i });
    expect(discoverLink).toBeInTheDocument();
    expect(discoverLink).toHaveAttribute("href", "/discover");
  });

  it("handles case where user has zero started contributions (all locked)", async () => {
    const zeroBadges: api.BadgeDto[] = mockBadgesList.map(b => ({
      ...b,
      earned: false,
      earnedAt: null,
      current: 0,
    }));
    vi.mocked(api.fetchBadges).mockResolvedValue(zeroBadges);
    render(<ContributionBadges />);

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText(/9 Earned/i)).toBeInTheDocument();
    });

    // No "Earned" badges
    expect(screen.queryByText("Earned")).not.toBeInTheDocument();
  });
});
