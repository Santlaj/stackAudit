"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Bookmark, 
  Check, 
  Layers, 
  ListOrdered 
} from "lucide-react";

export type ViewMode = "repositories" | "issues";
export type SortOption = "match" | "stars" | "issues" | "activity";
export type DifficultyOption = "all" | "beginner" | "intermediate" | "advanced";

export interface ResultsToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  difficulty: DifficultyOption;
  onDifficultyChange: (d: DifficultyOption) => void;
  goodFirstIssueOnly: boolean;
  onGoodFirstIssueChange: (val: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  savedOnly: boolean;
  onToggleSavedOnly: () => void;
  repoCount: number;
  issueCount: number;
  savedCount: number;
  className?: string;
}

export function ResultsToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  difficulty,
  onDifficultyChange,
  goodFirstIssueOnly,
  onGoodFirstIssueChange,
  sortBy,
  onSortChange,
  savedOnly,
  onToggleSavedOnly,
  repoCount,
  issueCount,
  savedCount,
  className,
}: ResultsToolbarProps) {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);

  const filterRef = React.useRef<HTMLDivElement>(null);
  const sortRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters = difficulty !== "all" || goodFirstIssueOnly;

  const sortLabels: Record<SortOption, string> = {
    match: "Best Match",
    stars: "Most Stars",
    issues: "Most Issues",
    activity: "Recent Activity",
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* VIEW TABS: Repositories vs Issues */}
        <div className="inline-flex items-center p-0.5 rounded-sm bg-muted/60 border border-border/80 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("repositories")}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xs transition-colors",
              viewMode === "repositories"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {viewMode === "repositories" && (
              <motion.span
                layoutId="activeViewTab"
                className="absolute inset-0 rounded-xs bg-background shadow-xs border border-border/50"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Layers className="w-3.5 h-3.5 shrink-0 z-10" />
            <span className="z-10">Repositories</span>
            <span className="z-10 ml-0.5 text-[10px] font-mono px-1 py-0.2 rounded-xs bg-muted text-muted-foreground">
              {repoCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("issues")}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xs transition-colors",
              viewMode === "issues"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {viewMode === "issues" && (
              <motion.span
                layoutId="activeViewTab"
                className="absolute inset-0 rounded-xs bg-background shadow-xs border border-border/50"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <ListOrdered className="w-3.5 h-3.5 shrink-0 z-10" />
            <span className="z-10">Issues</span>
            <span className="z-10 ml-0.5 text-[10px] font-mono px-1 py-0.2 rounded-xs bg-muted text-muted-foreground">
              {issueCount}
            </span>
          </button>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search repositories, issues or topics..."
              className="w-full h-8 pl-8 pr-7 text-xs rounded-sm border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* FILTERS BUTTON & POPOVER */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(prev => !prev)}
              className={cn(
                "h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-sm border transition-colors",
                hasActiveFilters
                  ? "bg-muted text-foreground border-foreground/30 font-semibold"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-1 w-64 rounded-sm border border-border bg-popover shadow-md p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {(["all", "beginner", "intermediate", "advanced"] as DifficultyOption[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onDifficultyChange(level)}
                        className={cn(
                          "px-2 py-1 text-xs capitalize rounded-xs text-left border transition-colors",
                          difficulty === level
                            ? "bg-foreground text-background border-foreground font-semibold"
                            : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <label
                    className="flex items-center gap-2 cursor-pointer text-xs text-foreground select-none"
                    onClick={() => onGoodFirstIssueChange(!goodFirstIssueOnly)}
                  >
                    <input
                      type="checkbox"
                      checked={goodFirstIssueOnly}
                      onChange={() => {}} // handled by parent onClick
                      className="rounded border-border text-primary focus:ring-0 cursor-pointer"
                    />
                    <span>Good first issues only</span>
                  </label>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      onDifficultyChange("all");
                      onGoodFirstIssueChange(false);
                    }}
                    className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground pt-1 border-t border-border"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SORT BUTTON & POPOVER */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen(prev => !prev)}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{sortLabels[sortBy]}</span>
            </button>

            {sortOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-sm border border-border bg-popover shadow-md py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {(["match", "stars", "issues", "activity"] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onSortChange(option);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors",
                      sortBy === option
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <span>{sortLabels[option]}</span>
                    {sortBy === option && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAVED ONLY TOGGLE */}
          <button
            type="button"
            onClick={onToggleSavedOnly}
            className={cn(
              "h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-sm border transition-colors shrink-0",
              savedOnly
                ? "bg-primary text-primary-foreground border-primary font-semibold"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
            )}
            title="Show saved issues only"
          >
            <Bookmark className={cn("w-3.5 h-3.5", savedOnly && "fill-current")} />
            <span className="hidden lg:inline">Saved</span>
            {savedCount > 0 && (
              <span className={cn(
                "font-mono text-[10px] px-1 rounded-xs",
                savedOnly ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
