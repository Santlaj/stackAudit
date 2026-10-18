"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Bookmark,
  FolderGit2,
  Settings,
  Search,
  FileCode2,
  Play,
  FileText,
  BookOpen
} from "lucide-react";

interface IssueItem {
  id: string;
  repo: string;
  number: number;
  title: string;
  matchScore: number;
  tags: { label: string; color: "blue" | "green" | "purple" | "rose" | "neutral" | "amber" }[];
  summary: string;
  files: string[];
}

const SAMPLE_ISSUES: IssueItem[] = [
  {
    id: "next-4812",
    repo: "vercel / next.js",
    number: 4812,
    title: "Improve error messaging for nested input routers",
    matchScore: 92,
    tags: [
      { label: "TypeScript", color: "blue" },
      { label: "Good first issue", color: "green" },
    ],
    summary:
      "Currently, when server-rendered timestamps mismatch during hydration, the error message is unclear and can be confusing for developers. This issue proposes a more descriptive error message with actionable guidance.",
    files: [
      "packages/next/src/client/hydration.ts",
      "packages/next/src/shared/timestamps.ts",
    ],
  },
  {
    id: "shadcn-2921",
    repo: "shadcn-ui / ui",
    number: 2921,
    title: "Add support for custom variant resolvers",
    matchScore: 88,
    tags: [
      { label: "TypeScript", color: "blue" },
      { label: "Enhancement", color: "blue" },
    ],
    summary:
      "Allow consumers to define compound variant handlers without overriding standard Tailwind preset tokens.",
    files: [
      "packages/cli/src/utils/get-theme.ts",
      "apps/www/registry/default/ui/button.tsx",
    ],
  },
  {
    id: "supabase-2156",
    repo: "supabase / supabase",
    number: 2156,
    title: "Clarify RLS documentation with examples",
    matchScore: 85,
    tags: [
      { label: "TypeScript", color: "blue" },
      { label: "Documentation", color: "amber" },
    ],
    summary:
      "Expand reference guide on PostgreSQL JSONB operators inside Row Level Security expressions with working SQL examples.",
    files: [
      "apps/docs/pages/guides/auth/row-level-security.mdx",
      "apps/docs/components/CustomCodeBlock.tsx",
    ],
  },
  {
    id: "react-30923",
    repo: "facebook / react",
    number: 30923,
    title: "Fix useTransition type inference edge case",
    matchScore: 78,
    tags: [
      { label: "TypeScript", color: "blue" },
      { label: "Bug", color: "rose" },
    ],
    summary:
      "TypeScript 5.8 reports union incompatibility when startTransition wraps async handlers returning void vs Promise<void>.",
    files: [
      "packages/react/src/ReactTransition.js",
      "packages/react/index.d.ts",
    ],
  },
];

import { InteractiveCanvasGrid } from "./interactive-canvas-grid";

export function EditorialHero() {
  const heroRef = React.useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = React.useState(false);

  const [selectedTag, setSelectedTag] = React.useState("All");
  const [selectedIssueId, setSelectedIssueId] = React.useState("next-4812");
  const [activeTab, setActiveTab] = React.useState<"Overview" | "Code context" | "Files" | "Discussion">("Overview");

  const selectedIssue = SAMPLE_ISSUES.find((i) => i.id === selectedIssueId) || SAMPLE_ISSUES[0];

  const filteredIssues = React.useMemo(() => {
    if (selectedTag === "All") return SAMPLE_ISSUES;
    return SAMPLE_ISSUES.filter(
      (issue) =>
        issue.tags.some((t) => t.label.toLowerCase() === selectedTag.toLowerCase()) ||
        issue.repo.toLowerCase().includes(selectedTag.toLowerCase())
    );
  }, [selectedTag]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Restrained 3D perspective tilt calculation
  const tiltX = isHovered && mousePos.x > 0 ? ((mousePos.y - 300) / 300) * -1.8 : 0;
  const tiltY = isHovered && mousePos.x > 0 ? ((mousePos.x - 700) / 700) * 1.8 : 0;

  return (
    <section
      id="product"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden bg-[#FAFAF9] pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-neutral-200/70 cursor-default select-none"
    >
      {/* Interactive Canvas Grid (Cursor tracking, laser crosshairs, glowing intersection nodes & click ripples) */}
      <InteractiveCanvasGrid />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* ── TOP HERO ROW: 2-Column Split (Left Copy, Right macOS Window) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                FIND . UNDERSTAND . CONTRIBUTE
              </span>
            </div>

            {/* Headline matching Reference 1 */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-normal leading-[1.08] tracking-tight text-neutral-900">
              Open-source<br />
              issues, matched to<br />
              <span className="text-neutral-700 italic">your actual code.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg font-normal leading-relaxed text-neutral-600 max-w-xl">
              StackAudit analyzes real GitHub repositories, understands your tech stack and code context,
              and helps you find high-signal issues you can contribute to.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/discover"
                className="group inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.99]"
              >
                <span>Explore issues</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-2xs transition-colors hover:bg-neutral-50 active:scale-[0.99]"
              >
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-white">
                  <Play className="h-2 w-2 fill-current translate-x-px" />
                </div>
                <span>See how it works</span>
              </a>
            </div>
          </div>

          {/* Right Column (7 Cols): Authentic High-Fidelity macOS Window matching Reference 1 */}
          <div className="lg:col-span-7 relative flex flex-col">
            {/* Top annotation callout matching reference image exactly */}
            <div className="hidden sm:flex items-end justify-end pr-12 mb-1.5">
              <div className="relative flex items-center gap-2.5">
                {/* Curved arrow curving over and pointing down into the window top edge */}
                <svg
                  className="w-7 h-9 text-slate-400 stroke-current -mb-1"
                  viewBox="0 0 28 36"
                  fill="none"
                >
                  <path
                    d="M26 3 C 8 3, 5 16, 5 30"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M1 26 L 5 31 L 9 26"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Two-line monospace text */}
                <div className="font-mono text-[11px] text-slate-500 leading-[1.3] select-none">
                  <div>Real repository context</div>
                  <div>before you write code.</div>
                </div>
              </div>
            </div>

            {/* macOS Application Preview Window with interactive 3D perspective tilt */}
            <div
              className="rounded-2xl border border-neutral-200/90 bg-white shadow-2xl shadow-neutral-900/8 overflow-hidden transition-transform duration-200 ease-out will-change-transform"
              style={{
                transform: `perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
              }}
            >
              {/* Window Chrome Header */}
              <div className="flex h-10 items-center justify-between border-b border-neutral-200 bg-[#FBFBFB] px-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                  <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
                </div>

                <div className="flex items-center gap-2">
                  <img src="/icon.png" alt="StackAudit" className="h-4 w-4 object-contain" />
                  <span className="text-xs font-semibold text-neutral-800">StackAudit</span>
                </div>

                <div className="w-12 text-right">
                  <span className="font-mono text-[10px] text-neutral-400">v1.0</span>
                </div>
              </div>

              {/* Window Body: 3 Panes exactly matching Reference 1 */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
                {/* 1. Left Sidebar Navigation (2.5 cols) */}
                <div className="hidden md:flex md:col-span-3 flex-col border-r border-neutral-200 bg-[#FAFAF9] p-3 text-xs">
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-lg bg-neutral-200/80 px-2.5 py-1.5 font-semibold text-neutral-900 text-xs shadow-2xs"
                    >
                      <Compass className="h-4 w-4 text-neutral-800" />
                      <span>Discover</span>
                    </button>
                    <Link
                      href="/discover"
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors text-xs"
                    >
                      <FolderGit2 className="h-4 w-4" />
                      <span>Repositories</span>
                    </Link>
                    <Link
                      href="/saved"
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors text-xs"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Saved</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors text-xs"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </div>
                </div>

                {/* 2. Middle Discover Feed (5.5 cols) */}
                <div className="md:col-span-5 flex flex-col border-r border-neutral-200 bg-white p-3.5 sm:p-4">
                  {/* Title & Filter Pills */}
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                      Discover Issues
                    </h3>

                    {/* Filter Pills */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {["All", "TypeScript", "JavaScript", "Python", "React", "Next.js"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTag(tag)}
                          className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                            selectedTag === tag
                              ? "bg-neutral-900 text-white"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative mt-2.5">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                      <div className="flex h-8 w-full items-center justify-between rounded-lg border border-neutral-200 bg-[#FAFAF9] pl-8 pr-2.5 text-[11px] text-neutral-400">
                        <span className="truncate">Search repositories, issues, or technologies...</span>
                        <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-neutral-500 shadow-2xs">
                          ⌘K
                        </kbd>
                      </div>
                    </div>
                  </div>

                  {/* Issue List Cards */}
                  <div className="mt-3 space-y-2 overflow-y-auto max-h-[350px] pr-1">
                    {filteredIssues.map((issue) => {
                      const isSelected = issue.id === selectedIssueId;
                      return (
                        <button
                          key={issue.id}
                          type="button"
                          onClick={() => setSelectedIssueId(issue.id)}
                          className={`w-full text-left rounded-xl border p-3 transition-all cursor-pointer ${
                            isSelected
                              ? "border-neutral-900 bg-neutral-50/70 shadow-2xs"
                              : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {/* Logo Icons */}
                              {issue.repo.includes("next.js") && (
                                <svg className="h-3.5 w-3.5 fill-current text-neutral-900" viewBox="0 0 24 24">
                                  <path d="M24 22.525H0l12-21.05 12 21.05z" />
                                </svg>
                              )}
                              {issue.repo.includes("shadcn") && (
                                <div className="h-3.5 w-3.5 rounded bg-neutral-900 flex items-center justify-center text-[8px] text-white font-bold">
                                  S
                                </div>
                              )}
                              {issue.repo.includes("supabase") && (
                                <svg className="h-3.5 w-3.5 text-emerald-500 fill-current" viewBox="0 0 24 24">
                                  <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.195.275a.396.396 0 0 0 .32.624H12v8.958a.396.396 0 0 0 .716.233l9.081-12.261.195-.275a.396.396 0 0 0-.32-.624h-.31z" />
                                </svg>
                              )}
                              {issue.repo.includes("react") && (
                                <svg className="h-3.5 w-3.5 text-blue-500 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                                  <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
                                  <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" />
                                  <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" />
                                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                </svg>
                              )}
                              <span className="text-xs font-semibold text-neutral-900">{issue.repo}</span>
                            </div>
                            <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
                              {issue.matchScore}% match
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] font-medium text-neutral-800 line-clamp-1">
                            #{issue.number} {issue.title}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {issue.tags.map((t) => (
                              <span
                                key={t.label}
                                className={`rounded px-1.5 py-0.2 text-[9px] font-medium ${
                                  t.color === "blue"
                                    ? "bg-blue-50 text-blue-700"
                                    : t.color === "green"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : t.color === "amber"
                                    ? "bg-amber-50 text-amber-700"
                                    : t.color === "purple"
                                    ? "bg-purple-50 text-purple-700"
                                    : t.color === "rose"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                {t.label === "TypeScript" ? "• TypeScript" : t.label}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Right Inspector Pane (4 cols) */}
                <div className="md:col-span-4 flex flex-col bg-[#FAFAF9] p-4 text-xs">
                  <div className="border-b border-neutral-200 pb-2.5">
                    <div className="flex items-center justify-between text-neutral-500 font-mono text-[10px]">
                      <span className="font-semibold text-neutral-900">{selectedIssue.repo}</span>
                      <span>#{selectedIssue.number}</span>
                    </div>
                    <h4 className="mt-1.5 text-xs font-semibold text-neutral-900 leading-snug">
                      Improve error messaging when server-rendered timestamps mismatch
                    </h4>

                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <span className="rounded bg-neutral-200/80 px-1.5 py-0.5 text-[9px] font-medium text-neutral-700">
                        TypeScript
                      </span>
                      <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-1.5 py-0.5 text-[9px] font-medium">
                        Good first issue
                      </span>
                      <span className="rounded bg-rose-50 text-rose-700 border border-rose-200/70 px-1.5 py-0.5 text-[9px] font-medium">
                        Bug
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-3 border-b border-neutral-200 pt-2 pb-1.5 text-[10px]">
                    {(["Overview", "Code context", "Files", "Discussion"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`font-semibold transition-colors ${
                          activeTab === tab
                            ? "text-neutral-900 border-b-2 border-neutral-900 -mb-[7px] pb-[5px]"
                            : "text-neutral-400 hover:text-neutral-700"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Body */}
                  <div className="flex-1 py-2.5 text-[10px] leading-relaxed overflow-y-auto">
                    {activeTab === "Overview" && (
                      <div className="space-y-3">
                        <p className="text-neutral-600 leading-relaxed">
                          Currently, when server-rendered timestamps mismatch during hydration, the error message is unclear and can be confusing for developers. This issue proposes a more descriptive error message with actionable guidance.
                        </p>

                        <div>
                          <span className="font-semibold text-neutral-800 text-[9px] uppercase tracking-wider">
                            Relevant files
                          </span>
                          <div className="mt-1.5 space-y-1 font-mono text-[9px]">
                            <div className="flex items-center gap-1.5 rounded bg-white border border-neutral-200 p-1.5 text-neutral-700 truncate shadow-2xs">
                              <FileCode2 className="h-3 w-3 text-neutral-400 shrink-0" />
                              <span className="truncate">packages/next/src/client/hydration.ts</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded bg-white border border-neutral-200 p-1.5 text-neutral-700 truncate shadow-2xs">
                              <FileCode2 className="h-3 w-3 text-neutral-400 shrink-0" />
                              <span className="truncate">packages/next/src/shared/timestamps.ts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "Code context" && (
                      <div className="rounded bg-neutral-900 text-neutral-200 p-2 font-mono text-[9px] leading-snug">
                        <span className="text-purple-400">export function</span> renderToHTML()
                      </div>
                    )}

                    {activeTab === "Files" && (
                      <div className="space-y-1 font-mono text-[9px]">
                        <div className="p-1 rounded bg-white border border-neutral-200 truncate">
                          packages/next/src/client/hydration.ts
                        </div>
                      </div>
                    )}

                    {activeTab === "Discussion" && (
                      <p className="text-neutral-500 text-[9px]">
                        Maintainer discussion synchronized from GitHub API.
                      </p>
                    )}
                  </div>

                  {/* Open in workspace button */}
                  <div className="pt-2 border-t border-neutral-200">
                    <Link
                      href="/discover"
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800"
                    >
                      <span>Open in workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
