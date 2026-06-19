import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import GlassCard from '@/components/ui/GlassCard'
import { Bell, CheckCheck, Trash2, Clock, CalendarDays, Wallet, TrendingUp, Sparkles, Loader2, Users, AlertCircle } from 'lucide-react'
import { notificationsApi } from '@/api/notifications'
import { formatDistanceToNow } from '@/lib/dateUtils'
import PageTransition from '@/components/animation/PageTransition'

const typeIcons: Record<string, typeof Bell> = {
  LEAVE_REQUEST: CalendarDays,
  LEAVE_APPROVED: CalendarDays,
  LEAVE_REJECTED: CalendarDays,
  REVIEW_DUE: TrendingUp,
  REVIEW_COMPLETED: TrendingUp,
  PAYROLL_GENERATED: Wallet,
  GOAL_ASSIGNED: Sparkles,
  EMPLOYEE_CREATED: Users,
  EMPLOYEE_UPDATED: Users,
  SYSTEM: AlertCircle,
  ANNOUNCEMENT: Bell,
  ROLE_CHANGE: Users,
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { page: 0 }],
    queryFn: () => notificationsApi.getAll({ page: 0, size: 50 }),
  })

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const clearAllMutation = useMutation({
    mutationFn: notificationsApi.clearAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id)
    }
  }

  const notifications = data?.content || []

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">Notifications</h1>
          <p className="text-sm text-nexus-400 mt-1">Stay updated with alerts and activities</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || notifications.length === 0}
            className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-nexus-400 hover:bg-white/[0.05] transition-colors disabled:opacity-50"
          >
            {markAllAsReadMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            Mark all read
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to clear all notifications?')) {
                clearAllMutation.mutate()
              }
            }}
            disabled={clearAllMutation.isPending || notifications.length === 0}
            className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            {clearAllMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Clear all
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-accent-indigo animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Bell className="h-8 w-8 text-nexus-600 mx-auto mb-3" />
            <p className="text-nexus-400">You're all caught up!</p>
            <p className="text-xs text-nexus-500 mt-1">No new notifications.</p>
          </GlassCard>
        ) : (
          notifications.map((notif, i) => {
            const Icon = typeIcons[notif.type] || Bell
            return (
              <motion.div 
                key={notif.id} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleMarkAsRead(notif.id, notif.isRead)}
                className={!notif.isRead ? "cursor-pointer" : ""}
              >
                <GlassCard className={`p-4 transition-all ${!notif.isRead ? 'border-accent-indigo/30 bg-accent-indigo/[0.03] shadow-[0_0_15px_rgba(99,102,241,0.05)]' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] ${!notif.isRead ? 'bg-accent-indigo/10 text-accent-indigo' : 'bg-white/[0.04] text-nexus-500'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-medium ${!notif.isRead ? 'text-nexus-50' : 'text-nexus-400'}`}>{notif.title}</h3>
                        {!notif.isRead && <div className="h-1.5 w-1.5 rounded-full bg-accent-indigo" />}
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed ${!notif.isRead ? 'text-nexus-300' : 'text-nexus-500'}`}>{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-nexus-600 flex-shrink-0">
                      {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })
        )}
      </div>
    </PageTransition>
  )
}
