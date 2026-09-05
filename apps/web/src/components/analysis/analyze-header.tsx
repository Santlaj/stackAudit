"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ExternalLink, 
  MessageSquare, 
  Clock, 
  Sparkles,
  GitPullRequest
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 w-full border-b border-border bg-card/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 transition-colors",
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
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px] md:max-w-[200px]" title={match.repository}>
              {match.repository}
            </span>
            <span className="text-muted-foreground/40" aria-hidden="true">#</span>
            <span className="font-mono text-xs text-muted-foreground">{match.issueNumber}</span>

            {/* Status dot */}
            <div className="hidden md:flex items-center gap-1.5 ml-2 border-l border-border pl-2">
              <StatusIndicator status={mappedStatus} className="scale-75" />
              <span className="text-[11px] text-muted-foreground capitalize">{activityLabel}</span>
            </div>
          </div>

          {/* Issue title */}
          <h1 
            className="text-sm font-semibold text-foreground truncate tracking-tight"
            title={match.issueTitle}
          >
            {match.issueTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Metadata + Match Score + GitHub Link */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Difficulty Badge */}
        {match.complexity && (
          <Badge 
            variant="secondary" 
            className="hidden md:inline-flex text-[11px] px-2 py-0.5 border border-border/80 font-normal bg-secondary/70 text-foreground"
          >
            {match.complexity}
          </Badge>
        )}

        {/* Primary Language */}
        {match.technologies && match.technologies.length > 0 && (
          <Badge 
            variant="outline" 
            className="hidden lg:inline-flex text-[11px] px-2 py-0.5 font-mono text-muted-foreground"
          >
            {match.technologies[0]}
          </Badge>
        )}

        {/* Comments Count */}
        {typeof match.commentsCount === "number" && match.commentsCount > 0 && (
          <div className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground px-1.5" title={`${match.commentsCount} comments`}>
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{match.commentsCount}</span>
          </div>
        )}

        {/* MatchBadge Slot or Default Score Pill */}
        {matchBadgeSlot ? (
          matchBadgeSlot
        ) : (
          <div 
            tabIndex={0}
            role="button"
            aria-label={`Match score: ${match.matchScore || 0}%`}
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-ring cursor-default"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>{match.matchScore || 0}% Match</span>
          </div>
        )}

        {/* View on GitHub button */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 border-border"
        >
          <a 
            href={match.issueUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="View original issue on GitHub"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
