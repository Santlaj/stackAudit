"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  GitPullRequest, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Code2, 
  ArrowRight,
  Bookmark,
  Layers,
  Sparkles,
  Search
} from "lucide-react";
import { IssueMatch, fetchContributionHistory } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterTab = "ALL" | "STARTED" | "PR_SUBMITTED" | "MERGED";

interface ContributionHistoryCardProps {
  initialMatches?: IssueMatch[];
  userId?: string;
  className?: string;
}
export function ContributionHistoryCard({ initialMatches = [], userId, className }: ContributionHistoryCardProps) {
  const [contributions, setContributions] = useState<IssueMatch[]>(() => {
    return initialMatches.filter(m => 
      ["STARTED", "PR_SUBMITTED", "MERGED"].includes(m.status)
    );
  });
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchContributionHistory(userId);
        if (mounted && data) {
          // Strictly genuine contributions: started work, PRs, or merged
          setContributions(data.filter(c => ["STARTED", "PR_SUBMITTED", "MERGED"].includes(c.status)));
        }
      } catch (err) {
        console.error("Failed to load contribution history:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [userId]);

  // Sync if initialMatches change and we had no data
  useEffect(() => {
    if (initialMatches.length > 0 && contributions.length === 0) {
      const activeOnly = initialMatches.filter(m => 
        ["STARTED", "PR_SUBMITTED", "MERGED"].includes(m.status)
      );
      if (activeOnly.length > 0) {
        setContributions(activeOnly);
      }
    }
  }, [initialMatches, contributions.length]);

  // Tab counts
  const counts = useMemo(() => {
    const started = contributions.filter(c => c.status === "STARTED").length;
    const prSubmitted = contributions.filter(c => c.status === "PR_SUBMITTED").length;
    const merged = contributions.filter(c => c.status === "MERGED").length;
    return {
      ALL: contributions.length,
      STARTED: started,
      PR_SUBMITTED: prSubmitted,
      MERGED: merged,
    };
  }, [contributions]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return contributions.filter(item => {
      // Status filter
      if (activeTab !== "ALL" && item.status !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inRepo = item.repository?.toLowerCase().includes(query);
        const inTitle = item.issueTitle?.toLowerCase().includes(query);
        const inTech = item.technologies?.some(t => t.toLowerCase().includes(query));
        return inRepo || inTitle || inTech;
      }
      return true;
    });
  }, [contributions, activeTab, searchQuery]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "MERGED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Merged
          </span>
        );
      case "PR_SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <GitPullRequest className="w-3 h-3 text-sky-500" />
            PR Submitted
          </span>
        );
      case "STARTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            In Progress
          </span>
        );
      case "ANALYZED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Code2 className="w-3 h-3 text-indigo-500" />
            Analyzed
          </span>
        );
      case "SAVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-muted-foreground border border-border/50">
            <Bookmark className="w-3 h-3" />
            Saved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary text-muted-foreground border border-border/50">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "";
    }
  };

  return (
    <div 
      id="contribution-history" 
      className={cn(
        "rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-5",
        className
      )}
    >
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Contribution History
            </h2>
            <span className="text-xs font-mono font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-secondary border border-border/50">
              {contributions.length} {contributions.length === 1 ? "record" : "records"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified open-source pull requests, merged code, and active contribution work.
          </p>
        </div>

        {/* Search within contributions */}
        {contributions.length > 3 && (
          <div className="relative shrink-0 w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by repo or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-background/60 border border-border/60 rounded-md pl-8 pr-2.5 py-1.5 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      {contributions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {(
            [
              { id: "ALL", label: "All Contributions" },
              { id: "STARTED", label: "In Progress" },
              { id: "PR_SUBMITTED", label: "PR Submitted" },
              { id: "MERGED", label: "Merged" },
            ] as const
          ).map(tab => {
            const count = counts[tab.id];
            if (count === 0 && tab.id !== "ALL") return null;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5",
                  isSelected
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "text-[10px] font-mono px-1 rounded-sm",
                  isSelected ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content Area ── */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Loading verified contributions...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="py-10 text-center space-y-3 rounded-xl border border-dashed border-border/60 p-6 bg-secondary/10">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            <GitPullRequest className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground">
              {contributions.length === 0 
                ? "No contributions started yet" 
                : "No matching contributions found"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {contributions.length === 0
                ? "Find suitable open-source issues matched to your skills in Discover and start contributing to earn verified badges and track your progress."
                : "Try selecting a different filter tab or clearing your search query to see other tracked contributions."}
            </p>
          </div>
          {contributions.length === 0 && (
            <Button size="sm" asChild className="h-8 text-xs font-medium cursor-pointer mt-2">
              <Link href="/discover">
                Explore Suitable Issues
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        /* Contribution Items List */
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group p-4 rounded-xl border border-border/60 bg-background/40 hover:bg-secondary/20 hover:border-border transition-all duration-150 space-y-3"
            >
              {/* Top Row: Repository, Status, and Date */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-foreground/90 hover:underline">
                      <a 
                        href={`https://github.com/${item.repository}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        {item.repository}
                      </a>
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      #{item.issueNumber}
                    </span>
                    {renderStatusBadge(item.status)}
                  </div>

                  <h3 className="text-sm font-medium text-foreground tracking-tight line-clamp-1 group-hover:text-foreground">
                    <Link href={`/analyze/${item.id}`} className="hover:underline">
                      {item.issueTitle}
                    </Link>
                  </h3>
                </div>

                {/* Date */}
                <span className="text-[11px] font-mono text-muted-foreground shrink-0 pt-0.5">
                  {formatDate(item.updatedAt || item.createdAt)}
                </span>
              </div>

              {/* Middle Row: Technologies & Difficulty */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.complexity && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-border/60 font-normal">
                      {item.complexity}
                    </Badge>
                  )}
                  {item.contributionType && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0 font-normal">
                      {item.contributionType}
                    </Badge>
                  )}
                  {item.technologies && item.technologies.slice(0, 3).map(tech => (
                    <span 
                      key={tech} 
                      className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.technologies && item.technologies.length > 3 && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      +{item.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-2">
                  {item.issueUrl && (
                    <a
                      href={item.issueUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-secondary cursor-pointer"
                    >
                      GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="h-7 text-xs px-2.5 font-medium cursor-pointer"
                  >
                    <Link href={`/analyze/${item.id}`}>
                      Open Workspace <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
