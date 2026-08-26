import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description: string
  action?: React.ReactNode
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive",
        className
      )}
      {...props}
    >
      <AlertCircle className="mb-2 h-8 w-8 opacity-80" />
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 mb-4 max-w-sm text-sm opacity-90">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
