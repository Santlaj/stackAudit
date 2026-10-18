"use client";

import * as React from "react";
import { 
  Search, 
  Bookmark, 
  Calendar, 
  Flame, 
  Check, 
  ArrowRight,
  RotateCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileCode2,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles
} from "lucide-react";
import Link from "next/link";

interface IssueData {
  id: string;
  repo: string;
  issueNumber: number;
  title: string;
  language: string;
  difficulty: "Good first" | "Intermediate" | "Advanced";
  matchScore: number;
  diffColor: string;
  scoreColor: string;
  reasons: string[];
  relevantFiles: string[];
  summary: string;
}

const SAMPLE_ISSUES: IssueData[] = [
  {
    id: "hyperframes-5389",
    repo: "heygen-com / hyperframes",
    issueNumber: 5389,
    title: "lint: add tests for three media rules that currently have none",
    language: "TypeScript",
    difficulty: "Good first",
    matchScore: 92,
    diffColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    scoreColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    reasons: [
      "Strong language match: TypeScript represents 86% of repository codebase",
      "Good first issue with existing test runner fixtures in tests/rules/",
      "Isolated scope: touches linter rule assertions without core runtime changes"
    ],
    relevantFiles: [
      "packages/linter/src/rules/media-audio.ts",
      "packages/linter/src/rules/media-video.ts",
      "packages/linter/tests/rules/media.test.ts"
    ],
    summary: "Create unit test fixtures for media validation rules following the existing rule testing harness."
  },
  {
    id: "pdfcn-62",
    repo: "shadcn-labs / pdfcn",
    issueNumber: 62,
    title: "block: Cover Letter layout and responsive typography scaling",
    language: "TypeScript",
    difficulty: "Good first",
    matchScore: 88,
    diffColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    scoreColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    reasons: [
      "Technology match: React, Tailwind CSS, and TypeScript",
      "Component-level styling and pagination margin handling",
      "Preview harness available in examples/storybook"
    ],
    relevantFiles: [
      "packages/templates/src/cover-letter/index.tsx",
      "packages/templates/src/cover-letter/styles.css"
    ],
    summary: "Implement responsive typography scaling and page margins for PDF export in the cover letter template."
  },
  {
    id: "career-5196",
    repo: "career-ops-hq / career-ops",
    issueNumber: 5196,
    title: "Duplicated logic in pipeline-lock.mjs: sameLockDirectory",
    language: "JavaScript",
    difficulty: "Intermediate",
    matchScore: 85,
    diffColor: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    scoreColor: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    reasons: [
      "Node.js runtime match: JavaScript pipeline utilities",
      "Refactoring utility helper across 3 pipeline synchronization handlers",
      "Clear acceptance criteria: extract sameLockDirectory to shared utility"
    ],
    relevantFiles: [
      "scripts/pipeline/pipeline-lock.mjs",
      "scripts/pipeline/release-lock.mjs",
      "packages/utils/src/fs-lock.js"
    ],
    summary: "Extract redundant lock directory path validation into a single tested utility module."
  },
  {
    id: "tabularis-1095",
    repo: "TabularisDB / tabularis",
    issueNumber: 1095,
    title: "[Refactor]: Share one tested helper for 'is the user typing' checks",
    language: "TypeScript",
    difficulty: "Good first",
    matchScore: 78,
    diffColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    scoreColor: "text-zinc-300 bg-zinc-800/80 border-zinc-700",
    reasons: [
      "TypeScript codebase: matches DOM event handler patterns",
      "Keyboard shortcut prevention when active in inputs/textareas/contenteditable",
      "Unit test fixture exists in tests/keyboard.spec.ts"
    ],
    relevantFiles: [
      "src/ui/keyboard/shortcuts.ts",
      "src/ui/dom/active-element.ts"
    ],
    summary: "Centralize input focus detection so keyboard shortcuts do not trigger while a developer is typing."
  },
  {
    id: "repowise-3755",
    repo: "repowise-dev / repowise",
    issueNumber: 3755,
    title: "A Dart call chain of three or more links drops every link after the second",
    language: "Python",
    difficulty: "Advanced",
    matchScore: 68,
    diffColor: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    scoreColor: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    reasons: [
      "Python AST parsing and compiler traversal",
      "Recursive AST visitor handles 2 call links but drops deeper chaintrees",
      "High complexity: requires AST grammar knowledge"
    ],
    relevantFiles: [
      "repowise/parsers/dart/ast_visitor.py",
      "tests/parsers/test_dart_chains.py"
    ],
    summary: "Fix recursive call chain node collector to preserve arbitrary method chaining depth."
  }
];

export function InteractiveWorkspace() {
  const [activeTab, setActiveTab] = React.useState<"feed" | "challenge" | "context">("feed");
  const [selectedTech, setSelectedTech] = React.useState<string>("All");
  const [expandedIssueId, setExpandedIssueId] = React.useState<string | null>("hyperframes-5389");
  const [savedIssues, setSavedIssues] = React.useState<Set<string>>(new Set(["hyperframes-5389"]));
  
  // Daily Challenge checklist state
  const [checklist, setChecklist] = React.useState({
    understood: true,
    identified: true,
    planned: false,
  });

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIssues(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredIssues = React.useMemo(() => {
    if (selectedTech === "All") return SAMPLE_ISSUES;
    return SAMPLE_ISSUES.filter(issue => 
      issue.language.toLowerCase() === selectedTech.toLowerCase() ||
      (selectedTech === "React" && (issue.title.toLowerCase().includes("block") || issue.repo.includes("pdfcn")))
    );
  }, [selectedTech]);

  const activeIssue = SAMPLE_ISSUES.find(i => i.id === expandedIssueId) || SAMPLE_ISSUES[0];

  return (
    <div className="w-full rounded-2xl border border-[#2B303C] bg-[#0E1015] shadow-2xl overflow-hidden font-sans text-left">
      
      {/* ── 1. SLEEK APP WINDOW HEADER ── */}
      <div className="h-11 px-4 sm:px-6 border-b border-[#242833] bg-[#14161C] flex items-center justify-between">
        
        {/* Left: Window controls & URL */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2A2E39] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2A2E39] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2A2E39] inline-block" />
          </div>
          <div className="h-6 px-3 rounded-md bg-[#0E1015] border border-[#242833] text-zinc-300 font-mono text-[11px] sm:text-xs flex items-center gap-2">
            <span className="text-zinc-500 font-sans">https://</span>
            <span className="text-zinc-200">stackaudit.com/discover</span>
          </div>
        </div>

        {/* Right: Interactive Tab Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0E1015] border border-[#242833]">
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "feed" 
                ? "bg-[#1E222B] text-white font-semibold" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Matched Feed
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("challenge")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "challenge" 
                ? "bg-[#1E222B] text-white font-semibold" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Daily Challenge</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("context")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer hidden sm:block ${
              activeTab === "context" 
                ? "bg-[#1E222B] text-white font-semibold" 
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Code Context
          </button>
        </div>
      </div>

      {/* ── 2. TAB 1: MATCHED FEED VIEW ── */}
      {activeTab === "feed" && (
        <div className="p-5 sm:p-7 space-y-6 bg-[#0B0C0E]">
          
          {/* Subheader & Technology Filter Chips */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Opportunities Matched To Your Profile</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    100% Deterministic
                  </span>
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Click any issue below to inspect language breakdown, required files, and matching signals.
                </p>
              </div>

              {/* Saved count badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">
                  {savedIssues.size} saved for later
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {["All", "TypeScript", "JavaScript", "Python", "React"].map((tech) => {
                const isSelected = selectedTech === tech;
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => setSelectedTech(tech)}
                    className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-white text-black font-semibold shadow-xs"
                        : "bg-[#14161B] border border-[#2B303C] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <span>{tech}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issue Rows */}
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const isExpanded = expandedIssueId === issue.id;
              const isSaved = savedIssues.has(issue.id);

              return (
                <div
                  key={issue.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? "border-[#3E4554] bg-[#14161C] shadow-lg" 
                      : "border-[#242833] bg-[#111317] hover:border-[#323745]"
                  }`}
                >
                  {/* Issue Main Row Bar */}
                  <div 
                    onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-zinc-400 text-xs font-semibold">
                          #{issue.issueNumber}
                        </span>
                        <h4 className="font-semibold text-white text-sm sm:text-base tracking-tight hover:text-zinc-200">
                          {issue.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                        <span className="text-zinc-200 font-mono font-medium">{issue.repo}</span>
                        <span>·</span>
                        <span className="text-zinc-400">{issue.language}</span>
                        <span>·</span>
                        <span className="text-zinc-400 hidden sm:inline">{issue.summary}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded border uppercase ${issue.diffColor}`}>
                        {issue.difficulty}
                      </span>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${issue.scoreColor}`}>
                        {issue.matchScore}% MATCH
                      </span>
                      
                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleSave(issue.id, e)}
                        title={isSaved ? "Saved" : "Save issue"}
                        className={`w-8 h-8 rounded border transition-colors flex items-center justify-center cursor-pointer ${
                          isSaved 
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" 
                            : "border-[#2B303C] bg-[#1A1C22] text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-emerald-400" : ""}`} />
                      </button>

                      {/* Expand Chevron */}
                      <div className="text-zinc-400 pl-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-[#242833] bg-[#0E1015] space-y-4 text-xs">
                      
                      {/* Signals & Why It Matches */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                          Verified Matching Signals
                        </span>
                        <div className="space-y-1.5">
                          {issue.reasons.map((r, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-zinc-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Relevant Codebase Files */}
                      <div className="space-y-2 pt-2 border-t border-[#20242E]">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                          Relevant Code Files To Investigate
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {issue.relevantFiles.map((file, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-[#14161B] border border-[#272B35] text-zinc-300 font-mono text-[11px] flex items-center gap-2">
                              <FileCode2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-zinc-400 text-xs">
                          Complete context available in StackAudit workspace.
                        </span>
                        <Link
                          href="/discover"
                          className="h-8 px-3.5 rounded-lg bg-white text-black font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-zinc-200 transition-colors"
                        >
                          <span>Explore in Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ── 3. TAB 2: DAILY CHALLENGE VIEW ── */}
      {activeTab === "challenge" && (
        <div className="p-5 sm:p-7 space-y-6 bg-[#0B0C0E]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242833] pb-4">
            <div>
              <div className="flex items-center gap-2 font-semibold text-white text-base">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Today&apos;s Contribution Challenge</span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Investigate one targeted open-source issue per day to build sustainable contribution momentum.
              </p>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14161C] border border-[#2B303C]">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span className="font-semibold text-white text-xs sm:text-sm">
                {checklist.understood && checklist.identified && checklist.planned ? "2 Day Streak" : "1 Day Streak"}
              </span>
            </div>
          </div>

          {/* Curated Daily Issue Card */}
          <div className="p-5 rounded-xl border border-[#2B303C] bg-[#14161C] space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 font-semibold">1fnovo / open-notebook</span>
              <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                ACTIVE ISSUE
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              #1451 Creating an episode or speaker profile with an existing duplicate name returns 500 error
            </h4>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              When a user submits a profile creation payload with a duplicate name, the database uniqueness constraint throws an unhandled exception instead of returning a 409 Conflict with descriptive validation error JSON.
            </p>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 font-medium">Beginner</span>
              <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 font-medium">TypeScript</span>
              <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 font-medium">Express / API</span>
              <span className="text-zinc-400 font-mono">~30 min investigation</span>
            </div>

            {/* Interactive Checklist */}
            <div className="pt-4 border-t border-[#242833] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  3-Step Investigation Checklist (Click to complete)
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {Object.values(checklist).filter(Boolean).length} of 3 completed
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-200">
                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, understood: !prev.understood }))}
                  className="w-full p-2.5 rounded-lg bg-[#0E1015] border border-[#242833] flex items-center gap-3 text-left hover:border-zinc-500 transition-colors cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    checklist.understood ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-600"
                  }`}>
                    {checklist.understood && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={checklist.understood ? "text-zinc-200" : "text-zinc-400"}>
                    1. I understand what the issue is asking for (handle unique constraint duplicate conflict).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, identified: !prev.identified }))}
                  className="w-full p-2.5 rounded-lg bg-[#0E1015] border border-[#242833] flex items-center gap-3 text-left hover:border-zinc-500 transition-colors cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    checklist.identified ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-600"
                  }`}>
                    {checklist.identified && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={checklist.identified ? "text-zinc-200" : "text-zinc-400"}>
                    2. I identified the relevant files (server/routes/profiles.ts & middleware/errorHandler.ts).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setChecklist(prev => ({ ...prev, planned: !prev.planned }))}
                  className="w-full p-2.5 rounded-lg bg-[#0E1015] border border-[#242833] flex items-center gap-3 text-left hover:border-zinc-500 transition-colors cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    checklist.planned ? "bg-emerald-500 border-emerald-500 text-black" : "border-zinc-600"
                  }`}>
                    {checklist.planned && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={checklist.planned ? "text-zinc-200" : "text-zinc-400"}>
                    3. I planned my implementation approach (catch Prisma P2002 error code and return HTTP 409).
                  </span>
                </button>
              </div>

              {checklist.understood && checklist.identified && checklist.planned && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                  <span>🎉 Daily investigation completed! Your challenge streak is active.</span>
                  <Link href="/discover" className="font-semibold underline ml-2">
                    Open in workspace
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ── 4. TAB 3: CODE CONTEXT PREVIEW ── */}
      {activeTab === "context" && (
        <div className="p-5 sm:p-7 space-y-5 bg-[#0B0C0E]">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white tracking-tight">
              Architectural Context Before Contributing
            </h4>
            <p className="text-xs text-zinc-300">
              StackAudit identifies the subsystem structure and existing patterns so you contribute with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-[#242833] bg-[#14161C] space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">01 Subsystem</span>
              <h5 className="font-semibold text-white">Rule Evaluation Engine</h5>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Rules are evaluated using an AST visitor tree. Tests execute mock AST nodes using the project's internal test harness.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#242833] bg-[#14161C] space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">02 Test Harness</span>
              <h5 className="font-semibold text-white">Vitest + RuleTester</h5>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Valid and invalid rule cases are defined with code snippets and expected diagnostic error messages.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#242833] bg-[#14161C] space-y-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold block">03 Contribution Path</span>
              <h5 className="font-semibold text-white">Isolated PR Target</h5>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                No core compiler changes required. Simply add assertions to existing media test suites and run pnpm test.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
