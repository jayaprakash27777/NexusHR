import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import { useRealtimeStore } from '@/store/realtime'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Users, UserCheck, CalendarDays, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, Sparkles, AlertCircle,
  UserPlus, FileText, CreditCard, TrendingUp, Clock, Building2,
  ChevronRight, UserMinus, CheckCircle2, XCircle, Briefcase, Eye,
  BarChart3, Bell, Zap
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import DeviceActivityWidget from '@/components/ui/DeviceActivityWidget'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ComposedChart, Line
} from 'recharts'
import { dashboardApi, type AdminDashboardResponse } from '@/api/dashboard'
import { aiApi } from '@/api/ai'
import PageTransition from '@/components/animation/PageTransition'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10b981',
  ON_NOTICE: '#f59e0b',
  TERMINATED: '#ef4444',
  PROBATION: '#8b5cf6',
  ON_LEAVE: '#3b82f6',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.05] glass px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-nexus-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || '#fff' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
        </p>
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
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

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [chartView, setChartView] = useState<'attendance' | 'payroll'>('attendance')
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const handleSearchUser = async () => {
    try {
      // Simulate search by just resolving to something if there's text, 
      // or we can use employees API, but we just want the ID. 
      // For a real app, you'd use a useQuery or an API call to search.
      // Assuming we have employeeAPI or we just fetch from dashboard.
      // We will just let the user type a UUID for now, or assume the selectedUser is handled.
    } catch (e) {}
  }

  const { data: dashboard, isLoading, isError } = useQuery<AdminDashboardResponse>({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardApi.getAdminDashboard,
    refetchInterval: 5000,
    staleTime: 2000,
  })

  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiApi.getInsights(3),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-danger" />
        <p className="text-nexus-300">Failed to load dashboard data. Please check that the backend is running.</p>
      </div>
    )
  }

  const kpis = dashboard
  const activityStream = dashboard?.recentActivity || []
  const deptData = dashboard?.employeesByDepartment
    ? Object.entries(dashboard.employeesByDepartment).map(([name, count], i) => ({
        name,
        count,
        color: DEPT_COLORS[i % DEPT_COLORS.length]
      }))
    : []

  const statusData = dashboard?.employeesByStatus
    ? Object.entries(dashboard.employeesByStatus).map(([name, count]) => ({
        name: name.replace('_', ' '),
        value: count,
        color: STATUS_COLORS[name] || '#737373'
      }))
    : []

  const avgAttendance = dashboard?.attendanceTrend?.length
    ? (dashboard.attendanceTrend.reduce((a, b) => a + (b.rate || 0), 0) / dashboard.attendanceTrend.length).toFixed(1)
    : '0'

  const totalPresentPercent = kpis?.totalEmployees
    ? ((kpis.presentToday / kpis.totalEmployees) * 100).toFixed(0)
    : '0'

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header with live status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              {getGreeting()}, <span className="text-gradient">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-accent-violet text-xs font-bold uppercase tracking-wider">
              Administrator
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-base text-nexus-400">
              Organization overview across {kpis?.totalDepartments || 0} departments
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-nexus-500">Live data</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/employees" className="px-4 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-indigo/20 active:scale-95 text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Link>
          <Link to="/payroll" className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payroll
          </Link>
          <Link to="/reports" className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports
          </Link>
        </div>
      </motion.div>

      {/* AI Insights Banner */}
      {insights && insights.length > 0 && (
        <GlassCard className="p-5 border-l-4 border-l-accent-indigo" glow="indigo" delay={0.05}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-indigo/10 flex-shrink-0 border border-accent-indigo/20">
              <Sparkles className="h-5 w-5 text-accent-indigo" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground tracking-tight mb-1">AI Executive Insight</h3>
              <p className="text-sm text-muted truncate">
                {insights[0].description}
              </p>
            </div>
            <Link
              to="/ai-insights"
              className="flex-shrink-0 w-full sm:w-auto rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-white/10 flex items-center gap-2 justify-center"
            >
              <Eye className="w-3.5 h-3.5" />
              View Full Report
            </Link>
          </div>
        </GlassCard>
      )}

      {/* KPI Cards — Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Total Employees"
          value={kpis?.totalEmployees ?? 0}
          previousValue={(kpis?.totalEmployees ?? 0) - (kpis?.newHiresThisMonth ?? 0)}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.1}
          subtitle={`${kpis?.activeEmployees || 0} active`}
        />
        <KPICard
          title="Present Today"
          value={kpis?.presentToday ?? 0}
          subtitle={`${totalPresentPercent}% attendance`}
          icon={<UserCheck className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-cyan to-accent-blue"
          delay={0.15}
        />
        <KPICard
          title="Pending Leaves"
          value={kpis?.pendingLeaveRequests ?? 0}
          subtitle={`${kpis?.approvedLeavesToday ?? 0} approved today`}
          icon={<CalendarDays className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-amber"
          delay={0.2}
        />
        <KPICard
          title="Monthly Payroll"
          value={dashboard?.payrollTrend?.length ? dashboard.payrollTrend[dashboard.payrollTrend.length - 1].amount : 0}
          format="currency"
          icon={<Wallet className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-success to-emerald-400"
          delay={0.25}
          isCurrency
        />
      </div>

      {/* Live Pulse Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'New Hires', value: kpis?.newHiresThisMonth ?? 0, icon: UserPlus, color: 'accent-emerald' },
          { label: 'On Notice', value: kpis?.onNoticeEmployees ?? 0, icon: UserMinus, color: 'accent-orange' },
          { label: 'Payrolls Paid', value: kpis?.payrollsPaid ?? 0, icon: CheckCircle2, color: 'success' },
          { label: 'Reviews Due', value: kpis?.pendingReviews ?? 0, icon: TrendingUp, color: 'accent-violet' },
          { label: 'AI Insights', value: kpis?.activeInsights ?? 0, icon: Sparkles, color: 'accent-indigo' },
          { label: 'Notifications', value: kpis?.unreadNotifications ?? 0, icon: Bell, color: 'accent-blue' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all group"
            >
              <div className={`p-2 rounded-lg bg-${stat.color}/10 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 text-${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
                <p className="text-[10px] text-nexus-500 mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary Chart — 8 cols with toggle */}
        <GlassCard className="lg:col-span-8 p-6 flex flex-col h-[380px]" delay={0.35}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {chartView === 'attendance' ? 'Attendance Overview' : 'Payroll Trend'}
              </h2>
              <p className="text-sm text-nexus-400">
                {chartView === 'attendance' ? 'Monthly attendance rate with present/absent split' : 'Monthly payroll expenditure'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Chart toggle */}
              <div className="flex rounded-lg bg-white/[0.03] border border-white/[0.06] p-0.5">
                <button
                  onClick={() => setChartView('attendance')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    chartView === 'attendance' ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30' : 'text-nexus-400 hover:text-white'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setChartView('payroll')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    chartView === 'payroll' ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30' : 'text-nexus-400 hover:text-white'
                  }`}
                >
                  Payroll
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
                <Activity className="h-3.5 w-3.5 text-accent-indigo" />
                <span className="text-xs font-medium text-nexus-300">
                  {chartView === 'attendance' ? `${avgAttendance}% avg` : `${dashboard?.payrollTrend?.length || 0} months`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">
              {chartView === 'attendance' ? (
                dashboard?.attendanceTrend && dashboard.attendanceTrend.length > 0 ? (
                  <motion.div key="attendance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dashboard.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} fill="url(#attendanceGradient)" name="Rate %" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                        <Bar dataKey="present" fill="#10b981" fillOpacity={0.3} barSize={16} radius={[4, 4, 0, 0]} name="Present" />
                        <Bar dataKey="absent" fill="#f43f5e" fillOpacity={0.3} barSize={16} radius={[4, 4, 0, 0]} name="Absent" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5">
                    <Activity className="mb-2 h-8 w-8 text-nexus-600" />
                    <p className="text-sm font-medium text-nexus-400">No attendance data available</p>
                  </div>
                )
              ) : (
                dashboard?.payrollTrend && dashboard.payrollTrend.length > 0 ? (
                  <motion.div key="payroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboard.payrollTrend} barSize={28} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="amount" fill="url(#payrollGradient)" radius={[6, 6, 0, 0]} name="Payroll" animationDuration={1200} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5">
                    <Wallet className="mb-2 h-8 w-8 text-nexus-600" />
                    <p className="text-sm font-medium text-nexus-400">No payroll data available</p>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Department Distribution — 4 cols */}
        <GlassCard className="lg:col-span-4 p-6 flex flex-col" delay={0.4}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Departments</h2>
              <p className="text-sm text-nexus-400">{kpis?.totalDepartments || 0} departments</p>
            </div>
            <Link to="/employees" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          {deptData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={deptData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                      animationDuration={1200}
                    >
                      {deptData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 pr-1">
                {deptData.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                    <span className="text-[11px] text-nexus-400 truncate flex-1">{dept.name}</span>
                    <span className="text-[11px] font-medium text-nexus-300">{dept.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-1 w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 mt-4">
              <Users className="mb-2 h-8 w-8 text-nexus-600" />
              <p className="text-sm font-medium text-nexus-400">No department data</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Secondary Row — Status, Activity, Quick Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Employee Status Breakdown — 4 cols */}
        <GlassCard className="lg:col-span-4 p-6" delay={0.45}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Employee Status</h2>
            <p className="text-sm text-nexus-400">Current workforce distribution</p>
          </div>
          {statusData.length > 0 ? (
            <div className="space-y-3">
              {statusData.map((status, i) => {
                const pct = kpis?.totalEmployees ? Math.round((status.value / kpis.totalEmployees) * 100) : 0
                return (
                  <motion.div
                    key={status.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                    <span className="text-xs text-nexus-400 flex-1 capitalize">{status.name.toLowerCase()}</span>
                    <span className="text-xs font-bold text-white mr-2">{status.value}</span>
                    <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: status.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="text-[10px] text-nexus-500 w-8 text-right">{pct}%</span>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-nexus-500 text-sm">No status data</div>
          )}
        </GlassCard>

        {/* Recent Activity — 4 cols */}
        <GlassCard className="lg:col-span-4 p-6 flex flex-col h-[360px]" delay={0.5}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Activity</h2>
            <Link to="/notifications" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activityStream.map((item, i) => {
              const typeColors: Record<string, string> = {
                CHECK_IN: 'bg-accent-cyan/10 text-accent-cyan',
                LEAVE_APPROVED: 'bg-accent-orange/10 text-accent-orange',
                REVIEW_COMPLETED: 'bg-accent-violet/10 text-accent-violet',
                PAYROLL_GENERATED: 'bg-success/10 text-success',
                EMPLOYEE_CREATED: 'bg-accent-blue/10 text-accent-blue',
                ONBOARDING: 'bg-nexus-500/10 text-nexus-400',
                PROMOTION: 'bg-accent-indigo/10 text-accent-indigo',
              }
              const colorClass = typeColors[item.type] || 'bg-nexus-500/10 text-nexus-400'
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.03] group"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${colorClass.split(' ')[0]} flex-shrink-0`}>
                    <span className="text-[10px] font-bold">{item.user.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-nexus-200 truncate">{item.user}</p>
                    <p className="text-[11px] text-nexus-500 truncate">{item.message}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] text-nexus-600">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded-md ${colorClass}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              )
            })}
            {activityStream.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse mb-3" />
                <p className="text-sm font-medium text-nexus-400">Listening for live events...</p>
                <p className="text-xs text-nexus-500 mt-1">Activity will appear here in real-time</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Navigation — 4 cols */}
        <div className="lg:col-span-4 space-y-4">
          {/* System Health */}
          <GlassCard className="p-5 border-l-4 border-l-success" glow="indigo" delay={0.52}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 flex-shrink-0 border border-success/20">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">System Healthy</h3>
                <p className="text-xs text-muted">All {kpis?.totalDepartments || 0} departments operational</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
                <span className="text-sm font-bold text-success">100%</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Nav Grid */}
          <GlassCard className="p-5" delay={0.55}>
            <h3 className="text-sm font-bold text-white mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Employees', icon: Users, to: '/employees', color: 'accent-indigo' },
                { label: 'Recruitment', icon: Briefcase, to: '/recruitment', color: 'accent-blue' },
                { label: 'Performance', icon: TrendingUp, to: '/performance', color: 'accent-violet' },
                { label: 'Analytics', icon: BarChart3, to: '/analytics', color: 'accent-cyan' },
                { label: 'AI Insights', icon: Sparkles, to: '/ai-insights', color: 'accent-indigo' },
                { label: 'Access Control', icon: ShieldCheck, to: '/security/rbac', color: 'accent-emerald' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-${item.color}/30 transition-all group`}
                  >
                    <Icon className={`w-4 h-4 text-${item.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-nexus-300 group-hover:text-white transition-colors">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </GlassCard>

          {/* Today's Snapshot */}
          <GlassCard className="p-5" delay={0.58}>
            <h3 className="text-sm font-bold text-white mb-3">Today's Snapshot</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-xs text-nexus-400">Present</span>
                </div>
                <span className="text-xs font-bold text-white">{kpis?.presentToday ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                  <span className="text-xs text-nexus-400">Absent</span>
                </div>
                <span className="text-xs font-bold text-white">{kpis?.absentToday ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
                  <span className="text-xs text-nexus-400">On Leave (Approved)</span>
                </div>
                <span className="text-xs font-bold text-white">{kpis?.approvedLeavesToday ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-violet" />
                  <span className="text-xs text-nexus-400">Avg Performance</span>
                </div>
                <span className="text-xs font-bold text-accent-violet">{kpis?.averagePerformanceRating?.toFixed(1) ?? '0.0'}/5</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bottom Row — Device Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceActivityWidget devices={dashboard?.deviceActivity || []} />
        
        {/* Critical Alerts */}
        <GlassCard className="p-6" delay={0.6}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Action Center</h2>
              <p className="text-sm text-nexus-400">Items requiring attention</p>
            </div>
          </div>
          <div className="space-y-3">
            {kpis?.pendingLeaveRequests && kpis.pendingLeaveRequests > 0 && (
              <Link to="/leaves" className="flex items-center gap-3 p-3 rounded-xl bg-accent-orange/5 border border-accent-orange/20 hover:bg-accent-orange/10 transition-all group">
                <div className="p-2 bg-accent-orange/10 rounded-lg"><CalendarDays className="w-4 h-4 text-accent-orange" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{kpis.pendingLeaveRequests} Leave Requests</p>
                  <p className="text-xs text-nexus-400">Awaiting approval</p>
                </div>
                <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            )}
            {kpis?.pendingReviews && kpis.pendingReviews > 0 && (
              <Link to="/performance" className="flex items-center gap-3 p-3 rounded-xl bg-accent-violet/5 border border-accent-violet/20 hover:bg-accent-violet/10 transition-all group">
                <div className="p-2 bg-accent-violet/10 rounded-lg"><TrendingUp className="w-4 h-4 text-accent-violet" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{kpis.pendingReviews} Performance Reviews</p>
                  <p className="text-xs text-nexus-400">Due this cycle</p>
                </div>
                <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            )}
            {kpis?.payrollsPending && kpis.payrollsPending > 0 && (
              <Link to="/payroll" className="flex items-center gap-3 p-3 rounded-xl bg-accent-blue/5 border border-accent-blue/20 hover:bg-accent-blue/10 transition-all group">
                <div className="p-2 bg-accent-blue/10 rounded-lg"><Wallet className="w-4 h-4 text-accent-blue" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{kpis.payrollsPending} Payrolls Pending</p>
                  <p className="text-xs text-nexus-400">Awaiting processing</p>
                </div>
                <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            )}
            {kpis?.criticalInsights && kpis.criticalInsights > 0 && (
              <Link to="/ai-insights" className="flex items-center gap-3 p-3 rounded-xl bg-danger/5 border border-danger/20 hover:bg-danger/10 transition-all group">
                <div className="p-2 bg-danger/10 rounded-lg"><Zap className="w-4 h-4 text-danger" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{kpis.criticalInsights} Critical Insights</p>
                  <p className="text-xs text-nexus-400">AI-detected issues</p>
                </div>
                <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            )}
            {(kpis?.onNoticeEmployees ?? 0) > 0 && (
              <Link to="/employees" className="flex items-center gap-3 p-3 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20 hover:bg-accent-emerald/10 transition-all group">
                <div className="p-2 bg-accent-emerald/10 rounded-lg"><UserMinus className="w-4 h-4 text-accent-emerald" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{kpis?.onNoticeEmployees} On Notice Period</p>
                  <p className="text-xs text-nexus-400">Plan replacements</p>
                </div>
                <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            )}
            {!(kpis?.pendingLeaveRequests || kpis?.pendingReviews || kpis?.payrollsPending || kpis?.criticalInsights || kpis?.onNoticeEmployees) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 bg-success/10 rounded-full mb-3"><CheckCircle2 className="w-6 h-6 text-success" /></div>
                <p className="text-sm font-medium text-nexus-300">All caught up!</p>
                <p className="text-xs text-nexus-500 mt-1">No items need attention</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Super Admin Quick Actions */}
      {user?.role === 'SUPER_ADMIN' && (
        <GlassCard className="p-6 mt-6 border border-danger/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-danger" />
                1. Security Management (Mandatory)
              </h2>
              <p className="text-sm text-nexus-400">Directly manage user access, credentials, and monitor security</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-accent-blue">{dashboard?.activeSessions || 0}</span>
              <span className="text-xs text-nexus-400 mt-1 uppercase tracking-wider font-semibold">Active Sessions</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-danger">{dashboard?.failedLoginAttempts || 0}</span>
              <span className="text-xs text-nexus-400 mt-1 uppercase tracking-wider font-semibold">Failed Login Attempts</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-accent-violet">{dashboard?.lockedAccounts || 0}</span>
              <span className="text-xs text-nexus-400 mt-1 uppercase tracking-wider font-semibold">Locked Accounts</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold text-nexus-400 uppercase tracking-wider">Target User UUID</label>
              <input 
                type="text" 
                placeholder="Enter User UUID (e.g. 123e4567-e89b-12d3...)" 
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-nexus-500 focus:outline-none focus:border-danger/50 focus:ring-1 focus:ring-danger/50"
              />
              <p className="text-xs text-nexus-500">Provide the exact user UUID to perform critical actions.</p>
            </div>
            
            <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
              <label className="text-xs font-semibold text-nexus-400 uppercase tracking-wider">Execute Action</label>
              <div className="flex flex-col gap-3">
                <button 
                  className="w-full bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 py-2.5 rounded-lg font-semibold text-sm transition-all"
                  onClick={async () => {
                    if (!searchUserQuery) return
                    try {
                      const { authAdminApi } = await import('@/api/authAdmin')
                      await authAdminApi.toggleUserAccess(searchUserQuery, false)
                      setActionMessage('Access successfully revoked (Disabled User).')
                      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] })
                    } catch(e: any) {
                      setActionMessage(e.message || 'Action failed')
                    }
                  }}
                >
                  Disable User (Lock Account)
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="w-full bg-accent-emerald/10 hover:bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/20 py-2.5 rounded-lg font-semibold text-sm transition-all"
                    onClick={async () => {
                      if (!searchUserQuery) return
                      try {
                        const { authAdminApi } = await import('@/api/authAdmin')
                        await authAdminApi.toggleUserAccess(searchUserQuery, true)
                        setActionMessage('Account unlocked successfully.')
                        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] })
                      } catch(e: any) {
                        setActionMessage(e.message || 'Action failed')
                      }
                    }}
                  >
                    Unlock Account
                  </button>
                  <button 
                    className="w-full bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange border border-accent-orange/20 py-2.5 rounded-lg font-semibold text-sm transition-all"
                    onClick={async () => {
                      if (!searchUserQuery) return
                      try {
                        const { authAdminApi } = await import('@/api/authAdmin')
                        await authAdminApi.forceLogout(searchUserQuery)
                        setActionMessage('Force Logout triggered successfully.')
                        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] })
                      } catch(e: any) {
                        setActionMessage(e.message || 'Action failed')
                      }
                    }}
                  >
                    Force Logout
                  </button>
                  <button 
                    className="w-full bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/20 py-2.5 rounded-lg font-semibold text-sm transition-all"
                    onClick={async () => {
                      if (!searchUserQuery) return
                      try {
                        const { authAdminApi } = await import('@/api/authAdmin')
                        await authAdminApi.toggleMfa(searchUserQuery, true)
                        setActionMessage('MFA Enabled for user.')
                        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] })
                      } catch(e: any) {
                        setActionMessage(e.message || 'Action failed')
                      }
                    }}
                  >
                    Enable MFA
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none focus:border-accent-violet/50"
                  />
                  <button 
                    className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 rounded-lg font-medium text-sm transition-all"
                    onClick={async () => {
                      if (!searchUserQuery || !newPassword) return
                      try {
                        const { authAdminApi } = await import('@/api/authAdmin')
                        await authAdminApi.forceChangePassword(searchUserQuery, newPassword)
                        setActionMessage('Password forcibly reset.')
                        setNewPassword('')
                        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] })
                      } catch(e: any) {
                        setActionMessage(e.message || 'Action failed')
                      }
                    }}
                  >
                    Reset
                  </button>
                </div>
                {actionMessage && <p className="text-xs text-accent-blue mt-1">{actionMessage}</p>}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Super Admin - User & Employee Management */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="space-y-6 mt-6">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-accent-blue" />
            2. User & Employee Management
          </h2>
          
          {/* Quick Actions Grid */}
          <GlassCard className="p-6">
            <h3 className="text-md font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'Add Employee', icon: UserPlus, color: 'accent-emerald' },
                { label: 'Add Admin', icon: ShieldCheck, color: 'accent-violet' },
                { label: 'Create Department', icon: Building2, color: 'accent-blue' },
                { label: 'Create Team', icon: Users, color: 'accent-cyan' },
                { label: 'Assign Manager', icon: UserCheck, color: 'accent-indigo' },
                { label: 'Bulk Import Employees', icon: ArrowDownRight, color: 'success' },
                { label: 'Bulk Export Employees', icon: ArrowUpRight, color: 'nexus-400' },
                { label: 'Deactivate Employee', icon: UserMinus, color: 'danger' },
                { label: 'Reset Password', icon: Zap, color: 'accent-orange' },
              ].map((action, i) => {
                const Icon = action.icon
                const toPath = action.label === 'Create Department' || action.label === 'Create Team' ? '/enterprise' 
                  : action.label === 'Add Admin' || action.label === 'Reset Password' ? '/security/rbac'
                  : action.label === 'Bulk Export Employees' ? '/reports'
                  : '/employees'
                return (
                  <Link
                    key={action.label}
                    to={toPath}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-${action.color}/10 hover:border-${action.color}/30 transition-all group`}
                  >
                    <Icon className={`w-5 h-5 text-${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs text-center font-medium text-nexus-300 group-hover:text-white">{action.label}</span>
                  </Link>
                )
              })}
            </div>
          </GlassCard>

          {/* Employee Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recently Joined */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Recently Joined Employees</h3>
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
              <div className="space-y-3">
                {dashboard?.recentlyJoinedEmployees?.length ? dashboard.recentlyJoinedEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{emp.name}</p>
                      <p className="text-[10px] text-nexus-400 truncate">{emp.designation} • {emp.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-nexus-300">{emp.joiningDate}</p>
                      <p className="text-[10px] text-accent-emerald">{emp.status}</p>
                    </div>
                  </div>
                )) : <p className="text-xs text-nexus-500 text-center py-4">No recent hires</p>}
              </div>
            </GlassCard>

            {/* Recently Resigned / Terminated */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Recently Resigned</h3>
                <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full font-medium">Inactive</span>
              </div>
              <div className="space-y-3">
                {dashboard?.recentlyResignedEmployees?.length ? dashboard.recentlyResignedEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{emp.name}</p>
                      <p className="text-[10px] text-nexus-400 truncate">{emp.designation} • {emp.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-nexus-300">{emp.joiningDate}</p>
                      <p className="text-[10px] text-danger">{emp.status}</p>
                    </div>
                  </div>
                )) : <p className="text-xs text-nexus-500 text-center py-4">No recent resignations</p>}
              </div>
            </GlassCard>

            {/* On Probation */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Employees on Probation</h3>
                <span className="text-xs bg-accent-violet/10 text-accent-violet px-2 py-0.5 rounded-full font-medium">Review Due</span>
              </div>
              <div className="space-y-3">
                {dashboard?.employeesOnProbation?.length ? dashboard.employeesOnProbation.map((emp) => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{emp.name}</p>
                      <p className="text-[10px] text-nexus-400 truncate">{emp.designation} • {emp.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-nexus-300">Joined: {emp.joiningDate}</p>
                      <p className="text-[10px] text-accent-violet">Evaluating</p>
                    </div>
                  </div>
                )) : <p className="text-xs text-nexus-500 text-center py-4">No employees on probation</p>}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Announcements Section */}
      <div className="h-[400px] mt-6">
        <AnnouncementsWidget />
      </div>

    </PageTransition>
  )
}
