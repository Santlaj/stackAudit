"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TechnologyStat } from "@/lib/api";
import { motion } from "motion/react";
import { ChevronDown, Check } from "lucide-react";

export interface TechnologyExplorerProps {
  technologies: TechnologyStat[];
  selectedTechnology: string;
  onSelectTechnology: (tech: string) => void;
  totalRepos: number;
  totalIssues: number;
  className?: string;
}

const PRIMARY_CHIPS = ["All", "TypeScript", "JavaScript", "Python", "React", "Node.js", "Go", "Rust"];

const TECH_COLORS: Record<string, string> = {
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

export function TechnologyExplorer({
  technologies,
  selectedTechnology,
  onSelectTechnology,
  totalRepos,
  totalIssues,
  className,
}: TechnologyExplorerProps) {
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  const overflowRef = React.useRef<HTMLDivElement>(null);

  // Close overflow on click outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Split into primary and overflow lists
  const techMap = React.useMemo(() => {
    const map = new Map<string, TechnologyStat>();
    for (const t of technologies) {
      map.set(t.name.toLowerCase(), t);
    }
    return map;
  }, [technologies]);

  const primaryList = React.useMemo(() => {
    return PRIMARY_CHIPS.map(name => {
      const stat = techMap.get(name.toLowerCase());
      return {
        name,
        repoCount: stat?.repoCount ?? (name === "All" ? totalRepos : 0),
        openIssueCount: stat?.openIssueCount ?? (name === "All" ? totalIssues : 0),
        matchedIssueCount: stat?.matchedIssueCount ?? 0,
      };
    });
  }, [techMap, totalRepos, totalIssues]);

  const overflowList = React.useMemo(() => {
    return technologies.filter(
      t => !PRIMARY_CHIPS.some(p => p.toLowerCase() === t.name.toLowerCase())
    );
  }, [technologies]);

  const isOverflowSelected = React.useMemo(() => {
    return overflowList.some(o => o.name.toLowerCase() === selectedTechnology.toLowerCase());
  }, [overflowList, selectedTechnology]);

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
        <span className="uppercase tracking-wider text-[11px] font-semibold text-foreground/80">
          Technologies
        </span>
        <span className="text-[11px] text-muted-foreground">
          {totalRepos} repositories · {totalIssues} open issues
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {primaryList.map((chip) => {
          const isSelected = selectedTechnology.toLowerCase() === chip.name.toLowerCase();
          const dotColor = TECH_COLORS[chip.name];

          return (
            <button
              key={chip.name}
              type="button"
              onClick={() => onSelectTechnology(chip.name)}
              className={cn(
                "relative inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm transition-colors font-medium border",
                isSelected
                  ? "bg-foreground text-background border-foreground shadow-xs font-semibold"
                  : "bg-card/70 text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="activeTechIndicator"
                  className="absolute inset-0 rounded-sm bg-foreground -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              {dotColor && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
              )}
              <span>{chip.name}</span>
              {chip.openIssueCount > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1 py-0.2 rounded-xs font-mono tracking-tight",
                    isSelected
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                  title={`${chip.repoCount} repos · ${chip.openIssueCount} open issues (${chip.matchedIssueCount} profile matches)`}
                >
                  {chip.openIssueCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Overflow Menu */}
        {overflowList.length > 0 && (
          <div className="relative" ref={overflowRef}>
            <button
              type="button"
              onClick={() => setOverflowOpen(prev => !prev)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors font-medium border",
                isOverflowSelected
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-card/70 text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span>
                {isOverflowSelected ? selectedTechnology : `+${overflowList.length} More`}
              </span>
              <ChevronDown className={cn("w-3 h-3 transition-transform", overflowOpen && "rotate-180")} />
            </button>

            {overflowOpen && (
              <div className="absolute left-0 mt-1 w-48 rounded-sm border border-border bg-popover shadow-md py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {overflowList.map((item) => {
                  const isItemActive = selectedTechnology.toLowerCase() === item.name.toLowerCase();
                  const dotColor = TECH_COLORS[item.name];

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        onSelectTechnology(item.name);
                        setOverflowOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors",
                        isItemActive
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {dotColor && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: dotColor }}
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                        <span>{item.openIssueCount}</span>
                        {isItemActive && <Check className="w-3 h-3 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
