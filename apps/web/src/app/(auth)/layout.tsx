import * as React from "react";
import Link from "next/link";
import { RgbCornerPatterns } from "@/components/ui/rgb-corner-patterns";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      {/* Diagonal RGB Line Corner Patterns */}
      <RgbCornerPatterns />

      {/* Brand Header Link */}
      <div className="relative z-10 mb-6 flex items-center justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-card/70 backdrop-blur-sm hover:border-border/80 transition-all text-xs font-semibold tracking-tight text-foreground shadow-2xs"
        >
          <img
            src="/icon.png"
            alt="StackAudit"
            className="h-4 w-4 object-contain rounded"
          />
          <span>StackAudit</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md p-6 sm:p-8 border border-border/60 bg-card/95 backdrop-blur-md rounded-xl shadow-xl relative z-10">
        {children}
      </div>
    </div>
  );
}
