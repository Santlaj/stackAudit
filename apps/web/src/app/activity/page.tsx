"use client";

import React, { useEffect, useState } from "react";
import { Shell } from "@/components/layout/shell";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Activity, Clock, Calendar, CheckCircle2, Info, Loader2 } from "lucide-react";
import { DailyActivityRecord, fetchDailyActivity } from "@/lib/api";
import { formatActiveDuration, formatTotalActiveTime, getActivityLevel } from "@/lib/activity-utils";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const [records, setRecords] = useState<DailyActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ dateStr: string; label: string; seconds: number | null } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadActivity(showLoading = false) {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const data = await fetchDailyActivity(365);
        if (!mounted) return;
        setRecords(data || []);
      } catch {
        if (!mounted) return;
        setRecords([]);
      } finally {
        if (mounted && showLoading) {
          setLoading(false);
        }
      }
    }

    loadActivity(true);

    const handleActivityUpdate = () => {
      loadActivity(false);
    };

    window.addEventListener("stackaudit:activity-updated", handleActivityUpdate);
    const interval = setInterval(() => loadActivity(false), 30_000);

    return () => {
      mounted = false;
      window.removeEventListener("stackaudit:activity-updated", handleActivityUpdate);
      clearInterval(interval);
    };
  }, []);

  // Map of dateStr -> activeSeconds
  const activityMap = new Map<string, number>();
  let totalActiveSeconds = 0;
  let maxActiveSeconds = 0;
  let activeDaysCount = 0;

  for (const r of records) {
    activityMap.set(r.date, r.activeSeconds);
    if (r.activeSeconds > 0) {
      totalActiveSeconds += r.activeSeconds;
      activeDaysCount++;
      if (r.activeSeconds > maxActiveSeconds) {
        maxActiveSeconds = r.activeSeconds;
      }
    }
  }

  // Generate 52 weeks (364/365 days) aligned by day of week ending today (canonical UTC)
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  
  // End on Saturday of the current week (or today)
  const days: { dateStr: string; label: string; dayOfWeek: number; month: string }[] = [];
  const TOTAL_DAYS = 52 * 7; // 364 days

  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate() - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    days.push({
      dateStr,
      label,
      dayOfWeek: d.getUTCDay(), // 0 = Sun, 1 = Mon, ...
      month,
    });
  }

  // Group into weeks (columns) of 7 days
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Cell colors based on activity level
  const getCellBg = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-950/90 dark:bg-emerald-950 border-emerald-900/60";
      case 2:
        return "bg-emerald-800 dark:bg-emerald-800 border-emerald-700/60";
      case 3:
        return "bg-emerald-600 dark:bg-emerald-600 border-emerald-500/60";
      case 4:
        return "bg-emerald-400 dark:bg-emerald-400 border-emerald-300/80";
      default:
        return "bg-secondary/30 dark:bg-secondary/20 border-border/40 hover:border-border";
    }
  };

  return (
    <ProtectedRoute>
      <Shell>
        <PageContainer>
          <PageHeader
            title="Active Time & Contributions"
            description="Truthful daily active engagement time on StackAudit over the last 12 months."
          />

          {/* Top Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground font-mono">
                  {formatTotalActiveTime(totalActiveSeconds)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Active Time (12M)</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground font-mono">
                  {activeDaysCount}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Active Days Measured</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground font-mono">
                  {maxActiveSeconds > 0 ? formatTotalActiveTime(maxActiveSeconds) : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Peak Day Active Time</p>
              </div>
            </div>
          </div>

          {/* 12-Month Calendar Heatmap Card */}
          <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 md:p-8 space-y-6 shadow-xs">
            {/* Header with Tooltip Callout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    12-Month Activity Heatmap
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hover any day to inspect measured active time. Unmeasured days display &quot;No activity data&quot;.
                </p>
              </div>

              {/* Dynamic Day Tooltip Callout Box */}
              <div className="min-h-[44px] min-w-[150px] rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5 text-right flex flex-col justify-center shrink-0">
                {hoveredCell ? (
                  <>
                    <span className="text-[10px] text-muted-foreground font-mono leading-none">
                      {hoveredCell.label}
                    </span>
                    <span className={cn(
                      "text-xs font-semibold font-mono mt-0.5 leading-tight",
                      hoveredCell.seconds !== null ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground"
                    )}>
                      {formatActiveDuration(hoveredCell.seconds) || "No activity data"}
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground/70 font-mono">
                    Hover a day
                  </span>
                )}
              </div>
            </div>

            {/* Heatmap Grid */}
            {loading ? (
              <div className="py-20 flex items-center justify-center text-xs text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading 12-month activity data...
              </div>
            ) : error ? (
              <div className="py-12 text-center text-xs text-destructive">
                Failed to load activity: {error}
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="inline-block min-w-full">
                  {/* Month header labels */}
                  <div className="flex pl-8 mb-1.5 text-[11px] font-mono text-muted-foreground">
                    {weeks.map((week, idx) => {
                      const firstDay = week[0];
                      // Show month label when month changes or on week 0
                      const isMonthStart = idx === 0 || week.some(d => d.dateStr.endsWith("-01"));
                      return (
                        <div key={idx} className="w-[15px] mr-[3px] text-left shrink-0">
                          {isMonthStart ? (
                            <span className="truncate">{firstDay.month}</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Days Matrix */}
                  <div className="flex items-start">
                    {/* Weekday indicators */}
                    <div className="flex flex-col justify-between pr-2 text-[10px] font-mono text-muted-foreground/80 h-[126px] py-1 select-none">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>

                    {/* 52 Week Columns */}
                    <div className="flex gap-[3px]">
                      {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-[3px]">
                          {week.map((day) => {
                            const seconds = activityMap.has(day.dateStr) 
                              ? activityMap.get(day.dateStr)! 
                              : null;
                            const level = getActivityLevel(seconds);

                            return (
                              <div
                                key={day.dateStr}
                                onMouseEnter={() => setHoveredCell({ dateStr: day.dateStr, label: day.label, seconds })}
                                onMouseLeave={() => setHoveredCell(null)}
                                className={cn(
                                  "w-[14px] h-[14px] rounded-[2px] border transition-all duration-150 cursor-pointer",
                                  getCellBg(level),
                                  hoveredCell?.dateStr === day.dateStr && "ring-2 ring-foreground/60 scale-125 z-10"
                                )}
                                aria-label={`${day.label}: ${formatActiveDuration(seconds) || "No activity data"}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer with Legend and Explanatory Link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-border/40 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                <span>
                  Active time requires active tab visibility and window focus. Background time is excluded.
                </span>
              </div>

              {/* Intensity Scale Legend */}
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-[2px] bg-secondary/30 border border-border/40" title="No activity data" />
                  <div className="w-3 h-3 rounded-[2px] bg-emerald-950 border border-emerald-900/60" title="< 15m active" />
                  <div className="w-3 h-3 rounded-[2px] bg-emerald-800 border border-emerald-700/60" title="15m – 45m active" />
                  <div className="w-3 h-3 rounded-[2px] bg-emerald-600 border border-emerald-500/60" title="45m – 90m active" />
                  <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300/80" title="90m+ active" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </PageContainer>
      </Shell>
    </ProtectedRoute>
  );
}
