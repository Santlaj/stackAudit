import type { Metadata } from "next";
import Link from "next/link";
import { EditorialNavbar } from "@/components/landing/editorial-navbar";
import { ArrowLeft, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog — StackAudit",
  description: "Recent updates, releases, and improvements to the StackAudit contribution intelligence platform.",
};

const RELEASES = [
  {
    version: "v1.0.0",
    date: "October 2026",
    tag: "Major Release",
    headline: "General Availability & Semantic Match Engine",
    description: "StackAudit v1.0 brings verified repository indexing, deep AST call-graph file detection, and interactive contribution roadmaps for open-source developers.",
    highlights: [
      {
        title: "Semantic Contribution Match Engine",
        detail: "Matches issues against developer programming languages, experience level, and preferred contribution scopes with explainable scoring.",
      },
      {
        title: "AST Call-Graph File Locator",
        detail: "Automatically pinpoints relevant source files and exported function boundaries involved in an issue before you open an editor.",
      },
      {
        title: "Interactive Developer Workspace",
        detail: "Saved contribution backlogs with persistent checklists, reproduction guides, and local notes.",
      },
      {
        title: "Safe Read-Only Ingestion",
        detail: "Strict read-only analysis using GitHub public APIs with zero code modification or unauthorized telemetry.",
      },
    ],
  },
  {
    version: "v0.9.2",
    date: "September 2026",
    tag: "Beta",
    headline: "Monorepo Package Breakdown & Performance",
    description: "Added specialized support for multi-package monorepos (Turborepo, pnpm workspaces) and enhanced maintainer response time tracking.",
    highlights: [
      {
        title: "Package Boundary Classification",
        detail: "Separates core framework runtimes, compilers, and documentation packages within monorepos like Next.js and Supabase.",
      },
      {
        title: "Maintainer Responsiveness Signals",
        detail: "Surfaces median PR review times and issue triage velocity so developers target healthy, active projects.",
      },
    ],
  },
  {
    version: "v0.9.0",
    date: "August 2026",
    tag: "Alpha",
    headline: "Initial Contributor Intelligence Pipeline",
    description: "Initial release of GitHub issue ingestion, community health scoring, and baseline developer profile configuration.",
    highlights: [
      {
        title: "Good First Issue Discovery",
        detail: "High-signal issue extraction with automated spam and stale ticket filtering.",
      },
      {
        title: "Better-Auth GitHub Authentication",
        detail: "Secure GitHub OAuth sign-in with verified contributor sessions.",
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      <EditorialNavbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="border-b border-neutral-200/80 pb-8">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              RELEASES &amp; LOGS
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900">
            Changelog
          </h1>
          <p className="mt-3 max-w-xl text-base text-neutral-600 leading-relaxed">
            All the latest releases, performance improvements, and feature updates shipped to StackAudit.
          </p>
        </div>

        {/* Timeline List */}
        <div className="mt-12 space-y-16">
          {RELEASES.map((release) => (
            <article key={release.version} className="relative pl-6 sm:pl-8 border-l border-neutral-200">
              {/* Timeline marker */}
              <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-neutral-900 shadow-xs" />

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-neutral-900">{release.version}</span>
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                  {release.tag}
                </span>
                <span className="font-mono text-xs text-neutral-400">• {release.date}</span>
              </div>

              <h2 className="mt-3 font-serif text-xl sm:text-2xl font-normal text-neutral-900">
                {release.headline}
              </h2>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                {release.description}
              </p>

              <div className="mt-6 space-y-3">
                {release.highlights.map((h) => (
                  <div key={h.title} className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                    <h3 className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {h.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed pl-3">
                      {h.detail}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
