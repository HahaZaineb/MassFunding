import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  dataSidebar?: string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, dataSidebar, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-full w-64 flex-col border-r bg-secondary text-secondary-foreground", className)}
        data-sidebar={dataSidebar}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Sidebar.displayName = "Sidebar"

interface SidebarSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  dataSidebar?: string
}

const SidebarSkeleton = React.forwardRef<HTMLDivElement, SidebarSkeletonProps>(
  ({ className, dataSidebar, style, ...props }, ref) => {
    return (
      <div className={className} data-sidebar={dataSidebar} style={style}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  },
)
SidebarSkeleton.displayName = "SidebarSkeleton"

export { Sidebar, SidebarSkeleton }
