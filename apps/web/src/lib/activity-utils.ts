/**
 * Formats active seconds into an honest human-readable duration.
 * Adheres strictly to the StackAudit formatting rules:
 * - Never returns decimal hours/minutes (e.g., 1.4h)
 * - Rounds to nearest minute
 * - Shows "<1m active" for positive durations under 60 seconds
 * - Returns null if no record exists (to distinguish from missing data)
 */
export function formatActiveDuration(activeSeconds: number | null | undefined): string | null {
  if (activeSeconds === null || activeSeconds === undefined) {
    return null; // Missing data
  }

  if (activeSeconds <= 0) {
    return "<1m active";
  }

  if (activeSeconds < 60) {
    return "<1m active";
  }

  const totalMinutes = Math.round(activeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m active` : `${hours}h active`;
  }

  return `${minutes}m active`;
}

/**
 * Formats total active seconds naturally (e.g., "12h 36m" or "48m").
 */
export function formatTotalActiveTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) {
    return "0m";
  }

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

/**
 * Returns activity level (0 to 4) based on active seconds.
 */
export function getActivityLevel(activeSeconds: number | undefined | null): number {
  if (!activeSeconds || activeSeconds <= 0) return 0;
  if (activeSeconds < 15 * 60) return 1; // < 15 mins
  if (activeSeconds < 45 * 60) return 2; // 15 - 45 mins
  if (activeSeconds < 90 * 60) return 3; // 45 - 90 mins
  return 4; // 90+ mins
}
