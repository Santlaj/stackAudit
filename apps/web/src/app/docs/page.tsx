import type { Metadata } from "next";
import Link from "next/link";
import { EditorialNavbar } from "@/components/landing/editorial-navbar";
import {
  FileCode2,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation — StackAudit",
  description:
    "Comprehensive guide to StackAudit open-source contribution intelligence, AST parsing, and issue matching architecture.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      <EditorialNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Top Header */}
        <div className="border-b border-neutral-200/80 pb-8">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              DOCUMENTATION &amp; ARCHITECTURE
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900">
            StackAudit Developer Docs
          </h1>
          <p className="mt-3 max-w-2xl text-base text-neutral-600 leading-relaxed">
            Everything you need to understand how StackAudit indexes repositories, matches your technical profile to high-signal issues, and structures contribution roadmaps.
          </p>
        </div>

        {/* 2-Column Documentation Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Sticky Table of Contents */}
          <aside className="lg:col-span-3">
            <nav className="sticky top-20 space-y-6 text-xs">
              <div>
                <span className="font-semibold uppercase tracking-wider text-neutral-400 font-mono text-[10px]">
                  Getting Started
                </span>
                <ul className="mt-2 space-y-1.5 font-medium text-neutral-600">
                  <li>
                    <a href="#overview" className="block py-1 hover:text-neutral-950 transition-colors">
                      Platform Overview
                    </a>
                  </li>
                  <li>
                    <a href="#quickstart" className="block py-1 hover:text-neutral-950 transition-colors">
                      Quickstart Workflow
                    </a>
                  </li>
                  <li>
                    <a href="#core-philosophy" className="block py-1 hover:text-neutral-950 transition-colors">
                      Contribution-First Philosophy
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="font-semibold uppercase tracking-wider text-neutral-400 font-mono text-[10px]">
                  Intelligence Engine
                </span>
                <ul className="mt-2 space-y-1.5 font-medium text-neutral-600">
                  <li>
                    <a href="#matching-algorithm" className="block py-1 hover:text-neutral-950 transition-colors">
                      Skill Matching Algorithm
                    </a>
                  </li>
                  <li>
                    <a href="#ast-context" className="block py-1 hover:text-neutral-950 transition-colors">
                      AST &amp; Call-Graph Analysis
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="font-semibold uppercase tracking-wider text-neutral-400 font-mono text-[10px]">
                  Guides &amp; Resources
                </span>
                <ul className="mt-2 space-y-1.5 font-medium text-neutral-600">
                  <li>
                    <a href="#guides" className="block py-1 hover:text-neutral-950 transition-colors">
                      Contribution Playbooks
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Right Main Content */}
          <div className="lg:col-span-9 space-y-16">
            {/* Section 1: Overview */}
            <section id="overview" className="scroll-mt-24">
              <span className="font-mono text-xs font-semibold text-neutral-400">01</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-neutral-900">
                Platform Overview
              </h2>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                Most developers who want to contribute to open source face friction: repos are massive monorepos, issue trackers have hundreds of noisy tickets, and understanding which files actually need to change takes hours of guesswork.
              </p>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                StackAudit solves this by performing structural analysis of active open-source projects, extracting relevant module boundaries, and mapping them directly against your developer skill profile.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                  <Search className="h-4 w-4 text-neutral-800" />
                  <h3 className="mt-2 text-xs font-semibold text-neutral-900">Discovery</h3>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Filter by languages, frameworks, and verified issue maintainer responsiveness.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                  <FileCode2 className="h-4 w-4 text-neutral-800" />
                  <h3 className="mt-2 text-xs font-semibold text-neutral-900">Context Extraction</h3>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Pinpoints the exact files and function call-sites relevant to each issue.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-neutral-800" />
                  <h3 className="mt-2 text-xs font-semibold text-neutral-900">Investigation Plan</h3>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Provides step-by-step reproduction and verification checklists.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Quickstart */}
            <section id="quickstart" className="scroll-mt-24 border-t border-neutral-200/80 pt-12">
              <span className="font-mono text-xs font-semibold text-neutral-400">02</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-neutral-900">
                Quickstart Workflow
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    1
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900">
                      Configure your technical profile
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      Specify your primary programming languages (e.g., TypeScript, Python, Rust) and your experience level (beginner, intermediate, or advanced maintainer).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    2
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900">
                      Browse matched opportunities in the directory
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      Browse real-time indexed GitHub issues. Issues display match scores based on your technology alignment and estimated difficulty.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    3
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900">
                      Examine code context and follow the checklist
                    </h3>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      Review key files, understand why the maintainer flagged the bug, and use the investigation checklist to reproduce and prepare your pull request.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Matching Algorithm */}
            <section id="matching-algorithm" className="scroll-mt-24 border-t border-neutral-200/80 pt-12">
              <span className="font-mono text-xs font-semibold text-neutral-400">03</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-neutral-900">
                Skill Matching Algorithm
              </h2>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                Rather than treating all issues identically, StackAudit computes a dynamic match score based on three core dimensions:
              </p>

              <div className="mt-4 rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4 text-xs font-mono space-y-2">
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-600">match_score = (stack_alignment * 0.45) + (complexity_fit * 0.35) + (repo_health * 0.20)</span>
                </div>
                <div className="pt-1 text-[11px] text-neutral-500 font-sans space-y-1">
                  <div><strong>stack_alignment</strong>: Evaluates language, dependencies, and framework requirements against your configured tech stack.</div>
                  <div><strong>complexity_fit</strong>: Assesses issue scope (e.g. good-first-issue, single-file patch vs multi-package refactor).</div>
                  <div><strong>repo_health</strong>: Factors in average PR review time and maintainer responsiveness so your effort isn&apos;t wasted on abandoned repos.</div>
                </div>
              </div>
            </section>

            {/* Section 4: Guides */}
            <section id="guides" className="scroll-mt-24 border-t border-neutral-200/80 pt-12">
              <span className="font-mono text-xs font-semibold text-neutral-400">04</span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-neutral-900">
                Contribution Playbooks
              </h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    Guide 01
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                    Making Your First Monorepo PR
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                    How to navigate Turborepo/pnpm monorepos like Next.js, run isolated package builds, and link local dependencies.
                  </p>
                  <Link href="/discover" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-neutral-700">
                    <span>Explore issues</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-blue-700 border border-blue-200">
                    Guide 02
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                    Writing Maintainer-Friendly Commits
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                    Convention standards (Conventional Commits, changeset files) that get your PR approved quickly by maintainers.
                  </p>
                  <Link href="/discover" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-neutral-700">
                    <span>Explore issues</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
