"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { EditorialNavbar } from "@/components/landing/editorial-navbar";
import { EditorialHero } from "@/components/landing/editorial-hero";
import { EditorialWorkflow } from "@/components/landing/editorial-workflow";
import { EditorialContextFlow } from "@/components/landing/editorial-context-flow";
import { EditorialUseCase } from "@/components/landing/editorial-use-case";
import { EditorialFaqAndFooter } from "@/components/landing/editorial-faq-and-footer";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Route logged-in users to their workspace or onboarding
  React.useEffect(() => {
    if (!isPending && session?.user?.id) {
      import("@/lib/api").then(({ fetchProfile }) => {
        fetchProfile(session.user.id)
          .then((profile) => {
            if (profile && profile.hasCompletedOnboarding) {
              router.push("/discover");
            } else {
              router.push("/onboarding");
            }
          })
          .catch(() => {
            router.push("/onboarding");
          });
      });
    }
  }, [session, isPending, router]);

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans antialiased">
      {/* Navigation */}
      <EditorialNavbar />

      {/* Main Content Sections (5 continuous reference sections) */}
      <main>
        {/* Section 1: Hero and Product Preview */}
        <EditorialHero />

        {/* Section 2: How StackAudit Works (Discover -> Understand -> Investigate) */}
        <EditorialWorkflow />

        {/* Section 3: Why StackAudit Exists (Context Flow Diagram) */}
        <EditorialContextFlow />

        {/* Section 4: Real Use Case & Product Capabilities */}
        <EditorialUseCase />

        {/* Section 5: FAQ, Final Call to Action, and Compact Footer */}
        <EditorialFaqAndFooter />
      </main>
    </div>
  );
}
