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

vi.mock("@/lib/auth-client", () => ({
  useSession: () => ({
    data: {
      user: { id: "test-user", name: "Test Developer", image: null },
    },
  }),
}));

vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

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

    expect(screen.getByText(/evaluating badges/i)).toBeInTheDocument();
  });

  it("displays error message if badge fetch fails", async () => {
    vi.mocked(api.fetchBadges).mockRejectedValue(new Error("Network connection error"));
    render(<ContributionBadges />);

    await waitFor(() => {
      expect(screen.getByText(/unable to load badges/i)).toBeInTheDocument();
      expect(screen.getByText(/network connection error/i)).toBeInTheDocument();
    });
  });

  it("renders earned badges with registry images and hides unearned ones", async () => {
    vi.mocked(api.fetchBadges).mockResolvedValue(mockBadgesList);
    render(<ContributionBadges />);

    await waitFor(() => {
      expect(screen.getByText("Achievements")).toBeInTheDocument();
    });

    // 2 badges earned
    expect(screen.getByText("2 badges earned")).toBeInTheDocument();

    // Verify earned badge titles from registry are present
    expect(screen.getByText("First Verified Contribution")).toBeInTheDocument();
    expect(screen.getByText("First PR Submitted")).toBeInTheDocument();

    // Unearned badges should NOT be displayed
    expect(screen.queryByText("Issue Investigator")).not.toBeInTheDocument();
    expect(screen.queryByText("Repository Analyst")).not.toBeInTheDocument();
    expect(screen.queryByText("10 Merged PRs")).not.toBeInTheDocument();
    expect(screen.queryByText("First PR Merged")).not.toBeInTheDocument();
    expect(screen.queryByText("Contributor ×5")).not.toBeInTheDocument();
  });

  it("shows empty state when no badges are earned", async () => {
    const zeroBadges: api.BadgeDto[] = mockBadgesList.map(b => ({
      ...b,
      earned: false,
      earnedAt: null,
      current: 0,
    }));
    vi.mocked(api.fetchBadges).mockResolvedValue(zeroBadges);
    render(<ContributionBadges />);

    await waitFor(() => {
      expect(screen.getByText("No badges earned yet")).toBeInTheDocument();
    });

    // Should show CTA to discover
    const discoverLink = screen.getByRole("link", { name: /find contributions/i });
    expect(discoverLink).toBeInTheDocument();
    expect(discoverLink).toHaveAttribute("href", "/discover");
  });
});
