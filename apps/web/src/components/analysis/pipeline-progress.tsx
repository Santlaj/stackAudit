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

export function PipelineProgress({ status, error, repositoryFullName = "yakew7/Fair-Code", stars = null, openIssues = null }: PipelineProgressProps) {
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

  if (status === "FAILED") {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">{error || "An unexpected error occurred while analyzing the repository. Please try again."}</p>
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
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-8">ANALYSIS PIPELINE</h3>
        
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
                      isDone ? "bg-emerald-500" : "bg-gray-100"
                    }`} />
                  )}

                  {/* Step Circle */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300 ${
                    isDone 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : isActive 
                        ? "bg-white border-emerald-500 text-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                        : "bg-white border-gray-200 text-gray-300"
                  }`}>
                    {isDone ? <Check className="w-4 h-4 font-bold" /> : <span className="text-[13px] font-bold">{idx + 1}</span>}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1.5">
                    <h4 className={`text-[15px] font-semibold mb-1.5 transition-colors ${
                      isActive || isDone ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {step.label}
                    </h4>
                    <p className={`text-[13px] leading-relaxed mb-3 ${isActive ? "text-gray-600" : "text-gray-400"}`}>
                      {step.description}
                    </p>
                    
                    {/* Badge */}
                    <div className="flex items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isDone 
                          ? "bg-emerald-50 text-emerald-600"
                          : isActive
                            ? "bg-emerald-50/50 text-emerald-500 border border-emerald-100"
                            : "bg-gray-50 text-gray-400 border border-gray-100"
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
            <div className="border border-gray-200/60 rounded-2xl p-6 shadow-sm bg-white/50 h-full flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shrink-0">
                  <Github className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1 truncate" title={repositoryFullName}>
                    {repositoryFullName}
                  </h2>
                  {(stars != null || openIssues != null) && (
                    <div className="flex items-center gap-4 text-[12px] font-medium text-gray-500">
                      {stars != null && (
                        <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> {stars.toLocaleString()} Stars</span>
                      )}
                      {openIssues != null && (
                        <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> {openIssues.toLocaleString()} Issues</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 text-[13px] font-medium">
                  <span className="text-gray-600">Repository scan progress</span>
                  <span className="text-emerald-500 font-bold">{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
            <div className="absolute w-64 h-64 border-[1.5px] border-gray-100 rounded-full animate-spin-reverse-slow">
              {/* Outer Ring Icons */}
              <div className="absolute top-0 left-1/2 -mt-4 -ml-4 bg-white border border-gray-100 shadow-sm p-2 rounded-full text-emerald-500 animate-orbit-counter-reverse">
                <File className="w-4 h-4" />
              </div>
              <div className="absolute bottom-0 left-1/2 -mb-4 -ml-4 bg-white border border-gray-100 shadow-sm p-2 rounded-full text-emerald-500 animate-orbit-counter-reverse">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="absolute left-0 top-1/2 -ml-4 -mt-4 bg-white border border-gray-100 shadow-sm p-2 rounded-full text-emerald-500 animate-orbit-counter-reverse">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="absolute right-0 top-1/2 -mr-4 -mt-4 bg-white border border-gray-100 shadow-sm p-2 rounded-full text-emerald-500 animate-orbit-counter-reverse">
                <Database className="w-4 h-4" />
              </div>
            </div>

            {/* Inner Ring */}
            <div className="absolute w-40 h-40 border-[1.5px] border-emerald-50 rounded-full animate-spin-slow">
              <div className="absolute top-[10%] right-[10%] w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute bottom-[20%] left-[5%] w-1.5 h-1.5 bg-emerald-300 rounded-full" />
              <div className="absolute bottom-[10%] right-[30%] w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Center Hub */}
            <div className="w-16 h-16 bg-white border border-gray-100 shadow-lg shadow-emerald-500/10 rounded-2xl flex items-center justify-center z-10 text-emerald-500 relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-2xl animate-pulse" />
              <Folder className="w-7 h-7 relative z-10 fill-emerald-100" />
            </div>
          </div>
        </div>

        {/* Bottom Half: "WHAT WE ARE DOING" Feature Cards */}
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">WHAT WE ARE DOING</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {[
            { id: 0, title: "Repository scan", icon: Scan, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Analyzing repository structure, files, and configuration." },
            { id: 1, title: "Code intelligence", icon: Box, color: "text-purple-600", bg: "bg-purple-50", desc: "Understanding dependencies, modules, and how they interact." },
            { id: 2, title: "Issue context", icon: Target, color: "text-amber-600", bg: "bg-amber-50", desc: "Extracting relevant code context related to this issue." },
            { id: 3, title: "Preparing guidance", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", desc: "Generating actionable implementation steps and best practices." }
          ].map((card, i) => {
            const state = getCardState(i, status);
            const Icon = card.icon;
            
            return (
              <div key={i} className={`border rounded-2xl p-5 flex flex-col relative overflow-hidden transition-all duration-300 ${
                state === 'active' ? 'border-emerald-200 shadow-sm bg-white' : 'border-gray-100 bg-gray-50/30'
              }`}>
                {/* Colored Icon Box */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${
                  state === 'pending' ? 'bg-gray-100 text-gray-400' : `${card.bg} ${card.color}`
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <h4 className={`text-[13px] font-bold mb-2 ${state === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                  {card.title}
                </h4>
                <p className={`text-[12px] leading-relaxed mb-6 ${state === 'pending' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {card.desc}
                </p>
                
                {/* Dots indicator at bottom */}
                <div className="mt-auto flex items-center gap-1.5 h-4">
                  {state === 'done' && (
                    <>
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')}`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')}`} />
                    </>
                  )}
                  {state === 'active' && (
                    <>
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')} dot-bounce`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')} dot-bounce`} />
                      <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')} dot-bounce`} />
                      <div className={`w-1.5 h-1.5 rounded-full bg-gray-200`} />
                    </>
                  )}
                  {state === 'pending' && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Very Bottom: "Almost there!" Banner */}
        <div className="mt-auto bg-[#F0FDF4] rounded-2xl p-5 md:p-6 flex items-start gap-4 relative overflow-hidden border border-[#DCFCE7]">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 relative z-10">
            <Zap className="w-4 h-4 fill-emerald-600" />
          </div>
          <div className="relative z-10">
            <h4 className="text-sm font-bold text-emerald-900 mb-1">Almost there!</h4>
            <p className="text-[13px] text-emerald-800/80 max-w-xl">
              This usually takes 30-60 seconds. We're analyzing the repository to give you the best guidance possible.
            </p>
          </div>
          
          {/* Decorative Waves SVG at bottom right */}
          <div className="absolute right-0 bottom-0 opacity-40 pointer-events-none">
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
