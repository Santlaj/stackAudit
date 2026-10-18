"use client";

import * as React from "react";
import { 
  ChevronRight, 
  Search, 
  SlidersHorizontal, 
  Bookmark, 
  Calendar, 
  Flame, 
  Check, 
  ArrowRight,
  RotateCw,
} from "lucide-react";

export function RealDiscoverPreview() {
  const [checklist, setChecklist] = React.useState({
    understood: true,
    identified: true,
    planned: false,
  });

  return (
    <div className="w-full rounded-xl border border-[#2B303C] bg-[#0E1015] text-[#EDEDEE] shadow-2xl overflow-hidden font-sans select-none text-left">
      
      {/* ── BROWSER TITLEBAR ── */}
      <div className="h-10 px-4 border-b border-[#272B35] bg-[#14161B] flex items-center justify-between text-zinc-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E333F] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E333F] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E333F] inline-block" />
          <span className="ml-2 text-zinc-300 font-medium">app.stackaudit.com/discover</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-sans">Live Workspace</span>
        </div>
      </div>

      {/* ── WORKSPACE INTERACTION CANVAS ── */}
      <div className="p-5 sm:p-7 space-y-6 bg-[#0B0C0E]">
        
        {/* HEADER & TECHNOLOGIES FILTER BAR */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Discover Contributions</h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">Explore open-source repositories and issues matched to your developer profile.</p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              601 repositories · 1,377 open issues
            </span>
          </div>

          {/* Technology chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-white text-black font-semibold flex items-center gap-1.5 shrink-0">
              <span>All</span>
              <span className="text-[11px] bg-black/15 px-1.5 py-0.2 rounded-full font-mono font-bold">1,377</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#14161B] border border-[#2B303C] text-zinc-200 flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6]" />
              <span className="font-medium">TypeScript</span>
              <span className="text-[11px] text-zinc-400 font-mono">488</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#14161B] border border-[#2B303C] text-zinc-200 flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f1e05a]" />
              <span className="font-medium">JavaScript</span>
              <span className="text-[11px] text-zinc-400 font-mono">725</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#14161B] border border-[#2B303C] text-zinc-200 flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3572A5]" />
              <span className="font-medium">Python</span>
              <span className="text-[11px] text-zinc-400 font-mono">628</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#14161B] border border-[#2B303C] text-zinc-200 flex items-center gap-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#61dafb]" />
              <span className="font-medium">React</span>
              <span className="text-[11px] text-zinc-400 font-mono">56</span>
            </span>
            <span className="px-2.5 py-1.5 rounded-full bg-[#14161B] border border-[#2B303C] text-zinc-400 shrink-0 font-medium">
              +4 More
            </span>
          </div>

          {/* Sub-toolbar */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#222630]">
            <div className="flex items-center gap-2 pt-2">
              <span className="px-3.5 py-1 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-1.5">
                <span>Repositories</span>
                <span className="text-[11px] bg-black/15 px-1.5 py-0.2 rounded-full font-mono font-bold">53</span>
              </span>
              <span className="px-3.5 py-1 rounded-full bg-[#14161B] border border-[#2B303C] text-zinc-300 text-xs flex items-center gap-1.5 font-medium">
                <span>Issues</span>
                <span className="text-[11px] text-zinc-400 font-mono">150</span>
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3" />
                <div className="h-8 pl-8 pr-3 text-xs rounded-full bg-[#14161B] border border-[#2B303C] text-zinc-300 flex items-center w-36 sm:w-56 font-normal">
                  Search repositories...
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#14161B] border border-[#2B303C] flex items-center justify-center text-zinc-300">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#14161B] border border-[#2B303C] flex items-center justify-center text-zinc-300">
                <Bookmark className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── ASYMMETRIC WORKSPACE GRID (Left feed + Right Daily Challenge) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT: REPOSITORY FEED (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* ROW 1: EXPANDED REPO WITH MATCHED ISSUES */}
            <div className="border border-[#2B303C] rounded-xl bg-[#14161B] overflow-hidden">
              <div className="p-4 flex items-start sm:items-center justify-between gap-3 bg-[#1A1C22]/80 border-b border-[#272B35]">
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-white rotate-90 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white tracking-tight text-sm sm:text-base">lingdojo / kana-dojo</span>
                      <span className="text-xs text-emerald-400 font-mono">● Active</span>
                    </div>
                    <span className="text-xs text-zinc-300 flex items-center gap-1.5 mt-1 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6] inline-block" /> TypeScript
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block">
                    <span className="text-xs text-emerald-400 font-semibold block">7 Good first</span>
                    <span className="text-[11px] font-mono text-zinc-400">7 matched / 538 open</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                    94% MATCH
                  </span>
                </div>
              </div>

              {/* Nested Issues */}
              <div className="p-3.5 space-y-2.5 bg-[#0E1015]">
                {[
                  { num: 20, title: "vet: add a sec/git-force-push warning", tag: "Good first", score: "94%", signal: "Strong language match: TypeScript (95% of codebase)" },
                  { num: 22, title: "vet: add a sec/chmod-777 warning", tag: "Intermediate", score: "88%", signal: "Security lint rule · Requires AST visitor implementation" },
                  { num: 24, title: "vet: add SARIF output format (--format sarif)", tag: "Intermediate", score: "81%", signal: "CLI format serialization · Schema validation context" }
                ].map((item) => (
                  <div key={item.num} className="p-3 rounded-lg bg-[#14161B] border border-[#272B35] flex items-center justify-between gap-3 hover:border-zinc-500 transition-colors">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-400 font-semibold">#{item.num}</span>
                        <span className="font-medium text-white text-xs sm:text-sm truncate">{item.title}</span>
                      </div>
                      <span className="text-xs text-zinc-400 block truncate">✓ {item.signal}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                        {item.tag}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-300">{item.score}</span>
                      <span className="px-2.5 py-1 rounded bg-white text-black font-semibold text-xs inline-flex items-center gap-1 cursor-pointer hover:bg-zinc-200">
                        Explore →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2: COLLAPSED REPO */}
            <div className="border border-[#2B303C] rounded-xl bg-[#14161B] p-4 flex items-center justify-between gap-3 hover:border-zinc-500 transition-colors">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white tracking-tight text-sm sm:text-base">heygen-com / hyperframes</span>
                    <span className="text-xs text-emerald-400 font-mono">● Active</span>
                  </div>
                  <span className="text-xs text-zinc-300 flex items-center gap-1.5 mt-1 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6] inline-block" /> TypeScript
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-emerald-400 font-semibold block">1 Good first</span>
                  <span className="text-[11px] font-mono text-zinc-400">1 matched / 290 open</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                  86% MATCH
                </span>
              </div>
            </div>

            {/* ROW 3: COLLAPSED REPO */}
            <div className="border border-[#2B303C] rounded-xl bg-[#14161B] p-4 flex items-center justify-between gap-3 hover:border-zinc-500 transition-colors">
              <div className="flex items-center gap-3">
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white tracking-tight text-sm sm:text-base">TabularisDB / tabularis</span>
                    <span className="text-xs text-emerald-400 font-mono">● Active</span>
                  </div>
                  <span className="text-xs text-zinc-300 flex items-center gap-1.5 mt-1 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3178c6] inline-block" /> TypeScript
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-emerald-400 font-semibold block">3 Good first</span>
                  <span className="text-[11px] font-mono text-zinc-400">3 matched / 126 open</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                  78% MATCH
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: DAILY CHALLENGE & STREAK (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            
            {/* DAILY CHALLENGE CARD */}
            <div className="border border-[#2B303C] rounded-xl bg-[#14161B] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272B35]">
                <div className="flex items-center gap-2 font-semibold text-white text-sm">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Daily Challenge</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1C22] text-zinc-300 font-semibold">
                  Today
                </span>
              </div>

              <p className="text-xs text-zinc-300">One real issue to explore and investigate today.</p>

              <div className="p-3.5 rounded-lg bg-[#0E1015] border border-[#272B35] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="text-zinc-300 font-medium">1fnovo / open-notebook</span>
                  <span className="text-emerald-400 uppercase font-semibold">OPEN</span>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  #1451 Creating an episode or speaker profile with an existing name returns 500
                </h4>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-medium">Beginner</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-medium">TypeScript</span>
                  <span className="text-zinc-400 font-mono">~30m</span>
                </div>
              </div>

              {/* Why it matches */}
              <div className="p-3 rounded-lg bg-[#1A1C22] border border-[#272B35] text-xs text-zinc-200">
                <span className="font-semibold text-white block mb-1">Why it matches:</span>
                <span>Language match: TypeScript (56% of repo) · API route error handling.</span>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-9 rounded-lg bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-zinc-200 transition-colors">
                  <span>Explore in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="h-9 w-9 rounded-lg border border-[#2B303C] bg-[#14161B] text-zinc-300 flex items-center justify-center">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Investigation Checklist */}
              <div className="pt-3 border-t border-[#272B35] space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                  Investigation Checklist
                </span>
                <div className="space-y-1.5 text-xs text-zinc-200 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>I understand what the issue is asking for.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>I identified the relevant files or code area.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-400">
                    <span className="w-3.5 h-3.5 rounded-xs border border-zinc-600 inline-block shrink-0" />
                    <span>I know what I would investigate next.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STREAK WIDGET */}
            <div className="border border-[#2B303C] rounded-xl bg-[#14161B] p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span className="font-semibold text-white text-xs sm:text-sm">Challenge Streak</span>
              </div>
              <span className="font-mono font-bold text-xs sm:text-sm text-white">1 day streak</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

