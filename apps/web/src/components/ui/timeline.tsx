"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  step: string;
  title: string;
  description: string;
  details?: string[];
  tag?: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* Connecting Vertical Line */}
      <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border/60 hidden md:block" />

      <div className="space-y-6 md:space-y-8">
        {steps.map((item, index) => {
          return (
            <div
              key={index}
              className="relative flex flex-col md:flex-row md:items-start gap-4 md:gap-6 group"
            >
              {/* Step Monospace Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded border border-border/80 bg-card flex items-center justify-center font-mono text-xs font-semibold text-foreground group-hover:border-foreground/40 transition-colors z-10 shadow-sm">
                  {item.step}
                </div>
                {/* Mobile Title preview inline with step if needed */}
                <div className="md:hidden flex-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{item.title}</span>
                  {item.tag && (
                    <span className="text-[10px] font-mono border border-border/60 bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground">
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 border border-border/60 bg-card/30 rounded p-4 sm:p-5 hover:border-border transition-colors">
                <div className="hidden md:flex items-center justify-between gap-4 mb-2">
                  <h4 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                    {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                    {item.title}
                  </h4>
                  {item.tag && (
                    <span className="text-[10px] font-mono border border-border/60 bg-secondary/50 px-2 py-0.5 rounded text-muted-foreground">
                      {item.tag}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {item.details && item.details.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap gap-2">
                    {item.details.map((detail, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        {detail}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
