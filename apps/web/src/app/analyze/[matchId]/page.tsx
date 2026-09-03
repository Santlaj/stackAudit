"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ExternalLink, Check, AlertCircle, BookOpen, Lightbulb, 
  ChevronDown, ChevronUp, FileText, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE, IssueMatch, startAnalysis, updateMatchStatus, getMatch } from "@/lib/api";
import { PipelineProgress, AnalysisStatus } from "@/components/analysis/pipeline-progress";
import { ShimmerLoader } from "@/components/ui/shimmer-loader";

function parseApproachSteps(text: any): string[] {
  if (!text) return [];
  if (Array.isArray(text)) return text.map(String);
  const str = String(text);
  const lines = str.split(/(?:^|\n|\s+)(?:\d+[\.\)]\s+)/).map(s => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  return str.split(/\n+/).map(s => s.replace(/^\d+[\.\)]\s*/, "").trim()).filter(Boolean);
}

export default function AnalyzePage({ params }: { params: Promise<{ matchId: string }> }) {
  const router = useRouter();
  const { matchId } = React.use(params);

  const [match, setMatch] = useState<IssueMatch | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("NOT_STARTED");
  const [context, setContext] = useState<any>(null);
  const [error, setError] = useState<string | undefined>();
  const [isStarting, setIsStarting] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [isFilesExpanded, setIsFilesExpanded] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    async function loadMatch() {
      try {
        const data = await getMatch(matchId);
        setMatch(data);
      } catch (err) {
        console.error("Failed to load match", err);
      } finally {
        setLoadingMatch(false);
      }
    }
    loadMatch();
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    let eventSource: EventSource | null = null;

    async function initAnalysis() {
      try {
        const data = await startAnalysis(matchId);
        
        if (data.status === "COMPLETED") {
          setStatus("COMPLETED");
          setContext(data.context);
        } else if (data.status === "FAILED") {
          setStatus("FAILED");
          setError(data.error);
        } else {
          setStatus(data.status);
          eventSource = new EventSource(`${API_BASE}/api/analysis/${matchId}/stream`, {
            withCredentials: true,
          });

          eventSource.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              
              if (payload.status === "COMPLETED") {
                setIsFinishing(true);
                setContext(payload.context);
                eventSource?.close();
                
                setTimeout(() => {
                  setStatus("COMPLETED");
                  setIsFinishing(false);
                }, 1200); // Wait 1.2s then show completed content
              } else if (payload.status === "FAILED") {
                setStatus("FAILED");
                setError(payload.error);
                eventSource?.close();
              } else {
                setStatus(payload.status);
              }
            } catch (e) {
              console.error("Failed to parse SSE event", e);
            }
          };

          eventSource.onerror = (e) => {
            console.error("SSE stream error", e);
            eventSource?.close();
            setStatus("FAILED");
            setError("Connection to analysis stream lost.");
          };
        }
      } catch (err: any) {
        setStatus("FAILED");
        setError(err.message || "Failed to start analysis");
      }
    }

    initAnalysis();

    return () => {
      eventSource?.close();
    };
  }, [matchId]);

  const handleStartContribution = async () => {
    setIsStarting(true);
    try {
      await updateMatchStatus(matchId, "STARTED");
      router.push("/saved"); 
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  if (loadingMatch) {
    return (
      <div className="h-screen bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
        <ShimmerLoader text="Loading workspace..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="h-screen bg-[#f5f5f5] flex flex-col items-center justify-center overflow-hidden">
        <p className="text-sm text-muted-foreground mb-4">Contribution match not found.</p>
        <Button variant="outline" onClick={() => router.push("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  const skillFitScore = Math.round((match.matchScore || 100) * 0.92);
  const difficultyScore = Math.round((match.matchScore || 100) * 0.80);
  const activityScore = Math.round((match.matchScore || 100) * 0.91);

  const relevantFiles: Array<{ file: string; role: string; source: string }> = 
    context?.graphify?.relevantFiles || [];

  const visibleFiles = isFilesExpanded ? relevantFiles : relevantFiles.slice(0, 5);
  const approachSteps = parseApproachSteps(context?.synthesis?.implementationApproach);

  const knowledgeGaps: string[] = context?.synthesis?.knowledgeGaps?.length 
    ? context.synthesis.knowledgeGaps 
    : [
        "Understanding of Maven build configuration, especially the Surefire plugin and property propagation.",
        "Familiarity with JUnit test assumptions (Assume.assumeTrue) and how they interact with environment properties."
      ];

  return (
    <div className="h-screen w-full bg-[#f4f4f4] flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 bg-white px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 text-sm text-muted-foreground font-medium">
              <span 
                onClick={() => router.push("/discover")} 
                className="cursor-pointer hover:text-foreground transition-colors"
              >
                Discover
              </span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-muted-foreground truncate">{match.repository}</span>
              <a href={match.issueUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors inline-flex">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <h1 className="text-base font-semibold text-foreground truncate pr-4">{match.issueTitle}</h1>
          </div>
        </div>
        
        <div className="shrink-0 flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-emerald-500">{match.matchScore || 100}%</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">MATCH</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span>{match.technologies?.[0] || "Java"}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="capitalize">{match.complexity || "Beginner"}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="capitalize text-foreground">{match.repositoryActivity?.status || "Active"}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 flex overflow-hidden w-full">
        
        {/* Left Column: Sidebar */}
        <aside className="w-[320px] lg:w-[360px] shrink-0 flex flex-col overflow-y-auto">
          <div className="flex-1 px-6 py-6 lg:px-8 lg:py-8 flex flex-col gap-10">
            
            {/* CONTRIBUTION FIT */}
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-5">CONTRIBUTION FIT</h2>
              <div className="space-y-5">
                {/* Metric 1 */}
                <div>
                  <div className="flex justify-between items-center text-[13px] mb-2">
                    <span className="text-gray-700 font-medium">Skill fit</span>
                    <span className="text-emerald-500 font-bold">{skillFitScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${skillFitScore}%` }} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div>
                  <div className="flex justify-between items-center text-[13px] mb-2">
                    <span className="text-gray-700 font-medium">Difficulty</span>
                    <span className="text-emerald-500 font-bold">{difficultyScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${difficultyScore}%` }} />
                  </div>
                </div>

                {/* Metric 3 */}
                <div>
                  <div className="flex justify-between items-center text-[13px] mb-2">
                    <span className="text-gray-700 font-medium">Activity</span>
                    <span className="text-emerald-500 font-bold">{activityScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${activityScore}%` }} />
                  </div>
                </div>
              </div>
            </section>

            {/* WHY IT MATCHES */}
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">WHY IT MATCHES</h2>
              <ul className="space-y-4">
                {match.reasons && match.reasons.length > 0 ? (
                  match.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-gray-600 leading-snug">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3 text-[13px] text-gray-600 leading-snug">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Strong language match: {match.technologies?.[0] || "Java"} alignment.</span>
                    </li>
                    <li className="flex items-start gap-3 text-[13px] text-gray-600 leading-snug">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>This is a beginner-friendly issue, matching your preference.</span>
                    </li>
                    <li className="flex items-start gap-3 text-[13px] text-gray-600 leading-snug">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>This is a bug issue, which matches your preferred contribution types.</span>
                    </li>
                    <li className="flex items-start gap-3 text-[13px] text-gray-600 leading-snug">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Repository is highly active and actively maintained.</span>
                    </li>
                  </>
                )}
              </ul>
            </section>

            {/* KNOWLEDGE GAPS */}
            <section>
              <div className="flex items-center gap-1.5 mb-2">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">KNOWLEDGE GAPS</h2>
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {match.missingSignals || "No major knowledge gaps identified."}
              </p>
            </section>
            
          </div>
          
          <div className="px-6 pb-6 lg:px-8 lg:pb-8 mt-auto">
            <Button 
              onClick={handleStartContribution} 
              disabled={isStarting} 
              className="w-full h-11 bg-[#1a1a1a] text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              {isStarting ? "Starting..." : "Start Contribution"}
            </Button>
          </div>
        </aside>

        {/* Right Column: Main Content */}
        <div className="flex-1 py-6 pr-6 lg:py-8 lg:pr-8 pl-0 lg:pl-2 flex flex-col overflow-hidden">
          
          {isFinishing ? (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-black/5 w-full flex items-center justify-center">
              <ShimmerLoader text="Preparing workspace..." />
            </div>
          ) : status !== "COMPLETED" ? (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-black/5 p-8 w-full">
              <PipelineProgress 
                status={status} 
                error={error} 
                repositoryFullName={match.repository}
                stars={match.repositoryActivity?.stars}
                openIssues={match.repositoryActivity?.openIssues}
              />
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-black/5 w-full flex flex-col overflow-hidden">
              
              {/* Scrollable Inner Area for Content */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-12">
                
                {/* 1. TOP SECTION */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">REPOSITORY CONTEXT</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-8">Deep repository analysis and implementation guidance.</p>

                  {/* Architecture */}
                  <div className="mb-10">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Architecture</h4>
                    <div className="flex flex-col xl:flex-row items-start gap-8 xl:gap-16">
                      <p className="text-[13px] text-gray-600 leading-relaxed flex-1 max-w-3xl">
                        {context?.graphify?.architectureContext || `The repository is a ${match.technologies?.[0] || "JavaScript"} project containing tracked source files and structured modules.`}
                      </p>
                      
                      {/* Architecture Diagram Illustration */}
                      <div className="hidden lg:flex shrink-0 items-center justify-center p-3 border border-gray-200 rounded-xl bg-gray-50/50 w-64 h-28">
                        <svg viewBox="0 0 150 75" className="w-full h-full text-gray-400" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="8" y="8" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.05" />
                          <path d="M8 12h7l1.5 2h9.5" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M17 20v40m0-26h12m-12 13h12m-12 13h12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                          <rect x="31" y="28" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                          <rect x="31" y="41" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                          <rect x="31" y="54" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                          
                          <rect x="75" y="10" width="65" height="54" rx="4" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.02" />
                          <line x1="75" y1="21" x2="140" y2="21" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
                          <circle cx="82" cy="16" r="1.5" fill="#10b981" />
                          <circle cx="87" cy="16" r="1.5" fill="#f59e0b" />
                          <circle cx="92" cy="16" r="1.5" fill="#ef4444" />
                          <path d="M96 38l-4 4 4 4m14-8l4 4-4 4m-7 8l5-16" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Relevant Files */}
                  <div className="max-w-5xl mb-10">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Relevant Files</h4>
                    <div className="flex flex-col">
                      {(visibleFiles.length > 0 ? visibleFiles : [
                        { file: "hugegraph-server/hugegraph-dist/src/assembly/travis/install-hstore.sh", role: "primary" },
                        { file: "docker/docker-compose-hstore.yml", role: "supporting" },
                        { file: "hugegraph-server/Dockerfile-hstore", role: "supporting" },
                        { file: "docker/conf/hubble/hstore-ha.properties", role: "supporting" },
                        { file: "docker/conf/hubble/hstore.properties", role: "supporting" }
                      ]).map((f: any, i: number) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-center gap-3 font-mono text-[13px] text-gray-600 min-w-0 pr-8">
                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate">{f.file}</span>
                          </div>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-md shrink-0 ml-3 ${
                            f.role?.toLowerCase() === 'primary'
                              ? 'bg-emerald-50 text-emerald-600 font-medium'
                              : 'bg-gray-50 text-gray-500'
                          }`}>
                            {f.role?.toLowerCase() === 'primary' ? 'Primary' : 'Supporting'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* View all relevant files option */}
                    {relevantFiles.length > 5 && (
                      <div className="pt-4">
                        <button
                          onClick={() => setIsFilesExpanded(!isFilesExpanded)}
                          className="text-[13px] font-medium text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5 transition-colors"
                        >
                          {isFilesExpanded ? (
                            <>View fewer files <ChevronUp className="w-3.5 h-3.5" /></>
                          ) : (
                            <>View all relevant files ({Math.max(relevantFiles.length, 8)}) <ChevronDown className="w-3.5 h-3.5" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested approach (Moved here) */}
                  <div className="max-w-5xl">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Suggested approach</h4>
                    <div className="space-y-4">
                      {(approachSteps.length > 0 ? approachSteps : [
                        "Open the install-hstore.sh and trace commands setting environment variables or passing Maven properties.",
                        "Review docker-compose-hstore.yml and Dockerfile-hstore to see how the container is built and started.",
                        "Examine hstore.properties and hstore-ha.properties for backend/property codec configuration.",
                        "Identify the exact property name used by the server binary writer.",
                        "Modify Surefire configuration so the backend property is only applied to API-test scope.",
                        "Run the core-test suite in Docker to verify previously exposed failures are resolved."
                      ]).map((step, i) => (
                        <div key={i} className="flex items-start gap-3.5 text-[13px]">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="leading-relaxed text-gray-600">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100" />

                {/* 2. BOTTOM 50/50 SECTION */}
                <section className="flex flex-col lg:flex-row gap-12 max-w-6xl">
                  {/* Left Column: Implementation Guidance */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-4 h-4 text-gray-400" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">IMPLEMENTATION GUIDANCE</h3>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">What to understand first</h4>
                    <p className="text-[13px] text-gray-600 leading-relaxed">
                      {context?.synthesis?.whatToUnderstandFirst || "Understand how the test environment is provisioned, examine related script handlers, and determine where parameters are injected into runtime containers."}
                    </p>
                  </div>

                  {/* Right Column: Specific Knowledge Required */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">SPECIFIC KNOWLEDGE REQUIRED</h3>
                    </div>
                    <ul className="space-y-3">
                      {knowledgeGaps.map((gap, i) => (
                        <li key={i} className="flex items-start gap-3 text-[13px] text-gray-600">
                          <AlertCircle className="w-4 h-4 text-amber-500/80 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
