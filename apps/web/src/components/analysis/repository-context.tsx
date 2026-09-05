"use client";

import * as React from "react";
import { useState } from "react";
import { Tabs, TabItem } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, FolderTree, Layers, Cpu } from "lucide-react";
import { IssueMatch } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface RepositoryContextProps extends React.HTMLAttributes<HTMLDivElement> {
  match: IssueMatch;
  context?: {
    graphify?: {
      architectureContext?: string;
      relevantFiles?: Array<{ file: string; role: string; source: string }>;
      rawOutput?: string;
    };
    synthesis?: {
      whyFilesMatter?: string;
      whatToUnderstandFirst?: string;
      implementationApproach?: string;
      knowledgeGaps?: string[];
    };
  } | null;
}

export function RepositoryContext({
  match,
  context,
  className,
  ...props
}: RepositoryContextProps) {
  const [isArchitectureExpanded, setIsArchitectureExpanded] = useState(false);

  // 1. Architecture text
  const architectureText = context?.graphify?.architectureContext?.trim();
  const hasArchitecture = Boolean(architectureText && architectureText.length > 0);
  const isArchitectureLong = hasArchitecture && architectureText!.length > 280;

  // 2. Tech Stack data
  const technologies = match.technologies || [];
  const hasTech = technologies.length > 0;

  // 3. Key Directories derived from structural files
  const relevantFiles = context?.graphify?.relevantFiles || [];
  const directoriesMap = new Map<string, { count: number; primaryCount: number }>();

  relevantFiles.forEach((rf) => {
    const parts = rf.file.split("/");
    if (parts.length > 1) {
      // Top-level or second-level directory
      const dir = parts.slice(0, Math.min(2, parts.length - 1)).join("/");
      const current = directoriesMap.get(dir) || { count: 0, primaryCount: 0 };
      current.count += 1;
      if (rf.role.toLowerCase() === "primary") {
        current.primaryCount += 1;
      }
      directoriesMap.set(dir, current);
    }
  });

  const directoryEntries = Array.from(directoriesMap.entries()).sort(
    (a, b) => b[1].primaryCount - a[1].primaryCount || b[1].count - a[1].count
  );

  const tabs: TabItem[] = [
    {
      id: "architecture",
      label: "Architecture",
      content: (
        <div className="text-sm leading-relaxed text-foreground/90 space-y-3">
          {hasArchitecture ? (
            <div>
              <div
                className={cn(
                  "relative transition-all duration-200",
                  !isArchitectureExpanded && isArchitectureLong
                    ? "line-clamp-4 max-h-[6.5rem] overflow-hidden"
                    : ""
                )}
              >
                <p className="whitespace-pre-line text-sm text-foreground/80 leading-relaxed font-sans">
                  {architectureText}
                </p>
                {!isArchitectureExpanded && isArchitectureLong && (
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                )}
              </div>

              {isArchitectureLong && (
                <button
                  type="button"
                  onClick={() => setIsArchitectureExpanded((prev) => !prev)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {isArchitectureExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Show full architecture</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="py-4 text-xs text-muted-foreground italic font-sans">
              Architecture not yet determined for this repository.
            </div>
          )}
        </div>
      ),
    },
    {
      id: "tech-stack",
      label: "Tech Stack",
      badge: hasTech ? String(technologies.length) : undefined,
      content: (
        <div className="space-y-4">
          {hasTech ? (
            <div>
              <div className="text-xs text-muted-foreground mb-2.5 font-medium">
                Detected Technologies & Dependencies
              </div>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="font-mono text-xs px-2.5 py-1 bg-secondary text-foreground border border-border/80 font-normal"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-xs text-muted-foreground italic font-sans">
              Technology stack signals not explicitly cataloged for this repository.
            </div>
          )}
        </div>
      ),
    },
    {
      id: "key-directories",
      label: "Key Directories",
      badge: directoryEntries.length > 0 ? String(directoryEntries.length) : undefined,
      content: (
        <div className="space-y-3">
          {directoryEntries.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2 font-medium">
                Core code modules identified during structural analysis
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {directoryEntries.map(([dir, info]) => (
                  <div
                    key={dir}
                    className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-secondary/30 text-xs font-mono"
                  >
                    <span className="text-foreground truncate mr-2" title={dir}>
                      {dir}/
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {info.count} {info.count === 1 ? "file" : "files"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 text-xs text-muted-foreground italic font-sans">
              Key directory structure not yet extracted for this repository.
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-xs transition-colors",
        className
      )}
      aria-label="Repository Context and Architecture"
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Repository Context</span>
        </h2>
      </div>

      <Tabs tabs={tabs} defaultTab="architecture" />
    </section>
  );
}
