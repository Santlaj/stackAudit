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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 border-b border-border/40 px-6 flex items-center">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden">
            <img src="/icon.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span>StackAudit</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-16 px-6">
        <div className="mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">Workspace Setup</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Connect your GitHub account</h1>
        <p className="text-sm text-muted-foreground max-w-xl mb-10 leading-relaxed">
          StackAudit relies on your GitHub data to understand your experience and match you with the right issues. 
          Connect your account to unlock personalized contribution recommendations and repository insights.
        </p>

        <div className="border-l-2 border-border/40 pl-6 space-y-6 mb-10">
          <div>
            <h3 className="text-sm font-medium mb-1">1. Authenticate</h3>
            <p className="text-xs text-muted-foreground">Authorize StackAudit to read your public GitHub profile and repository data.</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">2. Ingest Stack</h3>
            <p className="text-xs text-muted-foreground">We'll analyze your commit history and language byte distributions.</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">3. Discover Matches</h3>
            <p className="text-xs text-muted-foreground">Get deterministic matches for open-source issues that fit your exact skills.</p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-sm p-3 text-sm flex items-start gap-2 mb-6 max-w-md">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleConnectGithub}
            disabled={loading}
            className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-medium px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            Connect GitHub
          </button>
          <button
            onClick={() => router.push("/onboarding/profile")}
            className="text-xs text-muted-foreground hover:text-foreground font-medium px-4 py-2.5 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </main>
    </div>
  );
}
