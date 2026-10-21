"use client";

import * as React from "react";

interface CornerLinesProps {
  size?: number;
  spacing?: number;
  lineCount?: number;
}

export function RgbCornerPatterns({
  size = 520,
  spacing = 14,
  lineCount = 36,
}: CornerLinesProps) {
  // Generate diagonal line coordinates and cycling RGB colors:
  // Red: #EF4444 (Crimson / Scarlet)
  // Green: #10B981 (Emerald Phosphor)
  // Blue: #3B82F6 (Electric Blue / Azure)
  const lines = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < lineCount; i++) {
      const offset = 24 + i * spacing;
      const rgbIndex = i % 3;
      const color =
        rgbIndex === 0
          ? "#EF4444"
          : rgbIndex === 1
          ? "#10B981"
          : "#3B82F6";
      
      const isAccent = i % 6 === 0;
      const isAnimated = i % 4 === 1;

      items.push({
        id: i,
        offset,
        color,
        isAccent,
        isAnimated,
        strokeWidth: isAccent ? 1.5 : 1,
        opacity: isAccent ? 0.9 : 0.65,
      });
    }
    return items;
  }, [spacing, lineCount]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <style>{`
        @keyframes rgbFlowForward {
          0% {
            stroke-dashoffset: 400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes rgbFlowReverse {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 400;
          }
        }
        @keyframes cornerPulse {
          0%, 100% {
            opacity: 0.85;
          }
          50% {
            opacity: 1;
          }
        }
        .rgb-line-animated-forward {
          stroke-dasharray: 60 180;
          animation: rgbFlowForward 18s linear infinite;
        }
        .rgb-line-animated-reverse {
          stroke-dasharray: 50 160;
          animation: rgbFlowReverse 22s linear infinite;
        }
        .corner-alive-pulse {
          animation: cornerPulse 8s ease-in-out infinite;
        }
      `}</style>

      {/* ── TOP-LEFT CORNER ── */}
      <div className="absolute -top-6 -left-6 w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[540px] lg:h-[540px] corner-alive-pulse">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="fade-mask-tl" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="35%" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="88%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="corner-mask-tl">
              <rect width={size} height={size} fill="url(#fade-mask-tl)" />
            </mask>
            <filter id="rgb-glow-tl" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g mask="url(#corner-mask-tl)" filter="url(#rgb-glow-tl)">
            {lines.map((line) => (
              <line
                key={`tl-${line.id}`}
                x1={0}
                y1={line.offset}
                x2={line.offset}
                y2={0}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                strokeOpacity={line.opacity}
                className={line.isAnimated ? "rgb-line-animated-forward" : undefined}
              />
            ))}
          </g>
        </svg>

        {/* Minimal Corner Engineering Tag */}
        <div className="absolute top-8 left-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 opacity-60">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>[RGB // 001]</span>
        </div>
      </div>

      {/* ── BOTTOM-RIGHT CORNER ── */}
      <div className="absolute -bottom-6 -right-6 w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[540px] lg:h-[540px] corner-alive-pulse">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="fade-mask-br" cx="100%" cy="100%" r="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="35%" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="88%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="corner-mask-br">
              <rect width={size} height={size} fill="url(#fade-mask-br)" />
            </mask>
            <filter id="rgb-glow-br" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g mask="url(#corner-mask-br)" filter="url(#rgb-glow-br)">
            {lines.map((line) => (
              <line
                key={`br-${line.id}`}
                x1={size - line.offset}
                y1={size}
                x2={size}
                y2={size - line.offset}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                strokeOpacity={line.opacity}
                className={line.isAnimated ? "rgb-line-animated-reverse" : undefined}
              />
            ))}
          </g>
        </svg>

        {/* Minimal Corner Engineering Tag */}
        <div className="absolute bottom-8 right-8 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 opacity-60">
          <span>[SYS // 255]</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>

      {/* ── TOP-RIGHT CORNER (Subtle complementary diagonal) ── */}
      <div className="absolute -top-6 -right-6 w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[420px] opacity-75">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="fade-mask-tr" cx="100%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="30%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#fff" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="corner-mask-tr">
              <rect width={size} height={size} fill="url(#fade-mask-tr)" />
            </mask>
          </defs>

          <g mask="url(#corner-mask-tr)">
            {lines.slice(0, 24).map((line) => (
              <line
                key={`tr-${line.id}`}
                x1={size - line.offset}
                y1={0}
                x2={size}
                y2={line.offset}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                strokeOpacity={line.opacity * 0.75}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* ── BOTTOM-LEFT CORNER (Subtle complementary diagonal) ── */}
      <div className="absolute -bottom-6 -left-6 w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[420px] opacity-75">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="fade-mask-bl" cx="0%" cy="100%" r="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="30%" stopColor="#fff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#fff" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="corner-mask-bl">
              <rect width={size} height={size} fill="url(#fade-mask-bl)" />
            </mask>
          </defs>

          <g mask="url(#corner-mask-bl)">
            {lines.slice(0, 24).map((line) => (
              <line
                key={`bl-${line.id}`}
                x1={0}
                y1={size - line.offset}
                x2={line.offset}
                y2={size}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                strokeOpacity={line.opacity * 0.75}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Subtle Central Ambient Dark Vignette for Pristine Contrast */}
      <div className="absolute inset-0 bg-radial from-transparent via-background/40 to-background/80 pointer-events-none" />
    </div>
  );
}
