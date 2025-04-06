
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

interface ToastProps {
  title: string
  description: string
  variant?: "default" | "destructive"
  onClose?: () => void
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 border animate-in slide-in-from-bottom-5",
        variant === "destructive" ? "bg-red-600 border-red-700 text-white" : "bg-slate-800 border-slate-700 text-white",
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className={cn("text-sm", variant === "destructive" ? "text-white/90" : "text-slate-300")}>{description}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-white/70 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} />
      ))}
    </div>
  )
}

