"use client";

import * as React from "react";
import { Shell } from "@/components/layout/shell";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Bookmark, ExternalLink, RefreshCw } from "lucide-react";
import { IssueMatch, getSavedMatches, toggleSaveMatch } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function SavedPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = React.useState<IssueMatch[]>([]);
  const [loading, setLoading] = React.useState(true);

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
    try {
      // Optimistically remove
      setMatches(prev => prev.filter(m => m.id !== matchId));
      await toggleSaveMatch(matchId);
    } catch (err) {
      console.error(err);
      fetchMatches(); // Revert on failure
    }
  };

  return (
    <ProtectedRoute>
      <Shell>
        <PageContainer>
          <PageHeader 
            title="Saved Contributions" 
            description="Opportunities you've saved to review later." 
          />
          
          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground/50" />
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/40 rounded-sm bg-card/20">
              <Bookmark className="h-6 w-6 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-foreground">No saved contributions yet.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Discover issues and save them here to keep track of your potential contributions.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {matches.map((match) => (
                <div key={match.id} className="border border-border/40 bg-card rounded-sm p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group hover:border-foreground/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground font-mono">
                        {match.repository}
                      </span>
                      {match.matchScore && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                          {match.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                      {match.issueTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {match.contributionType && (
                        <span className="text-[10px] text-muted-foreground">{match.contributionType}</span>
                      )}
                      {match.contributionType && match.technologies.length > 0 && <span className="text-muted-foreground/30">·</span>}
                      {match.technologies.slice(0, 3).map((tech, idx) => (
                        <React.Fragment key={tech}>
                          <span className="text-[10px] text-muted-foreground">{tech}</span>
                          {(idx < 2 && idx < match.technologies.length - 1) && <span className="text-muted-foreground/30">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(match.issueUrl, "_blank")}
                      className="h-8 text-xs gap-1.5"
                    >
                      View Issue <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleUnsave(match.id)}
                      className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      Unsave
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageContainer>
      </Shell>
    </ProtectedRoute>
  );
}
