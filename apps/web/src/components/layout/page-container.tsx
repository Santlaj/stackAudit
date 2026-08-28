import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  fullWidth?: boolean
}

export function PageContainer({ className, children, fullWidth = false, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 py-8 md:px-8 md:py-10", 
        !fullWidth && "mx-auto max-w-6xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)} {...props}>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
