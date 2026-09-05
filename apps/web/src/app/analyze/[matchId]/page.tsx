"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { API_BASE, IssueMatch, startAnalysis, updateMatchStatus, getMatch, toggleSaveMatch } from "@/lib/api";
import { PipelineProgress, AnalysisStatus } from "@/components/analysis/pipeline-progress";
import { ShimmerLoader } from "@/components/ui/shimmer-loader";
import { AnalyzeShell } from "@/components/analysis/analyze-shell";
import { AnalyzeHeader } from "@/components/analysis/analyze-header";
import { AnalyzeLayout } from "@/components/analysis/analyze-layout";
import { RepositoryContext } from "@/components/analysis/repository-context";
import { RelevantFiles } from "@/components/analysis/relevant-files";
import { ContributionGuide } from "@/components/analysis/contribution-guide";
import { MatchBadge } from "@/components/analysis/match-badge";
import { EnvironmentSetup } from "@/components/analysis/environment-setup";
import { RepositoryStatus } from "@/components/analysis/repository-status";
import { HintCard } from "@/components/analysis/hint-card";
import { Bookmark, BookmarkCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function AnalyzePage({ params }: { params: Promise<{ matchId: string }> }) {
  const router = useRouter();
  const { matchId } = React.use(params);

  const [match, setMatch] = useState<IssueMatch | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("NOT_STARTED");
  const [context, setContext] = useState<any>(null);
  const [error, setError] = useState<string | undefined>();
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);
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
    let isCancelled = false;

    async function initAnalysis() {
      try {
        const data = await startAnalysis(matchId);
        if (isCancelled) return;
        
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
            if (isCancelled) return;
            try {
              const payload = JSON.parse(event.data);
              
              if (payload.status === "COMPLETED") {
                setIsFinishing(true);
                setContext(payload.context);
                eventSource?.close();
                
                setTimeout(() => {
                  if (!isCancelled) {
                    setStatus("COMPLETED");
                    setIsFinishing(false);
                  }
                }, 1200);
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
            if (isCancelled) return;
            console.error("SSE stream error", e);
            eventSource?.close();
            setStatus("FAILED");
            setError("Connection to analysis stream lost.");
          };
        }
      } catch (err: any) {
        if (!isCancelled) {
          setStatus("FAILED");
          setError(err.message || "Failed to start analysis");
        }
      }
    }

    initAnalysis();

    return () => {
      isCancelled = true;
      eventSource?.close();
    };
  }, [matchId]);

  const handleStartContribution = async () => {
    if (match?.status === "STARTED") {
      if (match.issueUrl) {
        const opened = window.open(match.issueUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
          window.location.href = match.issueUrl;
        }
      }
      return;
    }

    setIsStarting(true);
    setActionError(null);
    try {
      const updated = await updateMatchStatus(matchId, "STARTED");
      setMatch(prev => prev ? { ...prev, status: updated.status } : updated);

      // Redirect to GitHub issue
      if (match?.issueUrl) {
        const opened = window.open(match.issueUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
          window.location.href = match.issueUrl;
        }
      }
    } catch (err: any) {
      setActionError(err.message || "Unable to start contribution. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleToggleSave = async () => {
    setIsSaving(true);
    setActionError(null);
    try {
      const updated = await toggleSaveMatch(matchId);
      setMatch(prev => prev ? { ...prev, status: updated.status } : updated);
    } catch (err: any) {
      setActionError(err.message || "Unable to update saved status.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingMatch) {
    return (
      <AnalyzeShell className="flex items-center justify-center min-h-screen">
        <ShimmerLoader text="Loading workspace..." />
      </AnalyzeShell>
    );
  }

  if (!match) {
    return (
      <AnalyzeShell className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <p className="text-sm text-muted-foreground mb-4 font-medium">Contribution match not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/discover")}>
          Return to Discover
        </Button>
      </AnalyzeShell>
    );
  }

  const relevantFiles: Array<{ file: string; role: string; source: string }> = 
    context?.graphify?.relevantFiles || [];

  const knowledgeGaps: string[] = context?.synthesis?.knowledgeGaps || [];

  return (
    <AnalyzeShell>
      {/* Top Header with Popover MatchBadge */}
      <AnalyzeHeader 
        match={match} 
        matchBadgeSlot={<MatchBadge match={match} knowledgeGaps={knowledgeGaps} />}
      />

      {/* Loading Pipeline State: Renders the orbital PipelineProgress with Dark Mode support */}
      {isFinishing ? (
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <ShimmerLoader text="Preparing workspace guidance..." />
        </div>
      ) : status !== "COMPLETED" ? (
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-xs">
            <PipelineProgress 
              status={status} 
              error={error} 
              repositoryFullName={match.repository}
              stars={match.repositoryActivity?.stars}
              openIssues={match.repositoryActivity?.openIssues}
            />
          </div>
        </div>
      ) : (
        /* Completed Workspace: Newer Analysis Data Section */
        <AnalyzeLayout
          mainColumn={
            <>
              {/* Section 1: Repository Context (Tabs: Architecture, Tech Stack, Key Directories) */}
              <RepositoryContext match={match} context={context} />

              {/* Section 2: Relevant Files (Grouped Primary/Supporting, Expandable Rows, GitHub Links) */}
              <RelevantFiles
                files={relevantFiles}
                repository={match.repository}
                whyFilesMatter={context?.synthesis?.whyFilesMatter}
              />

              {/* Section 3: Contribution Guide (5-Phase Guided Workflow with Step Stepper & Persistence) */}
              <ContributionGuide matchId={matchId} context={context} />
            </>
          }
          rightRail={
            <>
              {/* Card 1: Contribution Workflow Actions */}
              <div className="rounded-lg border border-border bg-card p-4 shadow-xs space-y-3">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    {match.status === "STARTED" ? "Contribution Active" : "Start Contribution"}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {match.status === "STARTED"
                      ? "You are actively contributing to this issue. Continue following the guided workflow below."
                      : "Ready to work on this issue? Marking as started tracks your progress in your contribution workspace."}
                  </p>
                </div>

                {actionError && (
                  <div className="flex items-start gap-2 p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {/* Primary Action: Start or Continue */}
                  {match.status === "STARTED" ? (
                    <Button
                      onClick={handleStartContribution}
                      className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Continue Contribution
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartContribution}
                      disabled={isStarting}
                      className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      {isStarting ? "Starting..." : "Start Contribution"}
                    </Button>
                  )}

                  {/* Secondary Action: Save Contribution */}
                  {match.status === "STARTED" ? (
                    <div className="flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Saved in your in-progress workspace</span>
                    </div>
                  ) : match.status === "SAVED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleSave}
                      disabled={isSaving}
                      className="w-full h-8 text-xs font-medium text-foreground hover:bg-secondary/60 border-border gap-1.5 cursor-pointer"
                    >
                      <BookmarkCheck className="h-3.5 w-3.5 text-emerald-500" />
                      {isSaving ? "Updating..." : "Saved (Click to unsave)"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleSave}
                      disabled={isSaving}
                      className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 border-border gap-1.5 cursor-pointer"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      {isSaving ? "Saving..." : "Save Contribution"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Card 2: Environment Setup (OS Selector & Honest Unscanned State) */}
              <EnvironmentSetup repositoryFullName={match.repository} />

              {/* Card 3: Progressive Hint Card (Conceptual & Targeted hints) */}
              <HintCard
                level1Hint={context?.synthesis?.whatToUnderstandFirst}
                level2Hint={context?.synthesis?.whyFilesMatter}
              />

              {/* Card 4: Repository Status (Clean Real Metrics) */}
              <RepositoryStatus match={match} />
            </>
          }
        />
      )}
    </AnalyzeShell>
  );
}
