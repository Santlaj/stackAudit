import { describe, it, expect, vi } from "vitest";
import ActivityPage from "../page";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("ActivityPage", () => {
  it("redirects cleanly to /profile", () => {
    ActivityPage();
    expect(redirect).toHaveBeenCalledWith("/profile");
  });
});
