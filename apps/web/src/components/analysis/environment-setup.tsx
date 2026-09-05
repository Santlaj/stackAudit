"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Terminal, AlertCircle, Info, Apple, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EnvironmentSetupProps extends React.HTMLAttributes<HTMLDivElement> {
  repositoryFullName: string;
}

export function EnvironmentSetup({
  repositoryFullName,
  className,
  ...props
}: EnvironmentSetupProps) {
  const [selectedOS, setSelectedOS] = useState<"unix" | "windows">("unix");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stackaudit-env-os");
      if (saved === "unix" || saved === "windows") {
        setSelectedOS(saved);
      }
    } catch (e) {
      console.warn("Could not read OS preference", e);
    }
  }, []);

  const handleSelectOS = (os: "unix" | "windows") => {
    setSelectedOS(os);
    try {
      localStorage.setItem("stackaudit-env-os", os);
    } catch (e) {
      console.warn("Could not persist OS preference", e);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-xs space-y-3.5 transition-colors",
        className
      )}
      aria-label="Environment Setup"
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Environment Setup
          </h2>
        </div>

        {/* OS Selector Toggle */}
        <div 
          role="radiogroup" 
          aria-label="Target Operating System"
          className="flex items-center rounded-md border border-border bg-secondary/40 p-0.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={selectedOS === "unix"}
            onClick={() => handleSelectOS("unix")}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded transition-colors flex items-center gap-1 outline-none",
              selectedOS === "unix"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Apple className="h-2.5 w-2.5" />
            <span>macOS / Linux</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selectedOS === "windows"}
            onClick={() => handleSelectOS("windows")}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded transition-colors flex items-center gap-1 outline-none",
              selectedOS === "windows"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="h-2.5 w-2.5" />
            <span>Windows</span>
          </button>
        </div>
      </div>

      {/* Honest Empty / Unscanned State per Gap 1 Resolution */}
      <div className="p-3 rounded-md bg-secondary/30 border border-border/70 space-y-2">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Setup instructions have not yet been extracted for this repository.
          </p>
        </div>

        {/* Readiness Checklist */}
        <div className="pt-2 border-t border-border/50 space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Runtime detection</span>
            <span className="font-mono text-[10px] text-muted-foreground/70">Not specified</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Package manager</span>
            <span className="font-mono text-[10px] text-muted-foreground/70">Not detected</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Dev command</span>
            <span className="font-mono text-[10px] text-muted-foreground/70">Not available</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Environment variables</span>
            <span className="font-mono text-[10px] text-muted-foreground/70">Not scanned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
