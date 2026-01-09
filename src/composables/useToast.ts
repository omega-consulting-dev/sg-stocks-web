import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastId}`
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast
    }

    toasts.value.push(newToast)

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'success', message, title, duration })
  }

  const error = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'error', message, title, duration: duration ?? 7000 })
  }

  const warning = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'warning', message, title, duration })
  }

  const info = (message: string, title?: string, duration?: number) => {
    return addToast({ type: 'info', message, title, duration })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
