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
  BookOpen,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  ShieldCheck,
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

  const [activeNav, setActiveNav] = React.useState<"discover" | "repositories" | "saved" | "settings">("discover");
  const [selectedRepoId, setSelectedRepoId] = React.useState("vercel/next.js");
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
                      onClick={() => setActiveNav("discover")}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        activeNav === "discover"
                          ? "bg-neutral-200/80 font-semibold text-neutral-900 shadow-2xs"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <Compass className="h-4 w-4 text-neutral-800" />
                      <span>Discover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNav("repositories")}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        activeNav === "repositories"
                          ? "bg-neutral-200/80 font-semibold text-neutral-900 shadow-2xs"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <FolderGit2 className="h-4 w-4" />
                      <span>Repositories</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNav("saved")}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        activeNav === "saved"
                          ? "bg-neutral-200/80 font-semibold text-neutral-900 shadow-2xs"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Saved</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveNav("settings")}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        activeNav === "settings"
                          ? "bg-neutral-200/80 font-semibold text-neutral-900 shadow-2xs"
                          : "text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>

                {/* 2. Middle Pane (5.5 cols) */}
                <div className="md:col-span-5 flex flex-col border-r border-neutral-200 bg-white p-3.5 sm:p-4">
                  {activeNav === "discover" && (
                    <>
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
                                      <ellipse cx="12" cy="12" rx="90 12 12)" />
                                      <ellipse cx="12" cy="12" rx="150 12 12)" />
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
                    </>
                  )}

                  {activeNav === "repositories" && (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                          Tracked Repositories
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {["All", "Featured", "TypeScript", "React", "Rust"].map((tag, idx) => (
                            <span
                              key={tag}
                              className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                                idx === 0 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="relative mt-2.5">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                          <div className="flex h-8 w-full items-center justify-between rounded-lg border border-neutral-200 bg-[#FAFAF9] pl-8 pr-2.5 text-[11px] text-neutral-400">
                            <span className="truncate">Filter ecosystem repositories...</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 overflow-y-auto max-h-[350px] pr-1">
                        {[
                          { id: "vercel/next.js", name: "vercel / next.js", stars: "128k", issues: 42, health: "94%", lang: "TypeScript" },
                          { id: "shadcn-ui/ui", name: "shadcn-ui / ui", stars: "74k", issues: 18, health: "98%", lang: "TypeScript" },
                          { id: "supabase/supabase", name: "supabase / supabase", stars: "77k", issues: 26, health: "91%", lang: "TypeScript" },
                          { id: "facebook/react", name: "facebook / react", stars: "232k", issues: 15, health: "89%", lang: "JavaScript" },
                        ].map((repo) => {
                          const isSelected = selectedRepoId === repo.id;
                          return (
                            <button
                              key={repo.id}
                              type="button"
                              onClick={() => setSelectedRepoId(repo.id)}
                              className={`w-full text-left rounded-xl border p-3 transition-all cursor-pointer ${
                                isSelected
                                  ? "border-neutral-900 bg-neutral-50/70 shadow-2xs"
                                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-900">{repo.name}</span>
                                <span className="flex items-center gap-1 font-mono text-[10px] text-neutral-500">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                  {repo.stars}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-600">
                                <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium">{repo.lang}</span>
                                <span className="text-emerald-700 font-medium">{repo.issues} match issues</span>
                                <span className="font-mono text-neutral-400">Health: {repo.health}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {activeNav === "saved" && (
                    <>
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                            Saved Opportunities
                          </h3>
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[10px] text-neutral-600 font-medium">
                            2 saved
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-500">
                          Issues bookmarked for your next open-source contribution.
                        </p>
                      </div>

                      <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[350px] pr-1">
                        <div className="rounded-xl border border-neutral-900 bg-neutral-50/70 p-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-900">vercel / next.js</span>
                            <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
                              92% match
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-neutral-800">
                            #4812 Improve error messaging for nested input routers
                          </p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="rounded bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[9px] font-medium">
                              Good first issue
                            </span>
                            <span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-[9px] font-medium">
                              TypeScript
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-neutral-200 p-3 bg-white hover:border-neutral-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-900">supabase / supabase</span>
                            <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
                              85% match
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-neutral-800">
                            #2156 Clarify RLS documentation with working SQL examples
                          </p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="rounded bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[9px] font-medium">
                              Documentation
                            </span>
                            <span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 text-[9px] font-medium">
                              TypeScript
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeNav === "settings" && (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold tracking-tight text-neutral-900">
                          Contribution Profile
                        </h3>
                        <p className="mt-1 text-[11px] text-neutral-500">
                          Configured developer preferences for matching algorithms.
                        </p>
                      </div>

                      <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[350px] pr-1 text-xs">
                        <div className="rounded-lg border border-neutral-200 p-2.5 bg-[#FAFAF9]">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            Target Languages
                          </span>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {["TypeScript", "JavaScript", "Python", "Rust"].map((lang) => (
                              <span key={lang} className="rounded bg-white border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-800">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-lg border border-neutral-200 p-2.5 bg-[#FAFAF9]">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            Experience Level
                          </span>
                          <p className="mt-1 text-[11px] font-semibold text-neutral-900">
                            Intermediate Contributor
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            Focusing on bug fixes, performance, and moderate refactoring.
                          </p>
                        </div>

                        <div className="rounded-lg border border-neutral-200 p-2.5 bg-[#FAFAF9]">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            Match Threshold
                          </span>
                          <p className="mt-1 font-mono text-[11px] font-semibold text-emerald-700">
                            &gt;= 75% Confidence Score
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 3. Right Inspector Pane (4 cols) */}
                <div className="md:col-span-4 flex flex-col bg-[#FAFAF9] p-4 text-xs">
                  {activeNav === "discover" && (
                    <>
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
                    </>
                  )}

                  {activeNav === "repositories" && (
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-3">
                        <div className="border-b border-neutral-200 pb-2">
                          <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold">
                            Verified Ecosystem
                          </span>
                          <h4 className="mt-1.5 text-xs font-semibold text-neutral-900">
                            {selectedRepoId}
                          </h4>
                          <p className="mt-1 text-[10px] text-neutral-600">
                            Production monorepo indexed for AST inspection and high-signal contribution matching.
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-neutral-800 text-[9px] uppercase tracking-wider">
                            Monorepo Packages
                          </span>
                          <div className="mt-1.5 space-y-1 font-mono text-[9px]">
                            <div className="flex items-center gap-1.5 rounded bg-white border border-neutral-200 p-1.5 text-neutral-700 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span className="truncate">packages/next (Runtime Core)</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded bg-white border border-neutral-200 p-1.5 text-neutral-700 shadow-2xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span className="truncate">packages/turbopack (Compiler)</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg bg-neutral-100/70 p-2 text-[10px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Maintainer response:</span>
                            <span className="font-semibold text-neutral-800">~4 hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Good first issues:</span>
                            <span className="font-semibold text-emerald-700">12 open</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeNav === "saved" && (
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-3">
                        <div className="border-b border-neutral-200 pb-2">
                          <span className="rounded bg-blue-50 text-blue-700 border border-blue-200/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold">
                            Backlog Item
                          </span>
                          <h4 className="mt-1.5 text-xs font-semibold text-neutral-900">
                            vercel / next.js #4812
                          </h4>
                          <p className="mt-1 text-[10px] text-neutral-600">
                            Hydration timestamp mismatch error message improvements.
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-neutral-800 text-[9px] uppercase tracking-wider">
                            Contribution Checklist
                          </span>
                          <div className="mt-1.5 space-y-1.5 text-[10px]">
                            <div className="flex items-center gap-2 text-neutral-800">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>Read reproduction guide</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                              <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" />
                              <span>Inspect client/hydration.ts</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600">
                              <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" />
                              <span>Draft unit tests &amp; PR</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeNav === "settings" && (
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-3">
                        <div className="border-b border-neutral-200 pb-2">
                          <span className="rounded bg-neutral-200/80 text-neutral-700 px-1.5 py-0.5 font-mono text-[9px] font-semibold">
                            Environment
                          </span>
                          <h4 className="mt-1.5 text-xs font-semibold text-neutral-900">
                            Developer Workspace
                          </h4>
                          <p className="mt-1 text-[10px] text-neutral-600">
                            Connected GitHub profile and analysis parameters.
                          </p>
                        </div>

                        <div className="space-y-2 text-[10px]">
                          <div className="flex items-center justify-between rounded bg-white border border-neutral-200 p-2 shadow-2xs">
                            <span className="text-neutral-600">GitHub Identity</span>
                            <span className="font-mono font-semibold text-neutral-900">@developer</span>
                          </div>
                          <div className="flex items-center justify-between rounded bg-white border border-neutral-200 p-2 shadow-2xs">
                            <span className="text-neutral-600">Analysis Parser</span>
                            <span className="font-medium text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> Safe AST
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded bg-white border border-neutral-200 p-2 shadow-2xs">
                            <span className="text-neutral-600">Matching Engine</span>
                            <span className="font-semibold text-neutral-800">Semantic 2.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Open in workspace showcase button (non-redirecting) */}
                  <div className="pt-2 border-t border-neutral-200">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800 cursor-default"
                    >
                      <span>Open in workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
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
