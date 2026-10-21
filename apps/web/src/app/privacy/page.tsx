import type { Metadata } from "next";
import Link from "next/link";
import { EditorialNavbar } from "@/components/landing/editorial-navbar";

export const metadata: Metadata = {
  title: "Privacy Policy — StackAudit",
  description: "Privacy policy and data transparency practices for the StackAudit developer platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      <EditorialNavbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="border-b border-neutral-200/80 pb-6">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            DATA TRANSPARENCY
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-neutral-900">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-neutral-500 font-mono">
            Last updated: October 2026
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-neutral-900">1. Overview &amp; Privacy Pledge</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              StackAudit is built for software developers. We believe privacy and security are foundational engineering requirements. We do not sell your personal data, and we do not store or monetize your private code.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">2. Information We Collect</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              We collect minimal information necessary to deliver personalized issue recommendations:
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-600">
              <li><strong>Account Information</strong>: GitHub username, public email address, and avatar provided via OAuth.</li>
              <li><strong>Technical Preferences</strong>: Languages, frameworks, and contribution interests explicitly configured in your developer profile.</li>
              <li><strong>Saved Items</strong>: Issues and repositories bookmarked to your local workspace backlog.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">3. Read-Only Repository Inspection</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              Our analysis engine parses public GitHub open-source repositories to generate architectural context and identify file locations. We parse public files using static AST parsers in memory. We never clone private repositories or expose sensitive repository data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">4. Authentication &amp; Cookies</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              StackAudit uses secure, HTTP-only session cookies managed through Better-Auth to keep you signed in. We do not use third-party behavioral tracking cookies or marketing ad pixels.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">5. Data Retention &amp; Account Deletion</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              You can delete your account and associated developer preferences at any time from your Account Settings. Upon deletion, your profile records are purged from our PostgreSQL database immediately.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">6. Contact &amp; Data Requests</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              If you have any questions about our data practices or wish to request data export, please contact{" "}
              <a href="mailto:contact@santlaj.in" className="text-neutral-900 underline font-medium">
                contact@santlaj.in
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
