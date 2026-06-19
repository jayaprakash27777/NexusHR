import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeStore } from '@/store'
import { CheckCircle, Clock, Wallet, TrendingUp, UserPlus, Award } from 'lucide-react'

const iconMap: Record<string, any> = {
  CHECK_IN: Clock,
  LEAVE_APPROVED: CheckCircle,
  PAYROLL_GENERATED: Wallet,
  REVIEW_COMPLETED: TrendingUp,
  ONBOARDING: UserPlus,
  PROMOTION: Award,
}

const colorMap: Record<string, string> = {
  CHECK_IN: 'text-success bg-success/10 border-success/20',
  LEAVE_APPROVED: 'text-accent-indigo bg-accent-indigo/10 border-accent-indigo/20',
  PAYROLL_GENERATED: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
  REVIEW_COMPLETED: 'text-accent-violet bg-accent-violet/10 border-accent-violet/20',
  ONBOARDING: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
  PROMOTION: 'text-warning bg-warning/10 border-warning/20',
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return 'Yesterday'
}

export default function LiveActivityFeed() {
  const activityStream = useRealtimeStore((s) => s.activityStream)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Live Indicator */}
      <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-full bg-nexus-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-success shadow-lg backdrop-blur-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
        </span>
        Live Stream
      </div>

      <div ref={containerRef} className="h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="relative pl-3">
          {/* Vertical Timeline Line */}
          <div className="absolute bottom-0 left-[21px] top-4 w-[1px] bg-gradient-to-b from-white/10 to-transparent" />

          <AnimatePresence initial={false}>
            {activityStream.map((activity, index) => {
              const Icon = iconMap[activity.type] || Clock
              const colorClass = colorMap[activity.type] || 'text-nexus-400 bg-white/[0.04] border-white/10'

              return (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{
                    opacity: { duration: 0.3 },
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                  }}
                  className="relative mb-5 flex items-start gap-4 last:mb-0"
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border bg-nexus-900 shadow-md">
                    <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${colorClass}`}>
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="group flex-1 rounded-[var(--radius-lg)] border border-white/[0.04] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {activity.avatar ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 text-[9px] font-bold text-nexus-100 flex-shrink-0">
                            {activity.avatar}
                          </div>
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-accent-indigo flex-shrink-0" />
                        )}
                        <p className="truncate text-xs font-medium text-nexus-200">
                          {activity.user}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-[10px] text-nexus-500">
                        {timeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-nexus-400 leading-relaxed">
                      {activity.message}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
