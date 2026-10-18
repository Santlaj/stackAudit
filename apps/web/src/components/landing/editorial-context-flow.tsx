"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Github,
  FolderTree,
  FileCode2,
  CheckSquare,
  Sparkles,
  Target,
  Code2,
  ListChecks,
  ChevronRight
} from "lucide-react";
import { InteractiveCanvasGrid } from "./interactive-canvas-grid";

export function EditorialContextFlow() {
  return (
    <section className="relative border-b border-neutral-200/80 bg-[#FAFAF9] py-16 sm:py-24 overflow-hidden">
      {/* Interactive Background Grid */}
      <InteractiveCanvasGrid />
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Statement */}
          <div className="lg:col-span-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              WHY STACKAUDIT
            </span>

            <h2 className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.1] tracking-tight text-neutral-900">
              The hard part isn&apos;t finding an issue.
              <br />
              <span className="italic font-serif text-neutral-700">It&apos;s knowing where to start.</span>
            </h2>

            <div className="mt-6 space-y-4 text-sm sm:text-base text-neutral-600 leading-relaxed">
              <p>
                Open-source repositories are large, complex, and unfamiliar. Issue descriptions are often unclear,
                the codebase is hard to navigate, and it&apos;s not obvious which files or components are relevant.
              </p>
              <p className="font-medium text-neutral-800">
                StackAudit bridges this gap by giving you the context you need before you write code.
              </p>
            </div>

            <div className="mt-8">
              <a
                href="#real-use-case"
                className="group inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-all hover:bg-neutral-800"
              >
                <span>See how it helps</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Right Column: One Coherent Pipeline Composition (Issue -> Repo Context -> Relevant Code -> Plan) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-7 shadow-sm">
              <div className="border-b border-neutral-200/80 pb-3 mb-5 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-mono font-semibold uppercase tracking-wider text-neutral-800 text-[11px]">
                  Contribution Context Pipeline
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Illustrative analysis workflow
                </span>
              </div>

              {/* Connected Sequential Stages */}
              <div className="space-y-4 relative">
                {/* 1. GitHub Issue Input */}
                <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4 transition-all hover:border-neutral-300">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white font-mono text-[10px] font-bold">
                        1
                      </span>
                      <span className="font-semibold text-neutral-900">GitHub Issue</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[10px]">
                      <Github className="h-3.5 w-3.5" />
                      <span>vercel / next.js #4812</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold text-neutral-900 leading-snug">
                      Improve error handling for invalid input and hydration mismatches
                    </p>
                    <div className="flex shrink-0 items-center gap-1 font-mono text-[9px]">
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 border border-emerald-200">
                        open
                      </span>
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 border border-blue-200">
                        TypeScript
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500">
                    <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                  </div>
                </div>

                {/* 2. Repository Context & File Tree Mapping */}
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white font-mono text-[10px] font-bold">
                        2
                      </span>
                      <span className="font-semibold text-neutral-900">Repository Context & AST Mapping</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 font-medium">3 relevant files isolated</span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* File tree */}
                    <div className="rounded-lg border border-neutral-200/80 bg-[#FAFAF9] p-2.5 font-mono text-[10px] text-neutral-600 space-y-1">
                      <div className="font-semibold text-neutral-800">src/</div>
                      <div className="pl-3 flex items-center gap-1.5 text-blue-700 font-medium bg-blue-50/60 p-0.5 rounded">
                        <FileCode2 className="h-3 w-3 shrink-0 text-blue-600" />
                        <span>api/validation.ts</span>
                      </div>
                      <div className="pl-3 flex items-center gap-1.5 text-blue-700 font-medium bg-blue-50/60 p-0.5 rounded">
                        <FileCode2 className="h-3 w-3 shrink-0 text-blue-600" />
                        <span>middleware/error-handler.ts</span>
                      </div>
                      <div className="pl-3 flex items-center gap-1.5 text-neutral-700">
                        <FileCode2 className="h-3 w-3 shrink-0 text-neutral-400" />
                        <span>types/errors.ts</span>
                      </div>
                    </div>

                    {/* Context attributes */}
                    <div className="space-y-1.5 text-[10px] flex flex-col justify-center">
                      <div className="flex items-center gap-2 rounded bg-neutral-50 px-2 py-1 text-neutral-700 border border-neutral-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>Dependency trace: Express validation middleware</span>
                      </div>
                      <div className="flex items-center gap-2 rounded bg-neutral-50 px-2 py-1 text-neutral-700 border border-neutral-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>Interface types: <code className="font-mono text-[9px]">APIErrorResponse</code></span>
                      </div>
                      <div className="flex items-center gap-2 rounded bg-neutral-50 px-2 py-1 text-neutral-700 border border-neutral-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span>Test suite: <code className="font-mono text-[9px]">tests/unit/validation.test.ts</code></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500">
                    <ChevronRight className="h-3.5 w-3.5 rotate-90" />
                  </div>
                </div>

                {/* 3. Actionable Investigation Plan */}
                <div className="rounded-xl border border-neutral-900 bg-neutral-900 text-white p-4 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-neutral-900 font-mono text-[10px] font-bold">
                        3
                      </span>
                      <span className="font-semibold text-white">Actionable Investigation Plan</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">Ready to execute</span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-center gap-2 rounded bg-neutral-800/90 px-2.5 py-1.5 text-neutral-200">
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Reproduce validation failure locally</span>
                    </div>
                    <div className="flex items-center gap-2 rounded bg-neutral-800/90 px-2.5 py-1.5 text-neutral-200">
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Review error schema in types/errors.ts</span>
                    </div>
                    <div className="flex items-center gap-2 rounded bg-neutral-800/90 px-2.5 py-1.5 text-neutral-200">
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Format response in middleware/error-handler</span>
                    </div>
                    <div className="flex items-center gap-2 rounded bg-neutral-800/90 px-2.5 py-1.5 text-neutral-200">
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>Run unit test suite & submit PR</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom 3 Summary Pillars ── */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-neutral-200/80">
          <div className="flex items-start gap-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200 shadow-2xs text-neutral-900">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-neutral-400">01</span>
                <h4 className="text-sm font-semibold text-neutral-900">Understand the requirement</h4>
              </div>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Get a clear explanation of the issue and what needs to be done, in simple terms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200 shadow-2xs text-neutral-900">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-neutral-400">02</span>
                <h4 className="text-sm font-semibold text-neutral-900">Explore the relevant code</h4>
              </div>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Navigate to the right files, components, and dependencies with contextual hints.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200 shadow-2xs text-neutral-900">
              <ListChecks className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-neutral-400">03</span>
                <h4 className="text-sm font-semibold text-neutral-900">Plan your next step</h4>
              </div>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Follow a structured checklist to approach and implement the contribution with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
