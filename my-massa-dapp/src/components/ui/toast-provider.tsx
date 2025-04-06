

import { createContext, useContext, useState, type ReactNode } from "react"
import { ToastContainer } from "./toast"

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
      <ToastContainer
        toasts={toasts.map((toast) => ({
          ...toast,
          onClose: () => dismissToast(toast.id),
        }))}
      />
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

