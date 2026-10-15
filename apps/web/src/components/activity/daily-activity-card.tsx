"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Calendar, Info, Loader2, Clock, Flame } from "lucide-react";
import { DailyActivityRecord, fetchDailyActivity } from "@/lib/api";
import { formatActiveDuration, formatTotalActiveTime, getActivityLevel } from "@/lib/activity-utils";
import { cn } from "@/lib/utils";

interface DailyActivityCardProps {
  className?: string;
}

interface DayCell {
  dayNumber: number;
  dateStr: string;
  label: string;
  dayOfWeek: number;
  isFuture: boolean;
}

interface MonthData {
  monthName: string;
  year: number;
  monthIndex: number;
  daysInMonth: number;
  weeks: (DayCell | null)[][];
}

export function DailyActivityCard({ className }: DailyActivityCardProps) {
  const [activityMap, setActivityMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ dateStr: string; label: string; seconds: number | null } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadActivity(showLoading = false) {
      try {
        if (showLoading) setLoading(true);
        // Fetch full 1-year (365 days) activity data
        const data = await fetchDailyActivity(365);
        if (!mounted) return;
        const map = new Map<string, number>();
        for (const item of data) {
          map.set(item.date, item.activeSeconds);
        }
        setActivityMap(map);
      } catch {
        // Fallback to empty map if unmeasured or unavailable
      } finally {
        if (mounted && showLoading) {
          setLoading(false);
        }
      }
    }

    loadActivity(true);

    // Live update when a heartbeat successfully increments active time
    const handleActivityUpdate = () => {
      loadActivity(false);
    };

    window.addEventListener("stackaudit:activity-updated", handleActivityUpdate);
    // Fallback refresh every 5 minutes (primary updates are event-driven via stackaudit:activity-updated)
    const interval = setInterval(() => loadActivity(false), 300_000);

    return () => {
      mounted = false;
      window.removeEventListener("stackaudit:activity-updated", handleActivityUpdate);
      clearInterval(interval);
    };
  }, []);

  // Compute 1-year metrics
  let totalActiveSeconds = 0;
  let maxActiveSeconds = 0;
  let activeDaysCount = 0;

  activityMap.forEach((sec) => {
    if (sec > 0) {
      totalActiveSeconds += sec;
      activeDaysCount++;
      if (sec > maxActiveSeconds) {
        maxActiveSeconds = sec;
      }
    }
  });

  // Dynamically compute the 12 calendar months with year-accurate days & leap year handling
  const monthsData = useMemo<MonthData[]>(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const months: MonthData[] = [];

    // Rolling 12 months: from 11 months ago up to current month (index 0)
    for (let offset = 11; offset >= 0; offset--) {
      const targetDate = new Date(currentYear, currentMonth - offset, 1);
      const year = targetDate.getFullYear();
      const monthIndex = targetDate.getMonth();
      const monthName = targetDate.toLocaleDateString("en-US", { month: "short" });

      // Dynamically get exact number of days for this specific month and year (handles leap years 28/29, 30, 31)
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      // First day of week for the 1st of the month (0 = Sun, 1 = Mon, ..., 6 = Sat)
      const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();

      const weeks: (DayCell | null)[][] = [];
      let currentWeek: (DayCell | null)[] = [];

      // Pre-pad with null for slots before the 1st day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }

      // Populate actual days for this month
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthIndex, day);
        const yStr = String(year);
        const mStr = String(monthIndex + 1).padStart(2, "0");
        const dStr = String(day).padStart(2, "0");
        const dateStr = `${yStr}-${mStr}-${dStr}`;

        const label = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        // Flag future days if in current month beyond today
        const isFuture = d > today;

        currentWeek.push({
          dayNumber: day,
          dateStr,
          label,
          dayOfWeek: d.getDay(),
          isFuture,
        });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      // Post-pad with null to complete the last column of 7 rows
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }

      months.push({
        monthName,
        year,
        monthIndex,
        daysInMonth,
        weeks,
      });
    }

    return months;
  }, []);

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
        return "bg-secondary/40 dark:bg-secondary/30 border-border/40 hover:border-border";
    }
  };

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-5", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Daily Activity
            </h3>
            <div className="group relative cursor-help">
              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-56 rounded-md bg-popover border border-border p-2 text-xs text-popover-foreground shadow-md group-hover:block z-30 leading-relaxed">
                Active time is measured strictly during focused engagement with StackAudit. Background tabs and idle intervals are excluded.
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your active engagement time on StackAudit over the last 12 months.
          </p>
        </div>

        {/* Right side: Key Summary Badges (Clean, unified typography) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/60" title="Total active time measured over 12 months">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-foreground font-semibold">
              {formatTotalActiveTime(totalActiveSeconds)}
            </span>
            <span className="text-muted-foreground">total</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/60" title="Days with recorded active time">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-foreground font-semibold">{activeDaysCount}</span>
            <span className="text-muted-foreground">active days</span>
          </div>
        </div>
      </div>

      {/* 12-Month Calendar Grid */}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-xs text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading 1-year activity data...
        </div>
      ) : (
        <div className="w-full">
          <div className="flex items-start justify-between w-full">
            {monthsData.map((m, mIdx) => (
              <div key={`${m.year}-${m.monthIndex}`} className="flex flex-col items-center">
                {/* Clean Month Label Header directly above its own columns */}
                <div className="h-[18px] mb-1.5 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-medium">
                    {m.monthName}
                  </span>
                </div>

                {/* Month's Week Columns */}
                <div className="flex gap-[2px]">
                  {m.weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[2px]">
                      {week.map((day, dIdx) => {
                        if (!day) {
                          // Transparent empty slot for alignment before day 1 or after last day
                          return (
                            <div
                              key={`pad-${dIdx}`}
                              className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] lg:w-[12px] lg:h-[12px] bg-transparent"
                            />
                          );
                        }

                        if (day.isFuture) {
                          // Subtle disabled cell for future days beyond today in current month
                          return (
                            <div
                              key={day.dateStr}
                              className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] lg:w-[12px] lg:h-[12px] rounded-[2px] border border-border/20 bg-secondary/10 opacity-30 cursor-default"
                              title={`${day.label} (Future)`}
                            />
                          );
                        }

                        const seconds = activityMap.has(day.dateStr) 
                          ? activityMap.get(day.dateStr)! 
                          : null;
                        const level = getActivityLevel(seconds);
                        const isHovered = hoveredCell?.dateStr === day.dateStr;

                        return (
                          <div
                            key={day.dateStr}
                            className="relative"
                            onMouseEnter={() => setHoveredCell({ dateStr: day.dateStr, label: day.label, seconds })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div
                              className={cn(
                                "w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] lg:w-[12px] lg:h-[12px] rounded-[2px] border transition-all duration-150 cursor-pointer",
                                getCellBg(level),
                                isHovered && "ring-2 ring-foreground/60 scale-125 z-20"
                              )}
                              aria-label={`${day.label}: ${formatActiveDuration(seconds) || "No activity data"}`}
                            />

                            {/* Floating Tooltip anchored directly above the hovered square - unified standard font & text */}
                            {isHovered && (
                              <div
                                className={cn(
                                  "pointer-events-none absolute bottom-full mb-2 z-50 whitespace-nowrap",
                                  "rounded-md border border-border bg-popover px-2.5 py-1.5 text-center shadow-md",
                                  "animate-in fade-in-0 zoom-in-95 duration-100",
                                  mIdx === 0 
                                    ? "left-0" 
                                    : mIdx >= monthsData.length - 2 
                                      ? "right-0" 
                                      : "left-1/2 -translate-x-1/2"
                                )}
                              >
                                <div className="text-xs font-medium text-foreground leading-tight">
                                  {formatActiveDuration(seconds) || "No activity data"}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                                  {day.label}
                                </div>

                                {/* Downward Arrow Caret pointing directly to the tile */}
                                <div
                                  className={cn(
                                    "absolute top-full -mt-[1px] h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-popover",
                                    mIdx === 0 
                                      ? "left-1.5" 
                                      : mIdx >= monthsData.length - 2 
                                        ? "right-1.5" 
                                        : "left-1/2 -translate-x-1/2"
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with Legend and Explanatory Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
          <span className="text-xs leading-relaxed">
            Active time requires active tab visibility and window focus. Background intervals are excluded.
          </span>
        </div>

        {/* Intensity Scale Legend */}
        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground self-end sm:self-auto">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-[2px] bg-secondary/40 border border-border/40" title="No activity data" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-950 border border-emerald-900/60" title="< 15m active" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-800 border border-emerald-700/60" title="15m – 45m active" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-600 border border-emerald-500/60" title="45m – 90m active" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300/80" title="90m+ active" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
