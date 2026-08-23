import * as React from "react"
import { cn } from "@/lib/utils"
import { Layout, FolderGit2, Activity, Settings, GitCommit } from "lucide-react"

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r border-border bg-card",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <div className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background">
            <span className="text-[10px] font-bold">SA</span>
          </div>
          StackAudit
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-3">
        <nav className="space-y-0.5 px-2">
          <SidebarItem icon={<Layout className="h-4 w-4" />} label="Overview" active />
          <SidebarItem icon={<FolderGit2 className="h-4 w-4" />} label="Repositories" />
          <SidebarItem icon={<GitCommit className="h-4 w-4" />} label="Analyses" />
          <SidebarItem icon={<Activity className="h-4 w-4" />} label="Activity" />
        </nav>
      </div>

      <div className="border-t border-border px-2 py-3">
        <nav className="space-y-0.5">
          <SidebarItem icon={<Settings className="h-4 w-4" />} label="Settings" />
        </nav>
      </div>
    </div>
  )
}

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label: string
  active?: boolean
}

function SidebarItem({ icon, label, active, className, ...props }: SidebarItemProps) {
  return (
    <button
      className={cn(
        "group flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        className
      )}
      {...props}
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
    </button>
  )
}
