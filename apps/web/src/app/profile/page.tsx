"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Shell } from "@/components/layout/shell";
import { useSession, listAccounts, linkSocial } from "@/lib/auth-client";
import { fetchProfile, DeveloperProfile } from "@/lib/api";
import { ProfileForm } from "@/components/profile/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Loader2, Mail, CheckCircle2, Award, GitPullRequest, Settings2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [linkingGithub, setLinkingGithub] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id)
        .catch(async () => {
          const { ingestProfile } = await import("@/lib/api");
          return await ingestProfile();
        })
        .then(p => setProfile(p))
        .catch(e => console.error("Profile not found or error:", e))
        .finally(() => setLoadingProfile(false));
      
      listAccounts()
        .then(res => setAccounts(res.data || []))
        .catch(e => console.error("Accounts error:", e))
        .finally(() => setLoadingAccounts(false));
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

  return (
    <ProtectedRoute>
      <Shell>
        <div className="container max-w-4xl py-12 px-4 md:px-8 space-y-12">
          
          {/* PROFILE HEADER */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-8 border-b border-border/50">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border border-border">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="text-xl bg-secondary text-secondary-foreground font-semibold">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{session?.user?.name}</h1>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                {profile?.githubBio && (
                  <p className="text-sm text-foreground/80 max-w-md mt-2">{profile.githubBio}</p>
                )}
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Github className="w-3.5 h-3.5 text-muted-foreground" />
                    {hasGithub ? <span className="text-foreground">Connected</span> : (
                      <button onClick={handleConnectGithub} disabled={linkingGithub} className="text-emerald-600 hover:underline">
                        {linkingGithub ? "Connecting..." : "Connect GitHub"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className={hasGoogle ? "text-foreground" : "text-muted-foreground"}>
                      {hasGoogle ? "Connected" : "Not connected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2 shrink-0">
              <Settings2 className="w-4 h-4" />
              {isEditing ? "Cancel Editing" : (profile ? "Edit Profile" : "Setup Profile")}
            </Button>
          </div>

          {loadingProfile ? (
            <div className="flex items-center gap-3 text-muted-foreground text-sm py-12 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your developer context...
            </div>
          ) : isEditing ? (
            <div className="max-w-2xl">
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              
              {/* LEFT COLUMN: Context & Preferences */}
              <div className="md:col-span-7 space-y-10">
                
                {/* STACK */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.observedLanguages && profile.observedLanguages.length > 0 ? (
                      profile.observedLanguages.map((lang: string) => (
                        <Badge key={lang} variant="secondary" className="rounded-sm font-normal">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No languages detected.</span>
                    )}
                  </div>
                </section>

                {/* FOCUS */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Focus & Learning</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Current Focus</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.currentFocus && profile.currentFocus.length > 0 ? (
                          profile.currentFocus.map((focus: string) => (
                            <Badge key={focus} variant="outline" className="rounded-sm font-normal border-border/60">
                              {focus}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Learning Goals</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.learningGoals && profile.learningGoals.length > 0 ? (
                          profile.learningGoals.map((goal: string) => (
                            <Badge key={goal} variant="outline" className="rounded-sm font-normal border-border/60">
                              {goal}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* CONTRIBUTION PREFERENCES */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contribution Preferences</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Complexity</p>
                      <p className="text-sm font-medium">{profile?.preferredComplexity || "Any"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Primary Area</p>
                      <p className="text-sm font-medium">{profile?.preferredArea || "Any"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-2">Preferred Contribution Types</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.preferredContributionTypes && profile.preferredContributionTypes.length > 0 ? (
                          profile.preferredContributionTypes.map((type: string) => (
                            <Badge key={type} variant="secondary" className="bg-secondary/40 rounded-sm font-normal">
                              {type}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Any</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
                
              </div>

              {/* RIGHT COLUMN: History & Achievements */}
              <div className="md:col-span-5 space-y-10">
                
                {/* CONTRIBUTION HISTORY */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Contribution History</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-border/60 p-4 rounded-sm flex flex-col items-start justify-center">
                      <p className="text-2xl font-semibold tracking-tight">{profile?.totalContributions || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Contributions</p>
                    </div>
                    <div className="border border-border/60 p-4 rounded-sm flex flex-col items-start justify-center">
                      <p className="text-2xl font-semibold tracking-tight">{profile?.publicRepoCount || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Public Repositories</p>
                    </div>
                  </div>
                </section>

                {/* ACTIVITY (Empty State) */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Recent Activity</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground py-2">
                    <GitPullRequest className="w-4 h-4 opacity-50" />
                    <span>No recent activity tracked yet.</span>
                  </div>
                </section>

                {/* ACHIEVEMENTS (Empty State) */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Achievements</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground py-2">
                    <Award className="w-4 h-4 opacity-50" />
                    <span>No achievements unlocked yet.</span>
                  </div>
                </section>

              </div>
            </div>
          )}
          
        </div>
      </Shell>
    </ProtectedRoute>
  );
}
