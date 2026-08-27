"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { ShowcaseScreen } from "@/components/dashboard/showcase-screen";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useSession, signIn } from "@/lib/auth-client";
import {
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  Cpu,
  Github,
  Compass,
  FileCode2,
  Home,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background overflow-x-hidden">
      {/* We removed the traditional header and replaced it with FloatingDock at the bottom of the page */}

      {/* Top Section: Realistic 3D Macbook Scroll Showcase */}
      <section id="showcase" className="w-full relative">
        <MacbookScroll
          title={
            <>
              Discover, understand, and contribute{" "}
              <br />
              <span className="text-muted-foreground">to open source with confidence.</span>
            </>
          }
          showGradient={true}
        >
          <ShowcaseScreen />
        </MacbookScroll>
      </section>

      {/* Quick Launch Callout */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed mb-6">
          StackAudit analyzes your developer footprint, matches you with high-signal repositories, and delivers architectural context before you write a single line of code.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => router.push(session ? "/discover" : "/login")}
            className="h-10 px-6 text-xs sm:text-sm bg-foreground text-background hover:bg-foreground/90 font-medium gap-2 shadow-lg"
          >
            <Compass className="w-4 h-4" /> Find My First Contribution
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/profile")}
            className="h-10 px-5 text-xs sm:text-sm border-border/80 hover:bg-secondary/50 font-medium"
          >
            Configure Developer Profile
          </Button>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section id="capabilities" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border/40">
        <div className="mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
            Platform Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">
            Built around the complete contribution lifecycle.
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            From technical skill fingerprinting to pinpointing the exact AST nodes to edit, StackAudit removes the ambiguity of contributing to unfamiliar codebases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="border border-border/60 bg-card/40 rounded-sm p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Developer Skill Fingerprinting</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ingests your GitHub repositories, commit velocity, and language distribution to establish a verified technical profile rather than relying on self-reported questionnaires.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/30 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-language AST profiling
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-border/60 bg-card/40 rounded-sm p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Explainable Issue Matching</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Matches issues using concrete technical compatibility scores. Understand exactly why an issue fits your level, required frameworks, and estimated completion time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/30 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Explainable match reasoning
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-border/60 bg-card/40 rounded-sm p-5 flex flex-col justify-between hover:border-border transition-colors">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded border border-border/60 bg-secondary/40 flex items-center justify-center text-foreground">
                <FileCode2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Code & Architectural Context</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Surfaces relevant repository files, subsystem dependencies, and suggested step-by-step implementation roadmaps directly alongside the issue description.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/30 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> File-level contribution guidance
            </div>
          </div>
        </div>
      </section>

      {/* Structured Workflow Section */}
      <section id="workflow" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-border/40 w-full">
        <div className="border border-border/60 bg-card/30 rounded-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
                The Contribution Pipeline
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mt-1">
                DISCOVER → UNDERSTAND → MATCH → PREPARE → CONTRIBUTE
              </h3>
            </div>
            <Button
              onClick={() => router.push(session ? "/discover" : "/login")}
              className="bg-foreground text-background hover:bg-foreground/90 text-xs h-9 px-4 font-medium self-start md:self-auto"
            >
              Start Contributing <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-xs">
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-muted-foreground">STEP 01</div>
              <div className="font-semibold text-foreground text-sm">Sync Profile</div>
              <p className="text-muted-foreground leading-relaxed">
                Connect GitHub to parse languages, repository density, and preferred toolchains.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-muted-foreground">STEP 02</div>
              <div className="font-semibold text-foreground text-sm">Filter & Discover</div>
              <p className="text-muted-foreground leading-relaxed">
                Query vetted open-source repositories filtered by language, difficulty, and active maintainers.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-muted-foreground">STEP 03</div>
              <div className="font-semibold text-foreground text-sm">Extract Context</div>
              <p className="text-muted-foreground leading-relaxed">
                Review relevant module architectures, modified files, and implementation blueprints.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="font-mono text-[10px] font-bold text-muted-foreground">STEP 04</div>
              <div className="font-semibold text-foreground text-sm">Ship Pull Request</div>
              <p className="text-muted-foreground leading-relaxed">
                Follow repository-specific contribution rules with verified technical readiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 py-8 px-4 sm:px-6 bg-card/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-background">
              <span className="text-[8px] font-bold">SA</span>
            </div>
            <span className="font-medium text-foreground">StackAudit</span>
            <span>— Open-source contribution intelligence platform.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/discover" className="hover:text-foreground transition-colors">Workbench</Link>
            <Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              GitHub <ArrowRight className="w-3 h-3 -rotate-45" />
            </a>
          </div>
        </div>
      </footer>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <FloatingDock 
          items={[
            { title: "Home", icon: <Home className="h-5 w-5 text-neutral-300" />, href: "/" },
            { title: "Discover", icon: <Compass className="h-5 w-5 text-neutral-300" />, href: "/discover" },
            ...(session
              ? [{ title: "Profile", icon: <User className="h-5 w-5 text-neutral-300" />, href: "/profile" }]
              : [
                  { title: "Login", icon: <LogIn className="h-5 w-5 text-neutral-300" />, href: "/login" },
                  { title: "Sign Up", icon: <UserPlus className="h-5 w-5 text-neutral-300" />, href: "/login" },
                ]),
          ]}
          desktopClassName="bg-black/90 backdrop-blur-md border border-white/10 shadow-2xl"
          mobileClassName="bg-black/90 backdrop-blur-md border border-white/10"
        />
      </div>
    </div>
  );
}
