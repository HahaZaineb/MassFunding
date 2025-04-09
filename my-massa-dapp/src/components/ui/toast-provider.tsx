"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Toast } from "./toast"

type ToastVariant = "default" | "destructive"

interface ToastProps {
  title: string
  description: string
  variant?: ToastVariant
  duration?: number
}

interface InternalToast extends ToastProps {
  id: number
}

interface ToastContextType {
  toast: (props: ToastProps) => number
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<InternalToast[]>([])

  const toast = (props: ToastProps) => {
    const id = Date.now()
    const duration = props.duration || 5000

    setToasts((prevToasts) => [...prevToasts, { ...props, id }])

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, duration)

    return id
  }

  const dismissToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant} className="animate-in slide-in-from-right-full">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold">{toast.title}</div>
              <div className="text-sm opacity-90">{toast.description}</div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100"
            >
              ✕
            </button>
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}
