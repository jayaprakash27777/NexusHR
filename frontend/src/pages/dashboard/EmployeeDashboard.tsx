import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  CalendarDays, Clock, CreditCard, Award, FileText, Target, ChevronRight, AlertCircle, Briefcase, Bell, CheckCircle, LogIn, LogOut
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import PageTransition from '@/components/animation/PageTransition'
import { Link } from 'react-router-dom'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.05] glass px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-nexus-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value}%</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[300px] w-full rounded-[var(--radius-2xl)]" />
        </div>
        <div>
          <Skeleton className="h-[300px] w-full rounded-[var(--radius-2xl)]" />
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'employee', user?.employeeId],
    queryFn: () => dashboardApi.getEmployeeDashboard(user?.employeeId!),
    enabled: !!user?.employeeId,
    refetchInterval: 60000,
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-danger" />
        <p className="text-nexus-300">Failed to load dashboard data. Please check connection.</p>
      </div>
    )
  }

  const kpis = dashboard

  const attendanceData = kpis?.attendanceTrend
    ? Object.entries(kpis.attendanceTrend).map(([week, rate]) => ({
        week,
        rate
      }))
    : []

  const hasCheckedIn = !!kpis?.checkInTime;

  return (
    <PageTransition className="space-y-6 h-full flex flex-col pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              {getGreeting()}, <span className="text-gradient">{user?.fullName || 'Employee'}</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-wider">
              {kpis?.designation || 'Employee'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-nexus-400">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" /> {kpis?.department || 'Your department'}
            </span>
            {kpis?.attendanceStatus && (
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                kpis.attendanceStatus === 'PRESENT' ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' :
                kpis.attendanceStatus === 'ABSENT' ? 'bg-accent-rose/10 text-accent-rose border-accent-rose/20' :
                kpis.attendanceStatus === 'ON_LEAVE' ? 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/20' :
                'bg-accent-orange/10 text-accent-orange border-accent-orange/20'
              }`}>
                {kpis.attendanceStatus}
              </span>
            )}
            {kpis?.unreadNotifications && kpis.unreadNotifications > 0 ? (
              <span className="flex items-center gap-1 text-accent-orange">
                <Bell className="w-4 h-4" /> {kpis.unreadNotifications} Unread
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          {!hasCheckedIn ? (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-blue/20 active:scale-95 text-sm">
              <LogIn className="w-4 h-4" /> Clock In
            </button>
          ) : (
             <button className="flex items-center gap-2 px-5 py-2.5 bg-accent-rose hover:bg-accent-rose/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-rose/20 active:scale-95 text-sm">
               <LogOut className="w-4 h-4" /> Clock Out
             </button>
          )}
          <Link to="/leaves" className="relative px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm backdrop-blur-md">
            Request Leave
            {kpis?.pendingLeaveRequests && kpis.pendingLeaveRequests > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-orange"></span>
              </span>
            ) : null}
          </Link>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Hours Worked Today"
          value={`${kpis?.workHoursToday || 0}h`}
          icon={<Clock className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-blue to-accent-cyan"
          delay={0.1}
        />
        <KPICard
          title="Leave Balance"
          value={`${kpis?.leaveBalances?.[0]?.remaining || 0} Days`}
          icon={<CalendarDays className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.15}
        />
        <KPICard
          title="Avg. Attendance"
          value={`${kpis?.attendancePercentage || 0}%`}
          icon={<Target className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.2}
        />
        <KPICard
          title="Performance"
          value={kpis?.latestPerformanceRating ? `${kpis.latestPerformanceRating}/5` : 'N/A'}
          icon={<Award className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-rose"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart & Today's Status */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Today's Status Card */}
          <GlassCard className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6" delay={0.3}>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white tracking-tight mb-1">Today's Status</h2>
              <p className="text-sm text-nexus-400">Track your daily working hours and attendance.</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                 <span className="text-xs text-nexus-400 mb-1 font-medium">Check In</span>
                 <span className="text-sm text-white font-semibold">{kpis?.checkInTime || '--:--'}</span>
               </div>
               <div className="h-8 w-px bg-white/10" />
               <div className="flex flex-col">
                 <span className="text-xs text-nexus-400 mb-1 font-medium">Check Out</span>
                 <span className="text-sm text-white font-semibold">{kpis?.checkOutTime || '--:--'}</span>
               </div>
               <div className="h-8 w-px bg-white/10 hidden sm:block" />
               <div className="hidden sm:flex flex-col">
                  <span className="text-xs text-nexus-400 mb-1 font-medium">Total Hours</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold">{kpis?.workHoursToday || 0}h</span>
                    {/* Progress bar visual for 8 hour workday */}
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-blue rounded-full" style={{ width: `${Math.min(((kpis?.workHoursToday || 0) / 8) * 100, 100)}%` }} />
                    </div>
                  </div>
               </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col h-[350px]" delay={0.4}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Attendance Trend</h2>
                <p className="text-sm text-nexus-400">Your attendance rate over the last 4 weeks</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{kpis?.attendancePercentage || 0}% Avg</span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `${val}%`} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#1a1b23', stroke: '#8b5cf6', strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Up Next & Documents */}
        <div className="flex flex-col gap-6">
          {/* Active Goals with Progress Bars */}
          <GlassCard className="p-6 flex-1 flex flex-col" delay={0.45}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white tracking-tight">Active Goals</h2>
              <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-nexus-300">
                {kpis?.activeGoals || 0} Open
              </div>
            </div>
            
            <div className="flex-1 space-y-5">
              {kpis?.upcomingGoals?.map((goal: any, idx: number) => {
                const progressNum = parseInt(goal.progress) || 0;
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-end mb-1.5">
                      <p className="text-sm font-medium text-white group-hover:text-accent-indigo transition-colors">{goal.title}</p>
                      <span className="text-xs font-semibold text-accent-indigo">{goal.progress}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-1.5">
                      <div 
                        className="h-full bg-gradient-to-r from-accent-indigo to-accent-violet rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progressNum}%` }} 
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-nexus-400">
                      <span>Due: {goal.dueDate}</span>
                      {progressNum === 100 && <span className="text-accent-emerald flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Completed</span>}
                    </div>
                  </div>
                )
              })}
              {!kpis?.upcomingGoals?.length && (
                <p className="text-sm text-nexus-400 text-center py-4">No active goals found.</p>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex-1 flex flex-col" delay={0.5}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white tracking-tight">Leave Balance</h2>
              <Link to="/leaves" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
                Apply <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
            
            {kpis?.leaveBalances && kpis.leaveBalances.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={kpis.leaveBalances.map((lb: any, i: number) => ({
                          name: lb.leaveType,
                          value: lb.remaining,
                          fill: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][i % 5]
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {kpis.leaveBalances.map((_: any, i: number) => (
                          <Cell key={i} fill={['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][i % 5]} stroke="transparent" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {kpis.leaveBalances.map((lb: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full shadow-lg" style={{ backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][i % 5], boxShadow: `0 0 10px ${['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][i % 5]}80` }} />
                        <span className="text-xs font-medium text-nexus-300 group-hover:text-white transition-colors">{lb.leaveType}</span>
                      </div>
                      <span className="text-xs font-bold text-white bg-white/5 px-2 py-0.5 rounded-md">{lb.remaining} <span className="text-nexus-400 font-normal">/ {lb.total}</span></span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-nexus-400 text-center py-4">No leave data.</p>
            )}
          </GlassCard>

          <GlassCard className="p-6 flex-1 flex flex-col" delay={0.55}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Documents</h2>
              <Link to="/documents" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
            
            <ul className="space-y-3 flex-1">
              {kpis?.recentDocuments?.map((doc: any, i: number) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all group cursor-pointer">
                  <div className="p-2.5 bg-accent-rose/10 text-accent-rose rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-accent-rose transition-colors">{doc.name}</p>
                    <p className="text-xs text-nexus-400">{doc.date} • {doc.type}</p>
                  </div>
                </li>
              ))}
              {!kpis?.recentDocuments?.length && (
                <p className="text-sm text-nexus-400 text-center py-4">No recent documents.</p>
              )}
            </ul>
          </GlassCard>
        </div>
      </div>
      
      {/* Announcements Section */}
      <div className="h-[400px] mt-2">
        <AnnouncementsWidget />
      </div>
    </PageTransition>
  )
}
