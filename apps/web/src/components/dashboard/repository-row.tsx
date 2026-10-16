"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { IssueMatch } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight, 
  Star, 
  Bookmark, 
  ArrowRight, 
  ExternalLink, 
  GitFork,
  CircleDot,
  FileCode
} from "lucide-react";
import { TECH_ICONS, getTechIconClass } from "./technology-explorer";

export interface RepositoryGroup {
  repository: string;
  owner: string;
  repoName: string;
  description: string | null;
  language: string | null;
  technologies: string[];
  stars: number;
  openIssuesCount: number;
  activityStatus: string | null;
  lastActivityAt: string | null;
  matchedIssues: IssueMatch[];
  topMatchScore: number | null;
  difficultyBreakdown: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface RepositoryRowProps {
  repo: RepositoryGroup;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectIssue: (issue: IssueMatch) => void;
  onToggleSaveIssue: (issueId: string) => void;
  onExploreIssue: (issueId: string) => void;
}

const LANG_COLORS: Record<string, string> = {
  "TypeScript": "#3178c6",
  "JavaScript": "#f1e05a",
  "Python": "#3572A5",
  "React": "#61dafb",
  "Node.js": "#339933",
  "Go": "#00ADD8",
  "Rust": "#dea584",
  "Java": "#b07219",
  "C++": "#f34b7d",
  "SQL": "#e38c00",
};

export function RepositoryRow({
  repo,
  isExpanded,
  onToggleExpand,
  onSelectIssue,
  onToggleSaveIssue,
  onExploreIssue,
}: RepositoryRowProps) {
  const dotColor = repo.language ? LANG_COLORS[repo.language] : undefined;

  const activityColor = 
    repo.activityStatus === "active" ? "bg-emerald-500/70 dark:bg-emerald-400/60" :
    repo.activityStatus === "moderate" ? "bg-amber-500/70 dark:bg-amber-400/60" :
    "bg-muted-foreground/30";

  // Filter out redundant language tag if it matches the main repo language
  const displayTechnologies = React.useMemo(() => {
    const langLower = (repo.language || "").toLowerCase();
    return repo.technologies
      .filter((t) => t.toLowerCase() !== langLower)
      .slice(0, 3);
  }, [repo.technologies, repo.language]);

  return (
    <div className="border border-border rounded-xl bg-card hover:border-foreground/30 transition-colors shadow-2xs">
      {/* REPOSITORY HEADER ROW */}
      <div 
        onClick={onToggleExpand}
        className="px-3.5 py-3 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          {/* Expand chevron with rotate animation */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5 sm:mt-0 p-0.5 rounded transition-transform"
            aria-label={isExpanded ? "Collapse repository issues" : "Expand repository issues"}
          >
            <ChevronRight 
              className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-90")} 
            />
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-foreground tracking-tight hover:underline flex items-center gap-1">
                <span>{repo.owner}</span>
                <span className="text-muted-foreground">/</span>
                <span>{repo.repoName}</span>
              </span>

              <a
                href={`https://github.com/${repo.repository}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground inline-flex items-center"
                title="View on GitHub"
              >
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Activity indicator */}
              {repo.activityStatus && (
                <span 
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground capitalize"
                  title={`Repository activity level: ${repo.activityStatus}`}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", activityColor)} />
                  <span className="hidden md:inline">{repo.activityStatus}</span>
                </span>
              )}
            </div>

            {/* Description */}
            {repo.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal max-w-2xl">
                {repo.description}
              </p>
            )}

            {/* Tech badges */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {repo.language && (() => {
                const iconSrc = TECH_ICONS[repo.language.toLowerCase()];
                return (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-foreground/80">
                    {iconSrc ? (
                      <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center overflow-visible">
                        <img
                          src={iconSrc}
                          alt={repo.language}
                          className={getTechIconClass(repo.language, "row")}
                        />
                      </span>
                    ) : dotColor ? (
                      <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                        <span 
                          className="w-1.5 h-1.5 rounded-full shrink-0" 
                          style={{ backgroundColor: dotColor }} 
                        />
                      </span>
                    ) : null}
                    {repo.language}
                  </span>
                );
              })()}

              {displayTechnologies.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* DIFFICULTY BREAKDOWN (Dedicated middle column, stacked vertically, balanced tone) */}
        <div className="hidden sm:flex flex-col items-start justify-center gap-0.5 shrink-0 px-2 min-w-[120px] text-xs font-medium leading-tight">
          {repo.difficultyBreakdown.beginner > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400/90 whitespace-nowrap">
              {repo.difficultyBreakdown.beginner} Good first
            </span>
          )}
          {repo.difficultyBreakdown.intermediate > 0 && (
            <span className="text-amber-600/95 dark:text-amber-400/85 whitespace-nowrap">
              {repo.difficultyBreakdown.intermediate} Intermediate
            </span>
          )}
          {repo.difficultyBreakdown.advanced > 0 && (
            <span className="text-rose-600/95 dark:text-rose-400/85 whitespace-nowrap">
              {repo.difficultyBreakdown.advanced} Advanced
            </span>
          )}
        </div>

        {/* METRICS & SCORES */}
        <div className="flex items-center gap-4 shrink-0 text-right">
          {/* Match Score */}
          {repo.topMatchScore != null && (
            <div className="flex flex-col items-end">
              <span className={cn(
                "text-xs font-mono",
                repo.topMatchScore >= 80
                  ? "font-bold text-emerald-600 dark:text-emerald-400"
                  : repo.topMatchScore >= 60
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              )}>
                {repo.topMatchScore}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Match
              </span>
            </div>
          )}

          {/* Open Issues & Matches count */}
          <div className="flex flex-col items-end min-w-[70px]">
            <span className="text-xs font-semibold text-foreground font-mono">
              {repo.matchedIssues.length}{" "}
              <span className="text-[10px] font-normal text-muted-foreground">matched</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {repo.openIssuesCount} open
            </span>
          </div>

          {/* Stars */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-mono min-w-[50px] justify-end">
            <Star className="w-3.5 h-3.5 text-muted-foreground fill-muted-foreground/20" />
            <span>{repo.stars > 999 ? `${(repo.stars / 1000).toFixed(1)}k` : repo.stars}</span>
          </div>
        </div>
      </div>

      {/* EXPANDED ISSUES LIST ACCORDION */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/70 bg-muted/15"
          >
            <div className="px-3.5 py-2 space-y-1.5 divide-y divide-border/40">
              {repo.matchedIssues.length === 0 ? (
                <div className="py-3 text-center text-xs text-muted-foreground italic">
                  No issues currently indexed for this repository matching current filters.
                </div>
              ) : (
                repo.matchedIssues.map((issue) => {
                  const isSaved = issue.status === "SAVED";

                  return (
                    <div
                      key={issue.id}
                      className="pt-2 first:pt-0 flex items-start sm:items-center justify-between gap-3 group/issue hover:bg-card/70 p-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono text-muted-foreground">
                            #{issue.issueNumber}
                          </span>
                          <span 
                            onClick={() => onSelectIssue(issue)}
                            className="text-xs font-medium text-foreground hover:underline cursor-pointer line-clamp-1"
                          >
                            {issue.issueTitle}
                          </span>
                        </div>

                        {/* Match Reason preview */}
                        {issue.reasons && issue.reasons.length > 0 && (
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            ✓ {issue.reasons[0]}
                          </p>
                        )}
                      </div>

                      {/* Difficulty column (aligned with parent repository row) */}
                      <div className="hidden sm:flex flex-col items-start justify-center shrink-0 px-2 min-w-[120px] text-xs font-medium leading-tight">
                        {issue.complexity && (() => {
                          const cLower = issue.complexity.toLowerCase();
                          const isGood = cLower.includes("beginner") || cLower.includes("good");
                          const isInter = cLower.includes("intermediate");
                          const isAdv = cLower.includes("advanced");

                          const textColor = isGood
                            ? "text-emerald-600 dark:text-emerald-400/90"
                            : isInter
                            ? "text-amber-600/95 dark:text-amber-400/85"
                            : isAdv
                            ? "text-rose-600/95 dark:text-rose-400/85"
                            : "text-muted-foreground";

                          const label = isGood ? "Good first" : isInter ? "Intermediate" : isAdv ? "Advanced" : issue.complexity;

                          return (
                            <span className={cn("whitespace-nowrap", textColor)}>
                              {label}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Issue Row Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {issue.matchScore != null && (
                          <span className="text-[11px] font-mono font-medium text-muted-foreground">
                            {issue.matchScore}%
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => onToggleSaveIssue(issue.id)}
                          className={cn(
                            "p-1 rounded text-muted-foreground hover:text-foreground transition-colors",
                            isSaved && "text-primary"
                          )}
                          title={isSaved ? "Saved" : "Save for later"}
                        >
                          <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onExploreIssue(issue.id)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
