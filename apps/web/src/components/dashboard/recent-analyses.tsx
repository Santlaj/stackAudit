"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRelativeTime } from "@/lib/format"
import type { AnalysisRun, AnalysisStatus } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Status mapping — reuse from repository-table pattern
// ---------------------------------------------------------------------------

const statusConfig: Record<AnalysisStatus, { label: string; status: "success" | "warning" | "error" | "info" | "neutral"; pulse?: boolean }> = {
  healthy:  { label: "Passed",   status: "success" },
  warning:  { label: "Warnings", status: "warning" },
  critical: { label: "Failed",   status: "error" },
  running:  { label: "Running",  status: "info", pulse: true },
  queued:   { label: "Queued",   status: "neutral" },
  failed:   { label: "Error",    status: "error" },
}

// ---------------------------------------------------------------------------
// Recent Analyses
// ---------------------------------------------------------------------------

interface RecentAnalysesProps extends React.HTMLAttributes<HTMLDivElement> {
  runs: AnalysisRun[]
}

export function RecentAnalyses({ runs, className, ...props }: RecentAnalysesProps) {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      <h2 className="text-sm font-medium text-foreground">Recent analyses</h2>
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Repository</TableHead>
              <TableHead className="hidden sm:table-cell">Branch</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="hidden md:table-cell">Score</TableHead>
              <TableHead className="hidden lg:table-cell">Commit</TableHead>
              <TableHead className="hidden md:table-cell">Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => {
              const config = statusConfig[run.status]
              return (
                <TableRow key={run.id} className="cursor-pointer">
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground text-sm">
                        {run.repositoryFullName}
                      </span>
                      <span className="text-xs text-muted-foreground sm:hidden">
                        {run.branch} · {formatRelativeTime(run.completedAt || run.startedAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{run.branch}</span>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator
                      status={config.status}
                      label={config.label}
                      pulse={config.pulse}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {run.score !== null ? (
                      <span className={cn(
                        "text-sm font-mono tabular-nums font-medium",
                        run.score >= 85 ? "text-success" : run.score >= 60 ? "text-warning" : "text-destructive"
                      )}>
                        {run.score}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{run.commitSha}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatRelativeTime(run.completedAt || run.startedAt)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function RecentAnalysesSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="h-4 w-28 rounded bg-muted animate-pulse" />
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Repository</TableHead>
              <TableHead className="hidden sm:table-cell">Branch</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="hidden md:table-cell">Score</TableHead>
              <TableHead className="hidden lg:table-cell">Commit</TableHead>
              <TableHead className="hidden md:table-cell">Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-36 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden sm:table-cell"><div className="h-4 w-14 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden md:table-cell"><div className="h-4 w-8 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden lg:table-cell"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden md:table-cell"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
