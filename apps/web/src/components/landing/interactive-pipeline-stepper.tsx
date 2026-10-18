"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Cpu, 
  SlidersHorizontal, 
  Activity, 
  FileCode2, 
  GitPullRequest, 
  Check, 
  ArrowRight,
  Terminal,
  ShieldCheck,
  Clock,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

const STEPS: Step[] = [
  {
    id: "ingest",
    number: "01",
    title: "GitHub Stack Ingestion",
    tagline: "No manual skill survey. Zero guesswork.",
    description: "StackAudit connects directly to your GitHub profile, ingesting your authentic repository language byte distributions, commit frequencies, and framework dependencies.",
    icon: Cpu,
    badge: "Automated Ingestion",
  },
  {
    id: "match",
    number: "02",
    title: "Deterministic Compatibility",
    tagline: "Mathematical alignment, not vague AI vibes.",
    description: "Evaluates each candidate issue against your skill footprint, difficulty preference, and recent commit patterns using a deterministic 6-factor matching formula.",
    icon: SlidersHorizontal,
    badge: "Explainable Matching",
  },
  {
    id: "vitality",
    number: "03",
    title: "Maintainer Vitality Screen",
    tagline: "Never waste hours on abandoned PRs.",
    description: "Filters out inactive repositories and ghost discussions. StackAudit checks maintainer response latency, merge rates, and active branch commits within the last 30 days.",
    icon: Activity,
    badge: "Repository Health",
  },
  {
    id: "localization",
    number: "04",
    title: "Target File Localization",
    tagline: "Know what to change before opening your IDE.",
    description: "Surfaces the exact target files, modules, and test suites involved in resolving the issue, eliminating cold-start codebase exploration fatigue.",
    icon: FileCode2,
    badge: "File Guidance",
  },
  {
    id: "contribute",
    number: "05",
    title: "Ready-to-Ship Guidance",
    tagline: "Contextual implementation readiness.",
    description: "Delivers architectural context, prerequisite concepts, and suggested implementation steps so you can open your pull request with complete confidence.",
    icon: GitPullRequest,
    badge: "Verified Contribution",
  },
];

export function InteractivePipelineStepper() {
  const [activeStepIndex, setActiveStepIndex] = React.useState(0);
  const activeStep = STEPS[activeStepIndex];

  return (
    <div className="w-full space-y-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
            <span>DISCOVER → UNDERSTAND → SHIP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            The Autonomous Contribution Loop
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From raw GitHub profile ingestion to targeted pull request guidance. See how StackAudit transforms open-source onboarding.
          </p>
        </div>

        {/* Step Indicator pill */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/40 border border-border/60 px-3 py-1.5 rounded-lg shrink-0">
          <span className="text-foreground font-bold">{activeStep.number}</span>
          <span>/</span>
          <span>05 — {activeStep.badge}</span>
        </div>
      </div>

      {/* ASYMMETRIC INTERACTIVE WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT: 5 STEP NAVIGATION BUTTONS (takes 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={cn(
                  "p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group",
                  isActive
                    ? "bg-card border-foreground/40 shadow-sm"
                    : "bg-card/30 border-border/50 hover:bg-card/60 hover:border-border"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
                )}

                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors border",
                    isActive
                      ? "bg-foreground text-background border-foreground font-bold"
                      : "bg-muted/50 text-muted-foreground border-border/60 group-hover:text-foreground"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "text-xs font-semibold tracking-tight transition-colors",
                        isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                      )}>
                        {step.title}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {step.number}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {step.tagline}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: DYNAMIC STAGE PREVIEW ARTIFACT (takes 7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          {/* Ambient subtle glow inside card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="space-y-4 relative z-10">
            {/* Header info for current step */}
            <div className="space-y-1 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>STEP {activeStep.number}: {activeStep.badge.toUpperCase()}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                {activeStep.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            {/* INTERACTIVE VISUAL ARTIFACTS PER STEP */}
            <div className="min-h-[220px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {activeStepIndex === 0 && (
                  /* STEP 1: INGESTION GRAPH */
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full space-y-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-1">
                      <span>Stack Ingestion: @octocat</span>
                      <span className="text-emerald-400">14 repos · 84.2k LOC</span>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-2 p-3.5 rounded-xl bg-background/60 border border-border/70">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-foreground font-semibold">TypeScript</span>
                          <span className="text-muted-foreground">64.8% (42,100 bytes)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: "64.8%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-foreground font-semibold">Python</span>
                          <span className="text-muted-foreground">22.4% (14,580 bytes)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "22.4%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-foreground font-semibold">Go / Rust</span>
                          <span className="text-muted-foreground">12.8% (8,320 bytes)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "12.8%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                      <span>✓ Ingestion status: Verified</span>
                      <span>Commit habits: Weekly regular</span>
                    </div>
                  </motion.div>
                )}

                {activeStepIndex === 1 && (
                  /* STEP 2: DETERMINISTIC MATCHING */
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full space-y-2 text-xs"
                  >
                    <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 space-y-2.5">
                      <div className="flex items-center justify-between font-mono text-[11px] border-b border-border/50 pb-2">
                        <span className="text-foreground font-semibold">Match Scoring Formula</span>
                        <span className="text-emerald-400 font-bold">96% Overall Score</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                          <span className="text-muted-foreground block text-[10px] uppercase font-mono">Language Fit</span>
                          <span className="font-semibold text-emerald-400">100% (TypeScript)</span>
                        </div>
                        <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                          <span className="text-muted-foreground block text-[10px] uppercase font-mono">Complexity Tier</span>
                          <span className="font-semibold text-emerald-400">95% (Intermediate)</span>
                        </div>
                        <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                          <span className="text-muted-foreground block text-[10px] uppercase font-mono">Dependency Overlap</span>
                          <span className="font-semibold text-foreground">90% (Zod, tRPC)</span>
                        </div>
                        <div className="p-2 rounded-lg bg-card/60 border border-border/50">
                          <span className="text-muted-foreground block text-[10px] uppercase font-mono">Effort Estimation</span>
                          <span className="font-semibold text-foreground">~45 minutes</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground text-center">
                      Deterministic engine weights real repository signals, not LLM guesses.
                    </div>
                  </motion.div>
                )}

                {activeStepIndex === 2 && (
                  /* STEP 3: VITALITY HEALTH SCREEN */
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full space-y-2.5 text-xs"
                  >
                    <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-foreground">trpc / trpc</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          HEALTH: A+ (VITAL)
                        </span>
                      </div>

                      <div className="space-y-1.5 font-mono text-[11px]">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Avg Maintainer Response:</span>
                          <span className="text-foreground font-semibold">2.4 hours (Fast)</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Community PR Merge Rate:</span>
                          <span className="text-emerald-400 font-semibold">88.5% merged</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Active Commits (Last 30d):</span>
                          <span className="text-foreground font-semibold">142 commits</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Ghost Discussion Risk:</span>
                          <span className="text-emerald-400 font-semibold">0.0% (Verified Active)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center font-mono">
                      Ghost repositories with unanswered PRs are automatically rejected.
                    </p>
                  </motion.div>
                )}

                {activeStepIndex === 3 && (
                  /* STEP 4: TARGET FILE LOCALIZATION */
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full space-y-2 font-mono text-xs"
                  >
                    <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 space-y-2">
                      <div className="text-[11px] text-muted-foreground pb-1 border-b border-border/50 flex justify-between">
                        <span>Resolved Target AST Locations</span>
                        <span>2 Files Identified</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/60">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-bold">
                              MODIFY
                            </span>
                            <span className="text-foreground truncate text-[11px]">packages/server/src/core/router.ts</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">L142-L188</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/60">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                              TEST
                            </span>
                            <span className="text-foreground truncate text-[11px]">packages/server/tests/batching.test.ts</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">L89-L134</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center">
                      Jump straight into the relevant code without searching 500+ files.
                    </div>
                  </motion.div>
                )}

                {activeStepIndex === 4 && (
                  /* STEP 5: PR READINESS GUIDANCE */
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full space-y-2.5 text-xs"
                  >
                    <div className="p-3.5 rounded-xl bg-background/60 border border-border/70 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono border-b border-border/50 pb-1.5">
                        <span className="font-semibold text-foreground">Contribution Readiness Checklist</span>
                        <span className="text-emerald-400">100% Ready</span>
                      </div>

                      <div className="space-y-1.5 text-foreground/90 text-xs">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Identified root cause: batch envelope validation omission.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Local test command verified: <code>pnpm test:batching</code></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>PR title & description generator prepared.</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground text-center">
                      Ship contributions that maintainers love and merge without back-and-forth delays.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* BOTTOM STEP CONTROLLER BUTTONS */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ← Previous Step
            </button>

            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveStepIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all cursor-pointer",
                    i === activeStepIndex ? "w-6 bg-emerald-500" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                  aria-label={`Jump to step ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={activeStepIndex === STEPS.length - 1}
              onClick={() => setActiveStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
