import { describe, it, expect } from "vitest";

/**
 * Pure calculation logic for daily challenge consecutive streak and boundary rules.
 */
export function calculateStreak(
  completedDateStrings: string[], 
  currentDate: Date = new Date()
): { streak: number; hasCompletedToday: boolean } {
  const completedDateSet = new Set(completedDateStrings.map(d => d.slice(0, 10)));
  
  const todayStr = currentDate.toISOString().slice(0, 10);
  const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const hasCompletedToday = completedDateSet.has(todayStr);

  let streak = 0;
  let checkDate: Date;

  if (hasCompletedToday) {
    streak = 1;
    checkDate = yesterday;
  } else if (completedDateSet.has(yesterdayStr)) {
    streak = 1;
    checkDate = new Date(yesterday.getTime() - 24 * 60 * 60 * 1000);
  } else {
    return { streak: 0, hasCompletedToday: false };
  }

  while (streak > 0 && checkDate.getTime() > 0) {
    const checkStr = checkDate.toISOString().slice(0, 10);
    if (completedDateSet.has(checkStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return { streak, hasCompletedToday };
}

describe("Daily Challenge Streak Calculations", () => {
  const fixedNow = new Date("2026-10-13T12:00:00Z");

  it("returns 0 streak when user has no completed records", () => {
    const res = calculateStreak([], fixedNow);
    expect(res.streak).toBe(0);
    expect(res.hasCompletedToday).toBe(false);
  });

  it("returns 1 streak if user completed challenge today", () => {
    const res = calculateStreak(["2026-10-13"], fixedNow);
    expect(res.streak).toBe(1);
    expect(res.hasCompletedToday).toBe(true);
  });

  it("preserves active streak from yesterday if user has not yet completed today's challenge", () => {
    // Completed yesterday (2026-10-12) and day before (2026-10-11)
    const res = calculateStreak(["2026-10-11", "2026-10-12"], fixedNow);
    expect(res.streak).toBe(2);
    expect(res.hasCompletedToday).toBe(false);
  });

  it("increments streak when completing today after consecutive prior days", () => {
    const res = calculateStreak(["2026-10-11", "2026-10-12", "2026-10-13"], fixedNow);
    expect(res.streak).toBe(3);
    expect(res.hasCompletedToday).toBe(true);
  });

  it("breaks streak if there is a gap of a full day", () => {
    // Completed on 10th and 11th, but missed 12th; today is 13th
    const res = calculateStreak(["2026-10-10", "2026-10-11"], fixedNow);
    expect(res.streak).toBe(0);
    expect(res.hasCompletedToday).toBe(false);
  });

  it("does not increment streak from multiple completions on the same date", () => {
    const res = calculateStreak(["2026-10-13", "2026-10-13"], fixedNow);
    expect(res.streak).toBe(1);
  });
});
