import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { DailyActivityCard } from "../daily-activity-card";
import * as api from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof api>("@/lib/api");
  return {
    ...actual,
    fetchDailyActivity: vi.fn(),
  };
});

describe("DailyActivityCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    vi.mocked(api.fetchDailyActivity).mockImplementation(() => new Promise(() => {}));
    render(<DailyActivityCard />);

    expect(screen.getByText(/loading activity/i)).toBeInTheDocument();
  });

  it("renders header, 30 days grid, and truthful active time tooltips", async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const mockData: api.DailyActivityRecord[] = [
      { date: todayStr, activeSeconds: 5040 }, // 1h 24m
    ];

    vi.mocked(api.fetchDailyActivity).mockResolvedValue(mockData);
    render(<DailyActivityCard />);

    await waitFor(() => {
      expect(screen.getByText("Daily Activity")).toBeInTheDocument();
      expect(screen.getByText("Your active time on StackAudit (last 30 days)")).toBeInTheDocument();
    });

    // Verify total time formatted
    expect(screen.getByText("Total this month:")).toBeInTheDocument();
    expect(screen.getByText("1h 24m")).toBeInTheDocument();

    // Hover today's active cell
    const todayCell = screen.getByLabelText(new RegExp("1h 24m active", "i"));
    expect(todayCell).toBeInTheDocument();

    fireEvent.mouseEnter(todayCell);
    expect(screen.getByText("1h 24m active")).toBeInTheDocument();

    // Hover an unmeasured day (no database record)
    const emptyCell = screen.getAllByLabelText(new RegExp("No activity data", "i"))[0];
    expect(emptyCell).toBeInTheDocument();

    fireEvent.mouseEnter(emptyCell);
    expect(screen.getByText("No activity data")).toBeInTheDocument();
    expect(screen.queryByText("0m active")).not.toBeInTheDocument();
  });
});
