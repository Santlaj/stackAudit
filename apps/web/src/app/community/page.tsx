import type { Metadata } from "next";
import Link from "next/link";
import { EditorialNavbar } from "@/components/landing/editorial-navbar";
import { Users, Github, MessageSquare, ArrowRight, BookOpen, Heart, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Community — StackAudit",
  description: "Join the StackAudit open-source community to discover projects, get mentorship, and collaborate.",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      <EditorialNavbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="border-b border-neutral-200/80 pb-8">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              OPEN-SOURCE CONTRIBUTORS
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-neutral-900">
            StackAudit Community
          </h1>
          <p className="mt-3 max-w-2xl text-base text-neutral-600 leading-relaxed">
            A global collective of developers contributing to open source, sharing monorepo playbooks, and helping each other land meaningful pull requests.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-neutral-900">
              GitHub Discussions
            </h2>
            <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
              Ask questions about unfamiliar issues, verify your reproduction setups, and share implementation approaches with fellow contributors.
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Link href="/discover" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-700">
                <span>Browse discussions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-neutral-900">
              Contribution Showcases
            </h2>
            <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
              Celebrate merged pull requests across top open-source projects. Learn from successful PR descriptions, test plans, and maintainer reviews.
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <Link href="/discover" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-700">
                <span>View showcases</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900">
              <Heart className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-neutral-900">
              Maintainer Partnerships
            </h2>
            <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
              Are you an open-source project maintainer? Index your repository on StackAudit to receive high-quality, pre-screened contributions.
            </p>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <a href="mailto:contact@santlaj.in" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-neutral-700">
                <span>Partner with us</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Code of conduct section */}
        <div className="mt-16 rounded-2xl border border-neutral-200/90 bg-[#FAFAF9] p-6 sm:p-8">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            OUR STANDARD
          </span>
          <h2 className="mt-2 font-serif text-2xl font-normal text-neutral-900">
            Open-Source Contributor Code of Conduct
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl">
            StackAudit is dedicated to fostering an inclusive, welcoming, and harassment-free experience for everyone, regardless of experience level, background, or identity. We prioritize kindness, technical rigor, and constructive collaboration.
          </p>
        </div>
      </main>
    </div>
  );
}
