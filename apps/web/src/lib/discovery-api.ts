const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface DeveloperProfile {
  userId: string;
  skills: string[];
  experienceLevel: string;
  interests: string[];
}

export interface IssueMatch {
  id: string;
  repository: string;
  issueNumber: number;
  issueTitle: string;
  issueUrl: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  matchScore: number;
  matchReason: string;
  status: string;
}

export async function saveDeveloperProfile(profile: DeveloperProfile): Promise<DeveloperProfile> {
  const res = await fetch(`${API_BASE}/api/discovery/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  const json = await res.json();
  return json.data;
}

export async function triggerDiscovery(userId: string): Promise<IssueMatch[]> {
  const res = await fetch(`${API_BASE}/api/discovery/discover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to discover issues");
  const json = await res.json();
  return json.data;
}

export async function fetchMatches(userId: string): Promise<IssueMatch[]> {
  const res = await fetch(`${API_BASE}/api/discovery/matches/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  const json = await res.json();
  return json.data;
}
