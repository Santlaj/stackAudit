"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { cn } from "@/lib/utils"

export interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Shell({ className, children, ...props }: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background", className)} {...props}>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex shrink-0" />
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-background/90" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 max-w-[85vw] shadow-lg shadow-background/50">
            <Sidebar className="flex w-full" />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
