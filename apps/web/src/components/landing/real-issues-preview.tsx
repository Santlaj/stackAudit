"use client";

import * as React from "react";
import { Bookmark, ArrowRight } from "lucide-react";

interface IssueItem {
  id: string;
  repo: string;
  issueNumber: number;
  title: string;
  language: string;
  difficulty: "Good first" | "Intermediate" | "Advanced";
  matchScore: string;
  scoreColor: string;
  diffColor: string;
  reason: string;
}

const REAL_VERIFIED_ISSUES: IssueItem[] = [
  {
    id: "heygen-5389",
    repo: "heygen-com / hyperframes",
    issueNumber: 5389,
    title: "lint: add tests for three media rules that have none",
    language: "TypeScript",
    difficulty: "Good first",
    matchScore: "92%",
    scoreColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    diffColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    reason: "Direct language match (TypeScript 86% of repo) · Clear test fixtures provided · Isolated scope"
  },
  {
    id: "pdfcn-62",
    repo: "shadcn-labs / pdfcn",
    issueNumber: 62,
    title: "block: Cover Letter layout and responsive typography",
    language: "TypeScript",
    difficulty: "Good first",
    matchScore: "88%",
    scoreColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    diffColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    reason: "React / Tailwind / TypeScript · Component-level layout issue with isolated preview harness"
  },
  {
    id: "career-5196",
    repo: "career-ops-hq / career-ops",
    issueNumber: 5196,
    title: "Duplicated logic in pipeline-lock.mjs: sameLockDirectory",
    language: "JavaScript",
    difficulty: "Intermediate",
    matchScore: "85%",
    scoreColor: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    diffColor: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    reason: "JavaScript runtime match · Refactoring shared utility logic across 3 pipeline handler files"
  },
  {
    id: "tabularis-1095",
    repo: "TabularisDB / tabularis",
    issueNumber: 1095,
    title: "[Refactor]: Share one tested helper for 'is the user typing' checks",
    language: "TypeScript",
    difficulty: "Good first",
    matchScore: "78%",
    scoreColor: "text-zinc-300 bg-zinc-800/80 border-zinc-700",
    diffColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    reason: "TypeScript (58% of repo) · Keyboard shortcut event listener handling · Clear acceptance criteria"
  },
  {
    id: "repowise-3755",
    repo: "repowise-dev / repowise",
    issueNumber: 3755,
    title: "A Dart call chain of three or more links drops every link after the second",
    language: "Python",
    difficulty: "Advanced",
    matchScore: "68%",
    scoreColor: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    diffColor: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    reason: "Python AST parser · Recursive call chain AST traversal · Requires compiler/AST domain context"
  }
];

export function RealIssuesPreview() {
  return (
    <div className="w-full rounded-xl border border-[#2B303C] bg-[#0E1015] text-[#EDEDEE] shadow-xl overflow-hidden font-sans text-xs">
      <div className="h-10 px-4 sm:px-5 border-b border-[#272B35] bg-[#14161B] flex items-center justify-between text-zinc-300 font-mono text-xs">
        <span className="font-semibold text-white">Verified Matching Feed</span>
        <span className="text-zinc-400 text-xs">Deterministic scoring based on skills & repo signals</span>
      </div>

      <div className="p-4 sm:p-6 space-y-3 bg-[#0B0C0E]">
        {REAL_VERIFIED_ISSUES.map((issue) => (
          <div
            key={issue.id}
            className="p-4 rounded-xl border border-[#272B35] bg-[#14161B] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-500 transition-colors"
          >
            <div className="space-y-1.5 min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-zinc-400 text-xs font-semibold">#{issue.issueNumber}</span>
                <span className="font-semibold text-white text-xs sm:text-sm tracking-tight">
                  {issue.title}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-zinc-300 font-mono">{issue.repo}</span>
                <span>·</span>
                <span className="text-zinc-400">{issue.language}</span>
              </div>
              <p className="text-xs text-zinc-400">
                ✓ {issue.reason}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded border uppercase ${issue.diffColor}`}>
                {issue.difficulty}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${issue.scoreColor}`}>
                {issue.matchScore} MATCH
              </span>
              <div className="w-8 h-8 rounded border border-[#272B35] bg-[#1A1C22] text-zinc-300 flex items-center justify-center">
                <Bookmark className="w-3.5 h-3.5" />
              </div>
              <div className="h-8 px-3 rounded bg-white text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-zinc-200 transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

