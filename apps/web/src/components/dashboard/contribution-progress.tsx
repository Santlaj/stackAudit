"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ContributionProgress as ProgressData } from "@/lib/api";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

export interface ContributionProgressProps {
  progress: ProgressData | null;
  className?: string;
}

export function ContributionProgress({ progress, className }: ContributionProgressProps) {
  const max = Math.max(progress?.totalTracked || 1, 1);

  const tiers = [
    { label: "Explored", count: progress?.explored || 0, color: "bg-blue-500", text: "text-blue-500" },
    { label: "Started", count: progress?.started || 0, color: "bg-amber-500", text: "text-amber-500" },
    { label: "PR Submitted", count: progress?.prSubmitted || 0, color: "bg-purple-500", text: "text-purple-500" },
    { label: "Merged", count: progress?.merged || 0, color: "bg-emerald-500", text: "text-emerald-500" },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="font-semibold text-foreground tracking-tight flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Contribution Progress</span>
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">
          {progress?.totalTracked || 0} tracked
        </span>
      </div>

      <div className="space-y-2">
        {tiers.map((tier) => {
          const percent = Math.min(100, Math.round((tier.count / max) * 100));

          return (
            <div key={tier.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", tier.color)} />
                  <span className="text-muted-foreground">{tier.label}</span>
                </div>
                <span className="font-mono font-semibold text-foreground">
                  {tier.count}
                </span>
              </div>

              {/* Progress bar with smooth animated fill */}
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", tier.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${tier.count > 0 ? Math.max(percent, 8) : 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
