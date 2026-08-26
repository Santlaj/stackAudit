"use client";

import React, { useState } from "react";
import { TechnologySelector } from "./technology-selector";
import { ContributionTypeSelector } from "./contribution-type-selector";
import { ComplexitySelector } from "./complexity-selector";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const LEARNING_GOALS = [
  "Backend",
  "Frontend",
  "Distributed Systems",
  "Testing",
  "DevOps",
  "Databases",
  "Security",
  "Open Source Practices",
];

export interface ProfileFormData {
  currentFocus: string[];
  learningGoals: string[];
  preferredContributionTypes: string[];
  preferredComplexity: string;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ProfileForm({ 
  initialData, 
  onSubmit, 
  isSubmitting = false,
  submitLabel = "Save Profile" 
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    currentFocus: initialData?.currentFocus || [],
    learningGoals: initialData?.learningGoals || [],
    preferredContributionTypes: initialData?.preferredContributionTypes || [],
    preferredComplexity: initialData?.preferredComplexity || "Intermediate",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    }
  };

  const toggleLearningGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter((g) => g !== goal)
        : [...prev.learningGoals, goal],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Focus Area */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Technical Focus</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select the languages and technologies you want to work with.
          </p>
        </div>
        <TechnologySelector 
          selected={formData.currentFocus}
          onChange={(val) => setFormData({ ...formData, currentFocus: val })}
        />
      </div>

      {/* Contribution Types */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Contribution Interests</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            What kind of issues are you looking for?
          </p>
        </div>
        <ContributionTypeSelector 
          selected={formData.preferredContributionTypes}
          onChange={(val) => setFormData({ ...formData, preferredContributionTypes: val })}
        />
      </div>

      {/* Complexity */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Project Complexity</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            What is your preferred level of repository complexity?
          </p>
        </div>
        <ComplexitySelector 
          selected={formData.preferredComplexity}
          onChange={(val) => setFormData({ ...formData, preferredComplexity: val })}
        />
      </div>

      {/* Learning Goals */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Learning Goals</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            What concepts do you want to learn while contributing?
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LEARNING_GOALS.map((goal) => {
            const isSelected = formData.learningGoals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => toggleLearningGoal(goal)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-sm font-medium transition-colors border",
                  isSelected 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "bg-transparent text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground hover:border-border"
                )}
              >
                {goal}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-sm p-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 font-medium px-5 py-2.5 rounded-sm transition-colors disabled:opacity-50 min-w-[140px]"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}
