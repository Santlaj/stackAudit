// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Formats an ISO timestamp into a human-readable relative time string.
 * Examples: "3 min ago", "2 hr ago", "Yesterday", "Aug 15"
 */
export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return "—"

  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr} hr ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/**
 * Formats an ISO timestamp into a short time string.
 * Example: "9:10 AM"
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}
