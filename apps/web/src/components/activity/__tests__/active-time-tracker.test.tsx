import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { ActiveTimeTracker } from "../active-time-tracker";
import * as authClient from "@/lib/auth-client";
import * as api from "@/lib/api";

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  sendHeartbeat: vi.fn().mockResolvedValue({ accepted: true }),
}));

describe("ActiveTimeTracker Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
    });
    Object.defineProperty(document, "hasFocus", {
      value: () => true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not start timer when user is unauthenticated", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as any);

    render(<ActiveTimeTracker />);
    vi.advanceTimersByTime(60_000);

    expect(api.sendHeartbeat).not.toHaveBeenCalled();
  });

  it("starts recurring 30s heartbeat when user is authenticated, visible, and focused", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "test-user-123" } },
      isPending: false,
    } as any);

    render(<ActiveTimeTracker />);

    // Fast-forward 30 seconds
    vi.advanceTimersByTime(30_000);
    expect(api.sendHeartbeat).toHaveBeenCalledTimes(1);

    // Fast-forward another 30 seconds
    vi.advanceTimersByTime(30_000);
    expect(api.sendHeartbeat).toHaveBeenCalledTimes(2);
  });

  it("pauses tracking when tab becomes hidden or window blurs", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "test-user-123" } },
      isPending: false,
    } as any);

    render(<ActiveTimeTracker />);

    // User switches tab (hidden)
    Object.defineProperty(document, "visibilityState", { value: "hidden", writable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    vi.advanceTimersByTime(60_000);
    // Heartbeat should not have fired while hidden
    expect(api.sendHeartbeat).not.toHaveBeenCalled();

    // User returns and focuses
    Object.defineProperty(document, "visibilityState", { value: "visible", writable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    vi.advanceTimersByTime(30_000);
    expect(api.sendHeartbeat).toHaveBeenCalledTimes(1);
  });

  it("cleans up intervals and event listeners on unmount", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { id: "test-user-123" } },
      isPending: false,
    } as any);

    const { unmount } = render(<ActiveTimeTracker />);
    unmount();

    vi.advanceTimersByTime(60_000);
    expect(api.sendHeartbeat).not.toHaveBeenCalled();
  });
});
