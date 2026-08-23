"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Menu, Search, Bell, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession, signIn, signOut } from "@/lib/auth-client"

export interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {
  onMenuClick?: () => void
  children?: React.ReactNode
}

export function Topbar({ className, onMenuClick, children, ...props }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:hidden"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Toggle menu</span>
        </button>

        {/* Breadcrumbs / Page Context */}
        <nav className="hidden md:flex items-center text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors duration-150">StackAudit</span>
          <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          <span className="font-medium text-foreground">Overview</span>
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end">
        {/* Search / Command Placeholder */}
        <div className="hidden md:flex relative max-w-sm w-full items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search repositories or commands..."
            className="h-8 w-full rounded-md border border-border bg-muted/30 pl-9 pr-14 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-muted-foreground focus:bg-background transition-colors duration-150"
          />
          <div className="absolute right-2.5 flex items-center gap-1">
            <kbd className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
        
        {/* Mobile Search Icon */}
        <button className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-secondary/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-foreground" />
        </button>

        {/* User Menu */}
        {session ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7 cursor-pointer border border-border transition-colors duration-150 hover:border-muted-foreground" onClick={() => signOut()}>
              <AvatarFallback className="bg-secondary text-secondary-foreground text-[11px] font-medium">
                {session.user.name?.substring(0, 2).toUpperCase() || "SA"}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <button 
            onClick={() => signIn.social({ provider: "github" })}
            className="text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  )
}
