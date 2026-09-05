"use client";

import * as React from "react";
import { useState } from "react";
import { Lightbulb, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HintCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level1Hint?: string;
  level2Hint?: string;
}

export function HintCard({
  level1Hint,
  level2Hint,
  className,
  ...props
}: HintCardProps) {
  const [hintLevel, setHintLevel] = useState<number>(0);

  const hasLevel1 = Boolean(level1Hint && level1Hint.trim().length > 0);
  const hasLevel2 = Boolean(level2Hint && level2Hint.trim().length > 0);

  if (!hasLevel1 && !hasLevel2) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-xs space-y-3 transition-colors",
        className
      )}
      aria-label="Guidance Hints"
      {...props}
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contribution Hint
        </h2>
      </div>

      {hintLevel === 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Stuck on understanding this codebase or formulating a fix?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHintLevel(1)}
            className="w-full h-8 text-xs font-medium border-border"
          >
            Show conceptual hint
          </Button>
        </div>
      ) : hintLevel === 1 ? (
        <div className="space-y-2.5">
          <div className="p-2.5 rounded bg-secondary/40 border border-border/70 text-xs leading-relaxed text-foreground">
            <span className="font-semibold block mb-0.5 text-foreground/90">Hint 1 (Conceptual):</span>
            <p className="text-muted-foreground font-sans">{level1Hint}</p>
          </div>

          {hasLevel2 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHintLevel(2)}
              className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Still stuck? Show specific clue →
            </Button>
          ) : (
            <p className="text-[11px] text-muted-foreground italic text-center">
              No further hint available for this issue.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="p-2.5 rounded bg-secondary/40 border border-border/70 text-xs leading-relaxed text-foreground">
            <span className="font-semibold block mb-0.5 text-foreground/90">Hint 2 (Targeted):</span>
            <p className="text-muted-foreground font-sans">{level2Hint}</p>
          </div>
          <button
            type="button"
            onClick={() => setHintLevel(0)}
            className="text-[11px] text-muted-foreground hover:underline block text-center w-full"
          >
            Collapse hints
          </button>
        </div>
      )}
    </div>
  );
}
