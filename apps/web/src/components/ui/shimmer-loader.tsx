"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ShimmerLoaderProps {
  text?: string;
  className?: string;
}

export function ShimmerLoader({ text = "Loading...", className }: ShimmerLoaderProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3 transition-opacity duration-300",
      mounted ? "opacity-100" : "opacity-0",
      className
    )}>
      <div className="shimmer-text-container">
        <span className="shimmer-text text-sm font-medium tracking-wide">
          {text}
        </span>
      </div>
    </div>
  );
}
