"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, ExternalLink, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE, IssueMatch, startAnalysis, updateMatchStatus, getMatch } from "@/lib/api";
import { PipelineProgress, AnalysisStatus } from "@/components/analysis/pipeline-progress";
import { FileTreeContext } from "@/components/analysis/file-tree-context";
import { ShimmerLoader } from "@/components/ui/shimmer-loader";

export default function AnalyzePage({ params }: { params: { matchId: string } }) {
  const router = useRouter();
  const { matchId } = params;

  const [match, setMatch] = useState<IssueMatch | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("NOT_STARTED");
  const [context, setContext] = useState<any>(null);
  const [error, setError] = useState<string | undefined>();
  const [isStarting, setIsStarting] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(true);

  useEffect(() => {
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
              setStatus(payload.status);
              
              if (payload.status === "COMPLETED") {
                setContext(payload.context);
                eventSource?.close();
              } else if (payload.status === "FAILED") {
                setError(payload.error);
                eventSource?.close();
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ShimmerLoader text="Loading workspace..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground mb-4">Contribution match not found.</p>
        <Button variant="outline" onClick={() => router.push("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Header */}
      <header className="border-b border-border/40 bg-card shrink-0">
        <div className="px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Discover</span>
                <span className="text-muted-foreground/30">/</span>
                <span className="text-xs font-mono text-muted-foreground truncate">{match.repository}</span>
                <a href={match.issueUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors inline-flex">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <h1 className="text-base font-semibold text-foreground truncate pr-4">{match.issueTitle}</h1>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight text-emerald-500">{match.matchScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MATCH</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-medium">
                {match.technologies.slice(0, 1).map(t => <span key={t}>{t}</span>)}
                {match.complexity && <span className="capitalize text-muted-foreground/50">· {match.complexity}</span>}
                {match.repositoryActivity?.status && (
                  <span className="flex items-center gap-1 text-muted-foreground/50 capitalize">
                    · <span className={`w-1.5 h-1.5 rounded-full ${
                      match.repositoryActivity.status === "active" ? "bg-emerald-500" :
                      match.repositoryActivity.status === "moderate" ? "bg-amber-500" :
                      match.repositoryActivity.status === "low" ? "bg-orange-500" :
                      "bg-muted-foreground"
                    }`} />
                    {match.repositoryActivity.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Contribution Fit */}
        <div className="w-80 shrink-0 border-r border-border/40 bg-card/30 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 flex flex-col gap-8">
            
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Contribution Fit</h2>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-foreground/80">
                  <span>Skill fit</span>
                  <span className="text-emerald-500 font-bold">{Math.round((match.matchScore || 0) * 0.92)}</span>
                </div>
                <div className="flex justify-between items-center text-foreground/80">
                  <span>Difficulty</span>
                  <span className="text-emerald-500 font-bold">{Math.round((match.matchScore || 0) * 0.80)}</span>
                </div>
                <div className="flex justify-between items-center text-foreground/80">
                  <span>Activity</span>
                  <span className="text-emerald-500 font-bold">{Math.round((match.matchScore || 0) * 0.91)}</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Why it matches</h2>
              <ul className="space-y-2.5">
                {match.reasons && match.reasons.length > 0 ? (
                  match.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2.5 text-xs text-foreground/90">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">Strong technical alignment.</span>
                  </li>
                )}
              </ul>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Knowledge Gaps</h2>
              <ul className="space-y-2.5">
                {match.gaps && match.gaps.length > 0 ? (
                  match.gaps.map((gap, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <span className="w-3.5 h-3.5 rounded-full border border-amber-500/50 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{gap}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <span className="leading-relaxed">No major knowledge gaps identified.</span>
                  </li>
                )}
              </ul>
            </section>

            <div className="mt-4">
              <Button 
                onClick={handleStartContribution} 
                disabled={isStarting || status !== "COMPLETED"} 
                className="w-full h-8 text-xs font-medium"
              >
                {isStarting ? "Starting..." : "Start Contribution"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Repository Context */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            
            <div className="mb-10">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Repository Context</h2>
              <p className="text-sm text-muted-foreground">Deep repository analysis and implementation guidance.</p>
            </div>

            {status !== "COMPLETED" ? (
              <div className="max-w-xl">
                <PipelineProgress status={status} error={error} />
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Architecture */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-4">Architecture</h3>
                  <div className="text-sm text-foreground/80 leading-relaxed max-w-3xl whitespace-pre-wrap">
                    {context?.graphify?.architectureContext || "No architecture data available."}
                  </div>
                </section>

                {/* Relevant Files */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-4">Relevant Files</h3>
                  <div className="bg-card/50 border border-border/40 rounded-sm p-4 max-w-3xl">
                    <FileTreeContext files={context?.graphify?.relevantFiles || []} />
                  </div>
                  <div className="mt-4 max-w-3xl">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Why these files matter</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {context?.synthesis?.whyFilesMatter || "No explanation provided."}
                    </p>
                  </div>
                </section>

                {/* Implementation Guidance */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-4">Implementation Guidance</h3>
                  <div className="space-y-6 max-w-3xl">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">What to understand first</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {context?.synthesis?.whatToUnderstandFirst || "No guidance provided."}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Suggested Approach</h4>
                      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                        {context?.synthesis?.implementationApproach || "No approach provided."}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Synthesis Knowledge Gaps */}
                {context?.synthesis?.knowledgeGaps?.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-2 mb-4">Specific Knowledge Required</h3>
                    <ul className="space-y-3 max-w-3xl">
                      {context.synthesis.knowledgeGaps.map((gap: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
