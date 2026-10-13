"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  DeveloperProfile, 
  IssueMatch, 
  DailyChallenge, 
  ChallengeHistory, 
  ContributionProgress as ProgressData,
  TechnologySummary,
  fetchProfile, 
  ingestProfile, 
  discoverIssues, 
  getMatches, 
  toggleSaveMatch,
  fetchDailyChallenge,
  fetchDailyChallengeHistory,
  fetchContributionProgress,
  fetchTechnologyStats,
} from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { TechnologyExplorer } from "./technology-explorer";
import { ResultsToolbar, ViewMode, SortOption, DifficultyOption } from "./results-toolbar";
import { RepositoryRow, RepositoryGroup } from "./repository-row";
import { IssueRow } from "./issue-row";
import { DailyChallengePanel } from "./daily-challenge-panel";
import { 
  RotateCw, 
  AlertCircle, 
  Compass, 
  Layers, 
  ListOrdered,
  SearchX,
  ExternalLink 
} from "lucide-react";

// Cache key and TTL (30 minutes)
const CACHE_TTL_MS = 1000 * 60 * 30;

interface DiscoveryCache {
  profile: DeveloperProfile | null;
  matches: IssueMatch[];
  techSummary: TechnologySummary | null;
  dailyChallenge: DailyChallenge | null;
  challengeHistory: ChallengeHistory | null;
  contributionProgress: ProgressData | null;
  timestamp: number;
}

function getDiscoveryCache(userId: string): DiscoveryCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`stackaudit_discovery_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveDiscoveryCache(userId: string, partial: Partial<DiscoveryCache>) {
  if (typeof window === "undefined") return;
  try {
    const existing = getDiscoveryCache(userId) || {
      profile: null,
      matches: [],
      techSummary: null,
      dailyChallenge: null,
      challengeHistory: null,
      contributionProgress: null,
      timestamp: Date.now(),
    };
    const updated: DiscoveryCache = {
      ...existing,
      ...partial,
      timestamp: Date.now(),
    };
    localStorage.setItem(`stackaudit_discovery_${userId}`, JSON.stringify(updated));
  } catch {
    // Quota or SSR
  }
}

export function DiscoveryDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  // Core Data States
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [matches, setMatches] = useState<IssueMatch[]>([]);
  const [techSummary, setTechSummary] = useState<TechnologySummary | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeHistory | null>(null);
  const [contributionProgress, setContributionProgress] = useState<ProgressData | null>(null);

  // Loading States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Toolbar States
  const [selectedTechnology, setSelectedTechnology] = useState<string>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("repositories");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficulty, setDifficulty] = useState<DifficultyOption>("all");
  const [goodFirstIssueOnly, setGoodFirstIssueOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("match");
  const [savedOnly, setSavedOnly] = useState<boolean>(false);

  // Expanded Repositories in repo view
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(15);

  // Initial Data Fetch with LocalStorage caching
  const loadInitialData = useCallback(async (userId: string, forceRefresh = false) => {
    // 1. Check local cache first
    const cached = getDiscoveryCache(userId);
    const isCacheFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL_MS);

    if (cached && !forceRefresh) {
      // Instant hydration from cache
      if (cached.profile) setProfile(cached.profile);
      if (cached.matches?.length) {
        setMatches(cached.matches);
        setExpandedRepo(cached.matches[0].repository);
      }
      if (cached.techSummary) setTechSummary(cached.techSummary);
      if (cached.dailyChallenge) setDailyChallenge(cached.dailyChallenge);
      if (cached.challengeHistory) setChallengeHistory(cached.challengeHistory);
      if (cached.contributionProgress) setContributionProgress(cached.contributionProgress);
      setLoadingInitial(false);

      // If fresh, return immediately — ZERO database or API queries!
      if (isCacheFresh && cached.matches?.length > 0) {
        return;
      }
    } else {
      setLoadingInitial(true);
    }

    setError(null);
    try {
      // 1. Profile
      let p = await fetchProfile(userId).catch(() => null);
      if (!p) {
        p = await ingestProfile().catch(() => null);
      }
      if (p) setProfile(p);

      // 2. Fetch matches (existing or discover)
      let currentMatches = await getMatches(userId).catch(() => []);
      if (!currentMatches || currentMatches.length === 0) {
        const disc = await discoverIssues(userId).catch(() => ({ matches: [] }));
        currentMatches = disc.matches || [];
      }
      setMatches(currentMatches);

      // Auto-expand first repo if available
      if (currentMatches.length > 0) {
        setExpandedRepo(currentMatches[0].repository);
      }

      // 3. Technology Stats
      const tStats = await fetchTechnologyStats().catch(() => null);
      if (tStats) setTechSummary(tStats);

      // 4. Daily Challenge
      setLoadingChallenge(true);
      const [cData, hData, prData] = await Promise.all([
        fetchDailyChallenge().catch(() => null),
        fetchDailyChallengeHistory().catch(() => null),
        fetchContributionProgress().catch(() => null),
      ]);
      setDailyChallenge(cData);
      setChallengeHistory(hData);
      setContributionProgress(prData);

      // Save to localStorage for instant loads on subsequent refreshes
      saveDiscoveryCache(userId, {
        profile: p,
        matches: currentMatches,
        techSummary: tStats,
        dailyChallenge: cData,
        challengeHistory: hData,
        contributionProgress: prData,
      });
    } catch (err: any) {
      console.error("Failed to load discovery data", err);
      // Only set error if we had no cached fallback
      if (!cached) {
        setError("Failed to load discovery data. Please check connection.");
      }
    } finally {
      setLoadingInitial(false);
      setLoadingChallenge(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      loadInitialData(session.user.id, false);
    }
  }, [session?.user?.id, loadInitialData]);

  // Technology Filter Selection Handler
  const handleSelectTechnology = useCallback(async (tech: string) => {
    setSelectedTechnology(tech);
    setVisibleCount(15);

    if (!session?.user?.id) return;
    setLoadingDiscover(true);
    try {
      const langs = tech === "All" ? [] : [tech];
      const disc = await discoverIssues(
        session.user.id,
        langs,
        [],
        difficulty !== "all" ? difficulty : undefined
      );
      if (disc?.matches && disc.matches.length > 0) {
        setMatches(disc.matches);
        setExpandedRepo(disc.matches[0].repository);
        // Update cache with latest discovered matches
        saveDiscoveryCache(session.user.id, { matches: disc.matches });
      }
    } catch (err) {
      console.error("Failed to filter by technology", err);
    } finally {
      setLoadingDiscover(false);
    }
  }, [session?.user?.id, difficulty]);

  // Save / Bookmark Toggle
  const handleToggleSave = async (issueId: string) => {
    try {
      const updated = await toggleSaveMatch(issueId);
      setMatches(prev => {
        const next = prev.map(m => m.id === issueId ? updated : m);
        if (session?.user?.id) {
          saveDiscoveryCache(session.user.id, { matches: next });
        }
        return next;
      });
      // Refresh contribution progress
      const prData = await fetchContributionProgress().catch(() => null);
      if (prData) {
        setContributionProgress(prData);
        if (session?.user?.id) {
          saveDiscoveryCache(session.user.id, { contributionProgress: prData });
        }
      }
    } catch (err) {
      console.error("Failed to toggle save", err);
    }
  };

  const handleExploreIssue = (issueId: string) => {
    router.push(`/analyze/${issueId}`);
  };

  // Group Matches by Repository for the Repositories View
  const repositoryGroups = useMemo<RepositoryGroup[]>(() => {
    const map = new Map<string, RepositoryGroup>();

    for (const match of matches) {
      const repoKey = match.repository;
      let group = map.get(repoKey);

      const isBeginner = match.complexity?.toLowerCase().includes("beginner") || match.complexity?.toLowerCase().includes("good");
      const isIntermediate = match.complexity?.toLowerCase().includes("intermediate");
      const isAdvanced = match.complexity?.toLowerCase().includes("advanced");

      if (!group) {
        const parts = repoKey.split("/");
        group = {
          repository: repoKey,
          owner: parts[0] || "",
          repoName: parts[1] || repoKey,
          description: null, // extracted from issues if present
          language: match.technologies[0] || null,
          technologies: [...match.technologies],
          stars: match.repositoryActivity?.stars || 0,
          openIssuesCount: match.repositoryActivity?.openIssues || 1,
          activityStatus: match.repositoryActivity?.status || null,
          lastActivityAt: match.repositoryActivity?.lastActivityAt || null,
          matchedIssues: [match],
          topMatchScore: match.matchScore ?? null,
          difficultyBreakdown: {
            beginner: isBeginner ? 1 : 0,
            intermediate: isIntermediate ? 1 : 0,
            advanced: isAdvanced ? 1 : 0,
          },
        };
        map.set(repoKey, group);
      } else {
        group.matchedIssues.push(match);
        // Union tech
        for (const t of match.technologies) {
          if (!group.technologies.includes(t)) group.technologies.push(t);
        }
        if (isBeginner) group.difficultyBreakdown.beginner++;
        if (isIntermediate) group.difficultyBreakdown.intermediate++;
        if (isAdvanced) group.difficultyBreakdown.advanced++;
        if (match.matchScore != null) {
          group.topMatchScore = Math.max(group.topMatchScore || 0, match.matchScore);
        }
      }
    }

    return Array.from(map.values());
  }, [matches]);

  // Filtered & Sorted Repositories
  const filteredRepositories = useMemo(() => {
    return repositoryGroups
      .filter((repo) => {
        // Tech filter
        if (selectedTechnology !== "All") {
          const matchTech = repo.technologies.some(
            t => t.toLowerCase() === selectedTechnology.toLowerCase()
          ) || (repo.language?.toLowerCase() === selectedTechnology.toLowerCase());
          if (!matchTech) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesRepo = repo.repository.toLowerCase().includes(q) ||
            repo.technologies.some(t => t.toLowerCase().includes(q)) ||
            repo.matchedIssues.some(i => i.issueTitle.toLowerCase().includes(q));
          if (!matchesRepo) return false;
        }

        // Difficulty filter
        if (difficulty !== "all") {
          const hasDiff = repo.matchedIssues.some(
            i => (i.complexity || "").toLowerCase().includes(difficulty)
          );
          if (!hasDiff) return false;
        }

        // Good first issue
        if (goodFirstIssueOnly) {
          const hasGfi = repo.matchedIssues.some(
            i => (i.complexity || "").toLowerCase().includes("good") ||
                 (i.issueLabels || []).some(l => l.toLowerCase().includes("good first issue"))
          );
          if (!hasGfi) return false;
        }

        // Saved only
        if (savedOnly) {
          const hasSaved = repo.matchedIssues.some(i => i.status === "SAVED");
          if (!hasSaved) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") return (b.topMatchScore || 0) - (a.topMatchScore || 0);
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "issues") return b.openIssuesCount - a.openIssuesCount;
        if (sortBy === "activity") {
          const at = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
          const bt = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
          return bt - at;
        }
        return 0;
      });
  }, [repositoryGroups, selectedTechnology, searchQuery, difficulty, goodFirstIssueOnly, savedOnly, sortBy]);

  // Filtered & Sorted Issues
  const filteredIssues = useMemo(() => {
    return matches
      .filter((issue) => {
        // Tech filter
        if (selectedTechnology !== "All") {
          const matchTech = issue.technologies.some(
            t => t.toLowerCase() === selectedTechnology.toLowerCase()
          );
          if (!matchTech) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesIssue = issue.issueTitle.toLowerCase().includes(q) ||
            issue.repository.toLowerCase().includes(q) ||
            issue.technologies.some(t => t.toLowerCase().includes(q));
          if (!matchesIssue) return false;
        }

        // Difficulty filter
        if (difficulty !== "all") {
          if (!(issue.complexity || "").toLowerCase().includes(difficulty)) {
            return false;
          }
        }

        // Good first issue
        if (goodFirstIssueOnly) {
          const isGfi = (issue.complexity || "").toLowerCase().includes("good") ||
            (issue.issueLabels || []).some(l => l.toLowerCase().includes("good first issue"));
          if (!isGfi) return false;
        }

        // Saved only
        if (savedOnly) {
          if (issue.status !== "SAVED") return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") return (b.matchScore || 0) - (a.matchScore || 0);
        if (sortBy === "stars") return (b.repositoryActivity?.stars || 0) - (a.repositoryActivity?.stars || 0);
        if (sortBy === "issues") return (b.repositoryActivity?.openIssues || 0) - (a.repositoryActivity?.openIssues || 0);
        return 0;
      });
  }, [matches, selectedTechnology, searchQuery, difficulty, goodFirstIssueOnly, savedOnly, sortBy]);

  const savedCount = useMemo(() => {
    return matches.filter(m => m.status === "SAVED").length;
  }, [matches]);

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Discover Contributions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore open-source repositories and issues matched to your developer profile.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => session?.user?.id && loadInitialData(session.user.id, true)}
            disabled={loadingInitial || loadingDiscover}
            className="h-8 px-2.5 text-xs font-medium rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors inline-flex items-center gap-1.5"
            title="Refresh discovery feed"
          >
            <RotateCw className={cn("w-3.5 h-3.5", (loadingInitial || loadingDiscover) && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT TECHNOLOGY EXPLORER */}
      <TechnologyExplorer
        technologies={techSummary?.technologies || []}
        selectedTechnology={selectedTechnology}
        onSelectTechnology={handleSelectTechnology}
        totalRepos={techSummary?.totalRepos || repositoryGroups.length}
        totalIssues={techSummary?.totalIssues || matches.length}
      />

      {/* 3. ASYMMETRIC MAIN CONTENT & RIGHT RAIL */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* LEFT / PRIMARY COLUMN: Toolbar & Feed (takes majority width) */}
        <div className="flex-1 min-w-0 w-full space-y-3.5">
          
          {/* Results Toolbar */}
          <ResultsToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            goodFirstIssueOnly={goodFirstIssueOnly}
            onGoodFirstIssueChange={setGoodFirstIssueOnly}
            sortBy={sortBy}
            onSortChange={setSortBy}
            savedOnly={savedOnly}
            onToggleSavedOnly={() => setSavedOnly(prev => !prev)}
            repoCount={filteredRepositories.length}
            issueCount={filteredIssues.length}
            savedCount={savedCount}
          />

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xs p-3 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.2" />
              <p>{error}</p>
            </div>
          )}

          {/* LOADING STATE */}
          {(loadingInitial || loadingDiscover) ? (
            <div className="py-20 text-center space-y-3 border border-dashed border-border/70 rounded-xs bg-card/40">
              <RotateCw className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">
                Analyzing matching opportunities...
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Comparing repository requirements and issue difficulty against your profile.
              </p>
            </div>
          ) : viewMode === "repositories" ? (
            /* REPOSITORIES FEED */
            filteredRepositories.length === 0 ? (
              <div className="py-16 text-center space-y-2 border border-dashed border-border/70 rounded-xs bg-card/30 p-6">
                <SearchX className="w-6 h-6 mx-auto text-muted-foreground/60" />
                <p className="text-xs font-semibold text-foreground">No repositories found</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  No repositories match your active technology or filter parameters. Try resetting your search or choosing another technology.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>
                    Showing {Math.min(visibleCount, filteredRepositories.length)} of {filteredRepositories.length} repositories
                  </span>
                  <span>Click a row to expand matched issues</span>
                </div>

                {filteredRepositories.slice(0, visibleCount).map((repo) => (
                  <RepositoryRow
                    key={repo.repository}
                    repo={repo}
                    isExpanded={expandedRepo === repo.repository}
                    onToggleExpand={() => {
                      setExpandedRepo(prev => prev === repo.repository ? null : repo.repository);
                    }}
                    onSelectIssue={(issue) => handleExploreIssue(issue.id)}
                    onToggleSaveIssue={handleToggleSave}
                    onExploreIssue={handleExploreIssue}
                  />
                ))}

                {visibleCount < filteredRepositories.length && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount(prev => prev + 15)}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 px-4 rounded-xs border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      Load more repositories ({filteredRepositories.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            /* ISSUES FEED */
            filteredIssues.length === 0 ? (
              <div className="py-16 text-center space-y-2 border border-dashed border-border/70 rounded-xs bg-card/30 p-6">
                <SearchX className="w-6 h-6 mx-auto text-muted-foreground/60" />
                <p className="text-xs font-semibold text-foreground">No issues found</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  No issues match the selected parameters.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                  <span>
                    Showing {Math.min(visibleCount, filteredIssues.length)} of {filteredIssues.length} issues
                  </span>
                  <span>Sorted by {sortBy}</span>
                </div>

                {filteredIssues.slice(0, visibleCount).map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    onToggleSave={handleToggleSave}
                    onExplore={handleExploreIssue}
                  />
                ))}

                {visibleCount < filteredIssues.length && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount(prev => prev + 15)}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground py-1.5 px-4 rounded-xs border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      Load more issues ({filteredIssues.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* RIGHT RAIL: Daily Contribution Challenge, Streak, Calendar, Contribution Progress */}
        <DailyChallengePanel
          challenge={dailyChallenge}
          history={challengeHistory}
          progress={contributionProgress}
          onChallengeUpdated={(updated) => setDailyChallenge(updated)}
          onHistoryUpdated={(updated) => setChallengeHistory(updated)}
          loadingChallenge={loadingChallenge}
        />
      </div>
    </div>
  );
}
