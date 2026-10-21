import type { Metadata } from "next";
import Link from "next/link";
import { EditorialNavbar } from "@/components/landing/editorial-navbar";

export const metadata: Metadata = {
  title: "Terms of Service — StackAudit",
  description: "Terms and conditions governing the use of the StackAudit open-source contribution platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      <EditorialNavbar />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="border-b border-neutral-200/80 pb-6">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            LEGAL &amp; POLICIES
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-neutral-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-neutral-500 font-mono">
            Last updated: October 2026
          </p>
        </div>

        <div className="mt-8 space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-neutral-900">1. Acceptance of Terms</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              By accessing or using StackAudit (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to all terms, please discontinue use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">2. Description of the Service</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              StackAudit is a developer productivity platform designed to help software engineers discover, understand, and contribute to public open-source software repositories. StackAudit provides matching algorithms, contextual file detection, and investigation roadmaps.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">3. GitHub Authentication &amp; Permissions</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              When authenticating via GitHub OAuth, you grant StackAudit read-only access to verify your developer profile and public activity. We never request or require write access to your repositories, and we never commit or push code on your behalf without your explicit authorization.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">4. Intellectual Property &amp; Open Source</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              Code analyzed through StackAudit remains the property of its respective open-source copyright holders under their respective licenses (e.g., MIT, Apache 2.0, BSD, GPL). StackAudit claims no ownership over third-party open-source codebases or contributions authored by users.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">5. Acceptable Use Policy</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              You agree not to use the Service to spam issue trackers, submit automated or malicious pull requests to open-source projects, or reverse-engineer the underlying service infrastructure. Respect the maintainers of open-source projects you choose to engage with.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">6. Disclaimer of Warranty</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. StackAudit does not guarantee that pull requests created following our checklists will be merged by repository maintainers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-neutral-900">7. Contact Information</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              For legal inquiries or questions regarding these terms, contact us at{" "}
              <a href="mailto:santlaj.dev@gmail.com" className="text-neutral-900 underline font-medium">
                contact@santlaj.in
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
