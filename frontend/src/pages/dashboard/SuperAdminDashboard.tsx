import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Users, UserCheck, CalendarDays, Wallet, ShieldCheck, Sparkles, AlertCircle,
  UserPlus, FileText, CreditCard, TrendingUp, Building2, ChevronRight,
  UserMinus, CheckCircle2, Briefcase, Eye, BarChart3, Bell, Zap,
  Crown, Lock, Unlock, LogOut as LogOutIcon, Key, Globe, Server,
  Activity, Shield, Settings, Database, Cpu, HardDrive, MonitorPlay
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { dashboardApi, type AdminDashboardResponse, type ExecutiveDashboardResponse } from '@/api/dashboard'
import { aiApi } from '@/api/ai'
import PageTransition from '@/components/animation/PageTransition'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

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

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [searchUserQuery, setSearchUserQuery] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const { data: dashboard, isLoading, isError } = useQuery<AdminDashboardResponse>({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardApi.getAdminDashboard,
    refetchInterval: 5000,
    staleTime: 2000,
  })

  const { data: execDashboard } = useQuery<ExecutiveDashboardResponse>({
    queryKey: ['dashboard', 'executive'],
    queryFn: dashboardApi.getExecutiveDashboard,
    staleTime: 10000,
  })

  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiApi.getInsights(3),
    staleTime: 5 * 60 * 1000,
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => import('@/api/employees').then(m => m.employeesApi.getAll({ size: 1000 })),
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
  const healthScore = execDashboard?.workforceHealthScore ?? 92

  const deptData = dashboard?.employeesByDepartment
    ? Object.entries(dashboard.employeesByDepartment).map(([name, count], i) => ({
        name,
        count,
        color: DEPT_COLORS[i % DEPT_COLORS.length]
      }))
    : []

  const totalPresentPercent = kpis?.totalEmployees
    ? ((kpis.presentToday / kpis.totalEmployees) * 100).toFixed(0)
    : '0'

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Supreme Header */}
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
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3 h-3" />
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-base text-nexus-400">
              Global system overview — Full administrative control
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-nexus-500">Live data</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/security/rbac" className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Access Control
          </Link>
          <Link to="/settings/platform" className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Platform Config
          </Link>
          <Link to="/settings/audit-logs" className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Audit Logs
          </Link>
        </div>
      </motion.div>

      {/* Workforce Health Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5 p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#healthGrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${healthScore * 2.51} 251`}
                />
                <defs>
                  <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{healthScore}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Workforce Health Score</h2>
              <p className="text-sm text-nexus-400 mt-1">
                Organization performing at {healthScore >= 90 ? 'excellent' : healthScore >= 70 ? 'good' : 'moderate'} levels across all departments
              </p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{kpis?.totalEmployees || 0}</p>
              <p className="text-[10px] text-nexus-400 uppercase tracking-wider font-semibold mt-1">Total Headcount</p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-emerald">{kpis?.activeEmployees || 0}</p>
              <p className="text-[10px] text-nexus-400 uppercase tracking-wider font-semibold mt-1">Active</p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-blue">{kpis?.totalDepartments || 0}</p>
              <p className="text-[10px] text-nexus-400 uppercase tracking-wider font-semibold mt-1">Departments</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Insights Banner */}
      {insights && insights.length > 0 && (
        <GlassCard className="p-5 border-l-4 border-l-accent-indigo" glow="indigo" delay={0.15}>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Total Employees"
          value={kpis?.totalEmployees ?? 0}
          previousValue={(kpis?.totalEmployees ?? 0) - (kpis?.newHiresThisMonth ?? 0)}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.2}
          subtitle={`${kpis?.activeEmployees || 0} active`}
        />
        <KPICard
          title="Present Today"
          value={kpis?.presentToday ?? 0}
          subtitle={`${totalPresentPercent}% attendance`}
          icon={<UserCheck className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-cyan to-accent-blue"
          delay={0.25}
        />
        <KPICard
          title="Pending Leaves"
          value={kpis?.pendingLeaveRequests ?? 0}
          subtitle={`${kpis?.approvedLeavesToday ?? 0} approved today`}
          icon={<CalendarDays className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-amber"
          delay={0.3}
        />
        <KPICard
          title="Monthly Payroll"
          value={dashboard?.payrollTrend?.length ? dashboard.payrollTrend[dashboard.payrollTrend.length - 1].amount : 0}
          format="currency"
          icon={<Wallet className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-success to-emerald-400"
          delay={0.35}
          isCurrency
        />
      </div>

      {/* Live Pulse Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'New Hires', value: kpis?.newHiresThisMonth ?? 0, icon: UserPlus, color: 'accent-emerald' },
          { label: 'On Notice', value: kpis?.onNoticeEmployees ?? 0, icon: UserMinus, color: 'accent-orange' },
          { label: 'Active Sessions', value: dashboard?.activeSessions ?? 0, icon: Globe, color: 'accent-blue' },
          { label: 'Reviews Due', value: kpis?.pendingReviews ?? 0, icon: TrendingUp, color: 'accent-violet' },
          { label: 'AI Insights', value: kpis?.activeInsights ?? 0, icon: Sparkles, color: 'accent-indigo' },
          { label: 'Failed Logins', value: dashboard?.failedLoginAttempts ?? 0, icon: Lock, color: 'danger' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trend — 8 cols */}
        <GlassCard className="lg:col-span-8 p-6 flex flex-col h-[380px]" delay={0.45}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Attendance Overview</h2>
              <p className="text-sm text-nexus-400">Monthly attendance rate with present/absent split</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
              <Activity className="h-3.5 w-3.5 text-accent-indigo" />
              <span className="text-xs font-medium text-nexus-300">
                {dashboard?.attendanceTrend?.length
                  ? `${(dashboard.attendanceTrend.reduce((a, b) => a + (b.rate || 0), 0) / dashboard.attendanceTrend.length).toFixed(1)}% avg`
                  : '0% avg'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {dashboard?.attendanceTrend && dashboard.attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="saAttGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} fill="url(#saAttGrad)" name="Rate %" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5">
                <Activity className="mb-2 h-8 w-8 text-nexus-600" />
                <p className="text-sm font-medium text-nexus-400">No attendance data available</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Department Distribution — 4 cols */}
        <GlassCard className="lg:col-span-4 p-6 flex flex-col" delay={0.5}>
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

      {/* Security Management Panel */}
      <GlassCard className="p-6 border border-amber-500/20" delay={0.55}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-400" />
              Security Command Center
            </h2>
            <p className="text-sm text-nexus-400">Manage user access, credentials, and monitor security events</p>
          </div>
          <Link to="/settings/security" className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Security Center
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-white/[0.07] transition-colors">
            <span className="text-2xl font-bold text-accent-blue">{dashboard?.activeSessions || 0}</span>
            <span className="text-xs text-nexus-400 mt-1 uppercase tracking-wider font-semibold">Active Sessions</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-white/[0.07] transition-colors">
            <span className="text-2xl font-bold text-danger">{dashboard?.failedLoginAttempts || 0}</span>
            <span className="text-xs text-nexus-400 mt-1 uppercase tracking-wider font-semibold">Failed Login Attempts</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-white/[0.07] transition-colors">
            <span className="text-2xl font-bold text-accent-violet">{dashboard?.lockedAccounts || 0}</span>
            <span className="text-xs text-nexus-400 mt-1 uppercase tracking-wider font-semibold">Locked Accounts</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-xs font-semibold text-nexus-400 uppercase tracking-wider">Select Target User</label>
            <select 
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 appearance-none transition-all"
            >
              <option value="" disabled>Select an employee with user account...</option>
              {employeesData?.content?.filter((emp: any) => emp.userId).map((emp: any) => (
                <option key={emp.userId} value={emp.userId} className="bg-background text-foreground">
                  {emp.fullName} ({emp.email}) - {emp.designation}
                </option>
              ))}
            </select>
            <p className="text-xs text-nexus-500">Select an employee to perform critical user actions on their account.</p>
          </div>
          
          <div className="space-y-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
            <label className="text-xs font-semibold text-nexus-400 uppercase tracking-wider">Execute Action</label>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
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
                <Lock className="w-4 h-4 inline mr-2" />
                Disable User (Lock Account)
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="w-full bg-accent-emerald/10 hover:bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/20 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
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
                  <Unlock className="w-3.5 h-3.5 inline mr-1.5" />
                  Unlock
                </button>
                <button 
                  className="w-full bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange border border-accent-orange/20 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
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
                  <LogOutIcon className="w-3.5 h-3.5 inline mr-1.5" />
                  Force Logout
                </button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-violet/50 transition-all"
                />
                <button 
                  className="px-4 bg-accent-violet/10 hover:bg-accent-violet/20 text-accent-violet border border-accent-violet/20 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
                  onClick={async () => {
                    if (!searchUserQuery || !newPassword) return
                    try {
                      const { authAdminApi } = await import('@/api/authAdmin')
                      await authAdminApi.forceChangePassword(searchUserQuery, newPassword)
                      setNewPassword('')
                      setActionMessage('Password reset successfully.')
                    } catch(e: any) {
                      setActionMessage(e.message || 'Action failed')
                    }
                  }}
                >
                  <Key className="w-3.5 h-3.5 inline mr-1.5" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 px-4 py-3 bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-sm rounded-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {actionMessage}
              <button onClick={() => setActionMessage('')} className="ml-auto text-accent-emerald/50 hover:text-accent-emerald transition-colors">✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Action Center + Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Center */}
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
            {!(kpis?.pendingLeaveRequests || kpis?.pendingReviews || kpis?.payrollsPending) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-3 bg-success/10 rounded-full mb-3"><CheckCircle2 className="w-6 h-6 text-success" /></div>
                <p className="text-sm font-medium text-nexus-300">All caught up!</p>
                <p className="text-xs text-nexus-500 mt-1">No items need attention</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Navigation */}
        <GlassCard className="p-6" delay={0.65}>
          <h3 className="text-lg font-bold text-white mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Employees', icon: Users, to: '/employees', color: 'accent-indigo' },
              { label: 'Payroll', icon: CreditCard, to: '/payroll', color: 'accent-emerald' },
              { label: 'Recruitment', icon: Briefcase, to: '/recruitment', color: 'accent-blue' },
              { label: 'Performance', icon: TrendingUp, to: '/performance', color: 'accent-violet' },
              { label: 'Analytics', icon: BarChart3, to: '/analytics', color: 'accent-cyan' },
              { label: 'AI Insights', icon: Sparkles, to: '/ai-insights', color: 'accent-indigo' },
              { label: 'Reports', icon: FileText, to: '/reports', color: 'accent-orange' },
              { label: 'Enterprise Hub', icon: Building2, to: '/enterprise', color: 'accent-emerald' },
              { label: 'RBAC Control', icon: Shield, to: '/security/rbac', color: 'amber' },
              { label: 'Platform Config', icon: Settings, to: '/settings/platform', color: 'accent-violet' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-${item.color}/30 transition-all group`}
                >
                  <Icon className={`w-4 h-4 text-${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-nexus-300 group-hover:text-white transition-colors">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
