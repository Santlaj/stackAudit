"use client";

import React from "react";
import { cn } from "@/lib/utils";

const COMPLEXITIES = [
  "Beginner-friendly",
  "Intermediate",
  "Advanced",
];

interface ComplexitySelectorProps {
  selected: string;
  onChange: (selected: string) => void;
}

export function ComplexitySelector({ selected, onChange }: ComplexitySelectorProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-border p-1 bg-muted/20">
      {COMPLEXITIES.map((complexity) => {
        const isSelected = selected === complexity;
        return (
          <button
            key={complexity}
            type="button"
            onClick={() => onChange(complexity)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-sm transition-all",
              isSelected
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
            )}
          >
            {complexity}
          </button>
        );
      })}
    </div>
  );
}
