"use client";

import React, { useState } from "react";
import { TechnologySelector } from "./technology-selector";
import { ContributionTypeSelector } from "./contribution-type-selector";
import { ComplexitySelector } from "./complexity-selector";
import { Loader2, AlertCircle, Code2, Compass, SlidersHorizontal, Layers } from "lucide-react";
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

const PREFERRED_AREAS = [
  "Any",
  "Frontend",
  "Backend",
  "Full Stack",
  "Systems",
  "DevOps",
];

export type ProfileSection = "all" | "tech_stack" | "focus" | "preferences";

export interface ProfileFormData {
  observedLanguages: string[];
  currentFocus: string[];
  learningGoals: string[];
  preferredContributionTypes: string[];
  preferredComplexity: string;
  preferredArea?: string;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  initialSection?: ProfileSection;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ProfileForm({ 
  initialData, 
  initialSection = "all",
  onSubmit, 
  onCancel,
  isSubmitting = false,
  submitLabel = "Save Changes" 
}: ProfileFormProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection>(initialSection);
  const [formData, setFormData] = useState<ProfileFormData>({
    observedLanguages: initialData?.observedLanguages || [],
    currentFocus: initialData?.currentFocus || [],
    learningGoals: initialData?.learningGoals || [],
    preferredContributionTypes: initialData?.preferredContributionTypes || [],
    preferredComplexity: initialData?.preferredComplexity || "Intermediate",
    preferredArea: initialData?.preferredArea || "Any",
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

  const SECTIONS: { id: ProfileSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "all", label: "All Settings", icon: Layers },
    { id: "tech_stack", label: "Tech Stack", icon: Code2 },
    { id: "focus", label: "Focus & Learning", icon: Compass },
    { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Navigation tabs for sections */}
      <div className="flex items-center gap-1 border-b border-border pb-2 overflow-x-auto">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0",
                isActive 
                  ? "bg-secondary text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {/* 1. TECH STACK (observedLanguages) */}
        {(activeSection === "all" || activeSection === "tech_stack") && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Tech Stack & Known Languages
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                The primary programming languages, frameworks, and tools you have experience with.
              </p>
            </div>
            <TechnologySelector 
              selected={formData.observedLanguages}
              placeholder="Search or type a language (e.g. TypeScript, Python, C++)..."
              onChange={(val) => setFormData({ ...formData, observedLanguages: val })}
            />
          </div>
        )}

        {/* 2. FOCUS & LEARNING */}
        {(activeSection === "all" || activeSection === "focus") && (
          <div className={cn(
            "space-y-5",
            activeSection === "all" && "pt-6 border-t border-border/40"
          )}>
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Focus & Learning Goals
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Specify what you are currently practicing or want to level up in.
              </p>
            </div>

            {/* Current Focus */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Current Focus</p>
              <p className="text-[11px] text-muted-foreground">
                Technologies you want to actively target right now.
              </p>
              <TechnologySelector 
                selected={formData.currentFocus}
                placeholder="What technologies are you actively focusing on?"
                onChange={(val) => setFormData({ ...formData, currentFocus: val })}
              />
            </div>

            {/* Learning Goals */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Learning Goals</p>
              <p className="text-[11px] text-muted-foreground">
                Concepts you wish to explore through open-source contributions.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {LEARNING_GOALS.map((goal) => {
                  const isSelected = formData.learningGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleLearningGoal(goal)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded-sm font-medium transition-colors border cursor-pointer",
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
          </div>
        )}

        {/* 3. CONTRIBUTION PREFERENCES */}
        {(activeSection === "all" || activeSection === "preferences") && (
          <div className={cn(
            "space-y-5",
            activeSection === "all" && "pt-6 border-t border-border/40"
          )}>
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Contribution Preferences
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define the types and complexity of issues StackAudit recommends for you.
              </p>
            </div>

            {/* Primary Area */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Primary Area</p>
              <div className="flex flex-wrap gap-1.5">
                {PREFERRED_AREAS.map((area) => {
                  const isSelected = (formData.preferredArea || "Any") === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredArea: area })}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-sm border transition-all cursor-pointer",
                        isSelected 
                          ? "bg-secondary text-foreground border-border font-semibold"
                          : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complexity */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Target Complexity</p>
              <ComplexitySelector 
                selected={formData.preferredComplexity}
                onChange={(val) => setFormData({ ...formData, preferredComplexity: val })}
              />
            </div>

            {/* Contribution Types */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Preferred Contribution Types</p>
              <ContributionTypeSelector 
                selected={formData.preferredContributionTypes}
                onChange={(val) => setFormData({ ...formData, preferredContributionTypes: val })}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-sm p-3 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 font-medium px-4 py-2 text-xs rounded-sm transition-colors disabled:opacity-50 min-w-[120px] cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}
