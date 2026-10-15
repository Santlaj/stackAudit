"use client";

import React, { useEffect, useState } from "react";
import { useSession, linkSocial, listAccounts, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { fetchProfile, updateProfile } from "@/lib/api";
import { TechnologySelector } from "@/components/profile/technology-selector";
import { 
  Github, 
  Loader2, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  LogOut,
  Layers,
  Code2,
  Sliders,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TECH_ICONS, getTechIconClass } from "@/components/dashboard/technology-explorer";

// Curated popular stacks for fast 1-click toggling
const POPULAR_TECHNOLOGIES = [
  "TypeScript",
  "Python",
  "JavaScript",
  "Go",
  "Rust",
  "React",
  "Next.js",
  "Node.js",
  "C++",
  "Java",
  "PostgreSQL",
  "Docker",
];

const COMPLEXITY_TIERS = [
  {
    id: "Beginner-friendly",
    label: "Beginner-Friendly",
    badge: "Good First Issues",
    description: "Documentation updates, small bug fixes, typo corrections, and well-scoped starter issues.",
  },
  {
    id: "Intermediate",
    label: "Intermediate",
    badge: "Recommended",
    description: "Feature enhancements, multi-file bug fixes, test suites, API contracts, and refactoring.",
  },
  {
    id: "Advanced",
    label: "Advanced",
    badge: "Core Systems",
    description: "Subsystem architecture, concurrency, performance optimization, and deep internal logic.",
  },
];

const PREFERRED_AREAS = [
  "Any",
  "Backend",
  "Frontend",
  "Full Stack",
  "Systems",
  "DevOps",
];

const CONTRIBUTION_TYPES = [
  "Bug Fix",
  "Feature",
  "Documentation",
  "Testing",
  "Refactoring",
  "Developer Tooling",
];

const STAGES = [
  { id: 1, name: "GitHub Source", icon: Github },
  { id: 2, name: "Target Stack", icon: Code2 },
  { id: 3, name: "Complexity", icon: Sliders },
  { id: 4, name: "Focus & Domain", icon: Layers },
];

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasGithub, setHasGithub] = useState(false);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [publicRepoCount, setPublicRepoCount] = useState<number>(0);

  // Form state
  const [observedLanguages, setObservedLanguages] = useState<string[]>([]);
  const [preferredComplexity, setPreferredComplexity] = useState("Intermediate");
  const [preferredArea, setPreferredArea] = useState("Any");
  const [preferredContributionTypes, setPreferredContributionTypes] = useState<string[]>([
    "Bug Fix",
    "Feature",
  ]);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    let isMounted = true;

    async function loadInitialData() {
      try {
        const [profileRes, accountsRes] = await Promise.all([
          fetchProfile(session!.user.id).catch(() => null),
          listAccounts().catch(() => null),
        ]);

        if (!isMounted) return;

        // If user already completed onboarding, route straight to discover
        if (profileRes && profileRes.hasCompletedOnboarding) {
          router.push("/discover");
          return;
        }

        const accounts = accountsRes?.data || [];
        const githubAccount = accounts.find((a: any) => a.providerId === "github");
        const isGithubLinked = Boolean(githubAccount || profileRes?.hasGithub);

        setHasGithub(isGithubLinked);
        setGithubLogin(profileRes?.githubLogin || (githubAccount ? session?.user?.name || "contributor" : null));
        setPublicRepoCount(profileRes?.publicRepoCount || 0);

        if (profileRes) {
          if (profileRes.observedLanguages && profileRes.observedLanguages.length > 0) {
            setObservedLanguages(profileRes.observedLanguages);
          } else if (profileRes.currentFocus && profileRes.currentFocus.length > 0) {
            setObservedLanguages(profileRes.currentFocus);
          }
          if (profileRes.preferredComplexity) {
            setPreferredComplexity(profileRes.preferredComplexity);
          }
          if (profileRes.preferredArea) {
            setPreferredArea(profileRes.preferredArea);
          }
          if (profileRes.preferredContributionTypes && profileRes.preferredContributionTypes.length > 0) {
            setPreferredContributionTypes(profileRes.preferredContributionTypes);
          }
        }
      } catch (err: any) {
        console.error("Error loading onboarding state", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [session, isPending, router]);

  const handleConnectGithub = async () => {
    setError(null);
    setConnectingGithub(true);
    try {
      await linkSocial({
        provider: "github",
        callbackURL: `${window.location.origin}/onboarding`,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to initiate GitHub authorization.");
      setConnectingGithub(false);
    }
  };

  const toggleLanguage = (tech: string) => {
    if (observedLanguages.includes(tech)) {
      setObservedLanguages(observedLanguages.filter((t) => t !== tech));
    } else {
      setObservedLanguages([...observedLanguages, tech]);
    }
  };

  const toggleContributionType = (type: string) => {
    if (preferredContributionTypes.includes(type)) {
      setPreferredContributionTypes(preferredContributionTypes.filter((t) => t !== type));
    } else {
      setPreferredContributionTypes([...preferredContributionTypes, type]);
    }
  };

  const handleNext = () => {
    setError(null);
    if (step === 2 && observedLanguages.length === 0) {
      setError("Please select at least one technology or programming language to continue.");
      return;
    }
    if (step < 4) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!session?.user?.id) return;

    if (observedLanguages.length === 0) {
      setError("Please select at least one target technology or programming language.");
      setStep(2);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await updateProfile(session.user.id, {
        observedLanguages,
        currentFocus: observedLanguages,
        preferredComplexity,
        preferredArea,
        preferredContributionTypes,
      });

      router.push("/discover");
    } catch (err: any) {
      setError(err?.message || "Failed to save profile preferences.");
      setSubmitting(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-foreground" />
        <span className="text-xs font-mono uppercase tracking-wider">Loading workspace context...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background">
      
      {/* ── TOPBAR ── */}
      <header className="h-14 border-b border-border/60 bg-background/80 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded overflow-hidden">
            <img src="/icon.png" alt="StackAudit Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-semibold tracking-tight">StackAudit</span>
          <span className="text-muted-foreground/30 text-sm font-light">/</span>
          <span className="text-xs text-muted-foreground font-mono">Contributor Onboarding</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Signed in as <strong className="text-foreground font-medium">{session?.user?.email}</strong>
          </span>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── MAIN STAGED WIZARD CONTAINER ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full py-10 px-4 sm:px-6 flex flex-col justify-between">
        
        <div className="space-y-8">
          {/* Progress Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono font-medium text-foreground uppercase tracking-wider">
                  Stage 0{step} of 04
                </span>
                <span className="text-muted-foreground/30 font-light">/</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {STAGES[step - 1].name}
                </span>
              </div>

              {/* Segmented mini progress bar */}
              <div className="flex items-center gap-1.5">
                {STAGES.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      s.id === step 
                        ? "w-8 bg-foreground" 
                        : s.id < step 
                          ? "w-4 bg-foreground/60" 
                          : "w-4 bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Stepper Breadcrumb Pills */}
            <div className="grid grid-cols-4 gap-2">
              {STAGES.map((s) => {
                const Icon = s.icon;
                const isCurrent = s.id === step;
                const isPast = s.id < step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (isPast) setStep(s.id);
                    }}
                    disabled={!isPast && !isCurrent}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border text-left transition-all",
                      isCurrent
                        ? "border-foreground bg-muted/50 text-foreground"
                        : isPast
                          ? "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground cursor-pointer"
                          : "border-border/30 bg-card/20 text-muted-foreground/40 cursor-not-allowed"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5 shrink-0", isCurrent ? "text-foreground" : "text-muted-foreground")} />
                    <span className="text-[11px] font-medium hidden sm:inline truncate">
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── STAGE 1: GITHUB CONNECTION ── */}
          {step === 1 && (
            <div className="rounded-lg border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Source Verification</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  Connect your GitHub account
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  StackAudit extracts public repositories, language byte counts, and commit velocity to deterministically match issues to your real development workflow.
                </p>
              </div>

              {hasGithub ? (
                <div className="p-4 rounded-md bg-muted/30 border border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-background border border-border/60 flex items-center justify-center shrink-0">
                        <Github className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-foreground">
                            {githubLogin ? `@${githubLogin}` : "Connected"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            Synced
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {publicRepoCount > 0 
                            ? `${publicRepoCount} public repositories linked for skill signals.`
                            : "GitHub profile and repository signals are active."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground/80 bg-background/40 p-2.5 rounded border border-border/30">
                    Your language distributions and commit patterns are automatically factored into your match score.
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-md bg-muted/20 border border-border/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-background border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Github className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-foreground">
                        Recommended: Connect GitHub OAuth
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Enables automated technology profiling without manual input. If you prefer, you can skip this step and configure your stack manually in the next stage.
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleConnectGithub}
                      disabled={connectingGithub}
                      className="h-9 px-4 inline-flex items-center gap-2 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {connectingGithub ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Github className="w-3.5 h-3.5" />
                      )}
                      <span>Authorize GitHub Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 transition-colors cursor-pointer underline underline-offset-4"
                    >
                      Skip & set up manually
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STAGE 2: TARGET TECHNOLOGIES ── */}
          {step === 2 && (
            <div className="rounded-lg border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Stack Definition</span>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                    Target Technologies
                  </h2>
                  <span className="text-xs font-mono text-muted-foreground">
                    {observedLanguages.length} selected
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Select the programming languages, runtimes, and frameworks you want to target for issue discovery.
                </p>
              </div>

              {/* Quick Select Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-muted-foreground/80 block">
                  Quick Select (click to toggle):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TECHNOLOGIES.map((tech) => {
                    const isSelected = observedLanguages.includes(tech);
                    const iconSrc = TECH_ICONS[tech.toLowerCase()];
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleLanguage(tech)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-md font-mono transition-all inline-flex items-center gap-2 border cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background font-semibold border-foreground shadow-xs"
                            : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-background shrink-0" />
                        ) : iconSrc ? (
                          <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center overflow-visible">
                            <img
                              src={iconSrc}
                              alt={tech}
                              className={getTechIconClass(tech, "explorer")}
                            />
                          </span>
                        ) : null}
                        <span>{tech}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Searchable input */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[11px] font-medium text-muted-foreground/80 block">
                  Search & Add Additional Packages / Frameworks:
                </span>
                <TechnologySelector
                  selected={observedLanguages}
                  onChange={setObservedLanguages}
                  placeholder="Type to search (e.g. Next.js, Django, Redis, Rust)..."
                />
              </div>
            </div>
          )}

          {/* ── STAGE 3: CONTRIBUTION COMPLEXITY ── */}
          {step === 3 && (
            <div className="rounded-lg border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Difficulty Gate</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  Contribution Complexity
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Choose the issue depth and technical readiness level you want StackAudit to prioritize.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {COMPLEXITY_TIERS.map((tier) => {
                  const isSelected = preferredComplexity === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setPreferredComplexity(tier.id)}
                      className={cn(
                        "p-4 rounded-md border text-left transition-all flex items-start justify-between gap-4 cursor-pointer",
                        isSelected
                          ? "border-foreground bg-muted/50 text-foreground ring-1 ring-foreground/20 shadow-xs"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-semibold tracking-tight text-foreground">
                            {tier.label}
                          </span>
                          <span className={cn(
                            "text-[10px] font-mono px-2 py-0.5 rounded",
                            isSelected ? "bg-foreground/15 text-foreground font-medium" : "bg-muted/50 text-muted-foreground"
                          )}>
                            {tier.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {tier.description}
                        </p>
                      </div>

                      <div className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        isSelected ? "border-foreground bg-foreground text-background" : "border-muted-foreground/40"
                      )}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STAGE 4: FOCUS AREAS & TYPES ── */}
          {step === 4 && (
            <div className="rounded-lg border border-border/60 bg-card/40 p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  <span>Scope Filters</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  Focus Areas & Contribution Types
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Select your architectural subsystem domain and the types of open-source tasks you are interested in tackling.
                </p>
              </div>

              {/* Subsystem Domain */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-muted-foreground/80 block">
                  Primary Subsystem Domain:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PREFERRED_AREAS.map((area) => {
                    const isSelected = preferredArea === area;
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setPreferredArea(area)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-md font-medium transition-colors border cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                            : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contribution Types */}
              <div className="space-y-2 pt-3 border-t border-border/40">
                <span className="text-[11px] font-medium text-muted-foreground/80 block">
                  Preferred Contribution Types:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CONTRIBUTION_TYPES.map((type) => {
                    const isSelected = preferredContributionTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleContributionType(type)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-md font-medium transition-colors inline-flex items-center gap-1.5 border cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                            : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── ERROR NOTICE ── */}
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── STAGE NAVIGATION CONTROLS ── */}
        <div className="pt-8 flex items-center justify-between gap-4 border-t border-border/60 mt-8">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="h-9 px-4 inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/20 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-[11px] text-muted-foreground font-mono">
                Step 1 of 4
              </span>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="h-9 px-5 inline-flex items-center gap-2 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || observedLanguages.length === 0}
                className="h-9 px-6 inline-flex items-center gap-2 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Initializing Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Workspace & Discover Issues</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
