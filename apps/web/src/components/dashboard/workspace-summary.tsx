"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { WorkspaceStats } from "@/lib/mock-data"
import { FolderGit2, Activity, AlertTriangle, Search } from "lucide-react"

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: number | string
  attention?: boolean
}

function StatItem({ icon, label, value, attention }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 min-w-0">
      <span className={cn(
        "flex items-center justify-center",
        attention ? "text-destructive" : "text-muted-foreground"
      )}>
        {icon}
      </span>
      <div className="flex flex-col min-w-0">
        <span className={cn(
          "text-lg font-semibold leading-tight tabular-nums",
          attention ? "text-destructive" : "text-foreground"
        )}>
          {value}
        </span>
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
    </div>
  )
}

interface WorkspaceSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: WorkspaceStats
}

export function WorkspaceSummary({ stats, className, ...props }: WorkspaceSummaryProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch divide-x divide-border rounded-md border border-border bg-card",
        className
      )}
      {...props}
    >
      <StatItem
        icon={<FolderGit2 className="h-4 w-4" />}
        label="Repositories"
        value={stats.totalRepositories}
      />
      <StatItem
        icon={<Activity className="h-4 w-4" />}
        label="Running"
        value={stats.analysesRunning}
      />
      <StatItem
        icon={<AlertTriangle className="h-4 w-4" />}
        label="Needs attention"
        value={stats.needsAttention}
        attention={stats.needsAttention > 0}
      />
      <StatItem
        icon={<Search className="h-4 w-4" />}
        label="Total findings"
        value={stats.totalFindings}
      />
    </div>
  )
}

// Skeleton for loading state
export function WorkspaceSummarySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex flex-wrap items-stretch divide-x divide-border rounded-md border border-border bg-card",
      className
    )}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-4">
          <div className="h-4 w-4 rounded bg-muted animate-pulse" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-8 rounded bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
