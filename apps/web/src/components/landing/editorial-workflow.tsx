"use client";

import * as React from "react";
import {
  Search,
  FileText,
  Terminal,
  ArrowRight,
  CheckCircle2,
  FileCode2,
  ChevronRight,
  Sparkles,
  GitPullRequest
} from "lucide-react";

export function EditorialWorkflow() {
  const [activeStepTab, setActiveStepTab] = React.useState<"Investigation" | "Checklist" | "Notes">("Investigation");
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([1]);

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  return (
    <section id="how-it-works" className="relative border-b border-neutral-200/80 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pb-12 border-b border-neutral-200/70">
          <div className="lg:col-span-7">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              BUILT AROUND THE CONTRIBUTION WORKFLOW
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.12] tracking-tight text-neutral-900">
              From discovery to a clearer next step.
            </h2>
            <p className="mt-4 max-w-xl text-base text-neutral-600 leading-relaxed">
              Explore an issue, understand its repository context, and plan what to investigate next.
            </p>
          </div>

          <div className="lg:col-span-5 lg:text-right">
            <p className="text-sm text-neutral-500 max-w-md ml-auto leading-relaxed">
              A structured three-stage pipeline to help you transition from discovering an open issue to writing your contribution with confidence.
            </p>
          </div>
        </div>

        {/* 3 Connected Interactive Workflow Stage Previews */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {/* ── STAGE 01: Discover ── */}
          <div className="rounded-2xl border border-neutral-200/90 bg-[#FAFAF9] p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-all hover:border-neutral-300">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400">01</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200/70 text-neutral-700">
                  <Search className="h-4 w-4" />
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900">Discover</h3>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Find issues in real repositories that match your skills, preferred languages, and interests.
              </p>
            </div>

            {/* Interface Glimpse */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] text-neutral-400 mb-2.5">
                <Search className="h-3 w-3" />
                <span>Search repositories, issues, or technologies...</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {["All", "TypeScript", "React", "Next.js"].map((tech, idx) => (
                  <span
                    key={tech}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      idx === 0 ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <div className="rounded-lg border border-neutral-200/80 p-2.5 text-left bg-neutral-50/70">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-900">vercel / next.js</span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-emerald-700 border border-emerald-200/70">
                      92% match
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-neutral-700 truncate">
                    #4812 Improve error messaging when server-rendered...
                  </p>
                  <span className="mt-1.5 inline-block rounded bg-emerald-50 px-1.5 text-[9px] font-medium text-emerald-700">
                    Good first issue
                  </span>
                </div>

                <div className="rounded-lg border border-neutral-200/60 p-2.5 text-left bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-900">shadcn-ui / ui</span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-emerald-700 border border-emerald-200/70">
                      88% match
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-neutral-700 truncate">
                    #2921 Add support for custom variant resolvers
                  </p>
                  <span className="mt-1.5 inline-block rounded bg-purple-50 px-1.5 text-[9px] font-medium text-purple-700">
                    Enhancement
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── STAGE 02: Understand ── */}
          <div className="rounded-2xl border border-neutral-200/90 bg-[#FAFAF9] p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-all hover:border-neutral-300">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400">02</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200/70 text-neutral-700">
                  <FileText className="h-4 w-4" />
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900">Understand</h3>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Review available repository context, relevant files, and component boundaries.
              </p>
            </div>

            {/* Interface Glimpse */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
                <span className="text-[11px] font-semibold text-neutral-900">vercel / next.js #4812</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-emerald-700 border border-emerald-200/70">
                  92% match
                </span>
              </div>

              <p className="mt-2 text-[11px] font-semibold text-neutral-900 leading-snug">
                Improve error messaging when server-rendered timestamps mismatch
              </p>
              <div className="mt-1 flex items-center gap-1">
                <span className="rounded bg-emerald-50 px-1 text-[8px] font-medium text-emerald-700">
                  Good first issue
                </span>
                <span className="rounded bg-blue-50 px-1 text-[8px] font-medium text-blue-700">
                  TypeScript
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 border-b border-neutral-100 pb-1 text-[10px]">
                <span className="font-semibold text-neutral-900 border-b border-neutral-900">Overview</span>
                <span className="text-neutral-400">Code context</span>
                <span className="text-neutral-400">Files</span>
              </div>

              <div className="mt-2.5">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">Relevant files</span>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-1.5 rounded bg-neutral-50 p-1.5 font-mono text-[9px] text-neutral-700">
                    <FileCode2 className="h-3 w-3 text-neutral-400" />
                    <span className="truncate">packages/next/src/client/hydration.ts</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded bg-neutral-50 p-1.5 font-mono text-[9px] text-neutral-700">
                    <FileCode2 className="h-3 w-3 text-neutral-400" />
                    <span className="truncate">packages/next/src/server/render.ts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── STAGE 03: Investigate ── */}
          <div className="rounded-2xl border border-neutral-200/90 bg-[#FAFAF9] p-5 sm:p-6 flex flex-col justify-between shadow-xs transition-all hover:border-neutral-300">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400">03</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200/70 text-neutral-700">
                  <Terminal className="h-4 w-4" />
                </div>
              </div>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-neutral-900">Investigate</h3>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                Plan your approach with structured checklists and code-investigation steps.
              </p>
            </div>

            {/* Interface Glimpse */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-neutral-200/80 pb-1.5 text-[10px]">
                {(["Investigation", "Checklist", "Notes"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveStepTab(tab)}
                    className={`font-semibold transition-colors ${
                      activeStepTab === tab ? "text-neutral-900 border-b border-neutral-900" : "text-neutral-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 text-[10px]">
                <span className="font-semibold text-neutral-800">Suggested Approach</span>
                <div className="mt-2 space-y-1.5">
                  {[
                    { num: 1, title: "Reproduce the issue locally", desc: "Set up a minimal Next.js app and trigger hydration mismatch." },
                    { num: 2, title: "Understand existing error handling", desc: "Check how current error message is generated in hydration." },
                    { num: 3, title: "Implement improved error message", desc: "Add descriptive info and actionable guidance." },
                    { num: 4, title: "Add and run tests", desc: "Write unit tests for the new error message." }
                  ].map((step) => {
                    const isDone = completedSteps.includes(step.num);
                    return (
                      <div
                        key={step.num}
                        onClick={() => toggleStep(step.num)}
                        className="flex items-start gap-2 cursor-pointer rounded-md p-1 hover:bg-neutral-50 transition-colors"
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold ${
                            isDone ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {step.num}
                        </span>
                        <div className="flex-1">
                          <p className={`font-medium leading-none text-[10px] ${isDone ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                            {step.title}
                          </p>
                          <p className="mt-0.5 text-[9px] text-neutral-500 line-clamp-1">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-neutral-800 cursor-default"
              >
                <span>Open in workspace</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
