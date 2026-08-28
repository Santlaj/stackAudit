"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { ShowcaseScreen } from "@/components/dashboard/showcase-screen";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Timeline } from "@/components/ui/timeline";
import { Compare } from "@/components/ui/compare";
import { Tabs } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/ui/code-block";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  Cpu,
  Github,
  Compass,
  FileCode2,
  Activity,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Check,
  X,
  AlertCircle,
  Code2,
  Terminal,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background overflow-x-hidden">
      
      {/* ─── 01. HERO & PRODUCT SHOWCASE ─── */}
      <section id="showcase" className="w-full relative">
        <MacbookScroll
          title={
            <>
              Discover, understand, and contribute{" "}
              <br />
              <span className="text-muted-foreground">to open source with confidence.</span>
            </>
          }
          showGradient={true}
        >
          <ShowcaseScreen />
        </MacbookScroll>
      </section>

      {/* Quick Launch Callout — compact, below the MacBook showcase */}
      <section className="py-14 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-border/60 bg-card/30 rounded p-5 sm:p-6">
          {/* Left: Subtitle & context */}
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
              Open-Source Contribution Intelligence
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              StackAudit matches developers with open-source issues and explains what it takes to contribute — from skill alignment to target file guidance.
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              size="lg"
              onClick={() => router.push(session ? "/discover" : "/login")}
              className="h-9 px-5 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium gap-2 shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" /> Start discovering
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/profile")}
              className="h-9 px-4 text-xs border-border/80 hover:bg-secondary/40 font-medium"
            >
              Configure Profile
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 02. WHAT IT DOES (Dense Technical Grid) ─── */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            WHAT STACKAUDIT ACTUALLY DOES
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
            From developer profile to contribution-ready context.
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xl">
            A deterministic system engineered to replace open-source guesswork with verifiable compatibility and actionable code context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Item 1 */}
          <div className="border border-border/60 bg-card/30 rounded p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground">GitHub Stack Ingestion</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ingests language byte distributions, repository activity, and commit frequencies to establish your verified technical footprint.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Multi-signal language profiling
            </div>
          </div>

          {/* Item 2 */}
          <div className="border border-border/60 bg-card/30 rounded p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground">Deterministic Issue Matching</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scores compatibility 0–100 based on language alignment (35%), difficulty tier (20%), activity signals (25%), and contribution type (20%).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Weighted suitability engine
            </div>
          </div>

          {/* Item 3 */}
          <div className="border border-border/60 bg-card/30 rounded p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <GitPullRequest className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground">Explainable Match Reasoning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Delivers structured, transparent reasons and gap analysis explaining precisely why an issue matches your background before you start.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Transparent fit breakdown
            </div>
          </div>

          {/* Item 4 */}
          <div className="border border-border/60 bg-card/30 rounded p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground">Repository & Issue Activity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filters out stale or abandoned discussions by verifying recent repository activity, maintainer engagement, and issue freshness signals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Freshness & staleness checks
            </div>
          </div>

          {/* Item 5 */}
          <div className="border border-border/60 bg-card/30 rounded p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <FileCode2 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground">Targeted File Guidance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Surfaces the specific repository modules, interfaces, and file paths requiring edits, removing the friction of navigating large unfamiliar codebases.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              File-level context isolation
            </div>
          </div>

          {/* Item 6 */}
          <div className="border border-border/60 bg-card/30 rounded p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-2.5">
              <div className="w-7 h-7 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground">Implementation Guidance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Outlines architectural context, dependencies, and actionable implementation steps so you can prepare pull requests efficiently.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Actionable contribution steps
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03. HOW IT WORKS (The Contribution Loop Timeline) ─── */}
      <section id="workflow" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            THE CONTRIBUTION LOOP
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
            From "I found an issue" to "I know what to change."
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xl">
            A 5-stage engineering workflow designed to take developers from skill connection to prepared pull request.
          </p>
        </div>

        <Timeline
          steps={[
            {
              step: "[01]",
              title: "Connect GitHub & Ingest Stack",
              description:
                "Authenticate via OAuth to ingest active language distributions, public repositories, and framework toolchains without manual survey questionnaires.",
              details: ["OAuth token ingestion", "Language byte calculation", "Commit velocity check"],
              tag: "INGESTION",
            },
            {
              step: "[02]",
              title: "Discover Relevant, Active Issues",
              description:
                "Query indexed open-source issues filtered against your stack, preferred difficulty level, and verified repository activity signals.",
              details: ["Freshness verification", "Staleness filtering", "Label classification"],
              tag: "DISCOVERY",
            },
            {
              step: "[03]",
              title: "Understand the Match & Compatibility Breakdown",
              description:
                "Review multi-signal match scoring that details why an issue fits your technical experience, along with explicit gap indicators.",
              details: ["0–100 deterministic score", "Language & difficulty weight", "Reason & gap breakdown"],
              tag: "EVALUATION",
            },
            {
              step: "[04]",
              title: "Extract Codebase Context & Target Files",
              description:
                "Access targeted repository context that highlights relevant entry points, dependencies, and exact file paths requiring modification.",
              details: ["Target file path isolation", "Module dependency context", "Architecture references"],
              tag: "CONTEXT",
            },
            {
              step: "[05]",
              title: "Prepare Implementation with Confidence",
              description:
                "Follow step-by-step guidance, run repository test suites, and write code with full architectural readiness before submitting your PR.",
              details: ["Validation commands", "Local build guidance", "PR readiness checklist"],
              tag: "CONTRIBUTION",
            },
          ]}
        />
      </section>

      {/* ─── 04. WHY IT IS DIFFERENT (Interactive Compare Slider) ─── */}
      <section id="comparison" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            THE WORKFLOW ADVANTAGE
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
            Stop guessing where to start.
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xl">
            Traditional open-source discovery leaves developers lost in unfamiliar codebases. StackAudit provides structured contribution intelligence.
          </p>
        </div>

        <Compare
          firstLabel="Traditional Approach"
          secondLabel="StackAudit Intelligence"
          firstContent={
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-semibold">
                <AlertCircle className="w-4 h-4" /> Traditional OSS Friction
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Navigating open-source projects without contextual tooling often leads to wasted effort:
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Large unfamiliar repositories:</strong> Wading through massive codebases with zero guidance on where logic resides.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Vague issue descriptions:</strong> Incomplete requirements without clear difficulty or estimated completion time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Searching blind across files:</strong> Guessing which files to edit and breaking unrelated modules.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Uncertain contribution outcomes:</strong> Submitting PRs on stale or abandoned issues that go unreviewed.</span>
                </li>
              </ul>
            </div>
          }
          secondContent={
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" /> StackAudit Contribution Intelligence
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                A structured, developer-focused workflow providing actionable context before you start coding:
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Deterministic skill alignment:</strong> Verified matching against your active languages and difficulty preferences.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Explainable suitability score:</strong> Transparent breakdown of language fit, maintainer signals, and skill gaps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Target file isolation:</strong> Direct pointers to specific files and interfaces requiring modification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Verified issue freshness:</strong> Activity signals checked to ensure maintainers are actively reviewing PRs.</span>
                </li>
              </ul>
            </div>
          }
        />
      </section>

      {/* ─── 05. WHAT THE USER ACTUALLY GETS (Representative Product Output) ─── */}
      <section id="artifacts" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            PRODUCT ARTIFACTS
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
            See the intelligence before you contribute.
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xl">
            Inspect representative outputs generated during the StackAudit matching and preparation lifecycle.
          </p>
        </div>

        <div className="border border-border/60 bg-card/20 rounded p-4 sm:p-6">
          <Tabs
            defaultTab="match"
            tabs={[
              {
                id: "profile",
                label: "Developer Profile",
                badge: "INGESTED",
                content: (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="border border-border/60 bg-card/60 rounded p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">Top Languages</div>
                        <div className="text-sm font-semibold text-foreground mt-1">TypeScript, Rust, Go</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Calculated from 14 public repos</div>
                      </div>
                      <div className="border border-border/60 bg-card/60 rounded p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">Target Difficulty</div>
                        <div className="text-sm font-semibold text-foreground mt-1">Intermediate</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Focus: Bug fixes & Features</div>
                      </div>
                      <div className="border border-border/60 bg-card/60 rounded p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">Contribution Velocity</div>
                        <div className="text-sm font-semibold text-foreground mt-1">Active Committer</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Synced with GitHub Events API</div>
                      </div>
                    </div>

                    <div className="border border-border/60 bg-card/40 rounded p-3 font-mono text-xs text-muted-foreground">
                      <div className="text-[10px] text-zinc-400 uppercase font-semibold mb-1.5">Observed Language Distribution</div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between"><span>TypeScript</span><span className="text-foreground">58% (342 KB)</span></div>
                        <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-foreground h-full rounded-full" style={{ width: "58%" }} />
                        </div>
                        <div className="flex justify-between pt-1"><span>Rust</span><span className="text-foreground">26% (154 KB)</span></div>
                        <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-zinc-400 h-full rounded-full" style={{ width: "26%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "match",
                label: "Issue Match Engine",
                badge: "SCORED 88/100",
                content: (
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-border/60 bg-card/60 rounded">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">trpc / trpc</span>
                          <span className="text-[10px] font-mono bg-secondary/80 border border-border/60 px-1.5 py-0.2 rounded text-muted-foreground">
                            Issue #4812
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mt-1">
                          Fix batch response validation for nested input routers
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-muted-foreground uppercase">Compatibility</div>
                          <div className="text-base font-bold font-mono text-emerald-400">88%</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-border/60 bg-card/40 rounded p-3 space-y-2">
                        <div className="text-[10px] font-mono font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
                          <Check className="w-3 h-3" /> Match Reasons
                        </div>
                        <ul className="text-xs space-y-1.5 text-zinc-300">
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-mono text-[10px]">•</span>
                            <span>Primary language (TypeScript) directly matches your active stack.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-mono text-[10px]">•</span>
                            <span>Estimated difficulty (Intermediate) matches preferred profile complexity.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-mono text-[10px]">•</span>
                            <span>Repository has active commits in the last 7 days and low staleness.</span>
                          </li>
                        </ul>
                      </div>

                      <div className="border border-border/60 bg-card/40 rounded p-3 space-y-2">
                        <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3" /> Technical Gaps & Signals
                        </div>
                        <ul className="text-xs space-y-1.5 text-zinc-400">
                          <li className="flex items-start gap-1.5">
                            <span className="text-zinc-500 font-mono text-[10px]">•</span>
                            <span>Involves internal router transformer types; review type definitions first.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-zinc-500 font-mono text-[10px]">•</span>
                            <span>Requires running the core package test suite locally.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "context",
                label: "Codebase Context",
                badge: "BLUEPRINT",
                content: (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs text-muted-foreground">
                      StackAudit isolates target files and provides architectural guidance directly alongside the issue:
                    </div>
                    <CodeBlock
                      filename="packages/server/src/core/internals/procedureBuilder.ts"
                      language="typescript"
                      highlightLines={[4, 5, 8]}
                      code={`// StackAudit Contribution Blueprint — Target File Guidance
// Repository: trpc/trpc | Issue: #4812 (Batch response validation)

import { TRPCError } from '../../error/TRPCError';
import type { ProcedureType } from '../types';

export function validateBatchInput(input: unknown, isBatch: boolean) {
  // Target fix: validate nested input arrays when batching is enabled
  if (isBatch && Array.isArray(input)) {
    return input.map((item) => executeSingleValidation(item));
  }
  return executeSingleValidation(input);
}`}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* ─── 06. COMPACT FINAL CTA ─── */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto w-full border-t border-border/40">
        <div className="border border-border/60 bg-card/30 rounded p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              GET STARTED
            </span>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">
              Ready to find your next contribution?
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Connect your GitHub profile or explore active issues suited to your technical stack.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={() => router.push(session ? "/discover" : "/login")}
              className="h-9 px-5 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium gap-2 shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" /> Start discovering
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/profile")}
              className="h-9 px-4 text-xs border-border/80 hover:bg-secondary/40 font-medium"
            >
              Configure Profile
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 07. MINIMAL DEVELOPER FOOTER ─── */}
      <footer className="mt-auto border-t border-border/40 py-8 px-4 sm:px-6 bg-card/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-foreground font-mono text-[11px]">StackAudit</span>
            <span className="text-border">/</span>
            <span className="text-muted-foreground text-[11px]">Open-source contribution intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/discover" className="hover:text-foreground transition-colors">
              Opportunities
            </Link>
            <Link href="/profile" className="hover:text-foreground transition-colors">
              Profile
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating dock navigation at bottom */}
      <FloatingDock
        items={[
          { title: "Home", icon: <Compass className="w-full h-full" />, href: "/" },
          { title: "Discover", icon: <Layers className="w-full h-full" />, href: "/discover" },
          { title: "Profile", icon: <ShieldCheck className="w-full h-full" />, href: "/profile" },
          { title: "GitHub", icon: <Github className="w-full h-full" />, href: "https://github.com" },
        ]}
      />
    </div>
  );
}
