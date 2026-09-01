// TODO: remove after homepage rewrite ships
"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  Inbox,
  Bookmark,
  Compass,
  CheckCircle2,
  Clock,
  ChevronDown,
  Filter,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Bell,
  Code2,
  ExternalLink,
  Cpu,
  GitPullRequest,
  Check,
} from "lucide-react";

export function ShowcaseScreen() {
  const [selectedIssueId, setSelectedIssueId] = useState<string>("1");

  return (
    <div className="w-full h-full bg-[#0b0c0e] text-[#e4e4e7] flex flex-col text-[11px] font-sans antialiased overflow-hidden select-none border border-[#27272a]/60">
      
      {/* Top Application Bar */}
      <div className="h-9 px-3 bg-[#111215] border-b border-[#222226] flex items-center justify-between shrink-0">
        {/* Left: Window Controls & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 border border-[#1aab29]/50" />
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#a1a1aa]">
            <span className="font-semibold text-foreground">StackAudit</span>
            <span className="text-[#52525b]">/</span>
            <span className="text-[#d4d4d8]">Contribution Intelligence</span>
          </div>
        </div>

        {/* Center/Right Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded text-[10px] text-[#a1a1aa]">
            <Search className="w-3 h-3 text-[#71717a]" />
            <span>Search or command...</span>
            <kbd className="text-[8px] bg-[#27272a] px-1 rounded text-[#a1a1aa] font-mono ml-2">⌘K</kbd>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>GitHub Live Sync</span>
          </div>
        </div>
      </div>

      {/* Main App Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden divide-x divide-[#222226]">
        
        {/* Left Navigation Sidebar */}
        <div className="w-44 bg-[#0e0e11] p-2.5 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="space-y-4">
            
            {/* Quick Action */}
            <div className="bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-foreground font-medium text-[10px] py-1 px-2 rounded flex items-center justify-between cursor-pointer transition-colors shadow-sm">
              <span className="flex items-center gap-1.5">
                <Plus className="w-3 h-3 text-emerald-400" /> New Search
              </span>
              <kbd className="text-[8px] text-[#71717a] font-mono">C</kbd>
            </div>

            {/* Main Nav Items */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#1f1f24] text-foreground font-medium text-[10px]">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Opportunities</span>
                <span className="ml-auto text-[9px] bg-[#2a2a32] px-1 rounded text-[#a1a1aa] font-mono">12</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-foreground hover:bg-[#18181b] text-[10px] cursor-pointer transition-colors">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Issues</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded text-[#a1a1aa] hover:text-foreground hover:bg-[#18181b] text-[10px] cursor-pointer transition-colors">
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Active PRs</span>
                <span className="ml-auto text-[9px] text-[#71717a] font-mono">2</span>
              </div>
            </div>

            {/* Developer Stack Footprint */}
            <div className="pt-2 border-t border-[#222226] space-y-1.5">
              <div className="text-[9px] uppercase tracking-wider font-bold text-[#71717a] px-1">
                Your Tech Footprint
              </div>
              <div className="space-y-1">
                {[
                  { name: "TypeScript", level: "94% Match" },
                  { name: "Rust", level: "88% Match" },
                  { name: "Go / Backend", level: "82% Match" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between px-1.5 py-0.5 text-[9.5px] text-[#a1a1aa]">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      {s.name}
                    </span>
                    <span className="text-[8px] font-mono text-emerald-400/80">{s.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Status */}
          <div className="pt-2 border-t border-[#222226] flex items-center gap-2 px-1">
            <div className="w-5 h-5 rounded-full bg-[#27272a] flex items-center justify-center font-bold text-[9px] text-foreground">
              SA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-medium text-foreground truncate">contributor.eth</span>
              <span className="text-[8px] text-[#71717a] truncate">Intermediate Tier</span>
            </div>
          </div>
        </div>

        {/* Center: Issue Stream Feed */}
        <div className="flex-1 bg-[#09090b] flex flex-col min-w-0 overflow-hidden">
          
          {/* Subheader / Filters */}
          <div className="h-8 px-3 border-b border-[#222226] flex items-center justify-between text-[10px] bg-[#0c0c0e]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1">
                Matched Feed <span className="text-[#71717a] font-normal">(4 actionable)</span>
              </span>
              <span className="h-3 w-[1px] bg-[#27272a]" />
              <button className="flex items-center gap-1 text-[#a1a1aa] hover:text-foreground px-1.5 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[9px]">
                <Filter className="w-2.5 h-2.5" /> Filter: Good First Issue
              </button>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-[#71717a]">
              <span>Sorted by: Compatibility Score</span>
            </div>
          </div>

          {/* Issue Stream List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e22]">
            
            {/* Section 1: In Progress / Recommended */}
            <div className="p-2 bg-[#0e0e11]/60 text-[9px] font-bold uppercase tracking-wider text-[#71717a] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> High-Compatibility Recommendations (3)
              </span>
            </div>

            {/* Row 1 */}
            <div
              onClick={() => setSelectedIssueId("1")}
              className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                selectedIssueId === "1" ? "bg-[#16161a] border-l-2 border-emerald-400" : "hover:bg-[#121215]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                <span className="font-mono text-[9px] text-[#71717a] shrink-0 font-semibold">NEXT-64102</span>
                <span className="text-[10px] font-medium text-foreground truncate">
                  Normalize symlinked module resolution in turbopack compiler
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 font-mono">
                  98% MATCH
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1c1c21] text-[#a1a1aa] border border-[#27272a]">
                  TypeScript
                </span>
                <span className="text-[8px] text-[#71717a] font-mono">2-4 hrs</span>
              </div>
            </div>

            {/* Row 2 */}
            <div
              onClick={() => setSelectedIssueId("2")}
              className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                selectedIssueId === "2" ? "bg-[#16161a] border-l-2 border-emerald-400" : "hover:bg-[#121215]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="font-mono text-[9px] text-[#71717a] shrink-0 font-semibold">TRPC-5320</span>
                <span className="text-[10px] font-medium text-foreground truncate">
                  Support batched schema coercion in HTTP link client adapter
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 font-mono">
                  94% MATCH
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1c1c21] text-[#a1a1aa] border border-[#27272a]">
                  Good First Issue
                </span>
                <span className="text-[8px] text-[#71717a] font-mono">1-2 hrs</span>
              </div>
            </div>

            {/* Row 3 */}
            <div
              onClick={() => setSelectedIssueId("3")}
              className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                selectedIssueId === "3" ? "bg-[#16161a] border-l-2 border-emerald-400" : "hover:bg-[#121215]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                <span className="font-mono text-[9px] text-[#71717a] shrink-0 font-semibold">PRISMA-228</span>
                <span className="text-[10px] font-medium text-foreground truncate">
                  Add connection retry telemetry hook for PostgreSQL driver adapters
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 font-mono">
                  89% MATCH
                </span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1c1c21] text-[#a1a1aa] border border-[#27272a]">
                  PostgreSQL
                </span>
                <span className="text-[8px] text-[#71717a] font-mono">3-5 hrs</span>
              </div>
            </div>

            {/* Section 2: Vetted Backlog */}
            <div className="p-2 bg-[#0e0e11]/60 text-[9px] font-bold uppercase tracking-wider text-[#71717a] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Additional Discovered Opportunities
              </span>
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 opacity-60">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                <span className="font-mono text-[9px] text-[#71717a] shrink-0 font-semibold">REACT-2819</span>
                <span className="text-[10px] font-medium text-foreground truncate">
                  Fix hydration mismatch warning formatting in nested suspense boundary
                </span>
              </div>
              <span className="text-[8px] text-[#71717a] font-mono">82% MATCH</span>
            </div>

          </div>
        </div>

        {/* Right: Contribution Intelligence Inspector */}
        <div className="w-56 bg-[#0c0c0f] p-3 flex flex-col justify-between shrink-0 overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#222226] pb-2">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#71717a]">
                Match Intelligence
              </span>
              <span className="text-[8px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1 rounded">
                VERIFIED
              </span>
            </div>

            <div className="space-y-2 text-[9px]">
              <div>
                <div className="text-[9px] font-semibold text-foreground mb-0.5 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-emerald-400" /> Why This Fits You
                </div>
                <p className="text-[#a1a1aa] leading-relaxed text-[8.5px]">
                  Your TypeScript AST knowledge matches the Turbopack path resolver module with zero complex dependencies.
                </p>
              </div>

              <div className="pt-2 border-t border-[#222226]">
                <div className="text-[9px] font-semibold text-foreground mb-1">
                  Target Files to Change
                </div>
                <div className="bg-[#141418] p-1.5 rounded border border-[#27272a] font-mono text-[8px] space-y-0.5">
                  <div className="text-foreground">packages/next/compiler.ts</div>
                  <div className="text-[#71717a]">packages/next/resolve.ts</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#222226]">
                <div className="text-[9px] font-semibold text-foreground mb-1">
                  PR Acceptance Velocity
                </div>
                <div className="flex items-center justify-between text-[8.5px] text-[#a1a1aa]">
                  <span>Maintainer Response</span>
                  <span className="text-emerald-400 font-mono font-semibold">&lt; 14 hours</span>
                </div>
                <div className="flex items-center justify-between text-[8.5px] text-[#a1a1aa] mt-0.5">
                  <span>PR Acceptance Rate</span>
                  <span className="text-emerald-400 font-mono font-semibold">91%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#222226]">
            <button className="w-full bg-foreground text-background font-semibold text-[9.5px] py-1.5 px-2 rounded text-center flex items-center justify-center gap-1 hover:bg-foreground/90 transition-colors shadow-sm">
              Explore Contribution <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
