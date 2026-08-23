"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { ActivityEvent, ActivityEventType } from "@/lib/mock-data"
import { CheckCircle2, Play, XCircle, GitFork, AlertTriangle } from "lucide-react"

// ---------------------------------------------------------------------------
// Event type config
// ---------------------------------------------------------------------------

const eventConfig: Record<ActivityEventType, { icon: React.ReactNode; color: string }> = {
  analysis_completed:   { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-success" },
  analysis_started:     { icon: <Play className="h-3.5 w-3.5" />,         color: "text-info" },
  analysis_failed:      { icon: <XCircle className="h-3.5 w-3.5" />,      color: "text-destructive" },
  repository_connected: { icon: <GitFork className="h-3.5 w-3.5" />,      color: "text-muted-foreground" },
  findings_detected:    { icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "text-warning" },
}

// ---------------------------------------------------------------------------
// Recent Activity
// ---------------------------------------------------------------------------

interface RecentActivityProps extends React.HTMLAttributes<HTMLDivElement> {
  events: ActivityEvent[]
  limit?: number
}

export function RecentActivity({ events, limit = 6, className, ...props }: RecentActivityProps) {
  const displayEvents = events.slice(0, limit)

  return (
    <section className={cn("space-y-3", className)} {...props}>
      <h2 className="text-sm font-medium text-foreground">Recent activity</h2>
      <div className="rounded-md border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {displayEvents.map((event) => {
            const config = eventConfig[event.type]
            return (
              <div
                key={event.id}
                className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors duration-150"
              >
                <span className={cn("mt-0.5 shrink-0", config.color)}>
                  {config.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {event.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{event.repositoryFullName}</span>
                    <span className="mx-1.5">·</span>
                    <span>{formatRelativeTime(event.timestamp)}</span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function RecentActivitySkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="h-4 w-28 rounded bg-muted animate-pulse" />
      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5">
            <div className="h-3.5 w-3.5 rounded-full bg-muted animate-pulse mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-56 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
