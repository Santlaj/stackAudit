"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export type AnalysisStatus = 
  | "NOT_STARTED"
  | "QUEUED"
  | "REPOSITORY_LOADING"
  | "REPOSITORY_LOADED"
  | "GRAPH_BUILDING"
  | "ARCHITECTURE_ANALYZED"
  | "RELEVANT_FILES_IDENTIFIED"
  | "CONTEXT_SYNTHESIZED"
  | "COMPLETED"
  | "FAILED";

interface PipelineProgressProps {
  status: AnalysisStatus;
  error?: string;
}

const STEPS = [
  { 
    id: "REPOSITORY_LOADING", 
    label: "Loading repository", 
    activeStates: ["QUEUED", "REPOSITORY_LOADING"],
    doneStates: ["REPOSITORY_LOADED", "GRAPH_BUILDING", "ARCHITECTURE_ANALYZED", "RELEVANT_FILES_IDENTIFIED", "CONTEXT_SYNTHESIZED", "COMPLETED"] 
  },
  { 
    id: "GRAPH_BUILDING", 
    label: "Inspecting architecture", 
    activeStates: ["REPOSITORY_LOADED", "GRAPH_BUILDING"],
    doneStates: ["ARCHITECTURE_ANALYZED", "RELEVANT_FILES_IDENTIFIED", "CONTEXT_SYNTHESIZED", "COMPLETED"] 
  },
  { 
    id: "RELEVANT_FILES_IDENTIFIED", 
    label: "Identifying relevant files", 
    activeStates: ["ARCHITECTURE_ANALYZED", "RELEVANT_FILES_IDENTIFIED"],
    doneStates: ["CONTEXT_SYNTHESIZED", "COMPLETED"] 
  },
  { 
    id: "CONTEXT_SYNTHESIZED", 
    label: "Generating context", 
    activeStates: ["CONTEXT_SYNTHESIZED"],
    doneStates: ["COMPLETED"] 
  }
];

export function PipelineProgress({ status, error }: PipelineProgressProps) {
  return (
    <div className="space-y-6 max-w-xl">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Analysis Pipeline</h3>
      
      <div className="space-y-4 font-mono text-sm">
        {STEPS.map((step, idx) => {
          const isFailed = status === "FAILED";
          const isDone = step.doneStates.includes(status);
          const isActive = !isFailed && !isDone && step.activeStates.includes(status);
          const isWaiting = !isFailed && !isDone && !isActive;
          const failedOnThisStep = isFailed && step.activeStates.includes(status);

          return (
            <div key={step.id} className="flex items-center gap-4">
              <div className="w-5 flex justify-center shrink-0">
                {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {isActive && <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />}
                {isWaiting && <Circle className="h-4 w-4 text-muted-foreground/30" />}
                {failedOnThisStep && <XCircle className="h-4 w-4 text-destructive" />}
                {isFailed && !failedOnThisStep && !isDone && <Circle className="h-4 w-4 text-muted-foreground/30" />}
              </div>

              <span className={`
                ${isDone ? "text-foreground" : ""}
                ${isActive ? "text-emerald-500 font-medium" : ""}
                ${isWaiting ? "text-muted-foreground" : ""}
                ${failedOnThisStep ? "text-destructive font-medium" : ""}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === "FAILED" && (
        <div className="mt-8 pt-6 border-t border-border/40">
          <div className="flex items-start gap-3 bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm font-sans mb-1">Analysis Failed</p>
              <p className="text-sm font-sans">{error || "An unknown error occurred during analysis."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
