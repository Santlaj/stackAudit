"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChallengeHistory } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DailyCalendarProps {
  history: ChallengeHistory | null;
  currentYear: number;
  currentMonth: number; // 1-12
  onMonthChange: (year: number, month: number) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function DailyCalendar({
  history,
  currentYear,
  currentMonth,
  onMonthChange,
  className,
}: DailyCalendarProps) {
  const [hoveredDate, setHoveredDate] = React.useState<string | null>(null);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(currentYear - 1, 12);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(currentYear + 1, 1);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  };

  // Generate calendar days for currentYear and currentMonth
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7; // Monday = 0

  const todayStr = new Date().toISOString().slice(0, 10);

  const days = React.useMemo(() => {
    const list: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isCompleted: boolean;
    }> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      list.push({
        dayNumber: 0,
        dateStr: "",
        isCurrentMonth: false,
        isToday: false,
        isCompleted: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(currentMonth).padStart(2, "0");
      const dayPadded = String(d).padStart(2, "0");
      const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;
      const isCompleted = Boolean(history?.calendar?.[dateStr]?.completed);
      const isToday = dateStr === todayStr;

      list.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday,
        isCompleted,
      });
    }

    return list;
  }, [currentYear, currentMonth, daysInMonth, firstDayOfWeek, history, todayStr]);

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="font-semibold text-foreground tracking-tight">
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w, idx) => (
          <span key={idx} className="text-[10px] font-mono text-muted-foreground">
            {w}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((item, index) => {
          if (!item.isCurrentMonth) {
            return <div key={`empty-${index}`} className="h-6 w-full" />;
          }

          const isHovered = hoveredDate === item.dateStr;

          return (
            <div
              key={item.dateStr}
              onMouseEnter={() => setHoveredDate(item.dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
              className="relative flex items-center justify-center"
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-all cursor-default select-none",
                  item.isCompleted
                    ? "bg-emerald-500 text-white font-bold shadow-xs hover:scale-110"
                    : item.isToday
                    ? "border border-foreground text-foreground font-semibold bg-muted/30"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {item.dayNumber}
              </div>

              {/* Accessible Tooltip */}
              {isHovered && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-50 bg-popover text-foreground border border-border shadow-md rounded-md px-2.5 py-1 text-[10px] whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  <div className="font-semibold">{item.dateStr}</div>
                  <div className="text-muted-foreground">
                    {item.isCompleted
                      ? "✓ Daily Challenge Completed"
                      : item.isToday
                      ? "Today (not completed)"
                      : "No completed challenge"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-foreground" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted" />
          <span>No activity</span>
        </div>
      </div>
    </div>
  );
}
