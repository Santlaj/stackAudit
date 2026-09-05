"use client";

import { useEffect, useState } from "react";
import { 
  Check, 
  Circle, 
  Github, 
  Box, 
  Scan, 
  Target, 
  FileText, 
  Folder, 
  File, 
  Database, 
  Code2, 
  Zap,
  GitBranch,
  XCircle,
  GitCommit,
  Star,
  AlertCircle
} from "lucide-react";

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
  repositoryFullName?: string;
  stars?: number | null;
  openIssues?: number | null;
}

const STEPS = [
  { 
    id: "REPOSITORY_LOADING", 
    label: "Loading repository", 
    description: "Fetching repository data, issues, and metadata...",
    activeStates: ["QUEUED", "REPOSITORY_LOADING"],
    doneStates: ["REPOSITORY_LOADED", "GRAPH_BUILDING", "ARCHITECTURE_ANALYZED", "RELEVANT_FILES_IDENTIFIED", "CONTEXT_SYNTHESIZED", "COMPLETED"] 
  },
  { 
    id: "GRAPH_BUILDING", 
    label: "Inspecting architecture", 
    description: "Understanding project structure, dependencies, and modules...",
    activeStates: ["REPOSITORY_LOADED", "GRAPH_BUILDING", "ARCHITECTURE_ANALYZED"],
    doneStates: ["RELEVANT_FILES_IDENTIFIED", "CONTEXT_SYNTHESIZED", "COMPLETED"] 
  },
  { 
    id: "RELEVANT_FILES_IDENTIFIED", 
    label: "Identifying relevant files", 
    description: "Locating files related to this issue using code intelligence...",
    activeStates: ["RELEVANT_FILES_IDENTIFIED"],
    doneStates: ["CONTEXT_SYNTHESIZED", "COMPLETED"] 
  },
  { 
    id: "CONTEXT_SYNTHESIZED", 
    label: "Generating context", 
    description: "Preparing implementation guidance, code insights, and next steps...",
    activeStates: ["CONTEXT_SYNTHESIZED"],
    doneStates: ["COMPLETED"] 
  }
];

// Helper to determine which "What we are doing" card is active
function getCardState(stepIndex: number, currentStatus: AnalysisStatus) {
  if (currentStatus === "FAILED") return "failed";
  if (currentStatus === "COMPLETED") return "done";
  
  const step = STEPS[stepIndex];
  if (step.doneStates.includes(currentStatus)) return "done";
  if (step.activeStates.includes(currentStatus)) return "active";
  return "pending";
}

export function PipelineProgress({ status, error, repositoryFullName = "Repository", stars = null, openIssues = null }: PipelineProgressProps) {
  // Simulated intractable progress bar
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "COMPLETED") {
      setProgress(100);
      return;
    }
    if (status === "FAILED") return;
    
    // Simulate natural progress easing up to 98%
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 4;
        const next = prev + increment;
        return next > 98 ? 98 : next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [status]);

  let progressLabel = "Initializing...";
  if (status === "COMPLETED") {
    progressLabel = "Analysis completed";
  } else {
    const activeStep = STEPS.find(
      step => step.activeStates.includes(status) && !step.doneStates.includes(status)
    );
    if (activeStep) {
      progressLabel = `${activeStep.label} progress`;
    } else if (status === "QUEUED") {
      progressLabel = "Queued for analysis";
    }
  }

  if (status === "FAILED") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-destructive/10 text-red-500 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">Analysis Failed</h2>
          <p className="text-sm text-gray-500 dark:text-muted-foreground max-w-md mx-auto">{error || "An unexpected error occurred while analyzing the repository. Please try again."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-12 lg:gap-16 w-full h-full max-w-7xl mx-auto">
      {/* Required Custom Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes orbit-counter {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 30s linear infinite;
        }
        .animate-orbit-counter {
          animation: orbit-counter 20s linear infinite;
        }
        .animate-orbit-counter-reverse {
          animation: spin-slow 30s linear infinite; 
        }
        .dot-bounce {
          animation: dot-bounce 1.4s infinite ease-in-out both;
        }
        .dot-bounce:nth-child(1) { animation-delay: -0.32s; }
        .dot-bounce:nth-child(2) { animation-delay: -0.16s; }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* LEFT COLUMN: Vertical Stepper */}
      <div className="w-full xl:w-72 shrink-0">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-muted-foreground mb-8">ANALYSIS PIPELINE</h3>
        
        <div className="relative">
          <div className="flex flex-col">
            {STEPS.map((step, idx) => {
              const isDone = step.doneStates.includes(status);
              const isActive = step.activeStates.includes(status) && !isDone;
              const isPending = !isDone && !isActive;
              const isLast = idx === STEPS.length - 1;

              return (
                <div key={step.id} className="flex items-start gap-5 relative pb-10 last:pb-0">
                  {/* Vertical connecting line to next step */}
                  {!isLast && (
                    <div className={`absolute left-[15px] top-8 bottom-0 w-[2px] transition-colors duration-500 ${
                      isDone ? "bg-emerald-500" : "bg-gray-100 dark:bg-border"
                    }`} />
                  )}

                  {/* Step Circle */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300 ${
                    isDone 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : isActive 
                        ? "bg-white dark:bg-card border-emerald-500 text-emerald-500 dark:text-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"
                        : "bg-white dark:bg-card border-gray-200 dark:border-border text-gray-300 dark:text-muted-foreground/50"
                  }`}>
                    {isDone ? <Check className="w-4 h-4 font-bold" /> : <span className="text-[13px] font-bold">{idx + 1}</span>}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1.5">
                    <h4 className={`text-[15px] font-semibold mb-1.5 transition-colors ${
                      isActive || isDone ? "text-gray-900 dark:text-foreground" : "text-gray-400 dark:text-muted-foreground/60"
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-[13px] leading-relaxed mb-3 ${isActive ? "text-gray-600 dark:text-muted-foreground" : "text-gray-400 dark:text-muted-foreground/60"}`}>
                      {step.description}
                    </p>
                    
                    {/* Badge */}
                    <div className="flex items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isDone 
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40"
                          : isActive
                            ? "bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40"
                            : "bg-gray-50 dark:bg-secondary/50 text-gray-400 dark:text-muted-foreground/60 border border-gray-100 dark:border-border"
                      }`}>
                        {isDone ? "Completed" : isActive ? "In progress" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dashboard & Animations */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Half: Repo Card & Orbital Animation */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          
          {/* Repo Card */}
          <div className="flex-1">
            <div className="border border-gray-200/60 dark:border-border rounded-2xl p-6 shadow-sm bg-white/50 dark:bg-card/60 backdrop-blur-xs h-full flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 bg-gray-900 dark:bg-secondary dark:border dark:border-border text-white dark:text-foreground rounded-full flex items-center justify-center shrink-0">
                  <Github className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-foreground mb-1 truncate" title={repositoryFullName}>
                    {repositoryFullName}
                  </h2>
                  {(stars != null || openIssues != null) && (
                    <div className="flex items-center gap-4 text-[12px] font-medium text-gray-500 dark:text-muted-foreground">
                      {stars != null && (
                        <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" /> {stars.toLocaleString()} Stars</span>
                      )}
                      {openIssues != null && (
                        <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-muted-foreground" /> {openIssues.toLocaleString()} Issues</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 text-[13px] font-medium">
                  <span className="text-gray-600 dark:text-muted-foreground">{progressLabel}</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Orbital Animation Area */}
          <div className="w-full lg:w-72 xl:w-80 h-64 shrink-0 flex items-center justify-center relative">
            
            {/* Outer Ring */}
            <div className="absolute w-64 h-64 border-[1.5px] border-gray-100 dark:border-border/60 rounded-full animate-spin-reverse-slow">
              {/* Outer Ring Icons */}
              <div className="absolute top-0 left-1/2 -mt-4 -ml-4 bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm p-2 rounded-full text-emerald-500 dark:text-emerald-400 animate-orbit-counter-reverse">
                <File className="w-4 h-4" />
              </div>
              <div className="absolute bottom-0 left-1/2 -mb-4 -ml-4 bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm p-2 rounded-full text-emerald-500 dark:text-emerald-400 animate-orbit-counter-reverse">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="absolute left-0 top-1/2 -ml-4 -mt-4 bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm p-2 rounded-full text-emerald-500 dark:text-emerald-400 animate-orbit-counter-reverse">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="absolute right-0 top-1/2 -mr-4 -mt-4 bg-white dark:bg-card border border-gray-100 dark:border-border shadow-sm p-2 rounded-full text-emerald-500 dark:text-emerald-400 animate-orbit-counter-reverse">
                <Database className="w-4 h-4" />
              </div>
            </div>

            {/* Inner Ring */}
            <div className="absolute w-40 h-40 border-[1.5px] border-emerald-50 dark:border-emerald-900/30 rounded-full animate-spin-slow">
              <div className="absolute top-[10%] right-[10%] w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute bottom-[20%] left-[5%] w-1.5 h-1.5 bg-emerald-300 rounded-full" />
              <div className="absolute bottom-[10%] right-[30%] w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Center Hub */}
            <div className="w-16 h-16 bg-white dark:bg-card border border-gray-100 dark:border-border shadow-lg shadow-emerald-500/10 rounded-2xl flex items-center justify-center z-10 text-emerald-500 dark:text-emerald-400 relative">
              <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl animate-pulse" />
              <Folder className="w-7 h-7 relative z-10 fill-emerald-100 dark:fill-emerald-900/50" />
            </div>
          </div>
        </div>

        {/* Bottom Half: "WHAT WE ARE DOING" Feature Cards */}
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-muted-foreground mb-5">WHAT WE ARE DOING</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {[
            { id: 0, title: STEPS[0].label, icon: Scan, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/40", dotColor: "bg-emerald-500", desc: STEPS[0].description },
            { id: 1, title: STEPS[1].label, icon: Box, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-800/40", dotColor: "bg-purple-500", desc: STEPS[1].description },
            { id: 2, title: STEPS[2].label, icon: Target, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800/40", dotColor: "bg-amber-500", desc: STEPS[2].description },
            { id: 3, title: STEPS[3].label, icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800/40", dotColor: "bg-blue-500", desc: STEPS[3].description }
          ].map((card, i) => {
            const state = getCardState(i, status);
            const Icon = card.icon;
            
            return (
              <div key={i} className={`border rounded-2xl p-5 flex flex-col relative overflow-hidden transition-all duration-300 ${
                state === 'active' 
                  ? 'border-emerald-200 dark:border-emerald-800/60 shadow-sm bg-white dark:bg-card' 
                  : 'border-gray-100 dark:border-border bg-gray-50/30 dark:bg-card/40'
              }`}>
                {/* Colored Icon Box */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${
                  state === 'pending' ? 'bg-gray-100 dark:bg-secondary text-gray-400 dark:text-muted-foreground' : `${card.bg} ${card.color}`
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <h4 className={`text-[13px] font-bold mb-2 ${state === 'pending' ? 'text-gray-400 dark:text-muted-foreground/60' : 'text-gray-900 dark:text-foreground'}`}>
                  {card.title}
                </h4>
                <p className={`text-[12px] leading-relaxed mb-6 ${state === 'pending' ? 'text-gray-400 dark:text-muted-foreground/50' : 'text-gray-500 dark:text-muted-foreground'}`}>
                  {card.desc}
                </p>
                
                {/* Dots indicator at bottom */}
                <div className="mt-auto flex items-center gap-1.5 h-4">
                  {state === 'done' && (
                    <>
                      <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
                    </>
                  )}
                  {state === 'active' && (
                    <>
                      <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor} dot-bounce`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor} dot-bounce`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor} dot-bounce`} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-secondary" />
                    </>
                  )}
                  {state === 'pending' && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-secondary" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-secondary" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-secondary" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-secondary" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Very Bottom: "Almost there!" Banner */}
        <div className="mt-auto bg-[#F0FDF4] dark:bg-emerald-950/20 rounded-2xl p-5 md:p-6 flex items-start gap-4 relative overflow-hidden border border-[#DCFCE7] dark:border-emerald-900/40">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 relative z-10">
            <Zap className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
          </div>
          <div className="relative z-10">
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-1">Almost there!</h4>
            <p className="text-[13px] text-emerald-800/80 dark:text-emerald-300/80 max-w-xl">
              This usually takes 30-60 seconds. We're analyzing the repository to give you the best guidance possible.
            </p>
          </div>
          
          {/* Decorative Waves SVG at bottom right */}
          <div className="absolute right-0 bottom-0 opacity-40 dark:opacity-15 pointer-events-none">
            <svg width="400" height="60" viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 60V30C40 30 60 10 100 10C140 10 160 50 200 50C240 50 260 20 300 20C340 20 360 40 400 40V60H0Z" fill="#86EFAC" fillOpacity="0.3" />
              <path d="M0 60V45C50 45 70 25 120 25C170 25 190 55 240 55C290 55 310 35 360 35C380 35 390 40 400 45V60H0Z" fill="#4ADE80" fillOpacity="0.2" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
