"use client";

import * as React from "react";
import {
  ArrowRight,
  Search,
  FileCode2,
  CheckCircle2,
  GitBranch,
  Terminal,
  ExternalLink,
  Github,
  Network,
  Code2,
  Box,
  ListTodo,
  FileText,
  CheckSquare
} from "lucide-react";

type WalkthroughStep = "issue" | "context" | "code" | "plan";

export function EditorialUseCase() {
  const [activeStep, setActiveStep] = React.useState<WalkthroughStep>("code");
  const [checkedPlanItems, setCheckedPlanItems] = React.useState<number[]>([1, 2]);

  const togglePlanItem = (id: number) => {
    setCheckedPlanItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section id="real-use-case" className="relative border-b border-neutral-200/80 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Top Split: Real Use Case Heading + Single Unified Walkthrough Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              REAL USE CASE
            </span>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.12] tracking-tight text-neutral-900">
              Go from an issue to a clearer plan.
            </h2>

            <p className="mt-4 text-base text-neutral-600 leading-relaxed">
              Explore issue context, examine the available repository information, and organize the next steps of your investigation.
            </p>

            {/* Interactive Step Switcher Tabs */}
            <div className="mt-6 space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                Investigation sequence:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "issue" as const, num: "01", label: "Understand issue" },
                  { id: "context" as const, num: "02", label: "Repository context" },
                  { id: "code" as const, num: "03", label: "Review relevant code" },
                  { id: "plan" as const, num: "04", label: "Investigation checklist" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStep(s.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all cursor-pointer ${
                      activeStep === s.id
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-[#FAFAF9] text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    <span className={`font-mono text-[10px] ${activeStep === s.id ? "text-neutral-400" : "text-neutral-400"}`}>
                      {s.num}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Single Unified Product Workbench Interface */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-neutral-200/90 bg-[#FAFAF9] shadow-xl shadow-neutral-900/5 overflow-hidden">
              {/* Top Navigation Bar of Workbench */}
              <div className="flex h-11 items-center justify-between border-b border-neutral-200 bg-white px-4 text-xs">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-neutral-800" />
                  <span className="font-semibold text-neutral-900">vercel / next.js</span>
                  <span className="font-mono text-neutral-400 text-[11px]">#4812</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200 font-semibold">
                    open
                  </span>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 border border-blue-200">
                    TypeScript
                  </span>
                </div>
              </div>

              {/* Workbench Body */}
              <div className="p-5 sm:p-6 bg-white min-h-[400px] flex flex-col justify-between">
                {/* Step 1: Understand Issue */}
                {activeStep === "issue" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold text-neutral-900">
                        Improve error messaging when server-rendered timestamps mismatch
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        Currently, when server-rendered timestamps mismatch during hydration, the error message is unclear and can be confusing for developers. This issue proposes a more descriptive error message with actionable guidance.
                      </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-3.5 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-neutral-700 font-semibold">
                        <img src="/icon.png" alt="StackAudit" className="h-3.5 w-3.5 object-contain" />
                        <span>Issue Analysis Overview</span>
                      </div>
                      <p className="text-neutral-600 text-[11px] leading-relaxed">
                        Identified as a hydration boundary diagnosis task. Maintainer requested backwards-compatible formatting changes to React server-rendering telemetry.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Repository Context */}
                {activeStep === "context" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <h4 className="text-sm font-semibold text-neutral-900">Repository Architecture Context</h4>
                      <span className="font-mono text-[10px] text-neutral-400">Turborepo • Next.js Core</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-3 space-y-1.5">
                        <span className="font-semibold text-neutral-800 text-[11px]">Identified Relevant Files</span>
                        <div className="space-y-1 font-mono text-[10px] text-neutral-700">
                          <div className="bg-white p-1.5 rounded border border-neutral-200 truncate">
                            packages/next/src/server/render.ts
                          </div>
                          <div className="bg-white p-1.5 rounded border border-neutral-200 truncate">
                            packages/next/src/shared/timestamps.ts
                          </div>
                          <div className="bg-white p-1.5 rounded border border-neutral-200 truncate">
                            packages/next/src/client/hydration.ts
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-3 space-y-2 text-[11px] text-neutral-600">
                        <span className="font-semibold text-neutral-800">Dependency & Scope</span>
                        <p>
                          Changes are confined to the rendering telemetry serializer. No changes required in public routing APIs.
                        </p>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Unit test suite exists in tests/unit/render</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Relevant Code Viewer */}
                {activeStep === "code" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                        <FileCode2 className="h-3.5 w-3.5 text-blue-600" />
                        <span>packages/next/src/server/render.ts</span>
                      </div>
                      <span className="font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                        TypeScript
                      </span>
                    </div>

                    {/* Syntax-highlighted Code Window */}
                    <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-3.5 font-mono text-xs leading-relaxed text-neutral-900">
                      <div>
                        <span className="text-neutral-400 select-none mr-3">210</span>
                        <span className="text-purple-600 font-medium">export function</span>{" "}
                        <span className="text-blue-600 font-medium">renderToHTML</span>(
                      </div>
                      <div>
                        <span className="text-neutral-400 select-none mr-3">211</span>
                        {"  "}req: <span className="text-amber-700">ServerRequest</span>,
                      </div>
                      <div>
                        <span className="text-neutral-400 select-none mr-3">212</span>
                        {"  "}res: <span className="text-amber-700">ServerResponse</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 select-none mr-3">213</span>
                        ) &#123;
                      </div>
                      <div>
                        <span className="text-neutral-400 select-none mr-3">214</span>
                        {"  "}<span className="text-purple-600 font-medium">const</span> timestamp = getTimestamp()
                      </div>
                      <div>
                        <span className="text-neutral-400 select-none mr-3">215</span>
                        {"  "}...
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Investigation Checklist */}
                {activeStep === "plan" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <h4 className="text-sm font-semibold text-neutral-900">Investigation Checklist</h4>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {checkedPlanItems.length} of 4 completed
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { id: 1, title: "Reproduce the issue locally", desc: "Set up minimal reproduction app to observe hydration mismatch warning." },
                        { id: 2, title: "Understand existing error handling", desc: "Inspect timestamp serialization in packages/next/src/server/render.ts." },
                        { id: 3, title: "Implement improved error message", desc: "Add descriptive diff guidance for developers." },
                        { id: 4, title: "Add and run test suite", desc: "Verify with pnpm test in packages/next." }
                      ].map((item) => {
                        const isChecked = checkedPlanItems.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => togglePlanItem(item.id)}
                            className="flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-[#FAFAF9] p-2.5 cursor-pointer hover:bg-neutral-50 transition-colors"
                          >
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] font-bold ${
                              isChecked ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-neutral-300 text-transparent"
                            }`}>
                              ✓
                            </span>
                            <div className="flex-1">
                              <p className={`text-xs font-semibold leading-tight ${isChecked ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                                {item.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-neutral-500">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Bar inside Workbench */}
                <div className="mt-5 pt-4 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-500 font-mono text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Contribution Plan Ready</span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 font-semibold text-white transition-colors hover:bg-neutral-800 cursor-default"
                  >
                    <span>Open in workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Capabilities Section (Clean, concise, and visually distinct) ── */}
        <div id="features" className="mt-20 sm:mt-28">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              WHAT YOU CAN DO
            </span>
            <div className="mt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h3 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-neutral-900">
                Tools to explore, understand, and contribute.
              </h3>
              <p className="text-sm text-neutral-500 max-w-md">
                Focused features to help you navigate open-source repositories and make meaningful contributions.
              </p>
            </div>
          </div>

          {/* 4 Capability Cards Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Issue discovery */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAFAF9] p-5 shadow-2xs transition-all hover:bg-white hover:border-neutral-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/50">
                <Search className="h-4 w-4" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-neutral-900">
                Issue discovery
              </h4>
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                Find open issues based on your skills, interests, and preferred tech stack.
              </p>
            </div>

            {/* 2. Repository context */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAFAF9] p-5 shadow-2xs transition-all hover:bg-white hover:border-neutral-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-200/50">
                <FileCode2 className="h-4 w-4" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-neutral-900">
                Repository context
              </h4>
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                Get relevant code context, file structure, and dependencies to understand the issue better.
              </p>
            </div>

            {/* 3. Investigation checklist */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAFAF9] p-5 shadow-2xs transition-all hover:bg-white hover:border-neutral-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-neutral-900">
                Investigation checklist
              </h4>
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                Follow a structured plan with key files, components, and areas to explore.
              </p>
            </div>

            {/* 4. Plan your contribution */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#FAFAF9] p-5 shadow-2xs transition-all hover:bg-white hover:border-neutral-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/50">
                <GitBranch className="h-4 w-4" />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-neutral-900">
                Plan your contribution
              </h4>
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                Understand what needs to be done and move forward with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
