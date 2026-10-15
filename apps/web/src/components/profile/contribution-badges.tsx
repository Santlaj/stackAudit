"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { BadgeDto, fetchBadges } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { BADGE_REGISTRY, BADGE_REGISTRY_MAP } from "./badge-registry";
import { BadgeDetailModal } from "./badge-detail-modal";
import { BadgeArtwork } from "./badge-artwork";
import { cn } from "@/lib/utils";

interface EarnedBadgeDisplay {
  dto: BadgeDto;
  registry: (typeof BADGE_REGISTRY)[number];
}

interface ContributionBadgesProps {
  className?: string;
  userId?: string;
}

export function ContributionBadges({ className, userId: propUserId }: ContributionBadgesProps = {}) {
  const { data: session } = useSession();
  const effectiveUserId = propUserId || session?.user?.id;
  const [badges, setBadges] = React.useState<BadgeDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = React.useState<EarnedBadgeDisplay | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function loadBadges() {
      if (!effectiveUserId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBadges(effectiveUserId);
        if (mounted) {
          setBadges(data || []);
        }
      } catch (err: any) {
        if (mounted) {
          console.error("Failed to load badges", err);
          setError(err.message || "Failed to load contribution badges");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadBadges();
    return () => { mounted = false; };
  }, [effectiveUserId]);

  // Filter: only badges that have a registry entry AND are earned
  const earnedBadges: EarnedBadgeDisplay[] = React.useMemo(() => {
    return badges
      .filter((dto) => dto.earned && BADGE_REGISTRY_MAP.has(dto.id))
      .map((dto) => ({
        dto,
        registry: BADGE_REGISTRY_MAP.get(dto.id)!,
      }));
  }, [badges]);

  // Total available (only from registry — badges with images)
  const totalAvailable = BADGE_REGISTRY.length;

  if (loading) {
    return (
      <div className="border border-border bg-card p-10 flex flex-col items-center justify-center min-h-[240px] text-center rounded-md">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground/50 mb-3" />
        <p className="text-xs text-muted-foreground">Evaluating badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-border bg-card p-5 flex items-start gap-3 text-xs text-muted-foreground rounded-md">
        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">Unable to load badges</p>
          <p className="mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Developer";

  return (
    <>
      <div className={cn("rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xs shadow-xs flex flex-col justify-between overflow-hidden", className)}>
        {/* Header — clean title on left, badges earned count on right */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Achievements
          </h2>
          <span className="text-xs font-mono font-medium text-muted-foreground px-2.5 py-0.5 rounded-full bg-secondary border border-border/50">
            {earnedBadges.length} {earnedBadges.length === 1 ? "badge earned" : "badges earned"}
          </span>
        </div>

        {/* Badge Grid / Empty State */}
        <div className="px-6 py-5 flex-1 flex flex-col justify-center">
          {earnedBadges.length === 0 ? (
            /* ── Empty State ── */
            <div className="py-6 text-center space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                Contribute to open-source projects to start earning achievement
                badges. Each badge represents a real milestone in your journey.
              </p>
              <Button
                size="sm"
                asChild
                className="h-8 text-xs font-medium cursor-pointer"
              >
                <Link href="/discover">
                  Find Contributions
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          ) : (
            /* ── Earned Badges Grid ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {earnedBadges.map(({ dto, registry }) => (
                <button
                  key={dto.id}
                  onClick={() => setSelectedBadge({ dto, registry })}
                  className="group flex flex-col items-center text-center p-3 rounded-md border border-transparent hover:border-border hover:bg-secondary/40 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {/* Badge Image / Artwork */}
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 mb-2 transition-transform duration-200 group-hover:scale-[1.03] flex items-center justify-center">
                    {registry.imagePath ? (
                      <Image
                        src={registry.imagePath}
                        alt={registry.achievementTitle}
                        fill
                        unoptimized
                        className="object-contain"
                        sizes="(max-width: 640px) 80px, 96px"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-18 sm:h-18">
                        <BadgeArtwork
                          type={dto.id}
                          earned={true}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Badge Title */}
                  <p className="text-[11px] sm:text-xs font-medium text-foreground leading-tight line-clamp-2">
                    {registry.achievementTitle}
                  </p>

                  {/* Earned Date */}
                  {dto.earnedAt && (
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">
                      {new Date(dto.earnedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Badge Detail Modal ── */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge.registry}
          earnedAt={selectedBadge.dto.earnedAt}
          userName={userName}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </>
  );
}
