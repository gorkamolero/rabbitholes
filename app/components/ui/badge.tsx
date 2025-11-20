import * as React from "react"
import { cn } from "@/app/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20",
        {
          "border-transparent bg-white text-black shadow-lg shadow-white/20":
            variant === "default",
          "border-transparent bg-white/10 text-white backdrop-blur-sm":
            variant === "secondary",
          "border-transparent bg-red-600 text-white shadow-lg shadow-red-600/20":
            variant === "destructive",
          "border-white/20 text-white": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
