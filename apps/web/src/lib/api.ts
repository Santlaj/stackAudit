import { getApiBaseUrl } from "./auth-client";

export const API_BASE = getApiBaseUrl();

// --- Types ---
export interface DeveloperProfile {
  id?: string | null;
  userId: string;
  githubLogin?: string | null;
  hasGithub?: boolean;
  hasCompletedOnboarding?: boolean;
  observedLanguages: string[];
  publicRepoCount?: number;
  totalContributions?: number;
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
  issueState?: string | null;
  issueBody?: string | null;
  issueCreatedAt?: string | null;
  issueUpdatedAt?: string | null;
  issueLabels?: string[];
  commentsCount?: number;
  reactionsTotal?: number;
  createdAt?: string;
  updatedAt?: string;
  repositoryActivity?: {
    status: string;
    lastActivityAt: string | null;
    openIssues: number | null;
    stars: number | null;
    prAcceptanceRate: number | null;
  };
  status: string; // DISCOVERED, VIEWED, SAVED, ANALYZED, STARTED, PR_SUBMITTED, MERGED
}

export interface BadgeDto {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
  current: number;
  target: number;
}

export interface DailyChallenge {
  id: string;
  challengeDate: string; // YYYY-MM-DD
  status: "ASSIGNED" | "COMPLETED";
  completedAt: string | null;
  checklist: {
    understoodProblem: boolean;
    identifiedFiles: boolean;
    nextStepsPlanned: boolean;
  } | null;
  matchId: string;
  issue: {
    id: string;
    repository: string;
    issueNumber: number;
    title: string;
    body: string | null;
    url: string;
    state: string;
    difficulty: string;
    technologies: string[];
    labels: string[];
    repoStars: number;
    repoActivity: string | null;
    matchScore: number;
    reasons: string[];
    gaps: string[];
    estimatedMinutes: number | null;
  };
}

export interface ChallengeHistory {
  streak: number;
  totalCompleted: number;
  hasCompletedToday: boolean;
  targetYear: number;
  targetMonth: number;
  calendar: Record<string, { completed: boolean; completedAt: string }>;
}

export interface ContributionProgress {
  explored: number;
  started: number;
  prSubmitted: number;
  merged: number;
  totalTracked: number;
}

export interface TechnologyStat {
  name: string;
  repoCount: number;
  openIssueCount: number;
  matchedIssueCount: number;
}

export interface TechnologySummary {
  totalRepos: number;
  totalIssues: number;
  totalMatched: number;
  technologies: TechnologyStat[];
}

async function getSafeErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    return json.error?.message || json.message || fallback;
  } catch {
    return fallback;
  }
}

// --- Client-Side LocalStorage Caching with TTL (Reduces server & DB load) ---
interface ClientCacheEnvelope<T> {
  data: T;
  expiresAt: number;
}

export function getClientCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const envelope: ClientCacheEnvelope<T> = JSON.parse(raw);
    if (Date.now() > envelope.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return envelope.data;
  } catch {
    return null;
  }
}

export function setClientCache<T>(key: string, data: T, ttlMs: number): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: ClientCacheEnvelope<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearClientCache(prefix: string): void {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}

// --- API Calls ---

export async function fetchProfile(userId?: string): Promise<DeveloperProfile> {
  const cacheKey = `stackaudit_profile_${userId || "current"}`;
  const cached = getClientCache<DeveloperProfile>(cacheKey);
  if (cached) {
    return cached;
  }

  // Using the new secure endpoint that doesn't rely on client-provided userId if omitted
  const url = userId ? `${API_BASE}/api/discovery/profile/${userId}` : `${API_BASE}/api/users/profile`;
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const json = await res.json();
  if (json.data) {
    setClientCache(cacheKey, json.data, 5 * 60 * 1000); // 5 min TTL
  }
  return json.data;
}

export function clearDiscoveryCache(userId?: string) {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      localStorage.removeItem(`stackaudit_discovery_${userId}`);
    }
    // Also scan and remove any stackaudit_discovery keys to be 100% clean
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("stackaudit_discovery_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // Ignore storage errors
  }
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
  // Clear local caches so UI will immediately load fresh data
  clearClientCache("stackaudit_profile_");
  clearClientCache("stackaudit_matches_");
  clearDiscoveryCache(userId);
  return json.data;
}

export async function ingestProfile(): Promise<DeveloperProfile> {
  const res = await fetch(`${API_BASE}/api/users/profile/ingest`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to ingest GitHub profile");
  const json = await res.json();
  clearClientCache("stackaudit_profile_");
  clearDiscoveryCache();
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
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch match");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}

export async function toggleSaveMatch(matchId: string): Promise<IssueMatch> {
  const res = await fetch(`${API_BASE}/api/discovery/save/${matchId}`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to toggle save match");
    throw new Error(message);
  }
  const json = await res.json();
  clearClientCache("stackaudit_history_");
  return json.data;
}

export async function getSavedMatches(): Promise<IssueMatch[]> {
  const res = await fetch(`${API_BASE}/api/discovery/saved`, {
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch saved matches");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data.matches;
}

export async function fetchContributionHistory(userId?: string): Promise<IssueMatch[]> {
  const cacheKey = `stackaudit_history_${userId || "current"}`;
  const cached = getClientCache<IssueMatch[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = userId 
    ? `${API_BASE}/api/discovery/history?userId=${encodeURIComponent(userId)}` 
    : `${API_BASE}/api/discovery/history`;
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch contribution history");
    throw new Error(message);
  }
  const json = await res.json();
  const data = json.data || [];
  setClientCache(cacheKey, data, 5 * 60 * 1000); // 5 min TTL
  return data;
}

export async function updateMatchStatus(matchId: string, status: string): Promise<IssueMatch> {
  const res = await fetch(`${API_BASE}/api/discovery/matches/${matchId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to update match status");
    throw new Error(message);
  }
  const json = await res.json();
  // Clear caches when contribution work is updated
  clearClientCache("stackaudit_history_");
  clearClientCache("stackaudit_badges_");
  return json.data;
}

export async function startAnalysis(matchId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/analysis/${matchId}/start`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to start analysis");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchBadges(userId?: string): Promise<BadgeDto[]> {
  const cacheKey = `stackaudit_badges_${userId || "current"}`;
  const cached = getClientCache<BadgeDto[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = userId 
    ? `${API_BASE}/api/badges?userId=${encodeURIComponent(userId)}` 
    : `${API_BASE}/api/badges`;
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch badges");
    throw new Error(message);
  }
  const json = await res.json();
  const data = json.data || [];
  setClientCache(cacheKey, data, 10 * 60 * 1000); // 10 min TTL
  return data;
}

export interface DailyActivityRecord {
  date: string; // YYYY-MM-DD
  activeSeconds: number;
}

export async function sendHeartbeat(): Promise<{ accepted: boolean; activeSeconds?: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/activity/heartbeat`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return { accepted: false };
    }
    const json = await res.json();
    return json.data || { accepted: false };
  } catch {
    return { accepted: false };
  }
}

export async function fetchDailyActivity(days: number = 365): Promise<DailyActivityRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/api/activity/daily?days=${days}`, {
      credentials: "include",
    });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return json.data?.activity || [];
  } catch {
    return [];
  }
}

export async function fetchDailyChallenge(): Promise<DailyChallenge> {
  const res = await fetch(`${API_BASE}/api/discovery/daily-challenge`, {
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch daily challenge");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}

export async function replaceDailyChallenge(): Promise<DailyChallenge> {
  const res = await fetch(`${API_BASE}/api/discovery/daily-challenge/replace`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to replace daily challenge");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}

export async function completeDailyChallenge(checklist: {
  understoodProblem: boolean;
  identifiedFiles: boolean;
  nextStepsPlanned: boolean;
}): Promise<DailyChallenge> {
  const res = await fetch(`${API_BASE}/api/discovery/daily-challenge/complete`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checklist }),
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to complete daily challenge");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchDailyChallengeHistory(year?: number, month?: number): Promise<ChallengeHistory> {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));
  const url = `${API_BASE}/api/discovery/daily-challenge/history${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch challenge history");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchContributionProgress(): Promise<ContributionProgress> {
  const res = await fetch(`${API_BASE}/api/discovery/progress`, {
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch contribution progress");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}

export async function fetchTechnologyStats(): Promise<TechnologySummary> {
  const res = await fetch(`${API_BASE}/api/discovery/technologies`, {
    credentials: "include",
  });
  if (!res.ok) {
    const message = await getSafeErrorMessage(res, "Failed to fetch technology stats");
    throw new Error(message);
  }
  const json = await res.json();
  return json.data;
}


