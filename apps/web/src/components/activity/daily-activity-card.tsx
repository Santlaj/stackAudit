"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Info, Loader2 } from "lucide-react";
import { DailyActivityRecord, fetchDailyActivity } from "@/lib/api";
import { formatActiveDuration, formatTotalActiveTime, getActivityLevel } from "@/lib/activity-utils";
import { cn } from "@/lib/utils";

interface DailyActivityCardProps {
  className?: string;
}

export function DailyActivityCard({ className }: DailyActivityCardProps) {
  const [activityMap, setActivityMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; seconds: number | null } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadActivity(showLoading = false) {
      try {
        if (showLoading) setLoading(true);
        const data = await fetchDailyActivity(30);
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
    const followUpTimer = setTimeout(() => loadActivity(false), 2_000);
    const interval = setInterval(() => loadActivity(false), 30_000);

    return () => {
      mounted = false;
      window.removeEventListener("stackaudit:activity-updated", handleActivityUpdate);
      clearTimeout(followUpTimer);
      clearInterval(interval);
    };
  }, []);

  // Generate last 30 canonical UTC days up to today
  const days: { dateStr: string; label: string; dateObj: Date }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    days.push({ dateStr, label, dateObj: d });
  }

  // Calculate total active seconds this month / last 30 days
  let totalSeconds = 0;
  activityMap.forEach((sec) => {
    totalSeconds += sec;
  });

  // Cell colors based on activity level
  const getCellBg = (level: number) => {
    switch (level) {
      case 1:
        return "bg-emerald-950 border-emerald-900/60";
      case 2:
        return "bg-emerald-800 border-emerald-700/60";
      case 3:
        return "bg-emerald-600 border-emerald-500/60";
      case 4:
        return "bg-emerald-400 border-emerald-300/80";
      default:
        return "bg-secondary/40 border-border/40 hover:border-border";
    }
  };

  // Month labels for columns
  const firstMonth = days[0].dateObj.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const midMonth = days[15].dateObj.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 shadow-xs space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Daily Activity
            </h3>
            <div className="group relative cursor-help">
              <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground" />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-52 rounded-md bg-popover border border-border p-2 text-[11px] text-popover-foreground shadow-md group-hover:block z-30">
                Active time is measured strictly during focused engagement with StackAudit. Background tabs and idle intervals are excluded.
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Your active time on StackAudit (last 30 days)
          </p>
        </div>

        {/* Dynamic Tooltip Callout */}
        <div className="min-h-[44px] min-w-[130px] rounded-lg border border-border/60 bg-secondary/30 px-3 py-1.5 text-right flex flex-col justify-center">
          {hoveredDay ? (
            <>
              <span className="text-[10px] text-muted-foreground font-mono leading-none">
                {hoveredDay.date}
              </span>
              <span className={cn(
                "text-xs font-semibold font-mono mt-0.5 leading-tight",
                hoveredDay.seconds !== null ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground"
              )}>
                {formatActiveDuration(hoveredDay.seconds) || "No activity data"}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground/70 font-mono">
              Hover a day
            </span>
          )}
        </div>
      </div>

      {/* Mini 30-day Grid */}
      {loading ? (
        <div className="py-8 flex items-center justify-center text-xs text-muted-foreground gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading activity...
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {/* Month labels */}
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
            <span>{firstMonth}</span>
            <span>{midMonth !== firstMonth ? midMonth : ""}</span>
            <span>Today</span>
          </div>

          {/* Days strip: 3 rows of 10 cells */}
          <div className="grid grid-flow-col grid-rows-3 gap-1.5 overflow-x-auto py-1">
            {days.map((day) => {
              const seconds = activityMap.has(day.dateStr) ? activityMap.get(day.dateStr)! : null;
              const level = getActivityLevel(seconds);

              return (
                <div
                  key={day.dateStr}
                  onMouseEnter={() => setHoveredDay({ date: day.label, seconds })}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={cn(
                    "w-5 h-5 rounded-[4px] border transition-all duration-150 cursor-pointer",
                    getCellBg(level),
                    hoveredDay?.date === day.label && "ring-2 ring-foreground/40 scale-110 z-10"
                  )}
                  aria-label={`${day.label}: ${formatActiveDuration(seconds) || "No activity data"}`}
                />
              );
            })}
          </div>

          {/* Footer: Legend & Total */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
            {/* Legend */}
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-[2px] bg-secondary/40 border border-border/40" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-900/60" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800 border border-emerald-700/60" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-500/60" />
                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300/80" />
              </div>
              <span>More</span>
            </div>

            {/* Total */}
            <div className="font-mono text-xs">
              <span className="text-muted-foreground">Total this month: </span>
              <span className="font-semibold text-foreground">{formatTotalActiveTime(totalSeconds)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
