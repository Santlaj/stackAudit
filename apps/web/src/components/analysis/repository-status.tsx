"use client";

import * as React from "react";
import { Activity, GitPullRequest, Star, AlertCircle, Calendar } from "lucide-react";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { IssueMatch } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface RepositoryStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  match: IssueMatch;
}

export function RepositoryStatus({
  match,
  className,
  ...props
}: RepositoryStatusProps) {
  const activity = match.repositoryActivity;
  const status = activity?.status?.toLowerCase() || "neutral";
  const mappedStatus = 
    status === "active" ? "success" :
    status === "moderate" ? "warning" :
    status === "inactive" || status === "low" ? "error" : "neutral";

  const updatedDateStr = match.issueUpdatedAt 
    ? new Date(match.issueUpdatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-xs space-y-3 transition-colors",
        className
      )}
      aria-label="Repository Status"
      {...props}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Repository Status</span>
        </h2>
        {activity?.status && (
          <div className="flex items-center gap-1.5">
            <StatusIndicator status={mappedStatus} className="scale-75" />
            <span className="text-[11px] font-medium text-foreground capitalize">
              {activity.status}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-xs">
        {/* Open Issues */}
        <div className="flex justify-between items-center py-0.5">
          <span className="text-muted-foreground">Open Issues</span>
          <span className="font-mono font-medium text-foreground">
            {activity?.openIssues != null ? activity.openIssues.toLocaleString() : "—"}
          </span>
        </div>

        {/* Stars */}
        <div className="flex justify-between items-center py-0.5">
          <span className="text-muted-foreground">Stars</span>
          <span className="font-mono font-medium text-foreground">
            {activity?.stars != null ? activity.stars.toLocaleString() : "—"}
          </span>
        </div>

        {/* PR Acceptance Rate */}
        <div className="flex justify-between items-center py-0.5">
          <span className="text-muted-foreground">PR Acceptance Rate</span>
          <span className="font-mono font-medium text-foreground">
            {activity?.prAcceptanceRate != null ? `${Math.round(activity.prAcceptanceRate)}%` : "—"}
          </span>
        </div>

        {/* Primary Language */}
        {match.technologies && match.technologies.length > 0 && (
          <div className="flex justify-between items-center py-0.5">
            <span className="text-muted-foreground">Primary Language</span>
            <span className="font-mono font-medium text-foreground">
              {match.technologies[0]}
            </span>
          </div>
        )}

        {/* Last Updated */}
        {updatedDateStr && (
          <div className="flex justify-between items-center py-0.5">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium text-foreground">
              {updatedDateStr}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
