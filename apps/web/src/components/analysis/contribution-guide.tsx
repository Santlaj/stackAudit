"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Compass, 
  FileCode, 
  ShieldAlert, 
  ArrowRight,
  Terminal,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GuideStepUnderstand {
  title?: string;
  guidance: string;
  goal?: string;
  investigationQuestion?: string;
}

export interface GuideStepTrace {
  title?: string;
  guidance: string;
  goal?: string;
  investigationQuestion?: string;
  evidence?: string[];
}

export interface GuideStepIdentify {
  title?: string;
  guidance: string;
  goal?: string;
  investigationQuestion?: string;
  evidence?: string[];
}

export interface GuideStepPlan {
  title?: string;
  guidance: string;
  goal?: string;
  investigationQuestions?: string[];
}

export interface GuideStepValidate {
  title?: string;
  guidance: string;
  goal?: string;
  commands?: string[];
  doneCriteria?: string[];
}

export interface ContributionGuideSteps {
  understand?: GuideStepUnderstand;
  trace?: GuideStepTrace;
  identify?: GuideStepIdentify;
  plan?: GuideStepPlan;
  validate?: GuideStepValidate;
}

export interface ContributionGuideProps extends React.HTMLAttributes<HTMLDivElement> {
  matchId: string;
  context?: {
    graphify?: {
      architectureContext?: string;
      relevantFiles?: Array<{ file: string; role: string; source: string }>;
    };
    synthesis?: {
      whyFilesMatter?: string;
      whatToUnderstandFirst?: string;
      implementationApproach?: string;
      knowledgeGaps?: string[];
      guideSteps?: ContributionGuideSteps;
    };
  } | null;
}

interface StepDefinition {
  phase: number;
  id: string;
  name: string;
  title: string;
  objective: string;
  questions: string[];
  guidanceText: string;
  suggestedFiles: Array<{ file: string; role: string }>;
  evidence?: string[];
  commands?: string[];
  doneCriteria?: string[];
  hint?: string;
}

export function ContributionGuide({
  matchId,
  context,
  className,
  ...props
}: ContributionGuideProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1]));
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

  // Restore step progress from localStorage
  useEffect(() => {
    if (!matchId) return;
    try {
      const saved = localStorage.getItem(`stackaudit-guide-step-${matchId}`);
      if (saved) {
        const stepNum = parseInt(saved, 10);
        if (stepNum >= 1 && stepNum <= 5) {
          setActiveStep(stepNum);
          setExpandedSteps(new Set([stepNum]));
          const visited = new Set<number>();
          for (let i = 1; i <= stepNum; i++) visited.add(i);
          setVisitedSteps(visited);
        }
      }
    } catch (e) {
      console.warn("Could not read guide progress from localStorage", e);
    }
  }, [matchId]);

  // Persist active step
  const handleSetActiveStep = (stepNum: number) => {
    setActiveStep(stepNum);
    setExpandedSteps((prev) => new Set([...prev, stepNum]));
    setVisitedSteps((prev) => new Set([...prev, stepNum]));
    try {
      localStorage.setItem(`stackaudit-guide-step-${matchId}`, String(stepNum));
    } catch (e) {
      console.warn("Could not save guide progress to localStorage", e);
    }
  };

  const toggleStepExpansion = (stepNum: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  };

  const toggleHint = (stepNum: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  };

  const guideSteps = context?.synthesis?.guideSteps;
  const relevantFiles = context?.graphify?.relevantFiles || [];
  const primaryFiles = relevantFiles.filter((f) => f.role?.toLowerCase() === "primary");
  const supportingFiles = relevantFiles.filter((f) => f.role?.toLowerCase() !== "primary");

  // Map independently generated guide steps (or fallback if guideSteps not present)
  const steps: StepDefinition[] = [
    {
      phase: 1,
      id: "understand",
      name: "Understand",
      title: guideSteps?.understand?.title || "Understand the Problem & System Architecture",
      objective: guideSteps?.understand?.goal || "Grasp what the issue is reporting, how the relevant subsystem is structured, and what behavior is expected.",
      questions: guideSteps?.understand?.investigationQuestion
        ? [guideSteps.understand.investigationQuestion]
        : [
            "What specific behavior is failing or requested in the issue description?",
            "Which module or subsystem owns this responsibility according to repository structure?",
          ],
      guidanceText:
        guideSteps?.understand?.guidance ||
        context?.synthesis?.whatToUnderstandFirst ||
        "Review the issue description and system entry points to understand the intended workflow.",
      suggestedFiles: primaryFiles.length > 0 ? primaryFiles : relevantFiles.slice(0, 2),
      hint: context?.graphify?.architectureContext || "Examine project entry points and configuration files first.",
    },
    {
      phase: 2,
      id: "trace",
      name: "Trace",
      title: guideSteps?.trace?.title || "Trace Code Execution Path",
      objective: guideSteps?.trace?.goal || "Follow the execution call chain through identified source files to pinpoint where the logic branches.",
      questions: guideSteps?.trace?.investigationQuestion
        ? [guideSteps.trace.investigationQuestion]
        : [
            "Where does data or configuration enter the relevant component?",
            "Which function or class handles the transformation or validation?",
          ],
      guidanceText:
        guideSteps?.trace?.guidance ||
        context?.synthesis?.whyFilesMatter ||
        "Inspect the primary files and trace references to understand how parameters propagate.",
      suggestedFiles: primaryFiles.slice(0, 3),
      evidence: guideSteps?.trace?.evidence,
      hint: context?.synthesis?.whyFilesMatter || "Look for existing error handling or branching conditions in the primary file.",
    },
    {
      phase: 3,
      id: "identify",
      name: "Identify",
      title: guideSteps?.identify?.title || "Identify the Required Change",
      objective: guideSteps?.identify?.goal || "Isolate the exact condition, missing validation, or incorrect assumption causing the issue.",
      questions: guideSteps?.identify?.investigationQuestion
        ? [guideSteps.identify.investigationQuestion]
        : [
            "What condition triggers the defect or missing functionality?",
            "Are there edge cases or boundary conditions that must be accounted for?",
          ],
      guidanceText:
        guideSteps?.identify?.guidance ||
        "Determine the exact mechanism in the codebase where the defect originates.",
      suggestedFiles: supportingFiles.slice(0, 3),
      evidence: guideSteps?.identify?.evidence,
      hint: "Check git blame or past commits on this file to see why the current logic was written this way.",
    },
    {
      phase: 4,
      id: "plan",
      name: "Plan",
      title: guideSteps?.plan?.title || "Plan Implementation & Tests",
      objective: guideSteps?.plan?.goal || "Design a minimal, backwards-compatible solution and identify relevant test files to verify your fix.",
      questions: guideSteps?.plan?.investigationQuestions && guideSteps.plan.investigationQuestions.length > 0
        ? guideSteps.plan.investigationQuestions
        : [
            "What is the smallest change that completely fixes the issue without breaking existing callers?",
            "Which test file tests this component?",
          ],
      guidanceText:
        guideSteps?.plan?.guidance ||
        "Formulate your implementation strategy. Write a failing test case first if a test suite is present.",
      suggestedFiles: relevantFiles.filter((f) => f.file.toLowerCase().includes("test")),
      hint: "Look for existing test fixtures or mocks in the test directory to reuse test setup.",
    },
    {
      phase: 5,
      id: "validate",
      name: "Validate",
      title: guideSteps?.validate?.title || "Validate & Prepare Contribution",
      objective: guideSteps?.validate?.goal || "Run tests locally, ensure no regressions exist, and format the contribution per project standards.",
      questions: [
        "Do all existing unit and integration tests pass?",
        "Does your change follow the project's coding style, linting rules, and documentation standards?",
      ],
      guidanceText:
        guideSteps?.validate?.guidance ||
        "Run the test suite locally. Verify both positive and negative cases before opening a Pull Request.",
      suggestedFiles: [],
      commands: guideSteps?.validate?.commands,
      doneCriteria: guideSteps?.validate?.doneCriteria,
      hint: "Review CONTRIBUTING.md or the repository README for PR submission guidelines.",
    },
  ];

  return (
    <section
      id="contribution-guide-section"
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-xs space-y-6 transition-colors",
        className
      )}
      aria-label="Contribution Guide and Guided Workflow"
      {...props}
    >
      {/* Section Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Contribution Guide</span>
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">
            Step {activeStep} of 5
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Five-phase guided workflow to understand, trace, and successfully contribute to this issue.
        </p>
      </div>

      {/* GuideStepper — Horizontal Step Indicators */}
      <nav aria-label="Contribution workflow steps" className="border-y border-border/80 py-3">
        <ol className="grid grid-cols-5 gap-2">
          {steps.map((step) => {
            const isActive = step.phase === activeStep;
            const isVisited = visitedSteps.has(step.phase);

            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    handleSetActiveStep(step.phase);
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-md transition-colors flex flex-col gap-1 outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isActive
                      ? "bg-secondary text-foreground font-semibold border-l-2 border-emerald-600 dark:border-emerald-400"
                      : isVisited
                      ? "hover:bg-secondary/60 text-foreground/80"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    {isVisited && !isActive ? (
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <span className="shrink-0">{step.phase}.</span>
                    )}
                    <span className="truncate hidden sm:inline">{step.name}</span>
                  </div>
                  <div className="text-[10px] truncate text-muted-foreground hidden md:block">
                    {step.title.split(" ")[0]}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Accordion Steps List */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isExpanded = expandedSteps.has(step.phase);
          const isActive = step.phase === activeStep;
          const isVisited = visitedSteps.has(step.phase);
          const hintRevealed = revealedHints.has(step.phase);

          return (
            <div
              key={step.id}
              className={cn(
                "rounded-md border transition-all duration-150 overflow-hidden",
                isActive
                  ? "border-emerald-600/40 bg-card shadow-xs"
                  : isExpanded
                  ? "border-border bg-card/80"
                  : "border-border/60 bg-secondary/20 hover:bg-secondary/40"
              )}
            >
              {/* Step Header (Clickable Accordion Trigger) */}
              <button
                type="button"
                onClick={() => toggleStepExpansion(step.phase)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between p-3.5 text-left outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs shrink-0 font-medium transition-colors",
                      isActive
                        ? "bg-emerald-600 text-white"
                        : isVisited
                        ? "bg-secondary text-foreground border border-border"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isVisited && !isActive ? <Check className="h-3.5 w-3.5" /> : step.phase}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-foreground truncate">
                        {step.title}
                      </h3>
                      {isActive && (
                        <Badge
                          variant="default"
                          className="bg-emerald-600 hover:bg-emerald-600 text-[10px] px-1.5 py-0 uppercase tracking-wider font-mono h-4"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-xl">
                        {step.objective}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-muted-foreground">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Step Body (Expanded Content) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-4 text-xs">
                  {/* Objective */}
                  <div className="p-3 rounded-md bg-secondary/40 border border-border/60">
                    <span className="font-semibold text-foreground block mb-0.5">Objective:</span>
                    <p className="text-foreground/90 leading-relaxed">{step.objective}</p>
                  </div>

                  {/* Grounded Guidance */}
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                      Repository Guidance
                    </h4>
                    <p className="text-foreground/85 leading-relaxed whitespace-pre-line font-sans">
                      {step.guidanceText}
                    </p>
                  </div>

                  {/* Key Questions to Answer */}
                  {step.questions.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                        Key Questions to Answer
                      </h4>
                      <ul className="space-y-1 pl-1">
                        {step.questions.map((q, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-foreground/85 leading-relaxed">
                            <span className="text-muted-foreground font-mono">Q{idx + 1}:</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence / Code Anchors to Inspect */}
                  {step.evidence && step.evidence.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                        Evidence & Points of Investigation
                      </h4>
                      <div className="space-y-1">
                        {step.evidence.map((ev, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded border border-border/70 bg-card font-mono text-[11px] text-foreground/90"
                          >
                            {ev}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files to Inspect for this step */}
                  {step.suggestedFiles.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                        Files to Inspect
                      </h4>
                      <div className="space-y-1">
                        {step.suggestedFiles.map((f, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded border border-border/70 bg-card font-mono text-[11px]"
                          >
                            <span className="text-foreground truncate">{f.file}</span>
                            <span className="text-[10px] text-muted-foreground capitalize shrink-0 ml-2">
                              {f.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Commands to Run (Validation Step) */}
                  {step.commands && step.commands.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Verified Validation Commands</span>
                      </h4>
                      <div className="space-y-1">
                        {step.commands.map((cmd, idx) => (
                          <pre
                            key={idx}
                            className="p-2 rounded bg-secondary/60 border border-border/80 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 overflow-x-auto"
                          >
                            <code>{cmd}</code>
                          </pre>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Done Criteria (Validation Step) */}
                  {step.doneCriteria && step.doneCriteria.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Contribution Readiness (Done Criteria)</span>
                      </h4>
                      <ul className="space-y-1 pl-1">
                        {step.doneCriteria.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-foreground/85 leading-relaxed">
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Step Hint Progressive Disclosure */}
                  {step.hint && (
                    <div className="pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => toggleHint(step.phase)}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{hintRevealed ? "Hide guidance hint" : "Need a hint for this step?"}</span>
                      </button>
                      {hintRevealed && (
                        <div className="mt-2 p-2.5 rounded bg-secondary/30 border border-border/60 text-muted-foreground italic leading-relaxed">
                          {step.hint}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action row: Next step button */}
                  {step.phase < 5 && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetActiveStep(step.phase + 1)}
                        className="text-xs h-8 gap-1.5 font-medium border-border"
                      >
                        <span>Next: {steps[step.phase]?.name}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
