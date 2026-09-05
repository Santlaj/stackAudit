import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ActivityPage from "../page";
import * as api from "@/lib/api";

vi.mock("@/components/layout/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layout/shell", () => ({
  Shell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof api>("@/lib/api");
  return {
    ...actual,
    fetchDailyActivity: vi.fn(),
  };
});

describe("ActivityPage (12-Month Heatmap)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 12-month activity page and truthful tooltips", async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const mockData: api.DailyActivityRecord[] = [
      { date: todayStr, activeSeconds: 7200 }, // 2h active
    ];

    vi.mocked(api.fetchDailyActivity).mockResolvedValue(mockData);
    render(<ActivityPage />);

    await waitFor(() => {
      expect(screen.getByText("Active Time & Contributions")).toBeInTheDocument();
      expect(screen.getByText("12-Month Activity Heatmap")).toBeInTheDocument();
    });

    // Check summary metrics
    expect(screen.getByText("2h")).toBeInTheDocument();
    expect(screen.getByText("Total Active Time (12M)")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Active Days Measured")).toBeInTheDocument();

    // Hover measured day
    const activeCell = screen.getByLabelText(new RegExp("2h active", "i"));
    expect(activeCell).toBeInTheDocument();

    fireEvent.mouseEnter(activeCell);
    expect(screen.getByText("2h active")).toBeInTheDocument();

    // Hover unmeasured day (no DB record)
    const unmeasuredCell = screen.getAllByLabelText(new RegExp("No activity data", "i"))[0];
    expect(unmeasuredCell).toBeInTheDocument();

    fireEvent.mouseEnter(unmeasuredCell);
    expect(screen.getByText("No activity data")).toBeInTheDocument();
    expect(screen.queryByText("0m active")).not.toBeInTheDocument();
  });
});
