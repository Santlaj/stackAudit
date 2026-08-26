"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { fetchProfile, updateProfile, DeveloperProfile } from "@/lib/api";
import { ProfileForm, ProfileFormData } from "@/components/profile/profile-form";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/protected-route";

export default function OnboardingProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id)
        .then(setProfile)
        .catch((e) => {
          console.error("Profile not found or error:", e);
          // It's okay if profile doesn't exist yet, we will create/update it.
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      if (!session?.user?.id) throw new Error("No user session");
      await updateProfile(session.user.id, data);
      router.push("/discovery");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {/* Simple Topbar for Onboarding */}
        <header className="flex h-14 shrink-0 items-center border-b border-border bg-card px-6">
          <span className="font-semibold tracking-tight">StackAudit</span>
        </header>

        <main className="max-w-3xl mx-auto py-12 px-6">
          <div className="mb-10">
            <h1 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Set up your contributor profile
            </h1>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Configure what you work with and what you want to contribute to.
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              We use this information to match you with the right open-source issues.
            </p>
          </div>

          <div className="bg-card border border-border rounded-md shadow-sm p-6 md:p-8">
            <ProfileForm 
              initialData={profile || undefined} 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
              submitLabel="Continue →" 
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
