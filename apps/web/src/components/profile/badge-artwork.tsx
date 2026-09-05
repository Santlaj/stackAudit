"use client";

import React from "react";

export type BadgeType =
  | "FIRST_CONTRIBUTION"
  | "FIRST_PR"
  | "MERGED"
  | "CONTRIBUTOR_5"
  | "CONTRIBUTOR_10"
  | "ISSUE_EXPLORER"
  | "REPOSITORY_EXPLORER"
  | "MULTI_STACK"
  | "REPOSITORY_CONTRIBUTOR";

interface BadgeArtworkProps {
  type: string;
  earned: boolean;
  className?: string;
}

interface BadgePalette {
  primary: string;
  secondary: string;
  accent: string;
  plateTop: string;
  plateBottom: string;
  stroke: string;
  glow: string;
  facetLight: string;
  facetDark: string;
  iconFill: string;
  iconStroke: string;
}

const PALETTES: Record<string, BadgePalette> = {
  FIRST_CONTRIBUTION: {
    primary: "#10b981", // Emerald
    secondary: "#059669",
    accent: "#34d399",
    plateTop: "#064e3b",
    plateBottom: "#022c22",
    stroke: "#10b981",
    glow: "rgba(16, 185, 129, 0.45)",
    facetLight: "#6ee7b7",
    facetDark: "#047857",
    iconFill: "#34d399",
    iconStroke: "#ecfdf5",
  },
  FIRST_PR: {
    primary: "#0ea5e9", // Electric Sky
    secondary: "#0284c7",
    accent: "#38bdf8",
    plateTop: "#0c4a6e",
    plateBottom: "#082f49",
    stroke: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.5)",
    facetLight: "#7dd3fc",
    facetDark: "#0369a1",
    iconFill: "#38bdf8",
    iconStroke: "#f0f9ff",
  },
  MERGED: {
    primary: "#a855f7", // Royal Purple / Platinum
    secondary: "#7e22ce",
    accent: "#c084fc",
    plateTop: "#3b0764",
    plateBottom: "#1e1b4b",
    stroke: "#a855f7",
    glow: "rgba(168, 85, 247, 0.45)",
    facetLight: "#d8b4fe",
    facetDark: "#6b21a8",
    iconFill: "#c084fc",
    iconStroke: "#faf5ff",
  },
  CONTRIBUTOR_5: {
    primary: "#8b5cf6", // Purple / Violet
    secondary: "#6d28d9",
    accent: "#a78bfa",
    plateTop: "#2e1065",
    plateBottom: "#1e1b4b",
    stroke: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.45)",
    facetLight: "#c4b5fd",
    facetDark: "#5b21b6",
    iconFill: "#a78bfa",
    iconStroke: "#f5f3ff",
  },
  CONTRIBUTOR_10: {
    primary: "#6366f1", // Indigo / Star
    secondary: "#4f46e5",
    accent: "#818cf8",
    plateTop: "#1e1b4b",
    plateBottom: "#0f172a",
    stroke: "#6366f1",
    glow: "rgba(99, 102, 241, 0.45)",
    facetLight: "#a5b4fc",
    facetDark: "#4338ca",
    iconFill: "#818cf8",
    iconStroke: "#eef2ff",
  },
  ISSUE_EXPLORER: {
    primary: "#f59e0b", // Gold / Amber
    secondary: "#d97706",
    accent: "#fbbf24",
    plateTop: "#78350f",
    plateBottom: "#451a03",
    stroke: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.45)",
    facetLight: "#fde68a",
    facetDark: "#b45309",
    iconFill: "#fbbf24",
    iconStroke: "#fffbeb",
  },
  REPOSITORY_EXPLORER: {
    primary: "#14b8a6", // Teal / Cyan
    secondary: "#0d9488",
    accent: "#2dd4bf",
    plateTop: "#134e4a",
    plateBottom: "#042f2e",
    stroke: "#14b8a6",
    glow: "rgba(20, 184, 166, 0.45)",
    facetLight: "#5eead4",
    facetDark: "#0f766e",
    iconFill: "#2dd4bf",
    iconStroke: "#f0fdfa",
  },
  MULTI_STACK: {
    primary: "#3b82f6", // Blue / Sapphire
    secondary: "#2563eb",
    accent: "#60a5fa",
    plateTop: "#1e3a8a",
    plateBottom: "#172554",
    stroke: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.45)",
    facetLight: "#93c5fd",
    facetDark: "#1d4ed8",
    iconFill: "#60a5fa",
    iconStroke: "#eff6ff",
  },
  REPOSITORY_CONTRIBUTOR: {
    primary: "#10b981", // Forest Mint
    secondary: "#047857",
    accent: "#34d399",
    plateTop: "#064e3b",
    plateBottom: "#022c22",
    stroke: "#10b981",
    glow: "rgba(16, 185, 129, 0.45)",
    facetLight: "#6ee7b7",
    facetDark: "#047857",
    iconFill: "#34d399",
    iconStroke: "#ecfdf5",
  },
};

const LOCKED_PALETTE: BadgePalette = {
  primary: "#64748b",
  secondary: "#475569",
  accent: "#94a3b8",
  plateTop: "#1e293b",
  plateBottom: "#0f172a",
  stroke: "#475569",
  glow: "none",
  facetLight: "#64748b",
  facetDark: "#334155",
  iconFill: "#94a3b8",
  iconStroke: "#cbd5e1",
};

export function ContributionBadgeArtwork({ type, earned, className }: BadgeArtworkProps) {
  const p = earned ? (PALETTES[type] || PALETTES.FIRST_CONTRIBUTION) : LOCKED_PALETTE;
  const filterId = `glow-${type}-${earned ? "earned" : "locked"}`;
  const gradOuter = `grad-outer-${type}-${earned ? "earned" : "locked"}`;
  const gradPlate = `grad-plate-${type}-${earned ? "earned" : "locked"}`;
  const gradSheen = `grad-sheen-${type}-${earned ? "earned" : "locked"}`;

  return (
    <div className={`relative flex items-center justify-center select-none ${className || "w-24 h-28"}`}>
      <svg
        viewBox="0 0 100 116"
        className="w-full h-full drop-shadow-md transition-all duration-300 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle glow for earned badges */}
          {earned && (
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}

          {/* Outer Bevel Gradient */}
          <linearGradient id={gradOuter} x1="50" y1="2" x2="50" y2="114" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={p.facetLight} stopOpacity={earned ? "0.9" : "0.5"} />
            <stop offset="50%" stopColor={p.primary} stopOpacity={earned ? "0.7" : "0.3"} />
            <stop offset="100%" stopColor={p.facetDark} stopOpacity={earned ? "0.95" : "0.6"} />
          </linearGradient>

          {/* Inner Plate Gradient */}
          <linearGradient id={gradPlate} x1="50" y1="14" x2="50" y2="102" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={p.plateTop} />
            <stop offset="100%" stopColor={p.plateBottom} />
          </linearGradient>

          {/* Diagonal Glass Sheen */}
          <linearGradient id={gradSheen} x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={earned ? "0.2" : "0.08"} />
            <stop offset="40%" stopColor="#ffffff" stopOpacity={earned ? "0.05" : "0.02"} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Glow Halo for Earned */}
        {earned && (
          <polygon
            points="50 3, 95 27, 95 87, 50 111, 5 87, 5 27"
            fill={p.primary}
            opacity="0.2"
            filter={`url(#${filterId})`}
          />
        )}

        {/* Outer Faceted Hexagon */}
        <polygon
          points="50 4, 94 28, 94 86, 50 110, 6 86, 6 28"
          fill={`url(#${gradOuter})`}
          stroke={p.stroke}
          strokeWidth="1.5"
        />

        {/* Facet Bevel Triangles/Polygons */}
        {/* Top Facet */}
        <polygon points="50 4, 94 28, 86 34, 50 14" fill={p.facetLight} opacity={earned ? "0.3" : "0.15"} />
        <polygon points="50 4, 6 28, 14 34, 50 14" fill={p.facetLight} opacity={earned ? "0.45" : "0.25"} />
        {/* Right Facet */}
        <polygon points="94 28, 94 86, 86 80, 86 34" fill={p.facetDark} opacity={earned ? "0.5" : "0.3"} />
        {/* Left Facet */}
        <polygon points="6 28, 6 86, 14 80, 14 34" fill={p.facetLight} opacity={earned ? "0.35" : "0.2"} />
        {/* Bottom Facets */}
        <polygon points="6 86, 50 110, 50 100, 14 80" fill={p.facetDark} opacity={earned ? "0.6" : "0.4"} />
        <polygon points="94 86, 50 110, 50 100, 86 80" fill={p.facetDark} opacity={earned ? "0.7" : "0.5"} />

        {/* Inner Plate */}
        <polygon
          points="50 14, 86 34, 86 80, 50 100, 14 80, 14 34"
          fill={`url(#${gradPlate})`}
          stroke={p.accent}
          strokeWidth="1"
          strokeOpacity={earned ? "0.4" : "0.15"}
        />

        {/* Diagonal Sheen Overlay */}
        <polygon
          points="50 14, 86 34, 86 80, 50 100, 14 80, 14 34"
          fill={`url(#${gradSheen})`}
        />

        {/* Decorative Laurel / Circuit framing if earned */}
        {(type === "ISSUE_EXPLORER" || type === "REPOSITORY_CONTRIBUTOR" || type === "MERGED") && (
          <g opacity={earned ? "0.6" : "0.25"}>
            {/* Left Laurel Leaves */}
            <path d="M22 45 C20 48, 23 52, 26 51 C24 48, 23 46, 22 45 Z" fill={p.accent} />
            <path d="M20 55 C18 58, 21 62, 24 61 C22 58, 21 56, 20 55 Z" fill={p.accent} />
            <path d="M22 65 C20 68, 23 72, 26 71 C24 68, 23 66, 22 65 Z" fill={p.accent} />
            {/* Right Laurel Leaves */}
            <path d="M78 45 C80 48, 77 52, 74 51 C76 48, 77 46, 78 45 Z" fill={p.accent} />
            <path d="M80 55 C82 58, 79 62, 76 61 C78 58, 79 56, 80 55 Z" fill={p.accent} />
            <path d="M78 65 C80 68, 77 72, 74 71 C76 68, 77 66, 78 65 Z" fill={p.accent} />
          </g>
        )}

        {/* Central Emblem Art according to Badge Type */}
        <g transform="translate(0, 0)">
          {renderBadgeGlyph(type, p, earned)}
        </g>

        {/* Locked Padlock Indicator on Bottom-Right */}
        {!earned && (
          <g transform="translate(68, 74)">
            <circle cx="12" cy="12" r="12" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            <path
              d="M9 11 V9 C9 7.34 10.34 6 12 6 C13.66 6 15 7.34 15 9 V11 M8 11 H16 C16.55 11 17 11.45 17 12 V16 C17 16.55 16.55 17 16 17 H8 C7.45 17 7 16.55 7 16 V12 C7 11.45 7.45 11 8 11 Z"
              stroke="#94a3b8"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Renders the unique, dedicated vector glyph inside the badge plate.
 */
function renderBadgeGlyph(type: string, p: BadgePalette, earned: boolean) {
  switch (type) {
    case "FIRST_CONTRIBUTION":
      // Git Branch / Seedling Contribution Node
      return (
        <g stroke={p.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="38" y1="38" x2="38" y2="76" stroke={p.iconStroke} />
          <path d="M38 58 C38 48, 62 48, 62 42" stroke={p.iconStroke} />
          <circle cx="38" cy="38" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <circle cx="38" cy="74" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <circle cx="62" cy="40" r="5" fill={earned ? "#6ee7b7" : p.accent} stroke={p.iconStroke} strokeWidth="2" />
        </g>
      );

    case "FIRST_PR":
      // Clean, bold Git Pull Request icon
      return (
        <g stroke={p.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="36" cy="40" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <circle cx="36" cy="74" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <line x1="36" y1="45" x2="36" y2="70" stroke={p.iconStroke} />
          <circle cx="64" cy="74" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <path d="M64 70 V52 C64 45, 36 45, 36 45" stroke={p.iconStroke} />
          {/* Arrow pointing to branch */}
          <polyline points="42 42, 36 45, 42 48" stroke={p.iconStroke} strokeWidth="2" />
        </g>
      );

    case "MERGED":
      // Git Merge icon with bold central node
      return (
        <g stroke={p.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="36" cy="38" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <circle cx="36" cy="74" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <line x1="36" y1="43" x2="36" y2="70" stroke={p.iconStroke} />
          <circle cx="64" cy="56" r="5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <path d="M64 51 C64 44, 36 44, 36 38" stroke={p.iconStroke} />
        </g>
      );

    case "CONTRIBUTOR_5":
      // Group of 3 contributors / users
      return (
        <g stroke={p.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Center User */}
          <circle cx="50" cy="45" r="5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <path d="M40 68 C40 60, 44 57, 50 57 C56 57, 60 60, 60 68" fill={p.plateBottom} stroke={p.iconStroke} strokeWidth="2" />
          {/* Left User */}
          <circle cx="34" cy="49" r="4" fill={p.primary} stroke={p.iconStroke} strokeWidth="1.5" />
          <path d="M26 69 C26 63, 29 61, 34 61 C36 61, 38 62, 39 63" stroke={p.iconStroke} strokeWidth="1.5" />
          {/* Right User */}
          <circle cx="66" cy="49" r="4" fill={p.primary} stroke={p.iconStroke} strokeWidth="1.5" />
          <path d="M74 69 C74 63, 71 61, 66 61 C64 61, 62 62, 61 63" stroke={p.iconStroke} strokeWidth="1.5" />
        </g>
      );

    case "CONTRIBUTOR_10":
      // Milestone Master Contributor with double ring / star crown
      return (
        <g stroke={p.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Crown / Star Points */}
          <polygon
            points="50 34, 54 42, 63 43, 56 49, 58 58, 50 53, 42 58, 44 49, 37 43, 46 42"
            fill={earned ? "#a5b4fc" : p.accent}
            stroke={p.iconStroke}
            strokeWidth="1.5"
          />
          {/* Bottom Banner Pedestal */}
          <path d="M34 66 H66 M38 72 H62" stroke={p.iconStroke} strokeWidth="2.5" />
        </g>
      );

    case "ISSUE_EXPLORER":
      // Magnifying Glass with inner dot / bug symbol
      return (
        <g stroke={p.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="47" cy="50" r="12" stroke={p.iconStroke} strokeWidth="2.5" fill={p.plateTop} fillOpacity="0.5" />
          <line x1="56" y1="59" x2="68" y2="71" stroke={p.iconStroke} strokeWidth="3" />
          {/* Spark/Cross inside lens */}
          <circle cx="47" cy="50" r="3.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="1.5" />
        </g>
      );

    case "REPOSITORY_EXPLORER":
      // Folder with Code Brackets inside
      return (
        <g stroke={p.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Folder */}
          <path
            d="M30 42 L42 42 L46 47 L70 47 C72 47, 74 49, 74 51 L74 71 C74 73, 72 75, 70 75 L30 75 C28 75, 26 73, 26 71 L26 44 C26 42, 28 42, 30 42 Z"
            fill={p.plateTop}
            stroke={p.iconStroke}
            strokeWidth="2"
          />
          {/* Code brackets </ > */}
          <path d="M44 57 L40 61 L44 65" stroke={p.accent} strokeWidth="2" />
          <path d="M56 57 L60 61 L56 65" stroke={p.accent} strokeWidth="2" />
          <line x1="52" y1="56" x2="48" y2="66" stroke={p.iconStroke} strokeWidth="1.5" />
        </g>
      );

    case "MULTI_STACK":
      // Multi-layer technology stack
      return (
        <g stroke={p.iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Top diamond layer */}
          <polygon points="50 38, 68 46, 50 54, 32 46" fill={p.accent} stroke={p.iconStroke} strokeWidth="1.75" />
          {/* Middle layer */}
          <path d="M32 54 L50 62 L68 54" stroke={p.iconStroke} strokeWidth="2" />
          {/* Bottom layer */}
          <path d="M32 62 L50 70 L68 62" stroke={p.iconStroke} strokeWidth="2" />
        </g>
      );

    case "REPOSITORY_CONTRIBUTOR":
      // Repository Tree with contribution node
      return (
        <g stroke={p.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Branching tree stem */}
          <line x1="50" y1="40" x2="50" y2="74" stroke={p.iconStroke} />
          <path d="M50 58 C40 58, 36 50, 36 44" stroke={p.iconStroke} />
          <path d="M50 64 C60 64, 64 56, 64 50" stroke={p.iconStroke} />
          <circle cx="50" cy="38" r="4.5" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <circle cx="36" cy="42" r="4" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <circle cx="64" cy="48" r="4" fill={p.accent} stroke={p.iconStroke} strokeWidth="2" />
          <circle cx="50" cy="74" r="4.5" fill={p.primary} stroke={p.iconStroke} strokeWidth="2" />
        </g>
      );

    default:
      return null;
  }
}
