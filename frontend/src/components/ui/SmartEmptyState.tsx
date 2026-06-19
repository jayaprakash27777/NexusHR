import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Plus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
  className?: string
}

export default function SmartEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className
}: SmartEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center max-w-sm"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-pulse rounded-full bg-accent-indigo/10 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[var(--radius-xl)] border border-white/5 bg-gradient-to-br from-white/10 to-transparent shadow-2xl backdrop-blur-xl">
            <Icon className="h-8 w-8 text-nexus-300" strokeWidth={1.5} />
          </div>
          {/* Decorative floating elements */}
          <motion.div 
            animate={{ y: [-4, 4, -4] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -right-2 -top-2 h-6 w-6 rounded-lg border border-white/10 bg-accent-violet/20 backdrop-blur-md"
          />
          <motion.div 
            animate={{ y: [4, -4, 4] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-1 -left-2 h-4 w-4 rounded-full border border-white/10 bg-accent-cyan/20 backdrop-blur-md"
          />
        </div>

        <h3 className="mb-2 text-lg font-semibold tracking-tight text-nexus-100">
          {title}
        </h3>
        <p className="mb-8 text-sm text-nexus-400 leading-relaxed">
          {description}
        </p>

        {actionLabel && onAction && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAction}
            className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-white px-5 py-2.5 text-sm font-semibold text-nexus-900 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:bg-nexus-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]"
          >
            <Plus className="h-4 w-4" />
            {actionLabel}
          </motion.button>
        )}

        {children && <div className="mt-8 w-full">{children}</div>}
      </motion.div>
    </div>
  )
}
