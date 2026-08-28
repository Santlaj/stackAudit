"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck } from "@tabler/icons-react"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Shell } from "@/components/layout/shell"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ProtectedRoute>
      <Shell>
        <div className="flex-1 overflow-auto bg-background p-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your account settings and preferences.
              </p>
            </div>

            {/* Appearance Section */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                {/* Light Theme Card */}
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 bg-card text-left transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    theme === "light" ? "border-foreground" : "border-transparent ring-1 ring-border shadow-sm"
                  )}
                >
                  {theme === "light" && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-foreground rounded-full flex items-center justify-center shadow-sm">
                      <IconCheck size={12} className="text-background" stroke={3} />
                    </div>
                  )}
                  <div className="w-full aspect-[4/3] rounded-md bg-[#F2F1EC] border border-[#E2E0D6] flex flex-col p-2 gap-2 shadow-sm overflow-hidden">
                    <div className="w-full h-3 bg-[#EBEAE4] rounded-sm" />
                    <div className="w-2/3 h-2 bg-[#FDFCF7] rounded-sm shadow-sm border border-[#E2E0D6]" />
                    <div className="w-3/4 h-2 bg-[#FDFCF7] rounded-sm shadow-sm border border-[#E2E0D6]" />
                  </div>
                  <div className="flex items-center gap-2 w-full justify-center">
                    <IconSun size={18} className="text-foreground" />
                    <span className="font-medium text-sm text-foreground">Light</span>
                  </div>
                </button>

                {/* Dark Theme Card */}
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 bg-card text-left transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    theme === "dark" ? "border-foreground" : "border-transparent ring-1 ring-border shadow-sm"
                  )}
                >
                  {theme === "dark" && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-foreground rounded-full flex items-center justify-center shadow-sm">
                      <IconCheck size={12} className="text-background" stroke={3} />
                    </div>
                  )}
                  <div className="w-full aspect-[4/3] rounded-md bg-[#18181b] border border-[#27272a] flex flex-col p-2 gap-2 shadow-sm overflow-hidden">
                    <div className="w-full h-3 bg-[#27272a] rounded-sm" />
                    <div className="w-2/3 h-2 bg-[#09090b] rounded-sm shadow-sm border border-[#27272a]" />
                    <div className="w-3/4 h-2 bg-[#09090b] rounded-sm shadow-sm border border-[#27272a]" />
                  </div>
                  <div className="flex items-center gap-2 w-full justify-center">
                    <IconMoon size={18} className="text-foreground" />
                    <span className="font-medium text-sm text-foreground">Dark</span>
                  </div>
                </button>

                {/* System Theme Card */}
                <button
                  onClick={() => setTheme("system")}
                  className={cn(
                    "relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 bg-card text-left transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    theme === "system" ? "border-foreground" : "border-transparent ring-1 ring-border shadow-sm"
                  )}
                >
                  {theme === "system" && (
                    <div className="absolute top-2 right-2 h-5 w-5 bg-foreground rounded-full flex items-center justify-center shadow-sm z-10">
                      <IconCheck size={12} className="text-background" stroke={3} />
                    </div>
                  )}
                  <div className="w-full aspect-[4/3] rounded-md border border-border flex shadow-sm overflow-hidden relative">
                    <div className="flex-1 bg-[#F2F1EC] p-2 flex flex-col gap-2">
                      <div className="w-full h-3 bg-[#EBEAE4] rounded-sm" />
                      <div className="w-full h-2 bg-[#FDFCF7] rounded-sm shadow-sm border border-[#E2E0D6]" />
                    </div>
                    <div className="flex-1 bg-[#18181b] p-2 flex flex-col gap-2 border-l border-[#27272a]">
                      <div className="w-full h-3 bg-[#27272a] rounded-sm" />
                      <div className="w-full h-2 bg-[#09090b] rounded-sm shadow-sm border border-[#27272a]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full justify-center">
                    <IconDeviceDesktop size={18} className="text-foreground" />
                    <span className="font-medium text-sm text-foreground">System</span>
                  </div>
                </button>
              </div>
            </section>
            
          </div>
        </div>
      </Shell>
    </ProtectedRoute>
  )
}
