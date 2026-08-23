"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Finding, FindingSeverity } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Severity mapping
// ---------------------------------------------------------------------------

const severityConfig: Record<FindingSeverity, { label: string; variant: "destructive" | "warning" | "info" | "secondary" | "outline" }> = {
  critical: { label: "Critical", variant: "destructive" },
  high:     { label: "High",     variant: "warning" },
  medium:   { label: "Medium",   variant: "info" },
  low:      { label: "Low",      variant: "secondary" },
  info:     { label: "Info",     variant: "outline" },
}

// ---------------------------------------------------------------------------
// Attention List
// ---------------------------------------------------------------------------

interface AttentionListProps extends React.HTMLAttributes<HTMLDivElement> {
  findings: Finding[]
}

export function AttentionList({ findings, className, ...props }: AttentionListProps) {
  // Only show critical and high findings in the attention section
  const attentionFindings = findings.filter(
    (f) => f.severity === "critical" || f.severity === "high"
  )

  if (attentionFindings.length === 0) return null

  return (
    <section className={cn("space-y-3", className)} {...props}>
      <h2 className="text-sm font-medium text-foreground">Needs attention</h2>
      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {attentionFindings.map((finding) => {
          const config = severityConfig[finding.severity]
          return (
            <div
              key={finding.id}
              className="group flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors duration-150 cursor-pointer"
            >
              <Badge variant={config.variant} className="shrink-0 w-16 justify-center text-[11px]">
                {config.label}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {finding.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {finding.repositoryFullName}
                  {finding.filePath && (
                    <span className="hidden sm:inline"> · <span className="font-mono">{finding.filePath}</span></span>
                  )}
                </p>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                {finding.category}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
              >
                Inspect
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function AttentionListSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="h-4 w-28 rounded bg-muted animate-pulse" />
      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-5 w-16 rounded bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
