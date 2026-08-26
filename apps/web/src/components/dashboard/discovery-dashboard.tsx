"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw, Github, CheckSquare, Square, Check, Cpu, Code2, ArrowRight, ExternalLink } from "lucide-react";
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
  const [selectedMatch, setSelectedMatch] = useState<IssueMatch | null>(null);

  // User Preferences State
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("beginner");

  const AVAILABLE_TECH = ["TypeScript", "Python", "Rust", "React", "Node.js", "Go", "Java", "C++"];

  useEffect(() => {
    if (session?.user?.id) {
      loadData(session.user.id);
    }
  }, [session?.user?.id]);

  const loadData = async (userId: string) => {
    setLoading(true);
    try {
      let p = await fetchProfile(userId).catch(() => null);
      if (!p) {
        p = await ingestProfile().catch(() => null);
      }
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
      const p = await ingestProfile();
      setProfile(p);
    } catch (err: any) {
      setError("Failed to sync profile from GitHub.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    setSelectedMatch(null);
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
      if (selectedMatch?.id === matchId) {
        setSelectedMatch(updatedMatch);
      }
    } catch (err: any) {
      console.error("Evaluation failed", err);
    } finally {
      setEvaluating(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const toggleTech = (tech: string) => {
    setSelectedTech(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 animate-in fade-in duration-500 w-full">
      
      {/* LEFT COLUMN: Context & Filters */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-6 sticky top-6">
        
        {/* Developer Identity Panel */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Developer Context</h2>
          <div className="space-y-4 text-sm">
            {profile ? (
              <>
                <div>
                  <div className="text-muted-foreground mb-0.5">Observed Languages</div>
                  <div className="font-medium text-foreground">
                    {profile.observedLanguages?.length > 0 ? profile.observedLanguages.join(", ") : "None detected"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-0.5">GitHub Footprint</div>
                  <div className="font-medium text-foreground">{profile.publicRepoCount} public repositories</div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground py-2 border border-dashed border-border/60 rounded p-3 text-center">
                <p className="mb-3 text-xs">No context established.</p>
                <Button variant="outline" size="sm" onClick={handleIngestProfile} disabled={loading} className="w-full h-7 text-xs">
                  <Github className="w-3 h-3 mr-2" /> Sync Profile
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Contribution Preferences Panel */}
        <section className="pt-4 border-t border-border/40">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Search Parameters</h2>
          <div className="space-y-5">
            
            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">Target Technologies</label>
              <div className="space-y-1.5">
                {AVAILABLE_TECH.map(tech => (
                  <button 
                    key={tech} 
                    onClick={() => toggleTech(tech)}
                    className="flex items-center gap-2 text-xs w-full text-left hover:text-foreground transition-colors group"
                  >
                    {selectedTech.includes(tech) ? (
                      <CheckSquare className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground/70" />
                    )}
                    <span className={selectedTech.includes(tech) ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {tech}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">Target Complexity</label>
              <div className="space-y-1.5">
                {[
                  { id: "beginner", label: "Beginner" },
                  { id: "intermediate", label: "Intermediate" },
                  { id: "advanced", label: "Advanced" }
                ].map(level => (
                  <label key={level.id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="difficulty" 
                      value={level.id}
                      checked={difficulty === level.id}
                      onChange={() => setDifficulty(level.id)}
                      className="accent-foreground w-3 h-3"
                    />
                    <span className={`text-xs ${difficulty === level.id ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground/70"}`}>
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button 
              className="w-full text-xs h-8 bg-foreground text-background hover:bg-foreground/90" 
              onClick={handleDiscover} 
              disabled={loading || selectedTech.length === 0}
            >
              {loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
              Discover Issues
            </Button>
          </div>
        </section>
      </div>

      {/* CENTER COLUMN: Discovery Feed */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">Contribution Opportunities</h1>
          <span className="text-xs text-muted-foreground font-medium">
            {matches.length} Matches
          </span>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-sm p-3 mb-4 flex items-start gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {matches.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Code2 className="h-6 w-6 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-foreground">No matches found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Adjust your search parameters on the left to find issues.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {matches.map((match) => {
            const isSelected = selectedMatch?.id === match.id;
            
            return (
              <div 
                key={match.id} 
                onClick={() => setSelectedMatch(match)}
                className={`border bg-card hover:bg-muted/30 transition-all rounded-sm overflow-hidden flex flex-col cursor-pointer ${
                  isSelected ? 'border-foreground shadow-sm ring-1 ring-foreground/10' : 'border-border/40'
                }`}
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">{match.repository}</span>
                        {match.matchScore && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {match.matchScore}% Match
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold leading-snug text-foreground truncate">
                        {match.issueTitle}
                        <span className="text-muted-foreground font-normal ml-1">#{match.issueNumber}</span>
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    {match.technologies.map(tech => (
                      <Badge key={tech} variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border/60">
                        {tech}
                      </Badge>
                    ))}
                    {match.contributionType && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-secondary/50">
                        {match.contributionType}
                      </Badge>
                    )}
                    {match.complexity && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-secondary/50">
                        {match.complexity}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Match Context / Evaluation Panel */}
      {selectedMatch && (
        <div className="w-full lg:w-80 shrink-0 border border-border/60 bg-card rounded-sm sticky top-6 animate-in slide-in-from-right-4 duration-300">
          <div className="p-4 border-b border-border/40 flex flex-col gap-2">
            <h3 className="text-sm font-semibold leading-tight">{selectedMatch.issueTitle}</h3>
            <a 
              href={selectedMatch.issueUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors w-fit"
            >
              View on GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 space-y-6">
            {selectedMatch.status === "DISCOVERED" ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <Cpu className="w-8 h-8 text-muted-foreground/30" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Contribution Context</p>
                  <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                    Extract deep context from the repository to understand why this issue fits you and what you need to know.
                  </p>
                </div>
                <Button 
                  onClick={() => handleEvaluate(selectedMatch.id)}
                  disabled={evaluating[selectedMatch.id]}
                  className="w-full text-xs h-8 bg-foreground text-background"
                >
                  {evaluating[selectedMatch.id] ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Cpu className="w-3 h-3 mr-2" />}
                  Extract Context
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" /> Why this fits you
                  </h4>
                  <ul className="text-xs text-foreground/80 space-y-1.5 list-disc pl-4 marker:text-border">
                    {selectedMatch.matchReason ? (
                      // Simple split if the backend returns sentences, otherwise just render the reason
                      selectedMatch.matchReason.split(/(?<=\.)\s+/).map((sentence, i) => (
                        sentence.length > 3 && <li key={i}>{sentence}</li>
                      ))
                    ) : (
                      <li>Strong technical alignment with your profile.</li>
                    )}
                  </ul>
                </div>

                {selectedMatch.missingSignals && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Knowledge Gap</h4>
                    <p className="text-xs text-foreground/80 leading-relaxed">{selectedMatch.missingSignals}</p>
                  </div>
                )}
                
                {selectedMatch.learningRelevance && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Learning Value</h4>
                    <p className="text-xs text-foreground/80 leading-relaxed">{selectedMatch.learningRelevance}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-border/40">
                  <Button variant="outline" className="w-full text-xs h-8 gap-1.5 group">
                    Explore Contribution <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
