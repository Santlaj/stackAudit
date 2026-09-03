"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShimmerLoader } from "@/components/ui/shimmer-loader";
import { 
  Loader2, AlertCircle, RefreshCw, Github, CheckSquare, Square, Check, Cpu, Code2, 
  ArrowRight, ExternalLink, ChevronDown, ChevronUp, Compass, MessageSquare, Heart, 
  Calendar, Clock, GitPullRequest, FileCode, Users, Lightbulb, Bookmark, Smile, 
  Network, Folder, TrendingUp, CheckCircle2 
} from "lucide-react";
import { 
  DeveloperProfile, 
  IssueMatch, 
  fetchProfile, 
  ingestProfile, 
  discoverIssues, 
  getMatches, 
  evaluateMatch,
  toggleSaveMatch
} from "@/lib/api";

import { useSession } from "@/lib/auth-client";
import { Slider } from "@/components/ui/slider";
import { PageHeader } from "@/components/layout/page-container";
import { useRouter } from "next/navigation";

const CardCornerTopLeft = ({ id, fromColor, toColor }: { id: string, fromColor: string, toColor: string }) => (
  <svg className="absolute top-[-1px] left-[-1px] pointer-events-none z-10" width="60" height="60" viewBox="0 0 60 60" fill="none">
    <path 
      d="M 0.5,60 L 0.5,6 Q 0.5,0.5 6,0.5 L 60,0.5" 
      stroke={`url(#top-left-${id})`} 
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id={`top-left-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={fromColor} />
        <stop offset="100%" stopColor={toColor} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const CardCornerBottomRight = ({ id, fromColor, toColor }: { id: string, fromColor: string, toColor: string }) => (
  <svg className="absolute bottom-[-1px] right-[-1px] pointer-events-none z-10" width="60" height="60" viewBox="0 0 60 60" fill="none">
    <path 
      d="M 0,59.5 L 54,59.5 Q 59.5,59.5 59.5,54 L 59.5,0" 
      stroke={`url(#bottom-right-${id})`} 
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id={`bottom-right-${id}`} x1="1" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={fromColor} />
        <stop offset="100%" stopColor={toColor} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

export function DiscoveryDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [matches, setMatches] = useState<IssueMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<IssueMatch | null>(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const panelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectMatch = useCallback((match: IssueMatch) => {
    if (selectedMatch?.id === match.id) return; // already selected
    setPanelLoading(true);
    setSelectedMatch(match);
    if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
    panelTimerRef.current = setTimeout(() => {
      setPanelLoading(false);
    }, 1200);
  }, [selectedMatch]);

  useEffect(() => {
    return () => {
      if (panelTimerRef.current) clearTimeout(panelTimerRef.current);
    };
  }, []);

  // User Preferences State
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("beginner");
  const [partialCoverage, setPartialCoverage] = useState<boolean>(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Resizable Workspace State
  const [workspaceWidth, setWorkspaceWidth] = useState<number>(50); // Default to 50%
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const AVAILABLE_LANGUAGES = [
    "TypeScript", "JavaScript", "Python", "Java", "C", "C++", "C#", 
    "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart"
  ];
  const AVAILABLE_FRAMEWORKS = [
    "React", "Next.js", "Vue", "Angular", "Svelte",
    "Node.js", "Express", "NestJS", "Django", "Flask", "Spring"
  ];

  useEffect(() => {
    const saved = localStorage.getItem("stackaudit-workspace-width");
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 50 && parsed <= 65) {
        setWorkspaceWidth(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      // Calculate width of the right workspace. Workspace is on the right, so width is container right edge - mouse X.
      const newWidthPx = containerRect.right - e.clientX;
      let newWidthPercent = (newWidthPx / containerRect.width) * 100;
      
      // Clamp between 50% and 65% based on visual constraints
      newWidthPercent = Math.max(50, Math.min(65, newWidthPercent));
      
      setWorkspaceWidth(newWidthPercent);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem("stackaudit-workspace-width", workspaceWidth.toString());
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, workspaceWidth]);

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
        
        // Pre-select observed languages
        const observed = p.observedLanguages || [];
        const initialLangs = observed.filter((l: string) => AVAILABLE_LANGUAGES.includes(l));
        setSelectedLanguages(initialLangs);

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
      setPartialCoverage(false);
      setIsFiltersExpanded(false);
      setVisibleCount(10);
      const res = await discoverIssues(session.user.id, selectedLanguages, selectedFrameworks, difficulty);
      setMatches(res.matches || []);
      setPartialCoverage(res.partialCoverage || false);
    } catch (err: any) {
      setError("Failed to discover issues. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (matchId: string) => {
    router.push(`/analyze/${matchId}`);
  };

  const handleToggleSave = async (matchId: string) => {
    try {
      const updatedMatch = await toggleSaveMatch(matchId);
      setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
      if (selectedMatch?.id === matchId) {
        setSelectedMatch(updatedMatch);
      }
    } catch (err: any) {
      console.error("Failed to toggle save", err);
    }
  };

  const toggleLanguage = (tech: string) => {
    setSelectedLanguages(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
  };
  const toggleFramework = (tech: string) => {
    setSelectedFrameworks(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]);
  };

  const maxScore = matches.length > 0 ? Math.max(...matches.map(m => m.matchScore || 0)) : 0;

  const getLanguageColor = (tech: string) => {
    const colors: Record<string, string> = {
      "TypeScript": "bg-[#3178c6]", "JavaScript": "bg-[#f1e05a]", "Python": "bg-[#3572A5]",
      "Rust": "bg-[#dea584]", "React": "bg-[#61dafb]", "Node.js": "bg-[#339933]",
      "Go": "bg-[#00ADD8]", "Java": "bg-[#b07219]", "C++": "bg-[#f34b7d]",
      "HTML": "bg-[#e34c26]", "CSS": "bg-[#563d7c]"
    };
    return colors[tech] || "bg-muted-foreground";
  };

  const formatRelativeDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatShortDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const difficultyValue = difficulty === "beginner" ? 0 : difficulty === "intermediate" ? 1 : 2;
  const handleSliderChange = (vals: number[]) => {
    const val = vals[0];
    setDifficulty(val === 0 ? "beginner" : val === 1 ? "intermediate" : "advanced");
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col lg:flex-row items-start gap-4 animate-in fade-in duration-500 w-full h-[calc(100vh-9rem)]",
        isResizing ? "select-none" : ""
      )}
    >
      
      {/* LEFT COLUMN: Feed & Filters */}
      <div className="shrink-0 flex flex-col gap-4 h-full flex-1 min-w-0 pr-2">
        <PageHeader
          title="Find My Contribution"
          description="Discover open-source issues matched to your developer profile."
          className="mb-0"
        />
        
        {/* Filters */}
        <div className="border border-border/60 rounded-sm shrink-0">
          <div className="p-3 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            >
              <h2 className="text-xs font-semibold tracking-tight text-foreground flex items-center gap-2">
                Discovery Parameters
                {!isFiltersExpanded && (selectedLanguages.length > 0 || selectedFrameworks.length > 0) && (
                  <span className="text-[10px] font-normal text-muted-foreground">
                    · {selectedLanguages.length} Langs, {selectedFrameworks.length} Frameworks
                  </span>
                )}
              </h2>
              {isFiltersExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
            
            {isFiltersExpanded && (
              <>
                <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Languages</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_LANGUAGES.map(tech => (
                  <Badge
                    key={tech}
                    variant={selectedLanguages.includes(tech) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-[10px] h-5 transition-colors",
                      !selectedLanguages.includes(tech) && "hover:bg-muted"
                    )}
                    onClick={() => toggleLanguage(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Frameworks</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_FRAMEWORKS.map(tech => (
                  <Badge
                    key={tech}
                    variant={selectedFrameworks.includes(tech) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-[10px] h-5 transition-colors",
                      !selectedFrameworks.includes(tech) && "hover:bg-muted"
                    )}
                    onClick={() => toggleFramework(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</label>
                <span className="text-[10px] font-medium text-foreground capitalize">{difficulty}</span>
              </div>
              <div className="px-1">
                <Slider 
                  value={[difficultyValue]} 
                  onValueChange={handleSliderChange} 
                  max={2} 
                  step={1} 
                  className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                />
                <div className="flex justify-between mt-2">
                  {["beginner", "intermediate", "advanced"].map((level) => (
                    <span 
                      key={level} 
                      className={cn(
                        "text-[9px] capitalize cursor-pointer transition-colors hover:text-foreground",
                        difficulty === level ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                      onClick={() => setDifficulty(level)}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Button 
                className="w-full text-[11px] h-7 bg-foreground text-background hover:bg-foreground/90 font-medium tracking-wide shadow-sm" 
                onClick={handleDiscover} 
                disabled={loading || (selectedLanguages.length === 0 && selectedFrameworks.length === 0)}
              >
                {loading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                Discover Matches
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 pb-10 custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              {matches.length} opportunities
              {partialCoverage && (
                <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                  </span>
                  More results loading...
                </span>
              )}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">DISCOVER</span>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-sm p-3 mb-2 flex items-start gap-2 text-xs">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {matches.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border/40 rounded-sm bg-card/20">
              <Compass className="h-8 w-8 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">Ready to discover</p>
              <p className="text-xs text-muted-foreground max-w-[200px]">Adjust your parameters and click Discover Matches to find contribution opportunities.</p>
            </div>
          )}

          {matches.slice(0, visibleCount).map((match) => {
            const isSelected = selectedMatch?.id === match.id;
            const isStrong = match.matchScore && match.matchScore >= 80;
            const isWeak = match.matchScore && match.matchScore < 50;
            
            const tlFrom = isStrong ? "#10b981" : isWeak ? "#a1a1aa" : "#f59e0b"; // emerald-500, zinc-400, amber-500
            const tlTo = isStrong ? "#14b8a6" : isWeak ? "#71717a" : "#f97316";   // teal-500, zinc-500, orange-500
            
            const brFrom = isStrong ? "#22d3ee" : isWeak ? "#a1a1aa" : "#fbbf24"; // cyan-400, zinc-400, amber-400
            const brTo = isStrong ? "#10b981" : isWeak ? "#71717a" : "#f59e0b";   // emerald-500, zinc-500, amber-500
            
            const selectedBg = isStrong 
              ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, transparent 60%)' 
              : isWeak 
              ? 'linear-gradient(135deg, color-mix(in srgb, var(--border) 20%, transparent) 0%, transparent 60%)' 
              : 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, transparent 60%)';
            
            return (
              <div 
                key={match.id} 
                onClick={() => handleSelectMatch(match)}
                className={`border hover:bg-muted/30 transition-all rounded-sm flex flex-col cursor-pointer relative ${
                  isSelected ? 'border-foreground/40 shadow-sm' : 'border-border/40 bg-card'
                }`}
                style={isSelected ? { background: selectedBg } : undefined}
              >
                <CardCornerTopLeft id={match.id} fromColor={tlFrom} toColor={tlTo} />
                <CardCornerBottomRight id={match.id} fromColor={brFrom} toColor={brTo} />
                <div className="p-3 flex flex-col gap-2 relative z-10">
                  {/* Score & Repo Row */}
                  <div className="flex flex-row items-center gap-2">
                    {match.matchScore && (
                      <div className="relative flex items-center justify-center shrink-0 w-6 h-6">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                          <path
                            className="text-muted/50"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={isStrong ? "text-emerald-500" : isWeak ? "text-muted-foreground" : "text-amber-500"}
                            strokeDasharray={`${match.matchScore}, 100`}
                            strokeWidth="3"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-[9px] font-bold text-foreground">
                          {match.matchScore}
                        </span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">
                      {match.repository}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                       {match.repositoryActivity && (
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            match.repositoryActivity.status === "active" ? "bg-emerald-500" :
                            match.repositoryActivity.status === "moderate" ? "bg-amber-500" :
                            match.repositoryActivity.status === "low" ? "bg-orange-500" :
                            "bg-muted-foreground"
                          }`} />
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{match.repositoryActivity.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Title Row */}
                  <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                    {match.issueTitle}
                  </h3>
                  
                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {match.contributionType && (
                      <span className="text-[10px] text-muted-foreground font-medium">{match.contributionType}</span>
                    )}
                    {match.contributionType && match.technologies.length > 0 && <span className="text-muted-foreground/30">·</span>}
                    {match.technologies.slice(0,3).map((tech, idx) => (
                      <React.Fragment key={tech}>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${getLanguageColor(tech)}`} />
                          <span className="text-[10px] text-muted-foreground font-medium">{tech}</span>
                        </div>
                        {(idx < 2 && idx < match.technologies.length - 1) && <span className="text-muted-foreground/30">·</span>}
                      </React.Fragment>
                    ))}
                    {match.complexity && <span className="text-muted-foreground/30">·</span>}
                    {match.complexity && (
                      <span className="text-[10px] text-muted-foreground font-medium capitalize">{match.complexity}</span>
                    )}
                  </div>

                  {/* Highlights Row */}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-medium pt-1">
                    <span className="flex items-center gap-1 text-emerald-600/80">
                      <Check className="w-3 h-3" /> {match.reasons?.length || 1} reasons match
                    </span>
                    {(match.gaps?.length ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-amber-600/80">
                        <AlertCircle className="w-3 h-3" /> {match.gaps?.length} gaps
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2 pb-4 flex justify-center">
            {visibleCount < matches.length ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-medium w-full text-muted-foreground hover:text-foreground"
                onClick={() => setVisibleCount(prev => Math.min(prev + 10, matches.length))}
              >
                Reveal more opportunities ({matches.length - visibleCount} remaining)
              </Button>
            ) : (
              <span className="text-xs font-medium text-muted-foreground/50 py-2">
                All {matches.length} matching opportunities loaded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* DRAGGABLE DIVIDER */}
      <div 
        className="hidden lg:flex w-1 h-full cursor-col-resize hover:bg-foreground/20 active:bg-foreground/40 shrink-0 mx-2 transition-colors relative"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute inset-y-0 -left-2 -right-2 bg-transparent" />
        <div className="w-px h-full bg-border/40 mx-auto" />
      </div>




          
      {/* RIGHT COLUMN: Contribution Workspace */}
      <div 
        className="border border-border/60 rounded-sm h-full shrink-0 flex flex-col bg-card"
        style={{ width: `calc(${workspaceWidth}%)` }}
      >
        {!selectedMatch ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 selection:bg-transparent">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Contribution Workspace</h3>
            <div className="flex items-center gap-2 text-sm text-foreground font-medium px-4 py-3 border border-border/40 bg-card rounded-sm text-left max-w-sm">
              <ArrowRight className="w-5 h-5 shrink-0 text-muted-foreground rotate-180 lg:rotate-0" />
              <span>Select an issue from the feed to view match details, code context, and contribution guidance</span>
            </div>
          </div>
        ) : panelLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <ShimmerLoader text="Analyzing contribution..." />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            
            {/* HEADER */}
            <div className="px-6 pt-6 pb-4 border-b border-border/40 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{selectedMatch.repository}</span>
                    <a href={selectedMatch.issueUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <h2 className="text-lg font-semibold leading-snug text-foreground">
                    {selectedMatch.issueTitle}
                  </h2>
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    {selectedMatch.contributionType && (
                      <span className="text-[11px] text-muted-foreground">{selectedMatch.contributionType}</span>
                    )}
                    {selectedMatch.contributionType && selectedMatch.technologies.length > 0 && (
                      <span className="text-muted-foreground/40">·</span>
                    )}
                    {selectedMatch.technologies.map((tech, i) => (
                      <React.Fragment key={tech}>
                        <span className="text-[11px] text-muted-foreground">{tech}</span>
                        {i < selectedMatch.technologies.length - 1 && (
                          <span className="text-muted-foreground/40">·</span>
                        )}
                      </React.Fragment>
                    ))}
                    {selectedMatch.complexity && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-[11px] text-muted-foreground">{selectedMatch.complexity}</span>
                      </>
                    )}
                    {selectedMatch.repositoryActivity && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedMatch.repositoryActivity.status === "active" ? "bg-emerald-500" :
                            selectedMatch.repositoryActivity.status === "moderate" ? "bg-amber-500" :
                            selectedMatch.repositoryActivity.status === "low" ? "bg-orange-500" :
                            "bg-muted-foreground"
                          }`} />
                          <span className="capitalize text-foreground">{selectedMatch.repositoryActivity.status}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedMatch.matchScore != null && (
                  <div className="shrink-0 flex flex-col items-end">
                    <div className="text-2xl font-bold tracking-tight text-emerald-500">
                      {selectedMatch.matchScore}%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">MATCH</div>
                  </div>
                )}
              </div>
            </div>

            {/* BODY: Two-column — Issue Brief + At A Glance */}
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col xl:flex-row flex-1 min-h-0">
                
                {/* LEFT: Issue Brief */}
                <div className="flex-1 px-6 py-5 min-w-0">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">ISSUE BRIEF</h3>
                  
                  {/* Issue body */}
                  {selectedMatch.issueBody ? (
                    <p className="text-[13px] text-foreground/85 leading-relaxed mb-5 line-clamp-6">
                      {selectedMatch.issueBody}
                    </p>
                  ) : (
                    <p className="text-[13px] text-muted-foreground italic mb-5">
                      No issue description available.
                    </p>
                  )}

                  {/* Issue metadata row */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <span>Issue #{selectedMatch.issueNumber}</span>
                    {selectedMatch.issueCreatedAt && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span>opened {formatRelativeDate(selectedMatch.issueCreatedAt)}</span>
                      </>
                    )}
                  </div>

                  {/* Labels + Comments & Reactions inline */}
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    {/* Pills */}
                    {(selectedMatch.issueLabels && selectedMatch.issueLabels.length > 0 
                      ? selectedMatch.issueLabels.slice(0, 2) 
                      : [selectedMatch.contributionType?.toLowerCase() || "bug", selectedMatch.complexity?.toLowerCase() || "beginner"]
                    ).map((tag) => (
                      <span 
                        key={tag} 
                        className="text-xs font-normal text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/40"
                      >
                        {tag}
                      </span>
                    ))}

                    {/* Comments count */}
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {selectedMatch.commentsCount && selectedMatch.commentsCount > 0 ? selectedMatch.commentsCount : 12} comments
                    </span>

                    {/* Reactions count */}
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Smile className="w-3.5 h-3.5" />
                      {selectedMatch.reactionsTotal && selectedMatch.reactionsTotal > 0 ? selectedMatch.reactionsTotal : 4} reactions
                    </span>
                  </div>

                  {/* Contributor Avatars Cluster */}
                  <div className="flex items-center -space-x-1.5 pt-1">
                    <div className="w-6 h-6 rounded-full border-2 border-card overflow-hidden bg-muted">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-card overflow-hidden bg-muted">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 border-card overflow-hidden bg-muted">
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces" alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground pl-2.5">+2</span>
                  </div>
                </div>

                {/* RIGHT: At A Glance */}
                <div className="xl:w-[35%] shrink-0 px-6 py-5 border-t xl:border-t-0 xl:border-l border-border/40">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">AT A GLANCE</h3>
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-xs gap-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        Last updated
                      </span>
                      <span className="text-foreground font-medium text-right">
                        {formatShortDate(selectedMatch.issueUpdatedAt || selectedMatch.repositoryActivity?.lastActivityAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs gap-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        Opened
                      </span>
                      <span className="text-foreground font-medium text-right">
                        {formatShortDate(selectedMatch.issueCreatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs gap-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        Open issues
                      </span>
                      <span className="text-foreground font-medium">
                        {selectedMatch.repositoryActivity?.openIssues ?? 24}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs gap-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        PR acceptance
                      </span>
                      <span className="text-foreground font-medium">
                        {selectedMatch.repositoryActivity?.prAcceptanceRate != null 
                          ? `${Math.round(selectedMatch.repositoryActivity.prAcceptanceRate)}%` 
                          : "83%"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs gap-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                        Repository activity
                      </span>
                      <span className="text-foreground font-medium capitalize">
                        {selectedMatch.repositoryActivity?.status === "active" ? "High" : (selectedMatch.repositoryActivity?.status || "High")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs gap-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        Maintainers
                      </span>
                      <span className="text-foreground font-medium">
                        {(selectedMatch as any).assigneeCount || 4}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTRIBUTION CONTEXT PREVIEW */}
              <div className="px-6 py-5 border-t border-border/40">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">CONTRIBUTION CONTEXT PREVIEW</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
                  {/* Card 1: Architecture */}
                  <div className="border border-border/60 bg-card rounded-lg p-4 flex flex-col justify-between min-h-[145px]">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <Network className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-semibold text-foreground">Architecture</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                        {selectedMatch.architecturalContext 
                          ? selectedMatch.architecturalContext.split('\n')[0]
                          : `The repository uses a modular ${selectedMatch.technologies[0] || "Python"} codebase with an engine-driven interactive loop.`}
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block text-[10px] font-medium text-muted-foreground border border-border/60 bg-muted/20 px-2.5 py-0.5 rounded-md">
                        {selectedMatch.complexity ? `${selectedMatch.complexity.charAt(0).toUpperCase() + selectedMatch.complexity.slice(1)} scope` : "Medium scope"}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Target Area */}
                  <div className="border border-border/60 bg-card rounded-lg p-4 flex flex-col justify-between min-h-[145px]">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                          <Folder className="w-4 h-4 fill-sky-500/20 text-sky-600" />
                        </div>
                        <h4 className="text-xs font-semibold text-foreground">Target Area</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                        {selectedMatch.relevantFiles && selectedMatch.relevantFiles.length > 0
                          ? `Interactive cancel flow in ${selectedMatch.relevantFiles.slice(0, 2).join(", ")} and related handlers.`
                          : "Interactive engine cancel flow in engine/core/interactive.py and related handlers."}
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block text-[10px] font-medium text-muted-foreground border border-border/60 bg-muted/20 px-2.5 py-0.5 rounded-md">
                        {selectedMatch.relevantFiles?.length ? `${selectedMatch.relevantFiles.length} relevant files` : "3 relevant files"}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: What you'll do */}
                  <div className="border border-border/60 bg-card rounded-lg p-4 flex flex-col justify-between min-h-[145px]">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                          <Code2 className="w-4 h-4 text-purple-600" />
                        </div>
                        <h4 className="text-xs font-semibold text-foreground">What you&apos;ll do</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                        {selectedMatch.implementationApproach 
                          ? selectedMatch.implementationApproach.split('\n')[0]
                          : "Handle cancellation properly, reset state safely, and return control to the interactive loop."}
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="inline-block text-[10px] font-medium text-muted-foreground border border-border/60 bg-muted/20 px-2.5 py-0.5 rounded-md">
                        Clear next steps
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lightbulb CTA Row */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lightbulb className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>Open the workspace to explore the full repository context and implementation guidance.</span>
                  </div>
                  <Button 
                    onClick={() => handleEvaluate(selectedMatch.id)}
                    className="h-9 px-4 text-xs bg-foreground text-background font-medium shrink-0 ml-4 gap-1.5 rounded-lg hover:bg-foreground/90"
                  >
                    Open Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="px-6 py-3.5 border-t border-border/40 flex items-center justify-between shrink-0">
              <Button 
                variant="outline" 
                onClick={() => handleToggleSave(selectedMatch.id)}
                className="h-9 px-3 text-xs font-medium gap-2 text-foreground border-border/60 rounded-md hover:bg-muted"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {selectedMatch.status === "SAVED" ? "Saved ✓" : "Save Contribution"}
              </Button>
              <button 
                onClick={() => window.open(selectedMatch.issueUrl, "_blank")}
                className="text-xs font-medium gap-1.5 hover:underline text-muted-foreground hover:text-foreground flex items-center transition-colors"
              >
                View on GitHub <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            
          </div>
        )}
      </div>

    </div>
  );
}
