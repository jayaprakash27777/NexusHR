import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Users, UserCheck, CalendarDays, Wallet,
  ArrowUpRight, Activity, ShieldCheck, Sparkles, AlertCircle
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import DeviceActivityWidget from '@/components/ui/DeviceActivityWidget'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { dashboardApi, type AdminDashboardResponse } from '@/api/dashboard'
import { aiApi } from '@/api/ai'
import PageTransition from '@/components/animation/PageTransition'

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.05] glass px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-nexus-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value?.toLocaleString('en-IN')}</p>
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
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading, isError } = useQuery<AdminDashboardResponse>({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardApi.getAdminDashboard,
    refetchInterval: 60000, // Auto-refresh every 60s
    staleTime: 30000,
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
  const deptData = dashboard?.employeesByDepartment
    ? Object.entries(dashboard.employeesByDepartment).map(([name, count], i) => ({
        name,
        count,
        color: DEPT_COLORS[i % DEPT_COLORS.length]
      }))
    : []

  return (
    <PageTransition className="space-y-10 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white">
          {getGreeting()}, <span className="text-gradient">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
        </h1>
        <p className="text-base text-nexus-400">
          Here's what's happening across your organization today.
        </p>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Employees"
          value={kpis?.totalEmployees ?? 0}
          previousValue={undefined}
          icon={<Users className="h-5 w-5" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.1}
        />
        <KPICard
          title="Present Today"
          value={kpis?.presentToday ?? 0}
          previousValue={undefined}
          icon={<UserCheck className="h-5 w-5" />}
          gradient="bg-gradient-to-r from-success to-accent-teal"
          delay={0.15}
        />
        <KPICard
          title="Pending Leaves"
          value={kpis?.pendingLeaveRequests ?? 0}
          previousValue={undefined}
          icon={<CalendarDays className="h-5 w-5" />}
          gradient="bg-gradient-to-r from-warning to-warning-light"
          delay={0.2}
        />
        <KPICard
          title="Monthly Payroll"
          value={kpis?.currentMonthPayroll ?? 0}
          previousValue={undefined}
          format="currency"
          icon={<Wallet className="h-5 w-5" />}
          gradient="bg-gradient-to-r from-accent-blue to-accent-cyan"
          delay={0.25}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Attendance Trend — from real monthly attendance aggregations */}
        <GlassCard className="p-6 lg:col-span-2" delay={0.3}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-nexus-100">Attendance Overview</h3>
              <p className="text-xs text-nexus-500 mt-0.5">Monthly attendance rate trend</p>
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
              <Activity className="h-3.5 w-3.5 text-accent-indigo" />
              <span className="text-xs font-medium text-nexus-300">
                {dashboard?.attendanceTrend?.length
                  ? `${(dashboard.attendanceTrend.reduce((a, b) => a + (b.rate || 0), 0) / dashboard.attendanceTrend.length).toFixed(0)}% avg`
                  : 'No data'}
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dashboard?.attendanceTrend ?? []}>
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#attendanceGradient)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Department Distribution — real employee counts from DB */}
        <GlassCard className="p-6" delay={0.35}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-nexus-100">Departments</h3>
            <p className="text-xs text-nexus-500 mt-0.5">Employee distribution</p>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {deptData.map((dept) => (
              <div key={dept.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                <span className="text-[11px] text-nexus-400 truncate">{dept.name}</span>
                <span className="ml-auto text-[11px] font-medium text-nexus-300">{dept.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Payroll Trend — real monthly payroll totals */}
        <GlassCard className="p-6 lg:col-span-2" delay={0.4}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-nexus-100">Payroll Trend</h3>
              <p className="text-xs text-nexus-500 mt-0.5">Monthly payroll expenditure</p>
            </div>
            {(dashboard?.payrollTrend?.length ?? 0) >= 2 && (() => {
              const trend = dashboard!.payrollTrend
              const last = trend[trend.length - 1].amount || 0
              const prev = trend[trend.length - 2].amount || 0
              const pct = prev > 0 ? (((last - prev) / prev) * 100).toFixed(1) : null
              return pct ? (
                <div className={`flex items-center gap-1 ${parseFloat(pct) >= 0 ? 'text-success' : 'text-danger'}`}>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{parseFloat(pct) >= 0 ? '+' : ''}{pct}%</span>
                </div>
              ) : null
            })()}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dashboard?.payrollTrend ?? []} barSize={28}>
              <defs>
                <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b8d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill="url(#payrollGradient)"
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Recent Activity — real DB audit log events */}
        <GlassCard className="p-6" delay={0.45}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-nexus-100">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {(dashboard?.recentActivity ?? []).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 rounded-[var(--radius-md)] p-2 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-nexus-400 flex-shrink-0">
                  <span className="text-[10px] font-semibold">{item.user.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-nexus-200 truncate">{item.user}</p>
                  <p className="text-[11px] text-nexus-500 truncate">{item.action}</p>
                </div>
                <span className="text-[10px] text-nexus-600 flex-shrink-0">{item.time}</span>
              </motion.div>
            ))}
            {(dashboard?.recentActivity?.length ?? 0) === 0 && (
              <p className="text-center text-sm text-nexus-500 py-6">No recent activity</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Third Row: Security */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DeviceActivityWidget />
        </div>
        <GlassCard className="p-6 flex flex-col justify-center items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <ShieldCheck className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-nexus-100 mb-2">System Secure</h3>
          <p className="text-sm text-nexus-400 mb-2">
            All services running normally. {kpis?.totalEmployees ?? 0} employees active.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full mt-4 text-center">
            <div className="rounded-lg bg-white/5 p-3 border border-white/5">
              <div className="text-xl font-bold text-white">{kpis?.newHiresThisMonth ?? 0}</div>
              <div className="text-[10px] text-nexus-500">New Hires</div>
            </div>
            <div className="rounded-lg bg-white/5 p-3 border border-white/5">
              <div className="text-xl font-bold text-white">0%</div>
              <div className="text-[10px] text-nexus-500">Attrition</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Insights Bar — real insights from DB */}
      {insights && insights.length > 0 && (
        <GlassCard className="p-6" glow="indigo" delay={0.5}>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 flex-shrink-0">
              <Sparkles className="h-5 w-5 text-accent-indigo" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-nexus-100 mb-1">AI Workforce Insight</h3>
              <p className="text-xs text-nexus-400 mt-0.5">
                {insights[0].description}
              </p>
              {insights.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.slice(1).map((insight) => (
                    <span key={insight.id} className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      insight.priority === 'CRITICAL' ? 'bg-danger/10 text-danger border-danger/20' :
                      insight.priority === 'HIGH' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/20'
                    }`}>
                      {insight.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <motion.button
              className="flex-shrink-0 rounded-[var(--radius-md)] border border-accent-indigo/30 bg-accent-indigo/10 px-4 py-2 text-xs font-medium text-accent-indigo transition-all hover:bg-accent-indigo/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View All Insights
            </motion.button>
          </div>
        </GlassCard>
      )}
    </PageTransition>
  )
}
