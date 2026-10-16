"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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

const SEARCH_PLACEHOLDERS = [
  "Search repositories, issues or topics...",
  "Search by tech (e.g. Python, React, Go)...",
  "Search beginner-friendly issues...",
  "Search by repository name...",
];

function useTypewriterPlaceholder(phrases: string[], isFocused: boolean, hasValue: boolean) {
  const [displayedText, setDisplayedText] = React.useState(phrases[0] || "");
  const [phraseIdx, setPhraseIdx] = React.useState(0);
  const [charIdx, setCharIdx] = React.useState(phrases[0]?.length || 0);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (hasValue || isFocused) {
      return;
    }

    const currentPhrase = phrases[phraseIdx % phrases.length] || "";
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIdx < currentPhrase.length) {
      timeout = setTimeout(() => {
        setCharIdx((prev) => prev + 1);
        setDisplayedText(currentPhrase.slice(0, charIdx + 1));
      }, 55);
    } else if (!isDeleting && charIdx >= currentPhrase.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setCharIdx((prev) => prev - 1);
        setDisplayedText(currentPhrase.slice(0, charIdx - 1));
      }, 28);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
      timeout = setTimeout(() => {}, 350);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, phraseIdx, phrases, isFocused, hasValue]);

  return displayedText;
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
  const [isFocused, setIsFocused] = React.useState(false);

  const filterRef = React.useRef<HTMLDivElement>(null);
  const sortRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const animatedPlaceholder = useTypewriterPlaceholder(
    SEARCH_PLACEHOLDERS,
    isFocused,
    Boolean(searchQuery)
  );

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("repositories")}
            className={cn(
              "h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-full transition-colors border",
              viewMode === "repositories"
                ? "bg-foreground text-background font-semibold border-foreground"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted shadow-2xs"
            )}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Repositories</span>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
              viewMode === "repositories"
                ? "bg-background/20 text-background font-bold"
                : "bg-muted text-muted-foreground border border-border/50"
            )}>
              {repoCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("issues")}
            className={cn(
              "h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-full transition-colors border",
              viewMode === "issues"
                ? "bg-foreground text-background font-semibold border-foreground"
                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted shadow-2xs"
            )}
          >
            <ListOrdered className="w-3.5 h-3.5 shrink-0" />
            <span>Issues</span>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
              viewMode === "issues"
                ? "bg-background/20 text-background font-bold"
                : "bg-muted text-muted-foreground border border-border/50"
            )}>
              {issueCount}
            </span>
          </button>
        </div>

        {/* CENTER: Header-Style Pill Search Bar */}
        <div className="flex-1 flex justify-center px-2">
          <div className="relative flex items-center w-full max-w-xs sm:max-w-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 pointer-events-none z-10" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={animatedPlaceholder}
              className="w-full h-8 pl-8.5 pr-8 text-xs rounded-full bg-card border border-border hover:border-foreground/40 focus:border-foreground text-foreground placeholder:text-muted-foreground outline-none transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  onSearchQueryChange("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>
        </div>

        {/* RIGHT: ACTIONS (Filters, Sort, Saved) */}
        <div className="flex items-center gap-2 shrink-0">

          {/* FILTERS BUTTON & POPOVER */}
          <div className="relative group shrink-0" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(prev => !prev)}
              aria-label="Filter options"
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors relative shrink-0 border",
                hasActiveFilters || filterOpen
                  ? "bg-foreground text-background font-semibold border-foreground"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted shadow-2xs"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </button>

            {/* Hover Tooltip */}
            {!filterOpen && (
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center px-2 py-0.5 text-[11px] font-medium text-foreground bg-popover border border-border shadow-xs rounded-md whitespace-nowrap z-50">
                {hasActiveFilters ? "Filters (Active)" : "Filters"}
              </div>
            )}

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover shadow-md p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
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
                          "px-2.5 py-1.5 text-xs capitalize rounded-md text-left border transition-colors",
                          difficulty === level
                            ? "bg-foreground text-background border-foreground font-semibold"
                            : "bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {level === "beginner" ? "Good first" : level}
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
          <div className="relative group shrink-0" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen(prev => !prev)}
              aria-label="Sort options"
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors shrink-0 border",
                sortOpen
                  ? "bg-foreground text-background font-semibold border-foreground"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted shadow-2xs"
              )}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* Hover Tooltip */}
            {!sortOpen && (
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center px-2 py-0.5 text-[11px] font-medium text-foreground bg-popover border border-border shadow-xs rounded-md whitespace-nowrap z-50">
                Sort: {sortLabels[sortBy]}
              </div>
            )}

            {sortOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-popover shadow-md py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
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
          <div className="relative group shrink-0">
            <button
              type="button"
              onClick={onToggleSavedOnly}
              aria-label="Show saved only"
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center rounded-full transition-colors relative shrink-0 border",
                savedOnly
                  ? "bg-foreground text-background font-semibold border-foreground"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted shadow-2xs"
              )}
            >
              <Bookmark className={cn("w-3.5 h-3.5", savedOnly && "fill-current")} />
              {savedCount > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center font-mono text-[9px] rounded-full",
                  savedOnly
                    ? "bg-foreground text-background font-bold"
                    : "bg-primary text-primary-foreground font-semibold"
                )}>
                  {savedCount}
                </span>
              )}
            </button>

            {/* Hover Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center px-2 py-0.5 text-[11px] font-medium text-foreground bg-popover border border-border shadow-xs rounded-md whitespace-nowrap z-50">
              {savedOnly ? "Show all" : (savedCount > 0 ? `Saved (${savedCount})` : "Saved")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
