export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// --- Types ---
export interface DeveloperProfile {
  id: string;
  userId: string;
  observedLanguages: string[];
  publicRepoCount: number;
  totalContributions: number;
  githubBio?: string;
  githubCompany?: string;
  githubLocation?: string;
  inferredSkills?: any;
  currentFocus: string[];
  learningGoals: string[];
  preferredArea?: string;
  preferredComplexity?: string;
  preferredContributionTypes: string[];
}

export interface IssueMatch {
  id: string;
  repository: string;
  issueNumber: number;
  issueTitle: string;
  issueUrl: string;
  complexity?: string;
  contributionType?: string;
  technologies: string[];
  matchScore?: number;
  matchReason?: string;
  missingSignals?: string;
  learningRelevance?: string;
  reasons?: string[];
  gaps?: string[];
  architecturalContext?: string;
  relevantFiles?: string[];
  implementationApproach?: string;
  // Issue detail fields
  issueBody?: string | null;
  issueCreatedAt?: string | null;
  issueUpdatedAt?: string | null;
  issueLabels?: string[];
  commentsCount?: number;
  reactionsTotal?: number;
  repositoryActivity?: {
    status: string;
    lastActivityAt: string | null;
    openIssues: number | null;
    stars: number | null;
    prAcceptanceRate: number | null;
  };
  status: string; // DISCOVERED, VIEWED, SAVED
}

// --- API Calls ---

export async function fetchProfile(userId?: string): Promise<DeveloperProfile> {
  // Using the new secure endpoint that doesn't rely on client-provided userId if omitted
  const url = userId ? `${API_BASE}/api/discovery/profile/${userId}` : `${API_BASE}/api/users/profile`;
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const json = await res.json();
  return json.data;
}

export async function updateProfile(userId: string, data: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  const json = await res.json();
  return json.data;
}

export async function ingestProfile(): Promise<DeveloperProfile> {
  const res = await fetch(`${API_BASE}/api/users/profile/ingest`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to ingest GitHub profile");
  const json = await res.json();
  return json.data;
}

export async function discoverIssues(
  userId: string, 
  languages?: string[], 
  frameworks?: string[],
  difficulty?: string
): Promise<{ matches: IssueMatch[], partialCoverage: boolean }> {
  const res = await fetch(`${API_BASE}/api/discovery/discover`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, languages, frameworks, difficulty })
  });
  if (!res.ok) throw new Error("Failed to discover issues");
  const json = await res.json();
  return json.data;
}

export async function getMatches(userId: string): Promise<IssueMatch[]> {
  const res = await fetch(`${API_BASE}/api/discovery/matches/${userId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch matches");
  const json = await res.json();
  return json.data;
}

export async function evaluateMatch(matchId: string): Promise<IssueMatch> {
  const res = await fetch(`${API_BASE}/api/discovery/evaluate/${matchId}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to evaluate match");
  const json = await res.json();
  return json.data;
}

export async function getMatch(matchId: string): Promise<IssueMatch> {
  const res = await fetch(`${API_BASE}/api/discovery/match/${matchId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch match");
  const json = await res.json();
  return json.data;
}

export async function toggleSaveMatch(matchId: string): Promise<IssueMatch> {
  const res = await fetch(`${API_BASE}/api/discovery/save/${matchId}`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to toggle save match");
  const json = await res.json();
  return json.data;
}

export async function getSavedMatches(): Promise<IssueMatch[]> {
  const res = await fetch(`${API_BASE}/api/discovery/saved`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch saved matches");
  const json = await res.json();
  return json.data.matches;
}

export async function updateMatchStatus(matchId: string, status: string): Promise<IssueMatch> {
  const res = await fetch(`${API_BASE}/api/discovery/matches/${matchId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update match status");
  const json = await res.json();
  return json.data;
}

export async function startAnalysis(matchId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/analysis/${matchId}/start`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to start analysis");
  const json = await res.json();
  return json.data;
}
