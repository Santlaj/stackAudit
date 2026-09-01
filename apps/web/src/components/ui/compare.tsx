// TODO: remove after homepage rewrite ships
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowLeftRight, Check, X, AlertCircle, ArrowRight } from "lucide-react";

interface CompareProps {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  firstLabel?: string;
  secondLabel?: string;
  initialSliderPosition?: number;
  className?: string;
}

export function Compare({
  firstContent,
  secondContent,
  firstLabel = "Traditional Approach",
  secondLabel = "StackAudit Intelligence",
  initialSliderPosition = 50,
  className,
}: CompareProps) {
  const [sliderPosition, setSliderPosition] = useState(initialSliderPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full rounded border border-border/60 bg-[#0c0d10] overflow-hidden select-none",
        className
      )}
    >
      {/* Top Status Labels */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121316] border-b border-border/40 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-red-500/80" />
          <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
            {firstLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
            {secondLabel}
          </span>
        </div>
      </div>

      {/* Split Comparison View Area */}
      <div className="relative min-h-[380px] w-full overflow-hidden">
        {/* Right / Background Side: StackAudit Intelligence (Second Content) */}
        <div className="absolute inset-0 w-full h-full p-5 sm:p-6 bg-[#0e1013] overflow-y-auto">
          {secondContent}
        </div>

        {/* Left / Clipped Side: Traditional Approach (First Content) */}
        <div
          className="absolute inset-0 w-full h-full bg-[#111115] border-r border-zinc-700/80 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="w-full h-full p-5 sm:p-6 overflow-y-auto"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%" }}
          >
            {firstContent}
          </div>
        </div>

        {/* Tactile Divider & Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          <div className="w-[2px] h-full bg-zinc-400/80 shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
          <div className="absolute w-8 h-8 rounded-full border border-border/80 bg-zinc-900 text-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="px-4 py-2 bg-[#121316] border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Drag the slider to compare workflows</span>
        <span className="font-mono text-[10px]">← TRADITIONAL | STACKAUDIT →</span>
      </div>
    </div>
  );
}
