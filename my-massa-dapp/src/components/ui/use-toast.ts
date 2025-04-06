import { useState } from "react"

type ToastVariant = "default" | "destructive"

interface ToastProps {
  title: string
  description: string
  variant?: ToastVariant
  duration?: number
}

// Add id to the internal toast type
interface InternalToast extends ToastProps {
  id: number
}

export function useToast() {
  const [toasts, setToasts] = useState<InternalToast[]>([])

  const toast = (props: ToastProps) => {
    const id = Date.now()
    const duration = props.duration || 5000

    setToasts((prevToasts) => [...prevToasts, { ...props, id }])

    // Log toast for debugging
    console.log(`Toast: ${props.title} - ${props.description}`)

    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, duration)

    return id
  }

  const dismissToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return { toast, toasts, dismissToast }
}

