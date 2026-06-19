import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id, duration: toast.duration || 5000 }
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    if (newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, newToast.duration)
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

export const toast = {
  success: (title: string, description?: string, duration?: number) => useToastStore.getState().addToast({ title, description, type: 'success', duration }),
  error: (title: string, description?: string, duration?: number) => useToastStore.getState().addToast({ title, description, type: 'error', duration }),
  warning: (title: string, description?: string, duration?: number) => useToastStore.getState().addToast({ title, description, type: 'warning', duration }),
  info: (title: string, description?: string, duration?: number) => useToastStore.getState().addToast({ title, description, type: 'info', duration }),
}
