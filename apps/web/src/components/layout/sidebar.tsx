"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Layout, Compass, Bookmark, Activity, Settings, User, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  React.useEffect(() => {
    const savedState = localStorage.getItem("stackaudit-sidebar-collapsed")
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev
      localStorage.setItem("stackaudit-sidebar-collapsed", String(newState))
      return newState
    })
  }

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-64",
        className
      )}
      {...props}
    >
      <div className={cn("flex h-14 items-center border-b border-border", isCollapsed ? "justify-center px-0" : "px-4")}>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
          <Menu className="h-4 w-4" />
        </Button>
        
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground ml-2 overflow-hidden">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded overflow-hidden">
              <img src="/icon.png" alt="StackAudit Logo" className="w-full h-full object-contain" />
            </div>
            <span className="truncate">StackAudit</span>
          </Link>
        )}
      </div>
      
      <div className="flex-1 overflow-auto py-3 custom-scrollbar">
        <nav className="space-y-0.5 px-2">
          <SidebarItem href="/" icon={<Layout className="h-4 w-4" />} label="Home" active={pathname === "/"} isCollapsed={isCollapsed} />
          <SidebarItem href="/discover" icon={<Compass className="h-4 w-4" />} label="Discover" active={pathname === "/discover"} isCollapsed={isCollapsed} />
          <SidebarItem href="/saved" icon={<Bookmark className="h-4 w-4" />} label="Saved" active={pathname === "/saved"} isCollapsed={isCollapsed} />
          <SidebarItem href="/activity" icon={<Activity className="h-4 w-4" />} label="Activity" active={pathname === "/activity"} isCollapsed={isCollapsed} />
        </nav>
      </div>

      <div className="border-t border-border px-2 py-3">
        <nav className="space-y-0.5">
          <SidebarItem href="/profile" icon={<User className="h-4 w-4" />} label="Profile" active={pathname === "/profile"} isCollapsed={isCollapsed} />
          <SidebarItem href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" active={pathname === "/settings"} isCollapsed={isCollapsed} />
        </nav>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  icon?: React.ReactNode
  label: string
  active?: boolean
  href: string
  className?: string
  isCollapsed?: boolean
}

function SidebarItem({ icon, label, active, href, className, isCollapsed }: SidebarItemProps) {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-md py-1.5 text-sm font-medium transition-colors duration-150 overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isCollapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        className
      )}
    >
      {active && <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-emerald-500 rounded-r-full" />}
      {icon && (
        <span className={cn(
          "flex items-center justify-center transition-colors duration-150 shrink-0",
          active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {icon}
        </span>
      )}
      {!isCollapsed && <span className="truncate flex-1 text-left">{label}</span>}
    </Link>
  )
}
