"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw, Github, Zap } from "lucide-react";
import { 
  DeveloperProfile, 
  IssueMatch, 
  fetchProfile, 
  ingestProfile, 
  discoverIssues, 
  getMatches, 
  evaluateMatch 
} from "@/lib/api";

import { useSession } from "@/lib/auth-client";

export function DiscoveryDashboard() {
  const { data: session } = useSession();
  
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [matches, setMatches] = useState<IssueMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // User Preferences State
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("beginner");

  const AVAILABLE_TECH = ["TypeScript", "Python", "Rust", "React", "Node.js", "Go"];

  // Initial load
  useEffect(() => {
    if (session?.user?.id) {
      loadData(session.user.id);
    }
  }, [session?.user?.id]);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      // Attempt to load matches first if profile fails we still have a blank slate
      const p = await fetchProfile(userId).catch(() => null);
      if (p) {
        setProfile(p);
        const m = await getMatches(userId).catch(() => []);
        setMatches(m);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestProfile = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // NOTE: This will fail if Prisma migrate reset wasn't run!
      const p = await ingestProfile();
      setProfile(p);
    } catch (err: any) {
      setError("Failed to ingest profile. Did you run `npx prisma migrate reset`?");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      await discoverIssues(session.user.id, selectedTech, difficulty);
      const m = await getMatches(session.user.id);
      setMatches(m);
    } catch (err: any) {
      setError("Failed to discover issues. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (matchId: string) => {
    setEvaluating(prev => ({ ...prev, [matchId]: true }));
    try {
      const updatedMatch = await evaluateMatch(matchId);
      setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
    } catch (err: any) {
      console.error("Evaluation failed", err);
    } finally {
      setEvaluating(prev => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-4 flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Developer Profile Header */}
      <section className="border border-border/40 rounded-lg p-6 bg-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-1">Developer Identity</h2>
          {profile ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Observed Skills:</span>{" "}
                {profile.observedLanguages?.length > 0 ? profile.observedLanguages.join(", ") : "None detected"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">GitHub Activity:</span>{" "}
                {profile.publicRepoCount} public repos
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No profile found. Sync your GitHub to start discovering issues.</p>
          )}
        </div>
      </section>
        
      {/* Preferences Panel */}
      <section className="border border-border/40 rounded-lg p-6 bg-card">
        <div className="mb-6">
          <h3 className="text-base font-semibold tracking-tight">Contribution Preferences</h3>
          <p className="text-sm text-muted-foreground mt-1">Refine what kind of issues you want to work on.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-sm font-medium mb-3 block">Technology Stack</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TECH.map(tech => (
                <button
                  key={tech}
                  onClick={() => {
                    setSelectedTech(prev => 
                      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
                    );
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    selectedTech.includes(tech) 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-transparent text-muted-foreground border-border/50 hover:border-border"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-3 block">Complexity Level</label>
            <div className="flex flex-wrap gap-2">
              {["beginner", "intermediate", "advanced"].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`text-xs px-3 py-1.5 rounded-md border capitalize transition-colors ${
                    difficulty === level 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-transparent text-muted-foreground border-border/50 hover:border-border"
                  }`}
                >
                  {level === "beginner" ? "Beginner (Good First Issue)" : level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleDiscover} disabled={loading || selectedTech.length === 0}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Discover Issues
          </Button>
        </div>
      </section>

      {/* Discovery Feed */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Contribution Opportunities</h3>
        
        {matches.length === 0 && !loading && (
          <div className="text-center py-12 border border-dashed border-border/40 rounded-lg">
            <p className="text-sm text-muted-foreground">No opportunities discovered yet.</p>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="border border-border/40 bg-card rounded-lg p-5">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{match.repository}</span>
                    <span className="text-xs px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border/50">
                      {match.complexity || "Unknown"}
                    </span>
                    {match.status === "VIEWED" && (
                      <span className="text-xs px-2 py-0.5 rounded-sm bg-success/10 text-success border border-success/20 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> AI Evaluated
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-medium">
                    <a href={match.issueUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {match.issueTitle} <span className="text-muted-foreground">#{match.issueNumber}</span>
                    </a>
                  </h4>
                  <div className="flex gap-2 mt-2">
                    {match.technologies.map(tech => (
                      <span key={tech} className="text-xs text-muted-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  {match.status === "DISCOVERED" ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleEvaluate(match.id)}
                      disabled={evaluating[match.id]}
                    >
                      {evaluating[match.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Evaluate Match"}
                    </Button>
                  ) : (
                    <div className="text-right">
                      <div className="text-2xl font-bold tracking-tight text-foreground">
                        {match.matchScore}
                        <span className="text-sm font-normal text-muted-foreground">/100</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Match Score</p>
                    </div>
                  )}
                </div>
              </div>

              {match.status === "VIEWED" && match.matchReason && (
                <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Why it matches you</h5>
                    <p className="text-sm text-foreground/90 leading-relaxed">{match.matchReason}</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">What you will learn</h5>
                      <p className="text-sm text-foreground/90">{match.learningRelevance}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Missing Signals</h5>
                      <p className="text-sm text-foreground/90">{match.missingSignals}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
