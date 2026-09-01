"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Menu, Search, Bell, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession, signIn, signOut } from "@/lib/auth-client"
import { useRouter, usePathname } from "next/navigation"
import { GooeyInput } from "@/components/ui/gooey-input"

export interface TopbarProps extends React.HTMLAttributes<HTMLDivElement> {
  onMenuClick?: () => void
  children?: React.ReactNode
}

export function Topbar({ className, onMenuClick, children, ...props }: TopbarProps) {
  const { data: session } = useSession();
  const router = useRouter();

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
          <span className="hover:text-foreground cursor-pointer transition-colors duration-150" onClick={() => router.push("/")}>StackAudit</span>
          <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          <span className="font-medium text-foreground capitalize">
            {usePathname().split('/')[1] || "Home"}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end">
        {/* Search / Command Placeholder */}
        <div className="hidden md:flex relative w-full items-center justify-end pr-2">
          <GooeyInput 
            placeholder="Search repositories or commands..."
            collapsedWidth={120}
            expandedWidth={300}
            classNames={{
              root: "scale-[0.8] origin-right" // slightly scale down to fit the 14 h-14 topbar better
            }}
          />
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
          <div className="flex items-center gap-3 relative group">
            <Avatar 
              className="h-7 w-7 cursor-pointer border border-border transition-colors duration-150 hover:border-muted-foreground" 
            >
              <AvatarFallback className="bg-secondary text-secondary-foreground text-[11px] font-medium">
                {session.user.name?.substring(0, 2).toUpperCase() || "SA"}
              </AvatarFallback>
            </Avatar>
            
            {/* Simple CSS-based Dropdown for Account Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="px-3 py-2 border-b border-border/50">
                <p className="text-sm font-medium text-foreground truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
              <div className="p-1">
                <button 
                  onClick={() => router.push("/profile")}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted text-foreground transition-colors"
                >
                  Profile
                </button>
                <button 
                  onClick={() => router.push("/settings")}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-muted text-foreground transition-colors"
                >
                  Settings
                </button>
              </div>
              <div className="p-1 border-t border-border/50">
                <button 
                  onClick={async () => {
                    await signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          router.push("/login");
                        }
                      }
                    });
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-destructive/10 text-destructive transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
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
