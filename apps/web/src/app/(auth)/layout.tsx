import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-6 border border-border/40 bg-card rounded-md shadow-sm">
        {children}
      </div>
    </div>
  );
}
