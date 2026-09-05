"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/shell";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { 
  Bookmark, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { IssueMatch, getSavedMatches, toggleSaveMatch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SavedPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [matches, setMatches] = React.useState<IssueMatch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const fetchMatches = React.useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const data = await getSavedMatches();
      setMatches(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  React.useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleUnsave = async (matchId: string) => {
    setActionError(null);
    try {
      // Optimistically remove
      setMatches(prev => prev.filter(m => m.id !== matchId));
      await toggleSaveMatch(matchId);
    } catch (err: any) {
      setActionError(err.message || "Unable to unsave contribution.");
      fetchMatches(); // Revert on failure
    }
  };

  // Group 1: In Progress (STARTED) — sorted by updatedAt descending
  const inProgressMatches = React.useMemo(() => {
    return matches
      .filter(m => m.status === "STARTED")
      .sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [matches]);

  // Group 2: Saved for Later (SAVED, ANALYZED) — sorted by updatedAt descending
  const savedForLaterMatches = React.useMemo(() => {
    return matches
      .filter(m => m.status === "SAVED" || m.status === "ANALYZED")
      .sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [matches]);

  const hasAnyContributions = inProgressMatches.length > 0 || savedForLaterMatches.length > 0;

  const renderCard = (match: IssueMatch, isInProgress: boolean) => {
    const formattedDate = match.updatedAt
      ? new Date(match.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : null;

    return (
      <div 
        key={match.id} 
        className="border border-border/60 bg-card rounded-md p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:border-border transition-colors"
      >
        <div className="space-y-1.5 min-w-0 flex-1">
          {/* Metadata Row: Repo, Status Badge, Match Score */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground font-mono truncate max-w-[220px]" title={match.repository}>
              {match.repository}
            </span>

            {/* Contribution Lifecycle Status Badge */}
            {match.status === "STARTED" ? (
              <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 px-1.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                In Progress
              </Badge>
            ) : match.status === "ANALYZED" ? (
              <Badge variant="outline" className="text-[10px] font-semibold border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 px-1.5 py-0.5">
                Analyzed
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0.5">
                Saved
              </Badge>
            )}

            {/* Real Match Score */}
            {typeof match.matchScore === "number" && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                {match.matchScore}% Match
              </span>
            )}

            {/* Complexity */}
            {match.complexity && (
              <span className="text-[10px] text-muted-foreground bg-secondary/70 px-1.5 py-0.5 rounded-sm">
                {match.complexity}
              </span>
            )}
          </div>

          {/* Issue Title */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            {match.issueTitle}
          </h3>

          {/* Tags & Persisted Timestamp */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-muted-foreground">
            {match.contributionType && (
              <span className="text-[11px] text-muted-foreground">{match.contributionType}</span>
            )}
            {match.contributionType && match.technologies.length > 0 && (
              <span className="text-muted-foreground/40 select-none">·</span>
            )}
            {match.technologies.slice(0, 3).map((tech, idx) => (
              <React.Fragment key={tech}>
                <span className="text-[11px] font-mono text-muted-foreground">{tech}</span>
                {(idx < 2 && idx < match.technologies.length - 1) && (
                  <span className="text-muted-foreground/40 select-none">·</span>
                )}
              </React.Fragment>
            ))}

            {formattedDate && (
              <>
                <span className="text-muted-foreground/40 select-none">·</span>
                <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {isInProgress ? `Started ${formattedDate}` : `Saved ${formattedDate}`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
          {isInProgress ? (
            /* Primary action for STARTED: Continue Contribution */
            <Button 
              size="sm" 
              onClick={() => router.push(`/analyze/${match.id}`)}
              className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Continue Contribution
            </Button>
          ) : (
            /* Primary action for SAVED/ANALYZED: Open Workspace / Open Analysis */
            <Button 
              variant="default"
              size="sm" 
              onClick={() => router.push(`/analyze/${match.id}`)}
              className="h-8 text-xs font-medium gap-1.5 cursor-pointer"
            >
              {match.status === "ANALYZED" ? "Open Workspace" : "Open Analysis"}
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}

          {/* GitHub link */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(match.issueUrl, "_blank")}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="View original issue on GitHub"
          >
            GitHub <ExternalLink className="w-3 h-3" />
          </Button>

          {/* Unsave button (only for saved-for-later items; in-progress items are retained in active workspace) */}
          {!isInProgress && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleUnsave(match.id)}
              className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Remove from saved contributions"
            >
              Unsave
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <Shell>
        <PageContainer>
          <PageHeader 
            title="Contribution Hub" 
            description="Resume active contributions or review opportunities saved for later." 
          />

          {actionError && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground/50" />
            </div>
          ) : !hasAnyContributions ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/50 rounded-lg bg-card/20 p-6">
              <Bookmark className="h-6 w-6 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">No saved contributions yet.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed">
                Save an issue from Discover or Analyze and it will appear here so you can return to it later.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/discover")}
                className="mt-4 text-xs font-medium"
              >
                Find Opportunities
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group 1: IN PROGRESS */}
              {inProgressMatches.length > 0 && (
                <section aria-labelledby="in-progress-heading" className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <h2 id="in-progress-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        In Progress
                      </h2>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                        {inProgressMatches.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Sorted by most recently active
                    </span>
                  </div>

                  <div className="grid gap-2.5">
                    {inProgressMatches.map(match => renderCard(match, true))}
                  </div>
                </section>
              )}

              {/* Group 2: SAVED FOR LATER */}
              {savedForLaterMatches.length > 0 && (
                <section aria-labelledby="saved-for-later-heading" className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <h2 id="saved-for-later-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Saved for Later
                      </h2>
                      <span className="text-[11px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.2 rounded-full">
                        {savedForLaterMatches.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Sorted by most recently saved
                    </span>
                  </div>

                  <div className="grid gap-2.5">
                    {savedForLaterMatches.map(match => renderCard(match, false))}
                  </div>
                </section>
              )}
            </div>
          )}
        </PageContainer>
      </Shell>
    </ProtectedRoute>
  );
}
