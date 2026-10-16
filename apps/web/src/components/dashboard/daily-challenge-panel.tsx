"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  DailyChallenge, 
  ChallengeHistory, 
  ContributionProgress as ProgressData,
  replaceDailyChallenge,
  completeDailyChallenge 
} from "@/lib/api";
import { DailyCalendar } from "./daily-calendar";
import { ContributionProgress } from "./contribution-progress";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, 
  Flame, 
  RotateCw, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Circle,
  Check, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

export interface DailyChallengePanelProps {
  challenge: DailyChallenge | null;
  history: ChallengeHistory | null;
  progress: ProgressData | null;
  onChallengeUpdated: (updated: DailyChallenge) => void;
  onHistoryUpdated: (updated: ChallengeHistory) => void;
  loadingChallenge: boolean;
  className?: string;
}

export function DailyChallengePanel({
  challenge,
  history,
  progress,
  onChallengeUpdated,
  onHistoryUpdated,
  loadingChallenge,
  className,
}: DailyChallengePanelProps) {
  const router = useRouter();

  // Investigation checklist state
  const [understood, setUnderstood] = React.useState(false);
  const [identified, setIdentified] = React.useState(false);
  const [planned, setPlanned] = React.useState(false);

  const [isCompleting, setIsCompleting] = React.useState(false);
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [completeError, setCompleteError] = React.useState<string | null>(null);

  // Calendar month state
  const today = new Date();
  const [currentYear, setCurrentYear] = React.useState(today.getUTCFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(today.getUTCMonth() + 1);

  // Sync checklist if challenge is already completed
  React.useEffect(() => {
    if (challenge?.status === "COMPLETED") {
      setUnderstood(true);
      setIdentified(true);
      setPlanned(true);
    } else {
      setUnderstood(false);
      setIdentified(false);
      setPlanned(false);
    }
  }, [challenge?.id, challenge?.status]);

  const allChecklistItemsConfirmed = understood && identified && planned;
  const isCompleted = challenge?.status === "COMPLETED";

  const handleComplete = async () => {
    if (!challenge || isCompleted || !allChecklistItemsConfirmed) return;
    setIsCompleting(true);
    setCompleteError(null);
    try {
      const res = await completeDailyChallenge({
        understoodProblem: understood,
        identifiedFiles: identified,
        nextStepsPlanned: planned,
      });
      onChallengeUpdated(res);

      // Optimistically increment streak & record completion
      if (history) {
        const todayStr = new Date().toISOString().slice(0, 10);
        onHistoryUpdated({
          ...history,
          streak: history.hasCompletedToday ? history.streak : history.streak + 1,
          totalCompleted: history.totalCompleted + 1,
          hasCompletedToday: true,
          calendar: {
            ...history.calendar,
            [todayStr]: {
              completed: true,
              completedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (err: any) {
      setCompleteError(err.message || "Failed to complete challenge");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReplace = async () => {
    if (isCompleted || isReplacing) return;
    setIsReplacing(true);
    try {
      const res = await replaceDailyChallenge();
      onChallengeUpdated(res);
    } catch (err) {
      console.error("Failed to replace challenge", err);
    } finally {
      setIsReplacing(false);
    }
  };

  const streak = history?.streak || 0;

  return (
    <aside 
      className={cn(
        "w-full lg:w-[320px] shrink-0 space-y-4 text-foreground text-xs",
        className
      )}
    >
      {/* 1. DAILY CONTRIBUTION CHALLENGE CARD */}
      <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-3 relative shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            <span>Daily Challenge</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase font-medium">
            {challenge?.challengeDate || new Date().toISOString().slice(0, 10)}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          One real issue to explore today.
        </p>

        {loadingChallenge ? (
          <div className="py-8 text-center text-muted-foreground space-y-2">
            <RotateCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
            <p className="text-[11px]">Finding suitable challenge...</p>
          </div>
        ) : !challenge ? (
          <div className="py-6 text-center text-muted-foreground space-y-1">
            <AlertCircle className="w-4 h-4 mx-auto text-amber-500" />
            <p className="font-medium text-foreground">No challenge available</p>
            <p className="text-[10px]">Sync your profile or repositories to find daily challenges.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Issue snippet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-muted-foreground truncate">
                  {challenge.issue.repository}
                </span>
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider",
                  isCompleted 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? "Completed" : "Open"}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                #{challenge.issue.issueNumber} {challenge.issue.title}
              </h4>

              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-foreground/80 capitalize font-medium">
                  {challenge.issue.difficulty}
                </span>
                {challenge.issue.technologies.slice(0, 2).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                    {t}
                  </span>
                ))}
                {challenge.issue.estimatedMinutes && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ~{challenge.issue.estimatedMinutes}m
                  </span>
                )}
              </div>
            </div>

            {/* Why it matches */}
            {challenge.issue.reasons && challenge.issue.reasons.length > 0 && (
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground/90 block mb-0.5">Why it matches:</span>
                <span>{challenge.issue.reasons[0]}</span>
              </div>
            )}

            {/* Actions: Explore in Workspace */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => router.push(`/analyze/${challenge.matchId}`)}
                className="flex-1 h-7.5 text-xs font-medium rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors inline-flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>Explore in Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {!isCompleted && (
                <button
                  type="button"
                  onClick={handleReplace}
                  disabled={isReplacing}
                  className="h-7.5 px-2.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors inline-flex items-center gap-1"
                  title="View another eligible challenge"
                  aria-label="View another challenge"
                >
                  <RotateCw className={cn("w-3 h-3", isReplacing && "animate-spin")} />
                </button>
              )}
            </div>

            {/* INVESTIGATION CHECKLIST */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Investigation Checklist
              </span>

              <div className="space-y-1.5">
                <label className="flex items-start gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    disabled={isCompleted}
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="mt-0.5 rounded border-border text-primary focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className={cn(
                    "text-[11px] leading-tight transition-colors",
                    understood ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    I understand what the issue is asking for.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    disabled={isCompleted}
                    checked={identified}
                    onChange={(e) => setIdentified(e.target.checked)}
                    className="mt-0.5 rounded border-border text-primary focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className={cn(
                    "text-[11px] leading-tight transition-colors",
                    identified ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    I identified the relevant files or code area.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    disabled={isCompleted}
                    checked={planned}
                    onChange={(e) => setPlanned(e.target.checked)}
                    className="mt-0.5 rounded border-border text-primary focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className={cn(
                    "text-[11px] leading-tight transition-colors",
                    planned ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    I know what I would investigate or validate next.
                  </span>
                </label>
              </div>

              {completeError && (
                <p className="text-[10px] text-destructive">{completeError}</p>
              )}

              {/* Complete Challenge Button */}
              {!isCompleted ? (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={!allChecklistItemsConfirmed || isCompleting}
                  className={cn(
                    "w-full h-7.5 text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs mt-1",
                    allChecklistItemsConfirmed
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer font-semibold"
                      : "bg-muted text-muted-foreground cursor-not-allowed border border-border/40"
                  )}
                >
                  {isCompleting ? (
                    <RotateCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  <span>Complete Daily Challenge</span>
                </button>
              ) : (
                <div className="py-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center justify-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Challenge Completed Today</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. CHALLENGE STREAK WIDGET */}
      <div className="border border-border/80 rounded-xl bg-card p-3 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            >
              <Flame className={cn("w-4 h-4", streak > 0 ? "text-amber-500 fill-amber-500/20" : "text-muted-foreground")} />
            </motion.div>
            <span className="font-semibold text-foreground text-xs">
              Challenge Streak
            </span>
          </div>

          {streak > 0 ? (
            <span className="font-mono font-bold text-xs text-foreground">
              {streak} {streak === 1 ? "day" : "days"}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground">0 days</span>
          )}
        </div>

        {streak > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            {history?.hasCompletedToday 
              ? "Completed today! Great consistency." 
              : "Complete today's challenge to keep your streak alive."}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Complete today's challenge to begin your streak.
          </p>
        )}
      </div>

      {/* 3. DAILY COMPLETION CALENDAR */}
      <div className="border border-border/80 rounded-xl bg-card p-3 space-y-2 shadow-xs">
        <DailyCalendar
          history={history}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onMonthChange={(y, m) => {
            setCurrentYear(y);
            setCurrentMonth(m);
          }}
        />
      </div>

      {/* 4. CONTRIBUTION PROGRESS */}
      <div className="border border-border/80 rounded-xl bg-card p-3 shadow-xs">
        <ContributionProgress progress={progress} />
      </div>
    </aside>
  );
}
