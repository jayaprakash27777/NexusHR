import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { PresenceStatus } from '@/store/chat'

interface PresenceBadgeProps {
  status: PresenceStatus
  className?: string
  showLabel?: boolean
}

const statusConfig: Record<PresenceStatus, { color: string; bg: string; label: string }> = {
  ONLINE: { color: 'bg-success', bg: 'bg-success/20', label: 'Online' },
  AWAY: { color: 'bg-warning', bg: 'bg-warning/20', label: 'Away' },
  OFFLINE: { color: 'bg-nexus-500', bg: 'bg-nexus-500/20', label: 'Offline' },
  MEETING: { color: 'bg-accent-violet', bg: 'bg-accent-violet/20', label: 'In Meeting' },
}

export default function PresenceBadge({ status, className, showLabel = false }: PresenceBadgeProps) {
  const config = statusConfig[status] || statusConfig.OFFLINE

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative flex h-2.5 w-2.5 items-center justify-center">
        <motion.div
          className={cn('absolute inset-0 rounded-full', config.color)}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {status === 'ONLINE' && (
          <motion.div
            className={cn('absolute inset-0 rounded-full', config.bg)}
            animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium tracking-wide text-nexus-400 uppercase">
          {config.label}
        </span>
      )}
    </div>
  )
}
