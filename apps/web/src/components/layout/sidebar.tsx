import * as React from "react"
import { cn } from "@/lib/utils"
import { Layout, Compass, Bookmark, Activity, Settings, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r border-border bg-card",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background">
            <span className="text-[10px] font-bold">SA</span>
          </div>
          StackAudit
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-3">
        <nav className="space-y-0.5 px-2">
          <SidebarItem href="/" icon={<Layout className="h-4 w-4" />} label="Overview" active={pathname === "/"} />
          <SidebarItem href="/discover" icon={<Compass className="h-4 w-4" />} label="Discover" active={pathname === "/discover"} />
          <SidebarItem href="/saved" icon={<Bookmark className="h-4 w-4" />} label="Saved" active={pathname === "/saved"} />
          <SidebarItem href="/activity" icon={<Activity className="h-4 w-4" />} label="Activity" active={pathname === "/activity"} />
        </nav>
      </div>

      <div className="border-t border-border px-2 py-3">
        <nav className="space-y-0.5">
          <SidebarItem href="/profile" icon={<User className="h-4 w-4" />} label="Profile" active={pathname === "/profile"} />
          <SidebarItem href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" active={pathname === "/settings"} />
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
}

function SidebarItem({ icon, label, active, href, className }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        className
      )}
    >
      {icon && (
        <span className={cn(
          "flex items-center justify-center transition-colors duration-150",
          active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {icon}
        </span>
      )}
      <span className="truncate flex-1 text-left">{label}</span>
    </Link>
  )
}
