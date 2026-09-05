"use client";

import * as React from "react";
import { useState } from "react";
import { FileCode, ShieldAlert, ChevronDown, ChevronUp, ExternalLink, Files } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RelevantFileItem {
  file: string;
  role: string;
  source: string;
}

export interface RelevantFilesProps extends React.HTMLAttributes<HTMLDivElement> {
  files: RelevantFileItem[];
  repository: string;
  whyFilesMatter?: string;
}

export function RelevantFiles({
  files,
  repository,
  whyFilesMatter,
  className,
  ...props
}: RelevantFilesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  if (!files || files.length === 0) {
    return (
      <section
        className={cn("rounded-lg border border-border bg-card p-5 shadow-xs", className)}
        aria-label="Relevant Files"
        {...props}
      >
        <div className="flex items-center gap-2 mb-2">
          <Files className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Relevant Files (0)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground italic py-3">
          No specific relevant files have been identified for this issue yet.
        </p>
      </section>
    );
  }

  // Sort: primary files first
  const sortedFiles = [...files].sort((a, b) => {
    const aPri = a.role?.toLowerCase() === "primary";
    const bPri = b.role?.toLowerCase() === "primary";
    if (aPri && !bPri) return -1;
    if (!aPri && bPri) return 1;
    return a.file.localeCompare(b.file);
  });

  const visibleFiles = isExpanded ? sortedFiles : sortedFiles.slice(0, 5);

  const toggleRow = (filePath: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) next.delete(filePath);
      else next.add(filePath);
      return next;
    });
  };

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-xs space-y-4 transition-colors",
        className
      )}
      aria-label="Relevant Files"
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Files className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Relevant Files ({files.length})</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key codebase files identified by Graphify structural analysis and AI context.
          </p>
        </div>

        {files.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Show first 5" : `View all ${files.length} files`}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {visibleFiles.map((rf) => {
          const isPrimary = rf.role?.toLowerCase() === "primary";
          const isRowExpanded = expandedRows.has(rf.file);
          const githubFileUrl = `https://github.com/${repository}/blob/HEAD/${rf.file}`;

          return (
            <div
              key={rf.file}
              className={cn(
                "rounded-md border border-border/70 transition-colors overflow-hidden",
                isPrimary ? "bg-secondary/30" : "bg-card hover:bg-secondary/20"
              )}
            >
              {/* Row Header */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleRow(rf.file)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleRow(rf.file);
                  }
                }}
                className="flex items-center justify-between p-2.5 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  {isPrimary ? (
                    <ShieldAlert className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <FileCode className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate text-foreground font-medium">{rf.file}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={isPrimary ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] uppercase font-mono px-2 py-0",
                      isPrimary && "bg-emerald-700 dark:bg-emerald-600 text-white"
                    )}
                  >
                    {rf.role || "supporting"}
                  </Badge>
                  <div className="text-muted-foreground">
                    {isRowExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </div>

              {/* Row Expanded Details */}
              {isRowExpanded && (
                <div className="px-3.5 pb-3 pt-1 border-t border-border/50 text-xs font-sans space-y-2 bg-secondary/10">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Source: {rf.source === "graphify" ? "Structural analysis graph" : "Codebase analysis"}
                    </span>
                    <a
                      href={githubFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium hover:underline"
                    >
                      <span>Open on GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {isPrimary && whyFilesMatter && (
                    <div className="p-2 rounded bg-card border border-border/60 text-foreground/90 text-xs leading-relaxed">
                      <span className="font-semibold text-foreground block mb-0.5">Why it matters:</span>
                      {whyFilesMatter}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
