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
import { TECH_ICONS, TECH_COLORS, getTechIconClass } from "./technology-explorer";

export interface IssueRowProps {
  issue: IssueMatch;
  onToggleSave: (issueId: string) => void;
  onExplore: (issueId: string) => void;
}

export function IssueRow({ issue, onToggleSave, onExplore }: IssueRowProps) {
  const isSaved = issue.status === "SAVED";

  const diffLower = (issue.complexity || "beginner").toLowerCase();
  const isGood = diffLower.includes("beginner") || diffLower.includes("good");
  const isInter = diffLower.includes("intermediate");
  const isAdv = diffLower.includes("advanced");

  const diffTextColor = isGood
    ? "text-emerald-600 dark:text-emerald-400/90"
    : isInter
    ? "text-amber-600/95 dark:text-amber-400/85"
    : isAdv
    ? "text-rose-600/95 dark:text-rose-400/85"
    : "text-muted-foreground";

  const diffLabel = isGood ? "Good first" : isInter ? "Intermediate" : isAdv ? "Advanced" : (issue.complexity || "Good first");

  return (
    <div className="border border-border rounded-xs bg-card px-3.5 py-3 hover:border-foreground/30 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group shadow-2xs">
      
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
        </div>

        {/* Repository context & tech */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/80 hover:underline">
            {issue.repository}
          </span>
          <span className="text-muted-foreground/40">·</span>
          {issue.technologies.slice(0, 3).map((tech) => {
            const iconSrc = TECH_ICONS[tech.toLowerCase()];
            const dotColor = TECH_COLORS[tech] || TECH_COLORS[tech.toLowerCase()];
            return (
              <span key={tech} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-muted/60 text-foreground/80 text-[10px] font-medium">
                {iconSrc ? (
                  <span className="w-3 h-3 shrink-0 flex items-center justify-center overflow-visible">
                    <img
                      src={iconSrc}
                      alt={tech}
                      className={getTechIconClass(tech, "row")}
                    />
                  </span>
                ) : dotColor ? (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                ) : null}
                {tech}
              </span>
            );
          })}

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

      {/* DIFFICULTY COLUMN */}
      <div className="hidden sm:flex flex-col items-start justify-center shrink-0 px-2 min-w-[120px] text-xs font-medium leading-tight">
        <span className={cn("whitespace-nowrap", diffTextColor)}>
          {diffLabel}
        </span>
      </div>

      {/* METRICS & ACTIONS */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {issue.matchScore != null && (
          <div className="flex flex-col items-end min-w-[50px]">
            <span className={cn(
              "text-xs font-mono",
              issue.matchScore >= 80
                ? "font-bold text-emerald-600 dark:text-emerald-400"
                : issue.matchScore >= 60
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground"
            )}>
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
