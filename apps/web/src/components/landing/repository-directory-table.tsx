"use client";

import * as React from "react";
import { 
  Search, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight,
  GitPullRequest,
  CheckCircle2,
  FileCode2,
  Bookmark
} from "lucide-react";
import Link from "next/link";

interface DirectoryRow {
  id: string;
  repo: string;
  description: string;
  primaryLang: string;
  langBreakdown: string;
  langColor: string;
  topIssueNumber: number;
  topIssueTitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  diffBadge: string;
  matchScore: number;
  openIssuesCount: number;
  targetFiles: string;
}

const DIRECTORY_DATA: DirectoryRow[] = [
  {
    id: "hyperframes",
    repo: "heygen-com / hyperframes",
    description: "High-performance media canvas & frame composition toolkit",
    primaryLang: "TypeScript",
    langBreakdown: "TypeScript 86.4%, JS 13.6%",
    langColor: "#3178c6",
    topIssueNumber: 5389,
    topIssueTitle: "lint: add tests for three media rules that have none",
    difficulty: "Beginner",
    diffBadge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    matchScore: 92,
    openIssuesCount: 290,
    targetFiles: "packages/linter/rules/media-*.ts"
  },
  {
    id: "pdfcn",
    repo: "shadcn-labs / pdfcn",
    description: "Declarative PDF layout primitives built on React and Tailwind",
    primaryLang: "TypeScript",
    langBreakdown: "TypeScript 78.2%, CSS 21.8%",
    langColor: "#3178c6",
    topIssueNumber: 62,
    topIssueTitle: "block: Cover Letter layout and responsive typography scaling",
    difficulty: "Beginner",
    diffBadge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    matchScore: 88,
    openIssuesCount: 42,
    targetFiles: "packages/templates/src/cover-letter/*"
  },
  {
    id: "career-ops",
    repo: "career-ops-hq / career-ops",
    description: "Automated candidate evaluation and pipeline orchestration",
    primaryLang: "JavaScript",
    langBreakdown: "JavaScript 94.1%, Shell 5.9%",
    langColor: "#f1e05a",
    topIssueNumber: 5196,
    topIssueTitle: "Duplicated logic in pipeline-lock.mjs: sameLockDirectory",
    difficulty: "Intermediate",
    diffBadge: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    matchScore: 85,
    openIssuesCount: 114,
    targetFiles: "scripts/pipeline/pipeline-lock.mjs"
  },
  {
    id: "tabularis",
    repo: "TabularisDB / tabularis",
    description: "Lightweight embedded columnar analytics engine",
    primaryLang: "TypeScript",
    langBreakdown: "TypeScript 58.3%, C++ 41.7%",
    langColor: "#3178c6",
    topIssueNumber: 1095,
    topIssueTitle: "[Refactor]: Share one tested helper for 'is user typing' checks",
    difficulty: "Beginner",
    diffBadge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    matchScore: 78,
    openIssuesCount: 126,
    targetFiles: "src/ui/keyboard/shortcuts.ts"
  },
  {
    id: "open-notebook",
    repo: "1fnovo / open-notebook",
    description: "Collaborative interactive code notebook & execution server",
    primaryLang: "TypeScript",
    langBreakdown: "TypeScript 56.1%, JS 43.9%",
    langColor: "#3178c6",
    topIssueNumber: 1451,
    topIssueTitle: "Duplicate profile name returns 500 error instead of 409 Conflict",
    difficulty: "Beginner",
    diffBadge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    matchScore: 84,
    openIssuesCount: 88,
    targetFiles: "server/routes/profiles.ts"
  },
  {
    id: "repowise",
    repo: "repowise-dev / repowise",
    description: "Static code intelligence and AST relationship extractor",
    primaryLang: "Python",
    langBreakdown: "Python 91.5%, Rust 8.5%",
    langColor: "#3572A5",
    topIssueNumber: 3755,
    topIssueTitle: "Dart call chain of 3+ links drops links after second",
    difficulty: "Advanced",
    diffBadge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    matchScore: 68,
    openIssuesCount: 312,
    targetFiles: "repowise/parsers/dart/ast_visitor.py"
  }
];

export function RepositoryDirectoryTable() {
  const [activeLang, setActiveLang] = React.useState<string>("All");
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (activeLang === "All") return DIRECTORY_DATA;
    return DIRECTORY_DATA.filter(r => r.primaryLang.toLowerCase() === activeLang.toLowerCase());
  }, [activeLang]);

  return (
    <div className="w-full space-y-3 text-left">
      
      {/* Directory Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#222630]">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {["All", "TypeScript", "JavaScript", "Python"].map((lang) => {
            const isSelected = activeLang === lang;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  isSelected 
                    ? "bg-[#222630] text-white font-medium" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-[#161922]"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-zinc-500">
          Showing {filtered.length} indexed targets · 601 total repos
        </span>
      </div>

      {/* Structured Developer Data Table */}
      <div className="w-full border border-[#222630] bg-[#101216] rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-[#1D212A]">
          <thead className="bg-[#14171E] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4 font-medium">Repository</th>
              <th className="py-2.5 px-3 font-medium">Language Breakdown</th>
              <th className="py-2.5 px-4 font-medium">Target Issue</th>
              <th className="py-2.5 px-3 font-medium">Difficulty</th>
              <th className="py-2.5 px-3 font-medium">Match</th>
              <th className="py-2.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#181B22] text-zinc-300">
            {filtered.map((row) => {
              const isExpanded = expandedRow === row.id;

              return (
                <React.Fragment key={row.id}>
                  <tr 
                    onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                    className="hover:bg-[#151821] transition-colors cursor-pointer select-none"
                  >
                    {/* Repository Name & Description */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-white tracking-tight">
                        {row.repo}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-sans truncate max-w-xs">
                        {row.description}
                      </div>
                    </td>

                    {/* Language Breakdown */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.langColor }} />
                        <span className="text-zinc-300">{row.primaryLang}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {row.langBreakdown}
                      </div>
                    </td>

                    {/* Target Issue */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-white flex items-center gap-1.5 max-w-sm truncate">
                        <span className="text-zinc-500 font-mono text-[11px]">#{row.topIssueNumber}</span>
                        <span className="truncate">{row.topIssueTitle}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate">
                        {row.targetFiles}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${row.diffBadge}`}>
                        {row.difficulty}
                      </span>
                    </td>

                    {/* Match Score */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {row.matchScore}%
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/discover"
                        className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>

                  {/* Expanded Row Detail */}
                  {isExpanded && (
                    <tr className="bg-[#0C0E12] border-t border-b border-[#222630]">
                      <td colSpan={6} className="py-3 px-6 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>Subsystem Context: <strong className="text-white">{row.targetFiles}</strong></span>
                          <span>{row.openIssuesCount} total open issues in repo</span>
                        </div>
                        <div className="p-2.5 rounded bg-[#14171E] border border-[#222630] font-mono text-[11px] text-zinc-300 flex items-center justify-between">
                          <span>Investigation Checklist & Architecture Map available in StackAudit Discovery.</span>
                          <Link href="/discover" className="text-white font-semibold flex items-center gap-1 underline">
                            Open full issue analysis <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
