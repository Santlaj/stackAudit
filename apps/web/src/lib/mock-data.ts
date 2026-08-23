// =============================================================================
// Mock Data Layer
// =============================================================================
// This module provides realistic demo data for the StackAudit dashboard.
// All types are domain-aligned and can be replaced by API responses directly.
// Do not import this module from reusable UI components — only from pages/routes.
// =============================================================================

export type AnalysisStatus = "healthy" | "warning" | "critical" | "running" | "queued" | "failed"
export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info"
export type ActivityEventType = "analysis_completed" | "analysis_started" | "analysis_failed" | "repository_connected" | "findings_detected"

export interface Repository {
  id: string
  owner: string
  name: string
  fullName: string
  language: string
  status: AnalysisStatus
  lastAnalyzedAt: string | null
  findingsCount: number
  score: number | null
  branch: string
}

export interface Finding {
  id: string
  repositoryFullName: string
  severity: FindingSeverity
  title: string
  category: string
  filePath: string | null
}

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  repositoryFullName: string
  message: string
  timestamp: string
  metadata?: Record<string, string>
}

export interface AnalysisRun {
  id: string
  repositoryFullName: string
  branch: string
  status: AnalysisStatus
  score: number | null
  findingsCount: number
  startedAt: string
  completedAt: string | null
  commitSha: string
}

export interface WorkspaceStats {
  totalRepositories: number
  analysesRunning: number
  needsAttention: number
  totalFindings: number
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

export const mockRepositories: Repository[] = [
  {
    id: "repo-1",
    owner: "facebook",
    name: "react",
    fullName: "facebook/react",
    language: "JavaScript",
    status: "healthy",
    lastAnalyzedAt: "2026-08-19T08:45:00Z",
    findingsCount: 3,
    score: 94,
    branch: "main",
  },
  {
    id: "repo-2",
    owner: "vercel",
    name: "next.js",
    fullName: "vercel/next.js",
    language: "TypeScript",
    status: "warning",
    lastAnalyzedAt: "2026-08-19T07:12:00Z",
    findingsCount: 8,
    score: 76,
    branch: "canary",
  },
  {
    id: "repo-3",
    owner: "microsoft",
    name: "TypeScript",
    fullName: "microsoft/TypeScript",
    language: "TypeScript",
    status: "running",
    lastAnalyzedAt: "2026-08-18T22:30:00Z",
    findingsCount: 0,
    score: null,
    branch: "main",
  },
  {
    id: "repo-4",
    owner: "stackaudit",
    name: "demo-api",
    fullName: "stackaudit/demo-api",
    language: "TypeScript",
    status: "critical",
    lastAnalyzedAt: "2026-08-19T06:00:00Z",
    findingsCount: 12,
    score: 42,
    branch: "main",
  },
  {
    id: "repo-5",
    owner: "stackaudit",
    name: "web-client",
    fullName: "stackaudit/web-client",
    language: "TypeScript",
    status: "healthy",
    lastAnalyzedAt: "2026-08-19T09:10:00Z",
    findingsCount: 1,
    score: 91,
    branch: "develop",
  },
  {
    id: "repo-6",
    owner: "nodejs",
    name: "node",
    fullName: "nodejs/node",
    language: "C++",
    status: "queued",
    lastAnalyzedAt: null,
    findingsCount: 0,
    score: null,
    branch: "main",
  },
]

export const mockFindings: Finding[] = [
  {
    id: "f-1",
    repositoryFullName: "stackaudit/demo-api",
    severity: "critical",
    title: "Hardcoded database credentials in config",
    category: "Security",
    filePath: "src/config/database.ts",
  },
  {
    id: "f-2",
    repositoryFullName: "stackaudit/demo-api",
    severity: "critical",
    title: "SQL injection vulnerability in user query",
    category: "Security",
    filePath: "src/handlers/users.ts",
  },
  {
    id: "f-3",
    repositoryFullName: "vercel/next.js",
    severity: "high",
    title: "Unsafe deserialization of user input",
    category: "Security",
    filePath: "packages/next/server/render.tsx",
  },
  {
    id: "f-4",
    repositoryFullName: "vercel/next.js",
    severity: "high",
    title: "Outdated dependency with known CVE",
    category: "Dependencies",
    filePath: null,
  },
  {
    id: "f-5",
    repositoryFullName: "stackaudit/demo-api",
    severity: "medium",
    title: "Missing rate limiting on auth endpoints",
    category: "Security",
    filePath: "src/routes/auth.ts",
  },
  {
    id: "f-6",
    repositoryFullName: "facebook/react",
    severity: "low",
    title: "Unused export in reconciler module",
    category: "Code Quality",
    filePath: "packages/react-reconciler/src/index.js",
  },
]

export const mockActivity: ActivityEvent[] = [
  {
    id: "evt-1",
    type: "analysis_completed",
    repositoryFullName: "stackaudit/web-client",
    message: "Analysis completed — 1 finding detected",
    timestamp: "2026-08-19T09:10:00Z",
  },
  {
    id: "evt-2",
    type: "analysis_started",
    repositoryFullName: "microsoft/TypeScript",
    message: "Analysis started on branch main",
    timestamp: "2026-08-19T09:05:00Z",
  },
  {
    id: "evt-3",
    type: "findings_detected",
    repositoryFullName: "stackaudit/demo-api",
    message: "2 critical findings detected",
    timestamp: "2026-08-19T06:02:00Z",
  },
  {
    id: "evt-4",
    type: "analysis_completed",
    repositoryFullName: "facebook/react",
    message: "Analysis completed — score 94/100",
    timestamp: "2026-08-19T08:45:00Z",
  },
  {
    id: "evt-5",
    type: "analysis_failed",
    repositoryFullName: "vercel/next.js",
    message: "Analysis completed with warnings — 8 findings",
    timestamp: "2026-08-19T07:12:00Z",
  },
  {
    id: "evt-6",
    type: "repository_connected",
    repositoryFullName: "nodejs/node",
    message: "Repository connected — queued for first analysis",
    timestamp: "2026-08-19T05:30:00Z",
  },
]

export const mockAnalysisRuns: AnalysisRun[] = [
  {
    id: "run-1",
    repositoryFullName: "stackaudit/web-client",
    branch: "develop",
    status: "healthy",
    score: 91,
    findingsCount: 1,
    startedAt: "2026-08-19T09:02:00Z",
    completedAt: "2026-08-19T09:10:00Z",
    commitSha: "a3f8c21",
  },
  {
    id: "run-2",
    repositoryFullName: "microsoft/TypeScript",
    branch: "main",
    status: "running",
    score: null,
    findingsCount: 0,
    startedAt: "2026-08-19T09:05:00Z",
    completedAt: null,
    commitSha: "e7b2d44",
  },
  {
    id: "run-3",
    repositoryFullName: "facebook/react",
    branch: "main",
    status: "healthy",
    score: 94,
    findingsCount: 3,
    startedAt: "2026-08-19T08:30:00Z",
    completedAt: "2026-08-19T08:45:00Z",
    commitSha: "1c9f0ab",
  },
  {
    id: "run-4",
    repositoryFullName: "vercel/next.js",
    branch: "canary",
    status: "warning",
    score: 76,
    findingsCount: 8,
    startedAt: "2026-08-19T06:50:00Z",
    completedAt: "2026-08-19T07:12:00Z",
    commitSha: "d4e1f89",
  },
  {
    id: "run-5",
    repositoryFullName: "stackaudit/demo-api",
    branch: "main",
    status: "critical",
    score: 42,
    findingsCount: 12,
    startedAt: "2026-08-19T05:40:00Z",
    completedAt: "2026-08-19T06:00:00Z",
    commitSha: "8bc3e77",
  },
]

export const mockWorkspaceStats: WorkspaceStats = {
  totalRepositories: mockRepositories.length,
  analysesRunning: mockRepositories.filter((r) => r.status === "running").length,
  needsAttention: mockRepositories.filter((r) => r.status === "critical" || r.status === "warning").length,
  totalFindings: mockFindings.length,
}
