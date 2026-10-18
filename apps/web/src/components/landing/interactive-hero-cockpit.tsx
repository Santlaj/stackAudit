"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  GitPullRequest, 
  CheckCircle2, 
  FileCode2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Code2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfilePreset {
  id: string;
  name: string;
  role: string;
  languages: string[];
  repo: {
    name: string;
    owner: string;
    stars: string;
    activity: string;
  };
  issue: {
    number: number;
    title: string;
    difficulty: "Good first" | "Intermediate" | "Advanced";
    matchScore: number;
    estimatedMinutes: number;
    technologies: string[];
    reasons: string[];
    gaps: string[];
    targetFiles: {
      path: string;
      lines: string;
      action: "modify" | "create" | "test";
    }[];
    codeSnippet: {
      file: string;
      diff: string[];
    };
  };
}

const PRESETS: ProfilePreset[] = [
  {
    id: "ts-fullstack",
    name: "TypeScript",
    role: "Fullstack / React",
    languages: ["TypeScript", "React", "Node.js"],
    repo: {
      owner: "trpc",
      name: "trpc",
      stars: "34.8k",
      activity: "Active (2h ago)",
    },
    issue: {
      number: 4812,
      title: "Fix batch response validation for nested input routers",
      difficulty: "Intermediate",
      matchScore: 94,
      estimatedMinutes: 45,
      technologies: ["TypeScript", "Zod", "Node.js"],
      reasons: [
        "Primary codebase language (TypeScript) aligns with 92% of your verified activity.",
        "Intermediate complexity matches your prior contributions to API router libraries.",
        "Maintainers merge 87% of community PRs within 48 hours."
      ],
      gaps: [
        "Touches internal procedure router types in core parser."
      ],
      targetFiles: [
        { path: "packages/server/src/core/router.ts", lines: "L142-L188", action: "modify" },
        { path: "packages/server/tests/batching.test.ts", lines: "L89-L134", action: "test" }
      ],
      codeSnippet: {
        file: "packages/server/src/core/router.ts",
        diff: [
          "  // Validate batch envelope input",
          "- const isValid = schema.safeParse(rawBatchPayload);",
          "+ const isValid = isNestedRouter(target) ",
          "+   ? schema.deepValidate(rawBatchPayload)",
          "+   : schema.safeParse(rawBatchPayload);"
        ]
      }
    }
  },
  {
    id: "py-backend",
    name: "Python",
    role: "Backend & Systems",
    languages: ["Python", "FastAPI", "PostgreSQL"],
    repo: {
      owner: "fastapi",
      name: "fastapi",
      stars: "76.2k",
      activity: "Active (today)",
    },
    issue: {
      number: 10428,
      title: "Add streaming response cancel propagation to ASGI middleware",
      difficulty: "Good first",
      matchScore: 98,
      estimatedMinutes: 30,
      technologies: ["Python", "AsyncIO", "ASGI"],
      reasons: [
        "100% Python codebase matching your backend proficiency.",
        "Explicit issue reproduction script with verified unit test fixture.",
        "Friendly maintainer label: 'help-wanted: validated'."
      ],
      gaps: [
        "Requires familiarity with Starlette ASGI event lifecycle."
      ],
      targetFiles: [
        { path: "fastapi/middleware/asgiref.py", lines: "L45-L78", action: "modify" },
        { path: "tests/test_streaming_disconnect.py", lines: "L12-L48", action: "create" }
      ],
      codeSnippet: {
        file: "fastapi/middleware/asgiref.py",
        diff: [
          "  async def send_stream(scope, receive, send):",
          "+   if event['type'] == 'http.disconnect':",
          "+       await self.cleanup_task()",
          "        return"
        ]
      }
    }
  },
  {
    id: "rust-systems",
    name: "Rust",
    role: "CLI & Tooling",
    languages: ["Rust", "Systems", "CLI"],
    repo: {
      owner: "astral-sh",
      name: "uv",
      stars: "41.5k",
      activity: "Active (15m ago)",
    },
    issue: {
      number: 6290,
      title: "Preserve symlink metadata during parallel wheel unpack cache",
      difficulty: "Intermediate",
      matchScore: 91,
      estimatedMinutes: 60,
      technologies: ["Rust", "tokio", "fs"],
      reasons: [
        "Strong systems programming footprint with async Tokio experience.",
        "Isolated crate module (crates/uv-extract) with no global state.",
        "High contributor momentum with fast maintainer review turnaround."
      ],
      gaps: [
        "Windows platform conditional compilation paths need testing."
      ],
      targetFiles: [
        { path: "crates/uv-extract/src/archive.rs", lines: "L210-L245", action: "modify" },
        { path: "crates/uv-extract/tests/symlinks.rs", lines: "L30-L75", action: "test" }
      ],
      codeSnippet: {
        file: "crates/uv-extract/src/archive.rs",
        diff: [
          "  // Copy file attributes safely",
          "- fs::copy(&entry_path, &dest)?;",
          "+ let meta = fs::symlink_metadata(&entry_path)?;",
          "+ fs::copy_with_metadata(&entry_path, &dest, meta)?;"
        ]
      }
    }
  },
  {
    id: "go-infra",
    name: "Go",
    role: "Microservices & Net",
    languages: ["Go", "gRPC", "Docker"],
    repo: {
      owner: "gofiber",
      name: "fiber",
      stars: "36.1k",
      activity: "Active (1h ago)",
    },
    issue: {
      number: 2940,
      title: "Improve context timeout propagation in multi-router groups",
      difficulty: "Good first",
      matchScore: 96,
      estimatedMinutes: 35,
      technologies: ["Go", "fasthttp", "net/http"],
      reasons: [
        "Standard library concurrency pattern matching your public Go commits.",
        "Zero external dependencies required for reproduction.",
        "First-time contributor friendly repository with triage bot support."
      ],
      gaps: [
        "Check benchmarks to ensure zero allocation regressions."
      ],
      targetFiles: [
        { path: "router.go", lines: "L320-L360", action: "modify" },
        { path: "router_test.go", lines: "L150-L190", action: "test" }
      ],
      codeSnippet: {
        file: "router.go",
        diff: [
          "  // Pass parent context to sub-router",
          "- ctx := r.pool.Get()",
          "+ ctx := r.acquireCtxWithDeadline(parent.Context())",
          "  defer r.releaseCtx(ctx)"
        ]
      }
    }
  }
];

export function InteractiveHeroCockpit() {
  const [activePresetId, setActivePresetId] = React.useState<string>("ts-fullstack");
  const [activeTab, setActiveTab] = React.useState<"reasons" | "files" | "diff">("reasons");
  const [isCopied, setIsCopied] = React.useState(false);

  const preset = PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];

  const handleCopyCmd = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(`stackaudit match ${preset.repo.owner}/${preset.repo.name}#${preset.issue.number}`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden flex flex-col text-left transition-all">
      {/* ── TOP COCKPIT CONTROLS & PRESET SELECTOR ── */}
      <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Terminal window buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground ml-1.5 hidden sm:inline">
            live-matching-cockpit
          </span>
        </div>

        {/* Live Match Engine status */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Interactive Preview</span>
        </div>
      </div>

      {/* ── PROFILE SWITCHER (Select your stack to test live) ── */}
      <div className="p-3 sm:px-4 sm:py-2.5 border-b border-border/50 bg-card/40 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Test Stack:
        </span>
        {PRESETS.map((p) => {
          const isActive = p.id === activePresetId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePresetId(p.id)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border",
                isActive
                  ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                  : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>{p.name}</span>
              <span className={cn(
                "text-[10px] opacity-75 font-mono hidden md:inline",
                isActive ? "text-background" : "text-muted-foreground"
              )}>
                ({p.role.split("/")[0]})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── MAIN COCKPIT BODY ── */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* REPOSITORY & COMPATIBILITY HERO ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-background/50 shadow-inner">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-foreground tracking-tight flex items-center gap-1">
                <span>{preset.repo.owner}</span>
                <span className="text-muted-foreground">/</span>
                <span>{preset.repo.name}</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/40">
                ★ {preset.repo.stars}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">
                ● {preset.repo.activity}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight line-clamp-1">
              #{preset.issue.number} {preset.issue.title}
            </h3>
          </div>

          {/* Compatibility badge */}
          <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-border/60 pt-2 sm:pt-0 sm:pl-4">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Deterministic Match
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                {preset.issue.matchScore}%
              </span>
              <span className="text-[10px] text-emerald-500/80 font-mono uppercase">Fit</span>
            </div>
          </div>
        </div>

        {/* METADATA CHIPS ROW */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-md",
              preset.issue.difficulty === "Good first"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            )}>
              {preset.issue.difficulty}
            </span>
            {preset.issue.technologies.map((t) => (
              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40">
                {t}
              </span>
            ))}
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 px-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              ~{preset.issue.estimatedMinutes}m effort
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCmd}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-0.5 rounded border border-border/50 hover:bg-muted/40 transition-colors"
            title="Copy CLI match command"
          >
            <Terminal className="w-3 h-3" />
            <span>{isCopied ? "Copied!" : "CLI: stackaudit match"}</span>
          </button>
        </div>

        {/* ── TABS: REASONS vs TARGET FILES vs CODE DIFF ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("reasons")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer",
                activeTab === "reasons"
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Match Reasons</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer",
                activeTab === "files"
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCode2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Target Files ({preset.issue.targetFiles.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("diff")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer",
                activeTab === "diff"
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Solution Diff</span>
            </button>
          </div>

          {/* TAB CONTENT WITH ANIMATION */}
          <div className="min-h-[145px]">
            <AnimatePresence mode="wait">
              {activeTab === "reasons" && (
                <motion.div
                  key="reasons"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2 text-xs"
                >
                  <div className="space-y-1.5">
                    {preset.issue.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-foreground/90">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{r}</span>
                      </div>
                    ))}
                  </div>
                  {preset.issue.gaps.length > 0 && (
                    <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>What to know first:</strong> {preset.issue.gaps[0]}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "files" && (
                <motion.div
                  key="files"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2"
                >
                  <p className="text-[11px] text-muted-foreground">
                    StackAudit isolated the precise repository modules requiring edits:
                  </p>
                  <div className="space-y-1.5">
                    {preset.issue.targetFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-background/70 border border-border/60 text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={cn(
                            "text-[9px] uppercase px-1.5 py-0.5 rounded font-bold",
                            file.action === "modify" && "bg-sky-500/10 text-sky-400 border border-sky-500/20",
                            file.action === "create" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                            file.action === "test" && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}>
                            {file.action}
                          </span>
                          <span className="text-foreground truncate">{file.path}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{file.lines}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "diff" && (
                <motion.div
                  key="diff"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2 font-mono text-[11px]"
                >
                  <div className="flex items-center justify-between text-muted-foreground text-[10px] px-1">
                    <span>{preset.issue.codeSnippet.file}</span>
                    <span>suggested_patch.diff</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#07080a] border border-border/80 text-foreground space-y-0.5 overflow-x-auto leading-relaxed">
                    {preset.issue.codeSnippet.diff.map((line, idx) => {
                      const isAdded = line.startsWith("+");
                      const isRemoved = line.startsWith("-");
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "px-1 py-0.2 rounded-xs whitespace-pre",
                            isAdded && "bg-emerald-500/15 text-emerald-300 font-semibold",
                            isRemoved && "bg-rose-500/15 text-rose-300 line-through opacity-80",
                            !isAdded && !isRemoved && "text-muted-foreground"
                          )}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground font-mono">
            Zero cold-start guessing. Real files before PR.
          </span>
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm cursor-pointer"
          >
            <span>Explore This Match</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
