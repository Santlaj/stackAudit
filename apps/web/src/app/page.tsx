"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import {
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  Cpu,
  Github,
  Compass,
  FileCode2,
  Activity,
  SlidersHorizontal,
  Terminal,
  Check,
  AlertCircle
} from "lucide-react";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // No forced redirect, allow logged-in users to see the homepage if they click Home.

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background overflow-x-hidden">
      
      {/* ─── NAV ─── */}
      <header className="h-14 border-b border-border/40 px-4 sm:px-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded overflow-hidden">
              <img src="/icon.png" alt="StackAudit Logo" className="w-full h-full object-contain" />
            </div>
            <span>StackAudit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <Link href="/" className="text-foreground">Home</Link>
            <Link href="/discover" className="hover:text-foreground transition-colors">Discover</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              GitHub <Github className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Button size="sm" className="h-8 text-xs bg-foreground text-background font-medium" onClick={() => router.push("/discover")}>
              Go to App <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-xs font-medium" onClick={() => router.push("/login")}>
                Sign In
              </Button>
              <Button size="sm" className="h-8 text-xs bg-foreground text-background font-medium" onClick={() => router.push("/login")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Open-Source <br />
            <span className="text-muted-foreground">Contribution Intelligence</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            StackAudit matches developers with open-source issues and explains what it takes to contribute. 
            Stop guessing where to start. Get verified compatibility, target file guidance, and architectural context before you write a single line of code.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="h-10 px-6 text-sm bg-foreground text-background hover:bg-foreground/90 font-medium gap-2 shadow-sm"
            >
              <Github className="w-4 h-4" /> Connect GitHub to Start
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })}
              className="h-10 px-4 text-sm font-medium"
            >
              Learn more
            </Button>
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section id="capabilities" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full border-t border-border/40">
        <div className="mb-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            WHAT STACKAUDIT DOES
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
            From developer profile to contribution-ready context.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Cpu, title: "GitHub Stack Ingestion", desc: "Ingests language byte distributions and commit frequencies to establish your verified technical footprint." },
            { icon: SlidersHorizontal, title: "Deterministic Matching", desc: "Scores compatibility based on language alignment, difficulty tier, activity signals, and contribution type." },
            { icon: GitPullRequest, title: "Explainable Reasoning", desc: "Delivers structured reasons and gap analysis explaining precisely why an issue matches your background." },
            { icon: Activity, title: "Repository Activity", desc: "Filters out stale discussions by verifying recent repository activity and maintainer engagement." },
            { icon: FileCode2, title: "Targeted File Guidance", desc: "Surfaces specific repository modules and file paths requiring edits, removing navigation friction." },
            { icon: Terminal, title: "Implementation Guidance", desc: "Outlines architectural context and actionable implementation steps so you can prepare pull requests efficiently." }
          ].map((item, i) => (
            <div key={i} className="border border-border/60 bg-card/30 rounded p-4 flex flex-col hover:border-border transition-colors">
              <div className="w-6 h-6 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground mb-3">
                <item.icon className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-1.5">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTRIBUTION LOOP ─── */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full border-t border-border/40">
        <div className="mb-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            THE WORKFLOW
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
            The Contribution Loop
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { num: "01", title: "Ingest", desc: "Connect GitHub to analyze your stack." },
            { num: "02", title: "Discover", desc: "Find issues matching your active languages." },
            { num: "03", title: "Evaluate", desc: "Review compatibility and technical gaps." },
            { num: "04", title: "Context", desc: "Extract target files and dependencies." },
            { num: "05", title: "Contribute", desc: "Write code with architectural readiness." }
          ].map((step, i) => (
            <div key={i} className="border border-border/60 bg-card/20 rounded p-4 relative overflow-hidden group">
              <div className="text-[10px] font-mono font-bold text-muted-foreground mb-2">[{step.num}]</div>
              <h3 className="text-xs font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-[11px] text-muted-foreground">{step.desc}</p>
              {i < 4 && <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-border opacity-50 hidden md:block" />}
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRODUCT OUTPUT EXAMPLE ─── */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full border-t border-border/40">
        <div className="mb-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            PRODUCT ARTIFACT
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-1">
            Intelligence before you contribute
          </h2>
        </div>

        <div className="border border-border/60 bg-card/20 rounded p-4 sm:p-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-border/60 bg-card/60 rounded">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-foreground">trpc / trpc</span>
                <span className="text-[10px] font-mono bg-secondary/80 border border-border/60 px-1.5 py-0.2 rounded text-muted-foreground">
                  Issue #4812
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground mt-1">
                Fix batch response validation for nested input routers
              </h4>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="text-right">
                <div className="text-[10px] font-mono text-muted-foreground uppercase">Compatibility</div>
                <div className="text-base font-bold font-mono text-emerald-400">88%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="border border-border/60 bg-card/40 rounded p-3 space-y-2">
              <div className="text-[10px] font-mono font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Match Reasons
              </div>
              <ul className="text-xs space-y-1.5 text-zinc-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-mono text-[10px]">•</span>
                  <span>Primary language (TypeScript) matches your stack.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-mono text-[10px]">•</span>
                  <span>Difficulty (Intermediate) fits preferred complexity.</span>
                </li>
              </ul>
            </div>

            <div className="border border-border/60 bg-card/40 rounded p-3 space-y-2">
              <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> Technical Gaps
              </div>
              <ul className="text-xs space-y-1.5 text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-zinc-500 font-mono text-[10px]">•</span>
                  <span>Involves internal router transformer types.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mt-auto border-t border-border/40 py-8 px-4 sm:px-6 bg-card/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-foreground font-mono text-[11px]">StackAudit</span>
            <span className="text-border">/</span>
            <span className="text-muted-foreground text-[11px]">Open-source contribution intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
