"use client";

import * as React from "react";
import { 
  FileCode2, 
  Check, 
  ArrowRight, 
  Bookmark, 
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity
} from "lucide-react";
import Link from "next/link";

interface CandidateIssue {
  id: string;
  repo: string;
  number: number;
  title: string;
  lang: string;
  langShare: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  match: number;
  files: string[];
  signals: string[];
}

const CANDIDATES: CandidateIssue[] = [
  {
    id: "hyperframes-5389",
    repo: "heygen-com/hyperframes",
    number: 5389,
    title: "lint: add unit tests for media duration rules",
    lang: "TypeScript",
    langShare: "86% TS",
    difficulty: "Beginner",
    match: 92,
    files: ["packages/linter/src/rules/media.ts", "tests/rules/media.test.ts"],
    signals: ["Matches active language: TypeScript", "Isolated test fixture", "Active maintainer commits in last 48h"]
  },
  {
    id: "pdfcn-62",
    repo: "shadcn-labs/pdfcn",
    number: 62,
    title: "template: cover letter page margin scaling",
    lang: "TypeScript",
    langShare: "78% TS",
    difficulty: "Beginner",
    match: 88,
    files: ["packages/templates/cover-letter.tsx", "packages/templates/styles.css"],
    signals: ["React / Tailwind match", "Isolated template scope", "Component preview harness available"]
  },
  {
    id: "career-5196",
    repo: "career-ops-hq/career-ops",
    number: 5196,
    title: "pipeline: share lock directory resolver utility",
    lang: "JavaScript",
    langShare: "94% JS",
    difficulty: "Intermediate",
    match: 85,
    files: ["scripts/pipeline/lock.mjs", "packages/utils/fs-lock.js"],
    signals: ["Node.js runtime match", "Refactor cross-file helper", "Clear acceptance test"]
  },
  {
    id: "tabularis-1095",
    repo: "TabularisDB/tabularis",
    number: 1095,
    title: "shortcuts: share tested typing detection helper",
    lang: "TypeScript",
    langShare: "58% TS",
    difficulty: "Beginner",
    match: 78,
    files: ["src/ui/keyboard/shortcuts.ts", "tests/keyboard.spec.ts"],
    signals: ["Keyboard event handler scope", "Unit test harness exists", "DOM activeElement pattern"]
  }
];

export function SplitHeroWorkbench() {
  const [selectedId, setSelectedId] = React.useState<string>("hyperframes-5389");
  const [activeFilter, setActiveFilter] = React.useState<string>("All");
  const [saved, setSaved] = React.useState<Set<string>>(new Set(["hyperframes-5389"]));

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = React.useMemo(() => {
    if (activeFilter === "All") return CANDIDATES;
    return CANDIDATES.filter(c => c.lang.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter]);

  const active = CANDIDATES.find(c => c.id === selectedId) || CANDIDATES[0];

  return (
    <div className="w-full border border-[#272B35] bg-[#101216] rounded-lg overflow-hidden text-left font-sans text-xs">
      
      {/* Workbench Console Header */}
      <div className="h-9 px-3.5 border-b border-[#222630] bg-[#14171E] flex items-center justify-between text-zinc-400 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-300 font-semibold">MATCH EVALUATOR</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">repo_bytes_proportional</span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono">LIVE INDEX</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 border-b border-[#222630] bg-[#0E1014] flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 text-[11px]">
          {["All", "TypeScript", "JavaScript"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveFilter(t)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                activeFilter === t
                  ? "bg-[#222630] text-white font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
          Click an issue to evaluate context
        </span>
      </div>

      {/* Main Split Grid: Left Candidate Rows, Right Detail Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#222630]">
        
        {/* Left: Issue Candidates List (7 cols) */}
        <div className="md:col-span-7 divide-y divide-[#1D212A] bg-[#101216]">
          {filtered.map((item) => {
            const isSelected = item.id === selectedId;
            const isSaved = saved.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-3 transition-colors cursor-pointer select-none flex items-start justify-between gap-2.5 ${
                  isSelected ? "bg-[#161922]" : "hover:bg-[#13151D]"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-zinc-500 text-[10px]">#{item.number}</span>
                    <span className={`font-medium text-xs truncate ${isSelected ? "text-white" : "text-zinc-300"}`}>
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span className="text-zinc-400">{item.repo}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-zinc-500">{item.langShare}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span className="font-mono font-semibold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.match}%
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleSave(item.id, e)}
                    className="p-1 text-zinc-500 hover:text-zinc-300"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-400 text-emerald-400" : ""}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Active Candidate Inspection Drawer (5 cols) */}
        <div className="md:col-span-5 p-3.5 space-y-3 bg-[#0D0F13] text-[11px]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Issue Context
            </span>
            <div className="font-mono text-white text-xs font-semibold mt-0.5 truncate">
              {active.repo} #{active.number}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
              Difficulty: {active.difficulty} · Score: {active.match}/100
            </div>
          </div>

          {/* Signals */}
          <div className="space-y-1.5 pt-2 border-t border-[#1D212A]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Evaluation Signals
            </span>
            <div className="space-y-1">
              {active.signals.map((s, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-zinc-300 text-[10px]">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div className="space-y-1.5 pt-2 border-t border-[#1D212A]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Subsystem Target Files
            </span>
            <div className="space-y-1">
              {active.files.map((f, idx) => (
                <div key={idx} className="p-1.5 rounded bg-[#13151D] border border-[#222630] font-mono text-[10px] text-zinc-300 flex items-center gap-1.5 truncate">
                  <FileCode2 className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action */}
          <div className="pt-2">
            <Link
              href="/discover"
              className="w-full h-7 rounded bg-white text-black font-semibold text-[11px] flex items-center justify-center gap-1 hover:bg-zinc-200 transition-colors"
            >
              <span>Inspect in workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
