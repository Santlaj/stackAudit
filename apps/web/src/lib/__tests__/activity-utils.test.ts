import { describe, it, expect } from "vitest";
import { formatActiveDuration, formatTotalActiveTime, getActivityLevel } from "../activity-utils";

describe("activity-utils", () => {
  describe("formatActiveDuration", () => {
    it("returns null for missing/null/undefined data to represent unmeasured days", () => {
      expect(formatActiveDuration(null)).toBeNull();
      expect(formatActiveDuration(undefined)).toBeNull();
    });

    it("returns '<1m active' for 0 seconds or seconds below 60", () => {
      expect(formatActiveDuration(0)).toBe("<1m active");
      expect(formatActiveDuration(30)).toBe("<1m active");
      expect(formatActiveDuration(45)).toBe("<1m active");
    });

    it("formats minutes accurately without decimal points", () => {
      expect(formatActiveDuration(60)).toBe("1m active");
      expect(formatActiveDuration(120)).toBe("2m active");
      expect(formatActiveDuration(1440)).toBe("24m active");
      expect(formatActiveDuration(2520)).toBe("42m active");
    });

    it("formats hours and minutes accurately", () => {
      expect(formatActiveDuration(3600)).toBe("1h active");
      expect(formatActiveDuration(5040)).toBe("1h 24m active");
      expect(formatActiveDuration(7200)).toBe("2h active");
      expect(formatActiveDuration(7500)).toBe("2h 5m active");
    });
  });

  describe("formatTotalActiveTime", () => {
    it("formats 0 as '0m'", () => {
      expect(formatTotalActiveTime(0)).toBe("0m");
    });

    it("formats minutes", () => {
      expect(formatTotalActiveTime(1800)).toBe("30m");
      expect(formatTotalActiveTime(2880)).toBe("48m");
    });

    it("formats hours and minutes without decimal precision", () => {
      expect(formatTotalActiveTime(3600)).toBe("1h");
      expect(formatTotalActiveTime(45360)).toBe("12h 36m");
    });
  });

  describe("getActivityLevel", () => {
    it("returns 0 for missing or non-positive active seconds", () => {
      expect(getActivityLevel(null)).toBe(0);
      expect(getActivityLevel(undefined)).toBe(0);
      expect(getActivityLevel(0)).toBe(0);
    });

    it("returns 1 for active time under 15 minutes", () => {
      expect(getActivityLevel(30)).toBe(1);
      expect(getActivityLevel(14 * 60)).toBe(1);
    });

    it("returns 2 for active time between 15 and 45 minutes", () => {
      expect(getActivityLevel(15 * 60)).toBe(2);
      expect(getActivityLevel(30 * 60)).toBe(2);
      expect(getActivityLevel(44 * 60)).toBe(2);
    });

    it("returns 3 for active time between 45 and 90 minutes", () => {
      expect(getActivityLevel(45 * 60)).toBe(3);
      expect(getActivityLevel(60 * 60)).toBe(3);
      expect(getActivityLevel(89 * 60)).toBe(3);
    });

    it("returns 4 for active time 90 minutes and above", () => {
      expect(getActivityLevel(90 * 60)).toBe(4);
      expect(getActivityLevel(180 * 60)).toBe(4);
    });
  });
});
