import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, ToastType } from '@/store/toast'
import { cn } from '@/lib/utils'

const icons: Record<ToastType, any> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors: Record<ToastType, string> = {
  success: 'text-success border-success/20 bg-success/10',
  error: 'text-danger border-danger/20 bg-danger/10',
  warning: 'text-warning border-warning/20 bg-warning/10',
  info: 'text-accent-blue border-accent-blue/20 bg-accent-blue/10',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-[120] flex max-w-sm flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          const colorClass = colors[toast.type]

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 shadow-xl backdrop-blur-md',
                'bg-nexus-900/90',
                colorClass.split(' ')[1] // Extract border color for overall container
              )}
            >
              <div className={cn('mt-0.5 rounded-full p-1', colorClass.split(' ')[2])}>
                <Icon className={cn('h-4 w-4', colorClass.split(' ')[0])} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-nexus-50">{toast.title}</h4>
                {toast.description && (
                  <p className="mt-1 text-xs text-nexus-400">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-md p-1 text-nexus-500 hover:bg-white/10 hover:text-nexus-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
