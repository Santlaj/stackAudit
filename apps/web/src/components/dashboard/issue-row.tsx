"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IssueMatch } from "@/lib/api";
import { 
  Bookmark, 
  ArrowRight, 
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export interface IssueRowProps {
  issue: IssueMatch;
  onToggleSave: (issueId: string) => void;
  onExplore: (issueId: string) => void;
}

export function IssueRow({ issue, onToggleSave, onExplore }: IssueRowProps) {
  const isSaved = issue.status === "SAVED";

  const diffLower = (issue.complexity || "beginner").toLowerCase();
  const diffBadgeColor = 
    diffLower.includes("beginner") || diffLower.includes("good")
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : diffLower.includes("intermediate")
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

  return (
    <div className="border border-border/70 rounded-xs bg-card px-3.5 py-3 hover:border-border hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group">
      
      {/* ISSUE TITLE & REPOSITORY METADATA */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-muted-foreground">
            #{issue.issueNumber}
          </span>
          <span 
            onClick={() => onExplore(issue.id)}
            className="text-xs font-semibold text-foreground hover:underline cursor-pointer tracking-tight"
          >
            {issue.issueTitle}
          </span>
          <span className={cn("text-[10px] px-1.5 py-0.2 rounded-xs font-medium border capitalize", diffBadgeColor)}>
            {issue.complexity || "beginner"}
          </span>
        </div>

        {/* Repository context & tech */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/80 hover:underline">
            {issue.repository}
          </span>
          <span className="text-muted-foreground/40">·</span>
          {issue.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="px-1.5 py-0.2 rounded-xs bg-muted/60 text-foreground/80">
              {tech}
            </span>
          ))}

          {issue.commentsCount != null && issue.commentsCount > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px]">
                <MessageSquare className="w-3 h-3" />
                {issue.commentsCount}
              </span>
            </>
          )}

          {/* Top match reason */}
          {issue.reasons && issue.reasons.length > 0 && (
            <span className="text-muted-foreground hidden lg:inline">
              · ✓ {issue.reasons[0]}
            </span>
          )}
        </div>
      </div>

      {/* METRICS & ACTIONS */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {issue.matchScore != null && (
          <div className="flex flex-col items-end min-w-[50px]">
            <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {issue.matchScore}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Match
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onToggleSave(issue.id)}
          className={cn(
            "p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors",
            isSaved && "text-primary"
          )}
          title={isSaved ? "Saved" : "Save for later"}
        >
          <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
        </button>

        <button
          type="button"
          onClick={() => onExplore(issue.id)}
          className="px-2.5 py-1 text-xs font-medium rounded-xs bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
        >
          <span>Explore</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
