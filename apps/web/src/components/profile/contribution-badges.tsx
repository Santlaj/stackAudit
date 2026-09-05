"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Trophy, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Check
} from "lucide-react";
import { BadgeDto, fetchBadges } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContributionBadgeArtwork } from "./badge-artwork";

// Milestone badges that display progress bars when locked
const MILESTONE_BADGES = new Set([
  "CONTRIBUTOR_5",
  "CONTRIBUTOR_10",
  "ISSUE_EXPLORER",
  "REPOSITORY_EXPLORER",
  "MULTI_STACK",
  "REPOSITORY_CONTRIBUTOR"
]);

export function ContributionBadges() {
  const [badges, setBadges] = React.useState<BadgeDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadBadges() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBadges();
        setBadges(data || []);
      } catch (err: any) {
        console.error("Failed to load badges", err);
        setError(err.message || "Failed to load contribution badges");
      } finally {
        setLoading(false);
      }
    }
    loadBadges();
  }, []);

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length || 9;

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 p-12 flex flex-col items-center justify-center min-h-[360px] text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground/50 mb-3" />
        <p className="text-xs text-muted-foreground">Evaluating contribution badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 p-6 flex items-start gap-3 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">Unable to load badges</p>
          <p className="mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  const firstRow = badges.slice(0, 5);
  const secondRow = badges.slice(5, 9);

  const renderBadgeItem = (badge: BadgeDto) => {
    const isMilestone = MILESTONE_BADGES.has(badge.id);
    const progressPercent = badge.target > 0 
      ? Math.min(Math.round((badge.current / badge.target) * 100), 100) 
      : 0;

    const formattedDate = badge.earned && badge.earnedAt
      ? new Date(badge.earnedAt).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : null;

    return (
      <div
        key={badge.id}
        className="group flex flex-col items-center text-center px-1 transition-transform duration-200 w-full"
      >
        {/* 1. Dedicated Badge Artwork (Hero) - Consistent Fixed Height */}
        <div className="h-24 sm:h-26 flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:-translate-y-1">
          <ContributionBadgeArtwork
            type={badge.id}
            earned={badge.earned}
            className="w-20 h-24 sm:w-22 sm:h-26"
          />
        </div>

        {/* 2. Badge Title - Fixed Height, wraps cleanly up to 2 lines without aggressive ellipsis */}
        <div className="h-9 sm:h-10 w-full flex items-center justify-center mb-1">
          <h3 className="text-xs sm:text-[13px] font-semibold text-foreground tracking-tight text-center line-clamp-2 leading-snug px-0.5">
            {badge.name}
          </h3>
        </div>

        {/* 3. Short Description - Fixed Height, consistent across all badges */}
        <div className="h-8 sm:h-9 w-full flex items-center justify-center mb-3">
          <p className="text-[11px] text-muted-foreground text-center line-clamp-2 leading-tight px-1 max-w-[170px]">
            {badge.description}
          </p>
        </div>

        {/* 4. Status Indicator - Fixed Height for exact horizontal baseline alignment */}
        <div className="h-6 w-full flex items-center justify-center">
          {badge.earned ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <Check className="w-3 h-3 stroke-[2.5]" />
              Earned
            </span>
          ) : isMilestone ? (
            <div className="w-full max-w-[96px] bg-secondary h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500/80 dark:bg-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          ) : (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium text-muted-foreground/70 bg-secondary/50 border border-border/40">
              Locked
            </span>
          )}
        </div>

        {/* 5. Date / Progress Sub-text - Fixed Height, positioned identically beneath status */}
        <div className="h-4 w-full flex items-center justify-center mt-1">
          {badge.earned && formattedDate ? (
            <span className="text-[10px] text-muted-foreground/80 font-mono leading-none">
              {formattedDate}
            </span>
          ) : !badge.earned && isMilestone ? (
            <span className="text-[10px] font-mono text-muted-foreground leading-none font-medium">
              {badge.current} / {badge.target}
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs p-6 lg:p-8 space-y-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Contribution Badges
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Earn meaningful achievements through your open source contributions.
          </p>
        </div>

        {/* Compact Counter near Section Heading */}
        <div className="shrink-0 flex items-center gap-1.5 font-mono text-sm font-semibold">
          <span className="text-emerald-500 font-bold text-base">{earnedCount}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground font-normal">{totalCount} Earned</span>
        </div>
      </div>

      {/* Badge Gallery: Separate logical rows (Row 1 = 5, Row 2 = 4 centered) */}
      <div className="flex flex-col gap-y-7 lg:gap-y-8">
        {/* Row 1: 5 equal badge slots on desktop, responsive 2/3 cols on mobile/tablet */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-4">
          {firstRow.map((badge) => renderBadgeItem(badge))}
        </div>

        {/* Row 2: 4 equal badge slots centered as a group on desktop, responsive on mobile/tablet */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:justify-center gap-3 sm:gap-4 lg:gap-4">
          {secondRow.map((badge) => (
            <div
              key={badge.id}
              className="lg:w-[calc((100%-4*1rem)/5)] lg:flex-none flex flex-col items-center w-full"
            >
              {renderBadgeItem(badge)}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Motivation Banner */}
      <div className="rounded-xl border border-border/60 bg-secondary/30 dark:bg-secondary/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-secondary text-emerald-500 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-medium text-foreground">Keep going!</p>
            <p className="text-muted-foreground leading-relaxed">
              Every contribution makes a difference. Explore more issues and earn new badges.
            </p>
          </div>
        </div>

        <Button 
          size="sm" 
          asChild 
          className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 gap-1.5 cursor-pointer shadow-2xs"
        >
          <Link href="/discover">
            Discover Issues <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
