import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FolderGit2 } from "lucide-react"

interface EmptyWorkspaceProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyWorkspace({ className, ...props }: EmptyWorkspaceProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed border-border py-16 px-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-muted-foreground mb-4">
        <FolderGit2 className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        No repositories connected
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-5">
        Connect a GitHub repository to start analyzing code quality, security vulnerabilities, and technical debt. StackAudit will automatically scan your codebase and surface actionable findings.
      </p>
      <Button variant="default" size="sm">
        Connect GitHub repository
      </Button>
    </div>
  )
}
