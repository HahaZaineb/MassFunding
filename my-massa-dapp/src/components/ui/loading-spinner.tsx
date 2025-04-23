import { cn } from "../../lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("animate-spin rounded-full border-4 border-t-transparent border-white", sizeClasses[size])} />
      {text && <p className="mt-2 text-sm text-slate-400">{text}</p>}
    </div>
  )
}
