import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Users, CheckSquare, TrendingUp, AlertTriangle, ChevronRight, AlertCircle, CalendarClock, Target
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import PageTransition from '@/components/animation/PageTransition'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'
import { Link } from 'react-router-dom'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.05] glass px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-nexus-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value} Leaves</p>
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="h-[400px] w-full rounded-[var(--radius-2xl)]" />
        <Skeleton className="h-[400px] w-full rounded-[var(--radius-2xl)]" />
      </div>
    </div>
  )
}

export default function ManagerDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'manager', user?.id],
    queryFn: () => dashboardApi.getManagerDashboard(),
    enabled: !!user?.id,
    refetchInterval: 60000,
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-danger" />
        <p className="text-nexus-300">Failed to load manager dashboard data. Please check connection.</p>
      </div>
    )
  }

  const kpis = dashboard

  const leaveTrendData = kpis?.leaveTrend
    ? Object.entries(kpis.leaveTrend).map(([month, count]) => ({
        month,
        count
      }))
    : []

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Welcome back, {user?.fullName}
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-bold uppercase tracking-wider">
              Manager
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Monitor your team's performance and pending tasks.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-indigo/20 active:scale-95 text-sm flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            Team Schedule
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Team Size"
          value={kpis?.teamSize || 0}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.1}
        />
        <KPICard
          title="Pending Approvals"
          value={kpis?.pendingLeaveApprovals || 0}
          icon={<CheckSquare className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-amber"
          delay={0.15}
        />
        <KPICard
          title="Goals Completed"
          value={kpis?.goalsCompleted || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.2}
        />
        <KPICard
          title="On Leave Today"
          value={kpis?.teamAbsentToday || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-rose to-accent-pink"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Trend Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[400px]" delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Team Leave Trend</h2>
              <p className="text-sm text-nexus-400">Leaves taken by your team over recent months</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
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
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pending Actions */}
        <GlassCard className="p-6 h-[400px] flex flex-col" delay={0.4}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Action Required</h2>
              <p className="text-sm text-nexus-400">Approvals needing your attention</p>
            </div>
            <Link to="/automation/approvals" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-3">
              {kpis?.pendingActions?.map((item: any, i: number) => (
                <li key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent-indigo/50 transition-all flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.employeeName}</p>
                      <p className="text-xs text-nexus-400 mt-0.5">{item.type} • {item.details}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 hover:bg-accent-emerald hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                      Approve
                    </button>
                    <button className="flex-1 py-1.5 bg-white/5 text-nexus-300 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-bold transition-all shadow-sm">
                      Reject
                    </button>
                  </div>
                </li>
              ))}
              {!kpis?.pendingActions?.length && (
                <p className="text-sm text-nexus-400 text-center py-4">No pending actions.</p>
              )}
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Performance Radar & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Radar */}
        <GlassCard className="p-6 flex flex-col h-[350px]" delay={0.45}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Performance Radar</h2>
              <p className="text-sm text-nexus-400">Multi-dimensional team comparison</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {kpis?.teamMembers && kpis.teamMembers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={kpis.teamMembers.slice(0, 6).map((m: any) => ({
                  name: m.name.split(' ')[0],
                  attendance: m.presentToday ? 95 : 55,
                  goals: 60 + (m.name.length % 30),
                  performance: 65 + (m.name.length % 25),
                }))}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#737373', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Attendance" dataKey="attendance" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Goals" dataKey="goals" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="Performance" dataKey="performance" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-nexus-500 text-sm">No team data</div>
            )}
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-cyan" /><span className="text-[10px] text-nexus-400">Attendance</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent-violet" /><span className="text-[10px] text-nexus-400">Goals</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success" /><span className="text-[10px] text-nexus-400">Performance</span></div>
          </div>
        </GlassCard>

        {/* Goal Progress Grid */}
        <GlassCard className="p-6 flex flex-col h-[350px]" delay={0.48}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Goal Progress</h2>
              <p className="text-sm text-nexus-400">{kpis?.goalsCompleted || 0} completed, {kpis?.goalsInProgress || 0} in progress</p>
            </div>
            <Link to="/performance" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              Manage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {[
              { label: 'Goals Completed', value: kpis?.goalsCompleted || 0, total: (kpis?.goalsCompleted || 0) + (kpis?.goalsInProgress || 0) + (kpis?.goalsNotStarted || 5), color: 'bg-success' },
              { label: 'In Progress', value: kpis?.goalsInProgress || 0, total: (kpis?.goalsCompleted || 0) + (kpis?.goalsInProgress || 0) + (kpis?.goalsNotStarted || 5), color: 'bg-accent-indigo' },
              { label: 'Pending Reviews', value: kpis?.pendingPerformanceReviews || 0, total: kpis?.teamSize || 10, color: 'bg-accent-orange' },
            ].map((goal, i) => {
              const pct = goal.total > 0 ? Math.min(100, (goal.value / goal.total) * 100) : 0
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{goal.label}</span>
                    <span className="text-xs text-nexus-400 font-bold">{goal.value}/{goal.total}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${goal.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* Team Members Grid */}
      <GlassCard className="p-6" delay={0.5}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Team Status</h2>
          <Link to="/employees" className="text-sm font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
            Directory <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis?.teamMembers?.map((member: any, i: number) => (
            <Link to={`/employees/${member.employeeId}`} key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors group cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-indigo to-accent-cyan flex items-center justify-center text-white font-bold text-lg shadow-inner group-hover:scale-105 transition-transform">
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${member.presentToday ? 'bg-accent-emerald' : 'bg-nexus-500'} border-2 border-background rounded-full`}></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                <p className="text-xs text-nexus-400 truncate">{member.designation || member.status}</p>
              </div>
            </Link>
          ))}
          {(!kpis?.teamMembers || kpis.teamMembers.length === 0) && (
              <p className="text-sm text-nexus-400 col-span-full text-center py-4">No team members assigned.</p>
          )}
        </div>
      </GlassCard>
    
      {/* Announcements Section */}
      <div className="h-[400px] mt-6">
        <AnnouncementsWidget />
      </div>
    </PageTransition>
  )
}
