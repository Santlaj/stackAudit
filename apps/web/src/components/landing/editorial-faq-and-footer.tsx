"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Github,
  Zap,
  Users,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  FileCode2,
  Twitter,
  Linkedin,
  Youtube,
  Mail
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { InteractiveCanvasGrid } from "./interactive-canvas-grid";

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "What is StackAudit?",
    a: "StackAudit analyzes open-source GitHub repositories, understands the issue in context, and helps you explore relevant files, components, and dependencies so you can plan your contribution with clarity.",
  },
  {
    q: "Is StackAudit free to use?",
    a: "Yes, StackAudit is free to explore open-source repositories and discover issues matched to your technical background.",
  },
  {
    q: "Which repositories and ecosystems are supported?",
    a: "Any public GitHub repository across TypeScript, JavaScript, Python, Rust, Go, C++, and Java ecosystems. You can also analyze any repository directly by typing its owner/repo slug.",
  },
  {
    q: "Does StackAudit write code for me?",
    a: "No, StackAudit does not write pull requests or generate automatic bot commits. It gives you the architectural context, relevant file locations, and structured investigation checklists so you understand the codebase and write the code yourself.",
  },
  {
    q: "How is this different from just searching on GitHub?",
    a: "GitHub search presents issues in isolation with little context on complexity or relevance. StackAudit analyzes language byte distribution, matches issues against your tech stack, identifies relevant files, and drafts a structured contribution plan.",
  },
  {
    q: "Do I need to connect my GitHub account?",
    a: "You can browse public repositories and explore contribution opportunities without signing in. Connecting your GitHub account enables personalized skill matching, saved issue bookmarks, and activity streak tracking.",
  },
  {
    q: "What data does StackAudit access?",
    a: "StackAudit only requests standard OAuth identity permissions (read:user and user:email). It never requests repository write permissions, administration privileges, or access to private repositories.",
  },
  {
    q: "Where can I get help or report an issue?",
    a: "You can open an issue directly on our open-source GitHub repository at github.com/Santlaj/stackauditvercel or reach out via our community channels.",
  },
];

export function EditorialFaqAndFooter() {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = React.useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = React.useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleGitHubSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/discover",
      });
    } catch {
      window.location.href = "/login";
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
    }
  };

  return (
    <>
      <section id="faq" className="relative border-t border-neutral-200/80 bg-[#FAFAF9] pt-16 sm:pt-24 pb-12 overflow-hidden">
      {/* Interactive Background Grid */}
      <InteractiveCanvasGrid />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Two-Column Layout: Left = Final CTA, Right = FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* ── LEFT COLUMN: Final Call to Action ── */}
          <div className="lg:col-span-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              READY TO EXPLORE
            </span>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.12] tracking-tight text-neutral-900">
              Find your next contribution.
            </h2>

            <p className="mt-4 max-w-lg text-sm sm:text-base text-neutral-600 leading-relaxed">
              Join StackAudit and explore open-source opportunities with the context you need to contribute with confidence.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGitHubSignIn}
                className="group inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.99] cursor-pointer"
              >
                <Github className="h-4 w-4" />
                <span>Continue with GitHub</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-2xs transition-colors hover:bg-neutral-50"
              >
                <span>Explore the directory</span>
              </Link>
            </div>

            {/* 3 Trust Signals */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-neutral-200/80">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200/60">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900">No credit card required</h4>
                  <p className="mt-0.5 text-[11px] text-neutral-500 leading-tight">Start exploring instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900">Open-source focused</h4>
                  <p className="mt-0.5 text-[11px] text-neutral-500 leading-tight">Built for developers.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-900">Transparent approach</h4>
                  <p className="mt-0.5 text-[11px] text-neutral-500 leading-tight">Clear methodology, no black box.</p>
                </div>
              </div>
            </div>

            {/* Visual Transformation Pipeline: Issue -> Context Analysis -> Verified Action Plan */}
            <div className="mt-10 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs hidden sm:block relative overflow-hidden">
              {/* Connected Stage Progression Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mb-3.5 px-0.5">
                <span className="flex items-center gap-1.5 font-medium text-neutral-800">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-200/80 text-[10px] font-bold text-neutral-700">1</span>
                  <span>Unfiltered Issue</span>
                </span>
                <div className="flex-1 mx-3 flex items-center">
                  <div className="h-px w-full bg-neutral-200 border-t border-dashed border-neutral-300" />
                  <ArrowRight className="h-3 w-3 text-neutral-400 -ml-1 shrink-0" />
                </div>
                <span className="flex items-center gap-1.5 font-medium text-neutral-800">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">2</span>
                  <span>StackAudit Indexing</span>
                </span>
                <div className="flex-1 mx-3 flex items-center">
                  <div className="h-px w-full bg-neutral-200 border-t border-dashed border-neutral-300" />
                  <ArrowRight className="h-3 w-3 text-neutral-400 -ml-1 shrink-0" />
                </div>
                <span className="flex items-center gap-1.5 font-medium text-neutral-800">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">3</span>
                  <span>Verified Plan</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 1. Issue Card */}
                <div className="flex-1 rounded-xl border border-neutral-200 bg-[#FAFAF9] p-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-900">
                      <Github className="h-3.5 w-3.5 text-neutral-800" />
                      <span>vercel / next.js</span>
                    </div>
                    <span className="font-mono text-[9px] text-neutral-400">#4812</span>
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-neutral-800 line-clamp-1 leading-snug">
                    Improve error messaging when server-rendered timestamps mismatch
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="rounded-full bg-emerald-50 px-1.5 py-0.2 text-[8px] font-medium text-emerald-700 border border-emerald-200">
                      open
                    </span>
                    <span className="rounded-full bg-blue-50 px-1.5 py-0.2 text-[8px] font-medium text-blue-700 border border-blue-200">
                      TypeScript
                    </span>
                  </div>
                </div>

                {/* Connector 1 */}
                <div className="flex items-center justify-center shrink-0 w-5 text-neutral-400">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

                {/* 2. StackAudit Analysis */}
                <div className="flex-1 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-900">
                    <img src="/icon.png" alt="StackAudit" className="h-3.5 w-3.5 object-contain" />
                    <span>StackAudit Analysis</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-[9px] text-neutral-600">
                    <li className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      <span>Understand the issue</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-blue-500" />
                      <span>Find relevant files</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-purple-500" />
                      <span>Analyze dependencies</span>
                    </li>
                  </ul>
                </div>

                {/* Connector 2 */}
                <div className="flex items-center justify-center shrink-0 w-5 text-neutral-400">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

                {/* 3. Next Steps Checklist */}
                <div className="flex-1 rounded-xl border border-neutral-200 bg-[#FAFAF9] p-3 shadow-2xs">
                  <span className="text-[11px] font-semibold text-neutral-900">Next steps</span>
                  <ul className="mt-1.5 space-y-1 text-[9px] text-neutral-700">
                    <li className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded border border-neutral-300 bg-white flex items-center justify-center text-[8px] text-emerald-600 font-bold">✓</span>
                      <span className="truncate">Explore relevant code</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded border border-neutral-300 bg-white flex items-center justify-center text-[8px] text-emerald-600 font-bold">✓</span>
                      <span className="truncate">Understand expected fix</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded border border-neutral-300 bg-white flex items-center justify-center text-[8px] text-emerald-600 font-bold">✓</span>
                      <span className="truncate">Plan implementation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: FAQ Accordion ── */}
          <div className="lg:col-span-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              FAQ
            </span>

            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.12] tracking-tight text-neutral-900">
              Frequently asked questions.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-neutral-600">
              Quick answers to the most common questions about StackAudit.
            </p>

            {/* Accordion list */}
            <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.q} className="py-4">
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="flex w-full items-center justify-between text-left text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-700 cursor-pointer"
                    >
                      <span className="pr-4">{item.q}</span>
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-neutral-500">
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 leading-relaxed pr-6">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── GROUNDED EDITORIAL FOOTER (NO GRID LINES) ── */}
    <footer className="border-t border-neutral-300 bg-white pt-14 pb-8 relative z-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded overflow-hidden">
                <img src="/icon.png" alt="StackAudit Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-neutral-900">StackAudit</span>
            </Link>
            <p className="mt-2 text-xs text-neutral-500">
              Understand. Explore. Contribute.
            </p>
            <p className="mt-1 text-xs text-neutral-500 max-w-xs leading-relaxed">
              Developer platform for open-source contribution intelligence and architectural codebase context.
            </p>
          </div>

          {/* Product */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Product</h5>
            <ul className="mt-3 space-y-2 text-xs text-neutral-600">
              <li>
                <a href="#features" className="hover:text-neutral-900 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/discover" className="hover:text-neutral-900 transition-colors">
                  Directory
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-neutral-900 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Resources</h5>
            <ul className="mt-3 space-y-2 text-xs text-neutral-600">
              <li>
                <Link href="/docs" className="hover:text-neutral-900 transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs#guides" className="hover:text-neutral-900 transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-neutral-900 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/community" className="hover:text-neutral-900 transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay in the loop */}
          <div className="col-span-2 md:col-span-1">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">Stay in the loop</h5>
            <p className="mt-2 text-xs text-neutral-500">
              Get product updates, new features, and open-source insights.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mt-3 flex items-center gap-1.5">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-white transition-colors hover:bg-neutral-800"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
            {newsletterSubmitted && (
              <p className="mt-1.5 text-[11px] text-emerald-600">Thank you for subscribing!</p>
            )}

            {/* Social links */}
            <div className="mt-4 flex items-center gap-3 text-neutral-500">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors"
                aria-label="X Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neutral-900 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@santlaj.in"
                className="hover:text-neutral-900 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright and Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200/80 pt-6 text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <span>© 2026 StackAudit. All rights reserved.</span>
            <Link href="/terms" className="hover:text-neutral-900 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">Privacy Policy</Link>
          </div>
          <div className="font-medium text-neutral-700">Crafted by Santlaj</div>
          <div>Made for the open-source community • India 🇮🇳</div>
        </div>
      </div>
    </footer>
    </>
  );
}
