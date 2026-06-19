import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, UserCheck, UserX, AlertTriangle, Loader2, LogIn, LogOut, CheckCircle2 } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { attendanceApi } from '@/api/attendance'
import { useAuthStore } from '@/store'
import { useToastStore } from '@/store/toast'

export default function AttendancePage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()

  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  
  const [activeTab, setActiveTab] = useState<'MY_ATTENDANCE' | 'COMPANY_ATTENDANCE'>('MY_ATTENDANCE')
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  
  const formattedDate = date.toISOString().split('T')[0]
  
  const { data: today, isLoading: isLoadingToday } = useQuery({
    queryKey: ['attendance', 'today', user?.employeeId],
    queryFn: () => attendanceApi.getTodayAttendance(user?.employeeId as string),
    enabled: !!user?.employeeId,
  })

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['attendance', 'summary', user?.employeeId, year, month],
    queryFn: () => attendanceApi.getMonthlySummary(user?.employeeId as string, year, month),
    enabled: !!user?.employeeId,
  })

  const { data: historyPage, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['attendance', 'history', user?.employeeId],
    queryFn: () => attendanceApi.getHistory(user?.employeeId as string, 0, 50),
    enabled: !!user?.employeeId && activeTab === 'MY_ATTENDANCE',
  })

  const { data: dailyReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ['attendance', 'daily', formattedDate],
    queryFn: () => attendanceApi.getDailyReport(formattedDate),
    enabled: !!user?.employeeId && isManager && activeTab === 'COMPANY_ATTENDANCE',
  })

  const clockInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(user?.employeeId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      addToast({
        title: 'Checked In',
        description: `Successfully clocked in at ${new Date().toLocaleTimeString()}`,
        type: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Error',
        description: 'Failed to clock in.',
        type: 'error',
      })
    }
  })

  const clockOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(user?.employeeId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      addToast({
        title: 'Checked Out',
        description: `Successfully clocked out at ${new Date().toLocaleTimeString()}`,
        type: 'success',
      })
    },
    onError: () => {
      addToast({
        title: 'Error',
        description: 'Failed to clock out.',
        type: 'error',
      })
    }
  })

  const logs = historyPage?.content || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'text-success'
      case 'LATE': return 'text-warning'
      case 'ABSENT': return 'text-danger'
      case 'LEAVE': return 'text-accent-indigo'
      case 'HALF_DAY': return 'text-accent-blue'
      default: return 'text-nexus-400'
    }
  }
  
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-success'
      case 'LATE': return 'bg-warning'
      case 'ABSENT': return 'bg-danger'
      case 'LEAVE': return 'bg-accent-indigo'
      case 'HALF_DAY': return 'bg-accent-blue'
      default: return 'bg-nexus-400'
    }
  }

  // Determine current clock state
  const isClockedIn = today?.checkInTime && !today?.checkOutTime
  const isClockedOut = today?.checkOutTime
  const hasRecordToday = !!today

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">Attendance</h1>
          <p className="text-sm text-nexus-400 mt-1">Track and manage your daily attendance</p>
        </div>
        
        {isManager && (
          <div className="flex bg-[#11111a] border border-white/10 rounded-lg overflow-hidden shrink-0">
            <button 
              onClick={() => setActiveTab('MY_ATTENDANCE')}
              className={`px-4 py-2 text-xs font-medium transition-colors border-r border-white/10 ${activeTab === 'MY_ATTENDANCE' ? 'bg-accent-indigo text-white' : 'text-nexus-400 hover:bg-white/[0.05] hover:text-white'}`}
            >
              My Attendance
            </button>
            <button 
              onClick={() => setActiveTab('COMPANY_ATTENDANCE')}
              className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === 'COMPANY_ATTENDANCE' ? 'bg-accent-indigo text-white' : 'text-nexus-400 hover:bg-white/[0.05] hover:text-white'}`}
            >
              Company Attendance
            </button>
          </div>
        )}
        
        {/* Clock In/Out Widget */}
        <GlassCard className="p-4 flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-nexus-400 uppercase tracking-wider font-semibold">Today's Status</span>
            <span className="text-lg font-bold text-nexus-50 flex items-center gap-3 mt-1">
              {isLoadingToday ? (
                <Loader2 className="h-4 w-4 animate-spin text-nexus-400" />
              ) : isClockedIn ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                  </span>
                  <span className="bg-gradient-to-r from-success to-emerald-400 bg-clip-text text-transparent">Active Session</span>
                </>
              ) : isClockedOut ? (
                <><CheckCircle2 className="h-4 w-4 text-success" /> Completed</>
              ) : (
                <><span className="h-2.5 w-2.5 rounded-full bg-nexus-500" /> Not Clocked In</>
              )}
            </span>
            {isClockedIn && today?.checkInTime && (
              <span className="text-xs text-nexus-400 mt-1">
                In: {new Date(today.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className="h-10 w-px bg-white/10" />

          <div className="flex gap-2">
            {!hasRecordToday && (
              <button 
                onClick={() => clockInMutation.mutate()} 
                disabled={clockInMutation.isPending}
                className="bg-success text-white hover:bg-success/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
              >
                {clockInMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4 mr-2" />}
                Clock In
              </button>
            )}
            
            {isClockedIn && (
              <button 
                onClick={() => clockOutMutation.mutate()} 
                disabled={clockOutMutation.isPending}
                className="border border-danger/50 text-danger hover:bg-danger/10 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2"
              >
                {clockOutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                Clock Out
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Days', value: summary?.totalDays || 0, icon: Clock, color: 'text-nexus-400' },
          { label: 'Present', value: summary?.presentDays || 0, icon: UserCheck, color: 'text-success' },
          { label: 'Absent', value: summary?.absentDays || 0, icon: UserX, color: 'text-danger' },
          { label: 'On Leave', value: summary?.leaveDays || 0, icon: AlertTriangle, color: 'text-accent-indigo' },
        ].map((stat, i) => (
          <GlassCard key={stat.label} className="p-5" delay={i * 0.05}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-nexus-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{isLoadingSummary ? '-' : stat.value}</p>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.color} opacity-50`} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'MY_ATTENDANCE' && (
          <GlassCard className="p-6 overflow-hidden flex flex-col" delay={0.25}>
            <h3 className="text-sm font-semibold text-nexus-100 mb-4 shrink-0">Your Recent Logs</h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 text-nexus-500 animate-spin" /></div>
              ) : logs.length === 0 ? (
                <p className="text-xs text-nexus-500 text-center py-4">No recent attendance logs.</p>
              ) : (
                logs.map((log: any, i: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-center justify-between rounded-[var(--radius-md)] p-3 bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-2.5 w-2.5 rounded-full ${getStatusBgColor(log.status)}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-nexus-200">
                          {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-nexus-500">
                            In: <span className="text-nexus-300">{log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                          </span>
                          <span className="text-xs text-nexus-500">
                            Out: <span className="text-nexus-300">{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-nexus-100">
                        {log.workHours ? `${log.workHours} hrs` : '-'}
                      </span>
                      <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        )}

        {activeTab === 'COMPANY_ATTENDANCE' && isManager && (
          <GlassCard className="p-0 overflow-hidden" delay={0.25}>
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-nexus-100">Daily Company Report</h3>
              <span className="text-xs text-nexus-400">{new Date(formattedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {['Employee', 'Date', 'Clock In', 'Clock Out', 'Hours', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-nexus-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoadingReport ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <Loader2 className="h-6 w-6 text-accent-indigo animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : !dailyReport || dailyReport.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-sm text-nexus-400">
                        No attendance records for today.
                      </td>
                    </tr>
                  ) : dailyReport.map((log: any, i: number) => (
                    <motion.tr key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-nexus-200">
                        <div className="flex items-center gap-3">
                           <div className={`h-2 w-2 rounded-full ${getStatusBgColor(log.status)}`} />
                           <div>
                             <p>{log.employeeName}</p>
                             <p className="text-[10px] text-nexus-500">{log.employeeCode}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-nexus-400">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-xs text-nexus-300">{log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td className="px-5 py-3.5 text-xs text-nexus-300">{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-nexus-100">{log.workHours ? `${log.workHours}h` : '-'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold tracking-wider ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  )
}
