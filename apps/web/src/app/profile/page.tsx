"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Shell } from "@/components/layout/shell";
import { useSession, listAccounts, linkSocial } from "@/lib/auth-client";
import { fetchProfile, DeveloperProfile, getMatches, IssueMatch } from "@/lib/api";
import { ProfileForm } from "@/components/profile/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  Loader2, 
  Mail, 
  CheckCircle2, 
  Pencil, 
  Code2, 
  Settings2,
  ArrowRight
} from "lucide-react";
import { ContributionBadges } from "@/components/profile/contribution-badges";
import { DailyActivityCard } from "@/components/activity/daily-activity-card";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [matches, setMatches] = useState<IssueMatch[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [linkingGithub, setLinkingGithub] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // 1. Fetch developer profile
      fetchProfile(session.user.id)
        .catch(async () => {
          const { ingestProfile } = await import("@/lib/api");
          return await ingestProfile();
        })
        .then(p => setProfile(p))
        .catch(e => console.error("Profile not found or error:", e))
        .finally(() => setLoadingProfile(false));
      
      // 2. Fetch linked social accounts
      listAccounts()
        .then(res => setAccounts(res.data || []))
        .catch(e => console.error("Accounts error:", e));

      // 3. Fetch matches to compute accurate contribution metrics
      getMatches(session.user.id)
        .then(m => setMatches(m || []))
        .catch(e => console.error("Matches error:", e));
    }
  }, [session]);

  const hasGithub = accounts.some(acc => acc.providerId === "github");
  const hasGoogle = accounts.some(acc => acc.providerId === "google");

  const handleConnectGithub = async () => {
    setLinkingGithub(true);
    try {
      await linkSocial({ provider: "github", callbackURL: window.location.href });
    } catch (err) {
      console.error(err);
      setLinkingGithub(false);
    }
  };

  const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : "SA";

  // Derive accurate contribution summary numbers
  const startedMatches = matches.filter(m => ["STARTED", "PR_SUBMITTED", "MERGED"].includes(m.status));
  const prMatches = matches.filter(m => ["PR_SUBMITTED", "MERGED"].includes(m.status));
  const analyzedMatches = matches.filter(m => ["ANALYZED", "STARTED", "PR_SUBMITTED", "MERGED"].includes(m.status));

  const totalContributions = Math.max(profile?.totalContributions || 0, startedMatches.length);
  const totalRepos = Math.max(profile?.publicRepoCount || 0, new Set(matches.map(m => m.repository)).size);
  const totalAnalyzed = Math.max((profile as any)?.issueCount || 0, analyzedMatches.length);
  const totalPrs = Math.max((profile as any)?.prCount || 0, prMatches.length);

  return (
    <ProtectedRoute>
      <Shell>
        <div className="container max-w-7xl py-8 md:py-10 px-4 md:px-8">
          {loadingProfile ? (
            <div className="flex items-center gap-3 text-muted-foreground text-sm py-24 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your developer context...
            </div>
          ) : isEditing ? (
            <div className="max-w-2xl mx-auto py-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold tracking-tight">Edit Developer Profile</h1>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
              <ProfileForm 
                initialData={profile || undefined} 
                onSubmit={async (data) => {
                  const { updateProfile } = await import("@/lib/api");
                  const updated = await updateProfile(session!.user.id, data);
                  setProfile(updated);
                  setIsEditing(false);
                }}
                submitLabel="Save Changes"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* ============================================================ */}
              {/* LEFT COLUMN: Profile Identity, History, Stack & Readiness    */}
              {/* ============================================================ */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. PROFILE IDENTITY + CONTRIBUTION HISTORY (Single cohesive card) */}
                <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-6">
                  {/* Avatar & Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <Avatar className="h-16 w-16 border-2 border-border shadow-xs">
                          <AvatarImage src={session?.user?.image || ""} />
                          <AvatarFallback className="text-lg bg-secondary text-secondary-foreground font-semibold">
                            {getInitials(session?.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Status dot indicator */}
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                      </div>

                      <div className="space-y-1">
                        <h1 className="text-lg font-semibold tracking-tight text-foreground">
                          {session?.user?.name}
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>@{session?.user?.name?.toLowerCase().replace(/\s+/g, "") || "developer"}</span>
                          <Github className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground/90 line-clamp-2 pt-0.5">
                          {profile?.githubBio || "Building with open source • Lifelong learner"}
                        </p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)} 
                      className="h-8 px-2.5 text-xs gap-1.5 shrink-0 hover:bg-secondary cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Profile
                    </Button>
                  </div>

                  {/* 2. CONTRIBUTION HISTORY (Directly underneath header per spec) */}
                  <div className="border-t border-border/50 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contribution History
                      </h3>
                      <Link 
                        href="/saved" 
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        View all <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Compact Horizontal Statistics Row */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <div className="space-y-0.5">
                        <p className="text-lg font-semibold tracking-tight text-foreground">
                          {totalContributions}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Contributions
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-lg font-semibold tracking-tight text-foreground">
                          {totalRepos}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Repositories
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-lg font-semibold tracking-tight text-foreground">
                          {totalAnalyzed}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Issues Analyzed
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-lg font-semibold tracking-tight text-foreground">
                          {totalPrs}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          PRs Submitted
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DAILY ACTIVITY (Last 30 days active-time signal) */}
                <DailyActivityCard />

                {/* 3. TECH STACK */}
                <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tech Stack
                    </h3>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile?.observedLanguages && profile.observedLanguages.length > 0 ? (
                      profile.observedLanguages.map((lang: string) => (
                        <Badge key={lang} variant="secondary" className="rounded-md font-normal text-xs px-2.5 py-0.5">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No languages detected.</span>
                    )}
                  </div>
                </div>

                {/* 4. FOCUS & LEARNING */}
                <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Focus & Learning
                    </h3>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="space-y-3 pt-1">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Current Focus</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile?.currentFocus && profile.currentFocus.length > 0 ? (
                          profile.currentFocus.map((focus: string) => (
                            <Badge key={focus} variant="outline" className="rounded-md font-normal text-xs border-border/60">
                              {focus}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5 font-medium">Learning Goals</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile?.learningGoals && profile.learningGoals.length > 0 ? (
                          profile.learningGoals.map((goal: string) => (
                            <Badge key={goal} variant="outline" className="rounded-md font-normal text-xs border-border/60">
                              {goal}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. CONTRIBUTION PREFERENCES */}
                <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Contribution Preferences
                    </h3>
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Complexity</p>
                      <p className="text-xs font-medium text-foreground">{profile?.preferredComplexity || "Beginner-friendly"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Primary Area</p>
                      <p className="text-xs font-medium text-foreground">{profile?.preferredArea || "Any"}</p>
                    </div>
                    <div className="col-span-2 pt-1">
                      <p className="text-xs text-muted-foreground mb-1.5">Preferred Contribution Types</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile?.preferredContributionTypes && profile.preferredContributionTypes.length > 0 ? (
                          profile.preferredContributionTypes.map((type: string) => (
                            <Badge key={type} variant="secondary" className="rounded-md font-normal text-xs">
                              {type}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Bug Fix, Documentation, Feature</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. CONTRIBUTION READINESS */}
                <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contribution Readiness
                  </h3>
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Github className="w-3.5 h-3.5" /> GitHub Connected
                      </span>
                      {hasGithub ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <button onClick={handleConnectGithub} disabled={linkingGithub} className="text-emerald-600 hover:underline font-medium">
                          {linkingGithub ? "Connecting..." : "Connect GitHub"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5" /> Languages Detected
                      </span>
                      {profile?.observedLanguages && profile.observedLanguages.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-amber-500 font-medium">Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs pb-1">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Settings2 className="w-3.5 h-3.5" /> Preferences Set
                      </span>
                      {profile?.preferredComplexity ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-amber-500 font-medium">Missing</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* ============================================================ */}
              {/* RIGHT COLUMN: Contribution Badges Gallery                    */}
              {/* ============================================================ */}
              <div className="lg:col-span-7">
                <ContributionBadges />
              </div>

            </div>
          )}
        </div>
      </Shell>
    </ProtectedRoute>
  );
}
