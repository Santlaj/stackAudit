"use client";

import * as React from "react";
import { Popover } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Sparkles, Activity, Shield } from "lucide-react";
import { IssueMatch } from "@/lib/api";

export interface MatchBadgeProps {
  match: IssueMatch;
  knowledgeGaps?: string[];
}

export function MatchBadge({ match, knowledgeGaps = [] }: MatchBadgeProps) {
  const score = match.matchScore || 0;
  const reasons = match.reasons || [];
  const activityStatus = match.repositoryActivity?.status || "active";

  const popoverContent = (
    <div className="space-y-3.5 text-xs font-sans">
      {/* Header with Composite Score */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-sm text-foreground">Contribution Fit</span>
        </div>
        <div className="font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
          {score}% Overall
        </div>
      </div>

      {/* Signal Summary Badges */}
      <div className="grid grid-cols-3 gap-1.5 py-1">
        <div className="p-2 rounded bg-secondary/50 border border-border/70 flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Skill Fit</span>
          <span className="font-medium text-foreground truncate" title={match.technologies?.[0] || "General"}>
            {match.technologies?.[0] || "General"}
          </span>
        </div>

        <div className="p-2 rounded bg-secondary/50 border border-border/70 flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Difficulty</span>
          <span className="font-medium text-foreground truncate" title={match.complexity || "Beginner"}>
            {match.complexity || "Beginner"}
          </span>
        </div>

        <div className="p-2 rounded bg-secondary/50 border border-border/70 flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Activity</span>
          <span className="font-medium text-foreground capitalize truncate" title={activityStatus}>
            {activityStatus}
          </span>
        </div>
      </div>

      {/* Why it matches */}
      <div className="space-y-1.5 pt-1">
        <div className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
          Why this matches your profile
        </div>
        {reasons.length > 0 ? (
          <ul className="space-y-1.5">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/90 leading-snug">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">
            Matched based on technology and difficulty preferences.
          </p>
        )}
      </div>

      {/* Knowledge Gaps */}
      <div className="space-y-1.5 pt-2 border-t border-border">
        <div className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-500" />
          <span>Knowledge Considerations</span>
        </div>
        {knowledgeGaps.length > 0 ? (
          <ul className="space-y-1.5">
            {knowledgeGaps.map((gap, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/85 leading-snug">
                <span className="text-muted-foreground/60 shrink-0">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">
            No major knowledge gaps identified for this issue.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Popover content={popoverContent} align="end">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
        aria-label={`Match score: ${score}%. Click or hover for detailed match explanation.`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" aria-hidden="true" />
        <span>{score}% Match</span>
      </button>
    </Popover>
  );
}
