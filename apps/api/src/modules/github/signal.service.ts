/**
 * Signal Derivation Service
 * 
 * Pure functions that derive normalized signals from raw GitHub issue data.
 * No API calls, no database access — just computation.
 * 
 * These signals are used to enrich github_issue records on ingest
 * and later feed into the matching engine.
 */

// ─── Types ──────────────────────────────────────────

export interface RawIssueSignals {
  labels: string[];
  title: string;
  body?: string | null;
  commentsCount: number;
  reactionsTotal: number;
  assigneeCount: number;
  linkedPrCount: number;
  issueCreatedAt: Date;
  issueUpdatedAt: Date;
  closedAt?: Date | null;
  state: string;
}

export type Staleness = "fresh" | "aging" | "stale" | "abandoned";
export type ActivityLevel = "active" | "moderate" | "low" | "dead";
export type DifficultyEstimate = "beginner" | "intermediate" | "advanced";
export type IssueType = "bug" | "feature" | "docs" | "refactor" | "unknown";

export interface DerivedSignals {
  staleness: Staleness;
  activityLevel: ActivityLevel;
  difficultyEstimate: DifficultyEstimate;
  issueType: IssueType;
  isGoodFirstIssue: boolean;
  isHelpWanted: boolean;
}

// ─── Constants ──────────────────────────────────────

const GOOD_FIRST_ISSUE_PATTERNS = [
  "good first issue",
  "good-first-issue",
  "beginner",
  "starter",
  "easy",
  "first-timers-only",
  "first timers only",
  "beginner-friendly",
  "beginner friendly",
  "low-hanging-fruit",
  "low hanging fruit",
];

const HELP_WANTED_PATTERNS = [
  "help wanted",
  "help-wanted",
  "contributions welcome",
  "contributions-welcome",
  "up-for-grabs",
  "up for grabs",
];

const BUG_LABEL_PATTERNS = ["bug", "fix", "defect", "error", "crash", "regression"];
const FEATURE_LABEL_PATTERNS = ["feature", "enhancement", "improvement", "request"];
const DOCS_LABEL_PATTERNS = ["docs", "documentation", "doc", "readme"];
const REFACTOR_LABEL_PATTERNS = ["refactor", "cleanup", "clean-up", "tech-debt", "technical debt", "chore"];

const BUG_TITLE_PATTERNS = /\b(bug|fix|error|crash|broken|fail|issue|wrong|incorrect|unexpected)\b/i;
const FEATURE_TITLE_PATTERNS = /\b(add|feature|implement|support|request|new|enhance|improvement)\b/i;
const DOCS_TITLE_PATTERNS = /\b(doc|docs|documentation|readme|typo|spelling|grammar)\b/i;
const REFACTOR_TITLE_PATTERNS = /\b(refactor|cleanup|clean up|reorganize|restructure|simplify|deprecate)\b/i;

// ─── Staleness ──────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Derives a staleness signal based on how recently the issue was updated.
 * 
 * - fresh:     updated within the last 7 days
 * - aging:     updated within the last 30 days
 * - stale:     updated within the last 90 days
 * - abandoned: not updated in over 90 days
 */
export function deriveStaleness(issue: Pick<RawIssueSignals, "issueUpdatedAt">, now: Date = new Date()): Staleness {
  const daysSinceUpdate = (now.getTime() - new Date(issue.issueUpdatedAt).getTime()) / MS_PER_DAY;

  if (daysSinceUpdate < 7) return "fresh";
  if (daysSinceUpdate < 30) return "aging";
  if (daysSinceUpdate < 90) return "stale";
  return "abandoned";
}

// ─── Activity Level ─────────────────────────────────

/**
 * Derives an activity level based on comment count and staleness.
 * 
 * - active:    5+ comments and updated recently (fresh)
 * - moderate:  3+ comments or aging but with some discussion
 * - low:       some comments but stale
 * - dead:      very few comments and stale/abandoned
 */
export function deriveActivityLevel(
  issue: Pick<RawIssueSignals, "commentsCount" | "issueUpdatedAt">,
  now: Date = new Date()
): ActivityLevel {
  const staleness = deriveStaleness(issue, now);
  const { commentsCount } = issue;

  if (commentsCount >= 5 && staleness === "fresh") return "active";
  if (commentsCount >= 3 || (staleness === "aging" && commentsCount >= 1)) return "moderate";
  if (commentsCount <= 1 && (staleness === "stale" || staleness === "abandoned")) return "dead";
  return "low";
}

// ─── Difficulty ─────────────────────────────────────

/**
 * Derives a difficulty estimate from multiple signals.
 * 
 * This intentionally does NOT trust labels as ground truth.
 * A "good first issue" label is a signal, not a verdict.
 * 
 * Scoring:
 * - Labels provide a baseline bias
 * - Long issue bodies suggest more context (could mean well-documented OR complex)
 * - High comment count suggests complexity or controversy
 * - Multiple failed PRs (linkedPrCount > 0 on open issue) suggest difficulty
 * - Assignee churn (assigneeCount > 1 on open issue) suggests difficulty
 */
export function deriveDifficulty(issue: RawIssueSignals): DifficultyEstimate {
  let score = 50; // Neutral starting point

  // Label signals
  const labelsLower = issue.labels.map(l => l.toLowerCase());
  
  if (labelsLower.some(l => GOOD_FIRST_ISSUE_PATTERNS.some(p => l.includes(p)))) {
    score -= 25; // Bias toward beginner
  }
  if (labelsLower.some(l => l.includes("advanced") || l.includes("complex") || l.includes("hard"))) {
    score += 25; // Bias toward advanced
  }
  if (labelsLower.some(l => l.includes("medium") || l.includes("intermediate"))) {
    score += 10; // Slight bias toward intermediate
  }

  // Body length signal
  const bodyLength = issue.body?.length || 0;
  if (bodyLength > 3000) {
    score += 10; // Long body could indicate complexity
  } else if (bodyLength < 200 && bodyLength > 0) {
    score -= 5; // Short body might mean simpler issue
  }

  // Discussion signal — high comments suggest complexity or controversy
  if (issue.commentsCount > 10) {
    score += 15;
  } else if (issue.commentsCount > 5) {
    score += 8;
  }

  // Failed PR signal — if PRs were attempted but issue is still open
  if (issue.state === "open" && issue.linkedPrCount > 0) {
    score += 12 * Math.min(issue.linkedPrCount, 3); // Cap at 3 to prevent extreme scores
  }

  // Assignee churn — multiple assignees on open issue = people giving up
  if (issue.state === "open" && issue.assigneeCount > 1) {
    score += 10;
  }

  // Clamp and classify
  if (score <= 35) return "beginner";
  if (score <= 65) return "intermediate";
  return "advanced";
}

// ─── Issue Type ─────────────────────────────────────

/**
 * Derives the issue type from labels first, then title keywords as fallback.
 * Labels are the stronger signal; title analysis is a fallback heuristic.
 */
export function deriveIssueType(issue: Pick<RawIssueSignals, "labels" | "title">): IssueType {
  const labelsLower = issue.labels.map(l => l.toLowerCase());

  // Check labels first (stronger signal)
  if (labelsLower.some(l => BUG_LABEL_PATTERNS.some(p => l.includes(p)))) return "bug";
  if (labelsLower.some(l => FEATURE_LABEL_PATTERNS.some(p => l.includes(p)))) return "feature";
  if (labelsLower.some(l => DOCS_LABEL_PATTERNS.some(p => l.includes(p)))) return "docs";
  if (labelsLower.some(l => REFACTOR_LABEL_PATTERNS.some(p => l.includes(p)))) return "refactor";

  // Fallback to title keyword analysis
  if (BUG_TITLE_PATTERNS.test(issue.title)) return "bug";
  if (FEATURE_TITLE_PATTERNS.test(issue.title)) return "feature";
  if (DOCS_TITLE_PATTERNS.test(issue.title)) return "docs";
  if (REFACTOR_TITLE_PATTERNS.test(issue.title)) return "refactor";

  return "unknown";
}

// ─── Good First Issue ───────────────────────────────

/**
 * Checks whether any label matches known good-first-issue patterns.
 */
export function deriveGoodFirstIssue(issue: Pick<RawIssueSignals, "labels">): boolean {
  const labelsLower = issue.labels.map(l => l.toLowerCase());
  return labelsLower.some(l => GOOD_FIRST_ISSUE_PATTERNS.some(p => l.includes(p)));
}

// ─── Help Wanted ────────────────────────────────────

/**
 * Checks whether any label matches known help-wanted patterns.
 */
export function deriveHelpWanted(issue: Pick<RawIssueSignals, "labels">): boolean {
  const labelsLower = issue.labels.map(l => l.toLowerCase());
  return labelsLower.some(l => HELP_WANTED_PATTERNS.some(p => l.includes(p)));
}

// ─── Combined ───────────────────────────────────────

/**
 * Derives all signals for a raw issue in one call.
 */
export function deriveAllSignals(issue: RawIssueSignals, now: Date = new Date()): DerivedSignals {
  return {
    staleness: deriveStaleness(issue, now),
    activityLevel: deriveActivityLevel(issue, now),
    difficultyEstimate: deriveDifficulty(issue),
    issueType: deriveIssueType(issue),
    isGoodFirstIssue: deriveGoodFirstIssue(issue),
    isHelpWanted: deriveHelpWanted(issue),
  };
}
