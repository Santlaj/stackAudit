"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { IssueMatch } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface AnalyzeHeaderProps extends React.HTMLAttributes<HTMLElement> {
  match: IssueMatch;
  /** Optional slot for MatchBadge popover trigger in Phase 8 */
  matchBadgeSlot?: React.ReactNode;
}

export function AnalyzeHeader({ match, matchBadgeSlot, className, ...props }: AnalyzeHeaderProps) {
  const router = useRouter();

  // Activity status mapping
  const activityStatus = match.repositoryActivity?.status?.toLowerCase() || "neutral";
  const mappedStatus = 
    activityStatus === "active" ? "success" :
    activityStatus === "moderate" ? "warning" :
    activityStatus === "inactive" || activityStatus === "low" ? "error" : "neutral";

  const activityLabel = match.repositoryActivity?.status 
    ? `${match.repositoryActivity.status.charAt(0).toUpperCase() + match.repositoryActivity.status.slice(1)} repo`
    : "Repo activity unknown";

  // Formatted date
  const updatedDateStr = match.issueUpdatedAt 
    ? new Date(match.issueUpdatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  // Difficulty formatting
  const { diffLabel, diffColor } = React.useMemo(() => {
    if (!match.complexity) return { diffLabel: null, diffColor: "text-muted-foreground" };
    const cLower = match.complexity.toLowerCase();
    const isGood = cLower.includes("beginner") || cLower.includes("good");
    const isInter = cLower.includes("intermediate");
    const isAdv = cLower.includes("advanced");

    const diffColor = isGood
      ? "text-emerald-600 dark:text-emerald-400"
      : isInter
      ? "text-amber-600 dark:text-amber-400"
      : isAdv
      ? "text-rose-600 dark:text-rose-400"
      : "text-muted-foreground";

    const diffLabel = isGood ? "Good first" : isInter ? "Intermediate" : isAdv ? "Advanced" : match.complexity;
    return { diffLabel, diffColor };
  }, [match.complexity]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16 w-full border-b border-border bg-card/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 transition-colors",
        className
      )}
      {...props}
    >
      {/* Left side: Back button & Breadcrumb / Issue Title */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1 mr-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 shrink-0 gap-1.5 focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => router.push("/discover")}
          title="Return to Discover"
          aria-label="Back to Discover"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium">Discover</span>
        </Button>

        <span className="text-border select-none hidden sm:inline" aria-hidden="true">/</span>

        <div className="min-w-0 flex flex-col justify-center">
          {/* Breadcrumb row: Repository #issue · Language · Difficulty · Status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-mono text-xs text-foreground truncate max-w-[140px] md:max-w-[200px]" title={match.repository}>
              {match.repository}
            </span>
            {match.issueUrl ? (
              <a 
                href={match.issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline inline-flex items-center"
                aria-label="View original issue on GitHub"
                title="View issue on GitHub"
              >
                <span className="text-muted-foreground" aria-hidden="true">#</span>
                <span>{match.issueNumber}</span>
              </a>
            ) : (
              <>
                <span className="text-muted-foreground" aria-hidden="true">#</span>
                <span className="font-mono text-xs text-muted-foreground">{match.issueNumber}</span>
              </>
            )}

            {/* Language */}
            {match.technologies && match.technologies.length > 0 && (
              <>
                <span className="text-muted-foreground hidden sm:inline" aria-hidden="true">·</span>
                <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                  {match.technologies[0]}
                </span>
              </>
            )}

            {/* Difficulty */}
            {diffLabel && (
              <>
                <span className="text-muted-foreground" aria-hidden="true">·</span>
                <span className={cn("text-xs font-medium shrink-0", diffColor)}>
                  {diffLabel}
                </span>
              </>
            )}

            {/* Status dot */}
            <div className="hidden md:flex items-center gap-1.5 ml-1 border-l border-border/60 pl-2">
              <StatusIndicator status={mappedStatus} className="scale-75" />
              <span className="text-xs text-muted-foreground capitalize">{activityLabel}</span>
            </div>
          </div>

          {/* Issue title */}
          <h1 
            className="text-sm font-semibold text-foreground truncate tracking-tight mt-0.5"
            title={match.issueTitle}
          >
            {match.issueTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Match Fit Score */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Match Fit Score Popover Trigger */}
        {matchBadgeSlot ? (
          matchBadgeSlot
        ) : (
          <div 
            tabIndex={0}
            role="button"
            aria-label={`Match score: ${match.matchScore || 0}%`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-default"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{match.matchScore || 0}% Match</span>
          </div>
        )}
      </div>
    </header>
  );
}
