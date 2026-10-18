"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Cpu, 
  SlidersHorizontal, 
  Activity, 
  FileCode2, 
  ShieldCheck, 
  Check, 
  Terminal,
  Zap,
  GitCommit,
  GitBranch,
  SearchCheck,
  FolderTree
} from "lucide-react";

export function BentoCapabilities() {
  return (
    <div className="w-full space-y-6">
      {/* SECTION HEADER */}
      <div className="space-y-2 max-w-2xl text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          <span>ENGINEERING CAPABILITIES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Built for Software Engineers
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Not generic AI marketing cards. StackAudit is powered by deterministic repository intelligence built specifically to make open-source contributions predictable and successful.
        </p>
      </div>

      {/* ASYMMETRIC BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        
        {/* ── CARD 1: GITHUB STACK INGESTION (Large - 7 cols) ── */}
        <div className="md:col-span-7 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-border transition-all shadow-sm space-y-5">
          <div className="space-y-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block font-semibold">
              Zero Questionnaire Friction
            </span>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Authentic GitHub Footprint Ingestion
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              We don't make you fill out manual skill surveys. StackAudit ingests your public GitHub commits, repository byte distributions, and package imports to construct a verified technical profile.
            </p>
          </div>

          {/* Interactive Graphic: Ingestion Footprint */}
          <div className="p-4 rounded-xl bg-background/60 border border-border/70 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/50 pb-2">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                <span>Byte Distribution Analysis</span>
              </span>
              <span className="text-emerald-400 font-medium">99.4% Confidence</span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] mb-1 text-muted-foreground">
                  <span className="text-foreground">TypeScript / React</span>
                  <span>68.2%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "68.2%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1 text-muted-foreground">
                  <span className="text-foreground">Python / FastAPI</span>
                  <span>21.4%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "21.4%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1 text-muted-foreground">
                  <span className="text-foreground">Go / CLI Utilities</span>
                  <span>10.4%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "10.4%" }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              <span>Sync latency: ~3 seconds</span>
              <span className="text-emerald-400">✓ Up-to-date</span>
            </div>
          </div>
        </div>

        {/* ── CARD 2: DETERMINISTIC MATCHING (5 cols) ── */}
        <div className="md:col-span-5 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-border transition-all shadow-sm space-y-5">
          <div className="space-y-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block font-semibold">
              Mathematical Precision
            </span>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              6-Factor Deterministic Match
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No black-box hallucinations. StackAudit calculates a deterministic compatibility score with explainable reasoning for every issue.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 space-y-2 font-mono text-xs">
            <div className="text-[10px] text-muted-foreground uppercase pb-1 border-b border-border/50 flex justify-between">
              <span>Scoring Factors</span>
              <span className="text-emerald-400">Weight</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-foreground">
                <span>1. Language Alignment</span>
                <span className="text-muted-foreground">35%</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>2. Complexity & Difficulty Tier</span>
                <span className="text-muted-foreground">25%</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>3. Maintainer Responsiveness</span>
                <span className="text-muted-foreground">15%</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>4. File Scope & Modularity</span>
                <span className="text-muted-foreground">15%</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>5. Dependency Familiarity</span>
                <span className="text-muted-foreground">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: MAINTAINER VITALITY SCREEN (5 cols) ── */}
        <div className="md:col-span-5 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-border transition-all shadow-sm space-y-5">
          <div className="space-y-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block font-semibold">
              Time Protection
            </span>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Maintainer Vitality Guard
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Avoid pouring hours into PRs that sit unreviewed for months. We verify maintainer response times, PR merge frequency, and active branch cadence.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Active Health Verification</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">PASS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-card/60 border border-border/50">
                <span className="text-muted-foreground block">AVG RESPONSE</span>
                <span className="text-xs font-bold text-foreground">4.2 hours</span>
              </div>
              <div className="p-2 rounded bg-card/60 border border-border/50">
                <span className="text-muted-foreground block">PR MERGE RATE</span>
                <span className="text-xs font-bold text-emerald-400">86.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 4: TARGET FILE & AST LOCALIZATION (Large - 7 cols) ── */}
        <div className="md:col-span-7 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-border transition-all shadow-sm space-y-5">
          <div className="space-y-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block font-semibold">
              Zero Cold-Start Fatigue
            </span>
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              Target File & Module Localization
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Don't get lost in unfamiliar directories. StackAudit pinpoints the exact files and function definitions that need changes, alongside relevant test files to validate your solution.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1.5 border-b border-border/50">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <FileCode2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Extracted Code Scope</span>
              </span>
              <span>2 files · 64 lines affected</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/50">
                <span className="text-foreground truncate">src/middleware/rate-limiter.ts</span>
                <span className="text-[10px] text-sky-400 font-semibold uppercase">L42-L88</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/50">
                <span className="text-foreground truncate">tests/rate-limiter.test.ts</span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">L12-L30</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
