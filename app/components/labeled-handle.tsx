import * as React from "react"
import { Handle, Position, type HandleProps } from "@xyflow/react"
import { cn } from "@/app/lib/utils"

interface LabeledHandleProps extends HandleProps {
  title?: string
}

const LabeledHandle = React.forwardRef<HTMLDivElement, LabeledHandleProps>(
  ({ title, position, type, className, ...props }, ref) => {
    const isLeft = position === Position.Left
    const isRight = position === Position.Right
    const isTop = position === Position.Top
    const isBottom = position === Position.Bottom

    return (
      <div
        ref={ref}
        className={cn(
          "nodrag nopan group relative flex items-center gap-2",
          isLeft && "flex-row",
          isRight && "flex-row-reverse justify-end",
          isTop && "flex-col",
          isBottom && "flex-col-reverse",
          className
        )}
      >
        <Handle
          type={type}
          position={position}
          className={cn(
            "!static !transform-none",
            "h-3 w-3 !border-2 !border-border !bg-background",
            "transition-colors",
            "group-hover:!bg-primary group-hover:!border-primary"
          )}
          {...props}
        />
        {title && (
          <span
            className={cn(
              "text-xs text-muted-foreground",
              "transition-colors",
              "group-hover:text-foreground"
            )}
          >
            {title}
          </span>
        )}
      </div>
    )
  }
)
LabeledHandle.displayName = "LabeledHandle"

export { LabeledHandle }
