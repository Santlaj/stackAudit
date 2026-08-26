"use client";

import React from "react";
import { cn } from "@/lib/utils";

const CONTRIBUTION_TYPES = [
  "Bug Fix",
  "Feature",
  "Documentation",
  "Testing",
  "Performance",
  "Refactoring",
  "Developer Tooling",
];

interface ContributionTypeSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function ContributionTypeSelector({ selected, onChange }: ContributionTypeSelectorProps) {
  const toggleType = (type: string) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CONTRIBUTION_TYPES.map((type) => {
        const isSelected = selected.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-sm font-medium transition-colors border",
              isSelected 
                ? "bg-primary/10 text-primary border-primary/20" 
                : "bg-transparent text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground hover:border-border"
            )}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
