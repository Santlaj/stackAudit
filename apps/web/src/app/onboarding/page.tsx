"use client";

import React, { useEffect, useState } from "react";
import { useSession, linkSocial, listAccounts } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Github, Loader2, AlertCircle } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push("/login");
      return;
    }
    
    // Fetch accounts to see if github is linked
    listAccounts()
      .then((res) => {
        if (res.data) setAccounts(res.data);
        setLoadingAccounts(false);
      })
      .catch(() => setLoadingAccounts(false));
  }, [session, isPending, router]);

  const hasGithub = accounts.some(acc => acc.providerId === "github");

  const handleConnectGithub = async () => {
    setError(null);
    setLoading(true);
    try {
      await linkSocial({
        provider: "github",
        callbackURL: `${window.location.origin}/onboarding/profile`,
      });
    } catch (err: any) {
      setError("Failed to connect GitHub account.");
      setLoading(false);
    }
  };

  if (isPending || loadingAccounts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If they already have GitHub linked, go to the next onboarding step
  if (hasGithub) {
    router.push("/onboarding/profile");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-lg border border-border/40 bg-card rounded-md shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b border-border/40">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">GitHub Connection</h1>
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight mb-2">Connect your GitHub account</h2>
          <p className="text-sm text-foreground/80 mb-6">
            StackAudit relies on your GitHub data to understand your experience and match you with the right issues. 
            Connect your account to unlock:
          </p>

          <ul className="space-y-3 mb-8 text-sm text-foreground/90 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              Personalized contribution recommendations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              Developer profile analysis
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              Contribution history
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              Open-source achievements
            </li>
          </ul>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-sm p-3 text-sm flex items-start gap-2 mb-6">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleConnectGithub}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-medium px-4 py-2.5 rounded-sm transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            Connect GitHub
          </button>

          <div className="mt-4 text-center">
            <a href="/onboarding/profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
