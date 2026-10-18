"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does StackAudit differ from GitHub's standard issue search?",
    answer: "GitHub search is keyword and label based. It has no understanding of your personal commit history, your language proficiency, or the active health of the repository. StackAudit calculates a deterministic 6-factor compatibility score, flags dead repositories with unresponsive maintainers, and pinpoints the exact target files and code diffs before you clone the repo."
  },
  {
    question: "Do I need write permissions to repositories to use StackAudit?",
    answer: "No. StackAudit operates entirely on public GitHub metadata, open repository trees, and public issue trackers. You only need to sign in with GitHub so StackAudit can inspect your public language distributions and commit habits."
  },
  {
    question: "How are compatibility match scores calculated?",
    answer: "We use a deterministic mathematical formula combining: (1) Language byte distribution alignment (35%), (2) Preferred difficulty tier & issue labels (25%), (3) Maintainer response and PR merge rates (15%), (4) File scope & modularity (15%), and (5) Dependency ecosystem overlap (10%). We never hallucinate arbitrary ratings."
  },
  {
    question: "What is the 'Maintainer Vitality Screen'?",
    answer: "One of the most frustrating parts of open source is spending hours fixing an issue only for the PR to sit unreviewed for 6 months. StackAudit actively analyzes maintainer response latency, 30-day branch activity, and recent PR merge frequency. Repositories with dormant maintainers are excluded from your suggestions."
  },
  {
    question: "Is StackAudit free for open source developers?",
    answer: "Yes, StackAudit is 100% free for individual open-source contributors. Our goal is to empower developers to discover high-impact repositories and make meaningful contributions without cold-start friction."
  }
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="w-full space-y-6 max-w-3xl mx-auto text-left">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Clear Answers for Engineers
        </h2>
        <p className="text-sm text-muted-foreground">
          Everything you need to know about StackAudit's matching architecture and workflow.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isOpen
                  ? "bg-card border-foreground/30 shadow-xs"
                  : "bg-card/40 border-border/70 hover:border-border hover:bg-card/60"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
              >
                <span className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 text-foreground"
                  )}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border/40 px-4 py-3 bg-background/50"
                  >
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
