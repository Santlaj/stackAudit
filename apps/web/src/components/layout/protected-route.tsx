"use client";

import React, { useEffect, useState } from "react";
import { useSession, listAccounts } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [hasGithub, setHasGithub] = useState<boolean | null>(null);

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.push("/login");
      return;
    }

    listAccounts().then((res) => {
      const githubLinked = res.data?.some(acc => acc.providerId === "github") || false;
      setHasGithub(githubLinked);
      
      // We don't strictly block access to the dashboard if they skipped onboarding,
      // but they will need to connect GitHub to run discovery. The prompt implies
      // they can skip but it will be limited. We'll let them through if they skip.
    });
  }, [session, isPending, router]);

  if (isPending || (session && hasGithub === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
