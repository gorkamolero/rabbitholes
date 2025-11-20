import * as React from "react"
import { cn } from "@/app/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/20":
              variant === "default",
            "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20":
              variant === "destructive",
            "border border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm":
              variant === "outline",
            "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm":
              variant === "secondary",
            "hover:bg-white/10 text-white": variant === "ghost",
            "text-white underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-11 rounded-lg px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
