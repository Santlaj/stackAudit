"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatRelativeTime } from "@/lib/format"
import type { Repository, AnalysisStatus } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------

const statusConfig: Record<AnalysisStatus, { label: string; status: "success" | "warning" | "error" | "info" | "neutral"; pulse?: boolean }> = {
  healthy:  { label: "Healthy",  status: "success" },
  warning:  { label: "Warning",  status: "warning" },
  critical: { label: "Critical", status: "error" },
  running:  { label: "Running",  status: "info", pulse: true },
  queued:   { label: "Queued",   status: "neutral" },
  failed:   { label: "Failed",   status: "error" },
}

// ---------------------------------------------------------------------------
// Score display
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">—</span>

  let variant: "success" | "warning" | "destructive" | "secondary" = "secondary"
  if (score >= 85) variant = "success"
  else if (score >= 60) variant = "warning"
  else variant = "destructive"

  // Map badge variant names
  const badgeVariantMap = {
    success: "success" as const,
    warning: "warning" as const,
    destructive: "destructive" as const,
    secondary: "secondary" as const,
  }

  return (
    <span className={cn(
      "text-sm font-mono tabular-nums font-medium",
      score >= 85 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive"
    )}>
      {score}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Repository Table
// ---------------------------------------------------------------------------

interface RepositoryTableProps extends React.HTMLAttributes<HTMLDivElement> {
  repositories: Repository[]
}

export function RepositoryTable({ repositories, className, ...props }: RepositoryTableProps) {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Repositories</h2>
        <Button variant="outline" size="sm">Connect repository</Button>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Repository</TableHead>
              <TableHead className="hidden sm:table-cell">Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Score</TableHead>
              <TableHead className="hidden lg:table-cell">Findings</TableHead>
              <TableHead className="hidden md:table-cell">Last analyzed</TableHead>
              <TableHead className="text-right w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repositories.map((repo) => {
              const config = statusConfig[repo.status]
              return (
                <TableRow key={repo.id} className="group cursor-pointer">
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground group-hover:text-foreground/90">
                        {repo.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {repo.language} · {formatRelativeTime(repo.lastAnalyzedAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{repo.language}</span>
                  </TableCell>
                  <TableCell>
                    <StatusIndicator
                      status={config.status}
                      label={config.label}
                      pulse={config.pulse}
                    />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <ScoreBadge score={repo.score} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {repo.findingsCount > 0 ? (
                      <Badge variant={repo.status === "critical" ? "destructive" : "outline"}>
                        {repo.findingsCount}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatRelativeTime(repo.lastAnalyzedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      View
                    </Button>
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

export function RepositoryTableSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="h-8 w-36 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead>Repository</TableHead>
              <TableHead className="hidden sm:table-cell">Language</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Score</TableHead>
              <TableHead className="hidden lg:table-cell">Findings</TableHead>
              <TableHead className="hidden md:table-cell">Last analyzed</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 w-32 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden sm:table-cell"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden md:table-cell"><div className="h-4 w-8 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden lg:table-cell"><div className="h-4 w-8 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell className="hidden md:table-cell"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
