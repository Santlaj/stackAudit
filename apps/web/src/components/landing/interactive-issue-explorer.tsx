"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Bookmark, 
  ArrowRight, 
  ChevronRight, 
  Check, 
  Clock, 
  SlidersHorizontal,
  ExternalLink,
  Flame,
  FileCode2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SampleIssue {
  id: string;
  repo: string;
  stars: string;
  issueNumber: number;
  title: string;
  tech: string[];
  primaryTech: string;
  difficulty: "Good first" | "Intermediate" | "Advanced";
  matchScore: number;
  estimatedMinutes: number;
  whyItMatches: string;
  targetFiles: string[];
}

const SAMPLE_ISSUES: SampleIssue[] = [
  {
    id: "trpc-4812",
    repo: "trpc / trpc",
    stars: "34.8k",
    issueNumber: 4812,
    title: "Fix batch response validation for nested input routers",
    primaryTech: "TypeScript",
    tech: ["TypeScript", "Zod", "Node.js"],
    difficulty: "Intermediate",
    matchScore: 95,
    estimatedMinutes: 45,
    whyItMatches: "Primary codebase language (TypeScript) matches 92% of your verified activity. No deep framework knowledge required.",
    targetFiles: ["packages/server/src/core/router.ts", "packages/server/tests/batching.test.ts"]
  },
  {
    id: "fastapi-1042",
    repo: "fastapi / fastapi",
    stars: "76.2k",
    issueNumber: 10428,
    title: "Add streaming response cancel propagation to ASGI middleware",
    primaryTech: "Python",
    tech: ["Python", "FastAPI", "AsyncIO"],
    difficulty: "Good first",
    matchScore: 98,
    estimatedMinutes: 30,
    whyItMatches: "100% Python codebase matching your backend proficiency. Includes verified unit test reproduction case.",
    targetFiles: ["fastapi/middleware/asgiref.py", "tests/test_streaming_disconnect.py"]
  },
  {
    id: "uv-6290",
    repo: "astral-sh / uv",
    stars: "41.5k",
    issueNumber: 6290,
    title: "Preserve symlink metadata during parallel wheel unpack cache",
    primaryTech: "Rust",
    tech: ["Rust", "tokio", "CLI"],
    difficulty: "Intermediate",
    matchScore: 91,
    estimatedMinutes: 60,
    whyItMatches: "Strong systems programming footprint with async Tokio experience. Isolated crate module with no global state.",
    targetFiles: ["crates/uv-extract/src/archive.rs", "crates/uv-extract/tests/symlinks.rs"]
  },
  {
    id: "fiber-2940",
    repo: "gofiber / fiber",
    stars: "36.1k",
    issueNumber: 2940,
    title: "Improve context timeout propagation in multi-router groups",
    primaryTech: "Go",
    tech: ["Go", "fasthttp", "HTTP"],
    difficulty: "Good first",
    matchScore: 96,
    estimatedMinutes: 35,
    whyItMatches: "Standard library concurrency patterns matching your public Go commits. Zero external dependencies required.",
    targetFiles: ["router.go", "router_test.go"]
  },
  {
    id: "next-58190",
    repo: "vercel / next.js",
    stars: "128k",
    issueNumber: 58190,
    title: "Prevent duplicate hydration warnings on nested layout metadata tags",
    primaryTech: "React",
    tech: ["React", "TypeScript", "Next.js"],
    difficulty: "Good first",
    matchScore: 94,
    estimatedMinutes: 40,
    whyItMatches: "Modern React 19 layout metadata experience. Reproducible fixture available in repository examples.",
    targetFiles: ["packages/next/src/client/components/metadata.tsx", "test/e2e/app-dir/metadata.test.ts"]
  }
];

export function InteractiveIssueExplorer() {
  const [selectedTech, setSelectedTech] = React.useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedId, setExpandedId] = React.useState<string | null>("trpc-4812");
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set(["fastapi-1042"]));

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredIssues = React.useMemo(() => {
    return SAMPLE_ISSUES.filter((issue) => {
      if (selectedTech !== "All" && issue.primaryTech !== selectedTech && !issue.tech.includes(selectedTech)) {
        return false;
      }
      if (difficultyFilter !== "all" && issue.difficulty.toLowerCase().replace(" ", "-") !== difficultyFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(q) ||
          issue.repo.toLowerCase().includes(q) ||
          issue.tech.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedTech, difficultyFilter, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* SECTION HEADER */}
      <div className="space-y-2 max-w-2xl text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          <span>TRY IT LIVE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Live Issue Match Explorer
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Filter by your stack and explore real open-source contribution opportunities matched with zero cold-start guesswork.
        </p>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="p-3.5 rounded-xl border border-border/70 bg-card/50 backdrop-blur-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* TECH FILTER CHIPS */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "TypeScript", "Python", "Go", "Rust", "React"].map((tech) => {
              const isSelected = selectedTech === tech;
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setSelectedTech(tech)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer border",
                    isSelected
                      ? "bg-foreground text-background font-semibold border-foreground"
                      : "bg-muted/30 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                  )}
                >
                  {tech}
                </button>
              );
            })}
          </div>

          {/* SEARCH INPUT */}
          <div className="relative flex items-center min-w-[200px] sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repo, issue, or tech..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-full bg-background/80 border border-border/70 focus:border-foreground text-foreground placeholder:text-muted-foreground outline-none transition-colors"
            />
          </div>
        </div>

        {/* DIFFICULTY FILTER TOGGLES */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-mono mr-1">Difficulty:</span>
            {[
              { id: "all", label: "All Levels" },
              { id: "good-first", label: "Good first issue" },
              { id: "intermediate", label: "Intermediate" }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficultyFilter(d.id)}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer",
                  difficultyFilter === d.id
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
            Showing {filteredIssues.length} live matches
          </span>
        </div>
      </div>

      {/* MATCHED ISSUES ACCORDION LIST */}
      <div className="space-y-2.5">
        {filteredIssues.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-border/70 p-6 space-y-2 bg-card/20">
            <p className="text-xs font-semibold text-foreground">No matches for current filter</p>
            <p className="text-[11px] text-muted-foreground">Try selecting "All" or clearing the search query.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isExpanded = expandedId === issue.id;
            const isSaved = savedIds.has(issue.id);

            return (
              <div
                key={issue.id}
                className={cn(
                  "rounded-xl border transition-all text-left overflow-hidden",
                  isExpanded
                    ? "border-foreground/40 bg-card shadow-sm"
                    : "border-border/70 bg-card/40 hover:bg-card/70 hover:border-border"
                )}
              >
                {/* ISSUE SUMMARY HEADER ROW */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                  className="p-3.5 sm:px-4 sm:py-3 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      className="text-muted-foreground shrink-0 mt-0.5 sm:mt-0 p-0.5"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-90 text-foreground")} />
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {issue.repo}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/40">
                          ★ {issue.stars}
                        </span>
                        <span className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase",
                          issue.difficulty === "Good first"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        )}>
                          {issue.difficulty}
                        </span>
                      </div>

                      <h4 className="text-xs font-medium text-foreground tracking-tight line-clamp-1">
                        #{issue.issueNumber} {issue.title}
                      </h4>
                    </div>
                  </div>

                  {/* Right: Compatibility score & Bookmark */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase">Fit</div>
                      <div className="text-sm font-bold font-mono text-emerald-400">{issue.matchScore}%</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleSave(issue.id, e)}
                      className={cn(
                        "p-1.5 rounded-lg border border-border/50 transition-colors cursor-pointer",
                        isSaved ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      title={isSaved ? "Bookmarked" : "Bookmark this issue"}
                    >
                      <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
                    </button>
                  </div>
                </div>

                {/* EXPANDABLE ACCORDION DETAIL */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border/50 bg-background/50 px-4 py-3.5 space-y-3 text-xs"
                    >
                      {/* WHY IT MATCHES */}
                      <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                        <span className="font-semibold text-emerald-400 text-[11px] block flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Why StackAudit Matched You:
                        </span>
                        <p className="text-[11px] text-foreground/90 leading-relaxed">
                          {issue.whyItMatches}
                        </p>
                      </div>

                      {/* TARGET FILES & EFFORT */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div className="p-2.5 rounded-lg bg-card/60 border border-border/60 space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase block flex items-center gap-1">
                            <FileCode2 className="w-3 h-3 text-sky-400" /> Target Files To Modify:
                          </span>
                          {issue.targetFiles.map((file, idx) => (
                            <div key={idx} className="text-foreground/90 truncate">
                              • {file}
                            </div>
                          ))}
                        </div>

                        <div className="p-2.5 rounded-lg bg-card/60 border border-border/60 flex flex-col justify-between">
                          <span className="text-[10px] text-muted-foreground uppercase block flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> Estimated Time:
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            ~{issue.estimatedMinutes} minutes
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Verified maintainer turn-around: &lt;48h
                          </span>
                        </div>
                      </div>

                      {/* CTA ROW */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/40">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Ready to contribute? Get architectural context in 1 click.
                        </span>
                        <a
                          href="/login"
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>Explore in Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
