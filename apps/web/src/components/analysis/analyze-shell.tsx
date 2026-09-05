import * as React from "react";
import { cn } from "@/lib/utils";

export interface AnalyzeShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Natural document scroll shell for the /analyze/[matchId] workspace.
 * Replaces the legacy h-screen + overflow-hidden root to enforce a single document scroll.
 */
export function AnalyzeShell({ className, children, ...props }: AnalyzeShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background text-foreground flex flex-col font-sans selection:bg-secondary selection:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
