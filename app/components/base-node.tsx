import * as React from "react"
import { cn } from "@/app/lib/utils"

type BaseNodeProps = React.HTMLAttributes<HTMLDivElement>

const BaseNode = React.forwardRef<HTMLDivElement, BaseNodeProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          "min-w-[200px]",
          "[.react-flow__node.selected_&]:ring-2 [.react-flow__node.selected_&]:ring-ring [.react-flow__node.selected_&]:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)
BaseNode.displayName = "BaseNode"

type BaseNodeHeaderProps = React.HTMLAttributes<HTMLDivElement>

const BaseNodeHeader = React.forwardRef<HTMLDivElement, BaseNodeHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 p-3", className)}
        {...props}
      />
    )
  }
)
BaseNodeHeader.displayName = "BaseNodeHeader"

type BaseNodeHeaderTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const BaseNodeHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  BaseNodeHeaderTitleProps
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "flex-1 text-sm font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
})
BaseNodeHeaderTitle.displayName = "BaseNodeHeaderTitle"

type BaseNodeContentProps = React.HTMLAttributes<HTMLDivElement>

const BaseNodeContent = React.forwardRef<HTMLDivElement, BaseNodeContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-3 pt-0", className)}
        {...props}
      />
    )
  }
)
BaseNodeContent.displayName = "BaseNodeContent"

type BaseNodeFooterProps = React.HTMLAttributes<HTMLDivElement>

const BaseNodeFooter = React.forwardRef<HTMLDivElement, BaseNodeFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-3 pt-0", className)}
        {...props}
      />
    )
  }
)
BaseNodeFooter.displayName = "BaseNodeFooter"

export {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
}
