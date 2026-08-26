import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
}

export function LoadingState({ text = "Loading...", className, ...props }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] w-full flex-col items-center justify-center space-y-4 text-muted-foreground",
        className
      )}
      {...props}
    >
      <Loader2 className="h-6 w-6 animate-spin" />
      {text && <p className="text-sm">{text}</p>}
    </div>
  )
}

export function Spinner({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} {...props} />
}
