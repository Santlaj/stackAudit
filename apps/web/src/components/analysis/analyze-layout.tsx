import * as React from "react";
import { cn } from "@/lib/utils";

export interface AnalyzeLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  mainColumn: React.ReactNode;
  rightRail: React.ReactNode;
}

/**
 * 2-column responsive layout for the /analyze/[matchId] page.
 *
 * Enforces:
 * - Desktop: minmax(0, 1fr) 320px grid with 20px gap.
 * - Single natural document scroll (no nested scroll containers).
 * - Right rail is position: sticky with top: var(--sticky-offset, 84px).
 * - Mobile: single column stacking.
 */
export function AnalyzeLayout({
  mainColumn,
  rightRail,
  className,
  ...props
}: AnalyzeLayoutProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[1440px] mx-auto px-4 md:px-6 py-6",
        "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start",
        className
      )}
      {...props}
    >
      {/* Main Column: Natural document height, left-aligned */}
      <div className="flex flex-col gap-6 min-w-0 w-full">
        {mainColumn}
      </div>

      {/* Right Rail: Sticky to header offset, self-start, never an inner scroll container */}
      <aside 
        style={{ top: "var(--sticky-offset, 84px)" }}
        className="flex flex-col gap-5 w-full sticky self-start z-[var(--z-sticky-rail,40)]"
        aria-label="Repository and contribution environment rail"
      >
        {rightRail}
      </aside>
    </div>
  );
}
