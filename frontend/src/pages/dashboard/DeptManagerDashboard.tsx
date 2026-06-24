import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Building2, Users, TrendingUp, Briefcase, ChevronRight, AlertCircle,
  BarChart3, Target, UserMinus, Shield, CalendarDays, Wallet
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import PageTransition from '@/components/animation/PageTransition'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'
import { Link } from 'react-router-dom'

const ROLE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.05] glass px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-nexus-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || '#fff' }}>{entry.value}</p>
      ))}
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

export default function DeptManagerDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: managerData, isLoading: loadingManager, isError: errorManager } = useQuery({
    queryKey: ['dashboard', 'manager', user?.id],
    queryFn: () => dashboardApi.getManagerDashboard(),
    enabled: !!user?.id,
    refetchInterval: 60000,
  })

  const { data: hrData, isLoading: loadingHR } = useQuery({
    queryKey: ['dashboard', 'hr'],
    queryFn: dashboardApi.getHRDashboard,
    refetchInterval: 120000,
  })

  const isLoading = loadingManager || loadingHR

  if (isLoading) return <DashboardSkeleton />

  if (errorManager) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-danger" />
        <p className="text-nexus-300">Failed to load department dashboard. Please check connection.</p>
      </div>
    )
  }

  const team = managerData
  const hr = hrData

  // Build role distribution from team members
  const roleDistribution = team?.teamMembers?.reduce((acc: Record<string, number>, m: any) => {
    const role = m.designation || 'Other'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const roleData = Object.entries(roleDistribution).map(([name, count], i) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    count,
    color: ROLE_COLORS[i % ROLE_COLORS.length]
  }))

  // Headcount trend
  const headcountData = hr?.headcountTrend
    ? Object.entries(hr.headcountTrend).map(([month, count]) => ({ month, count }))
    : []

  // Leave trend for the department
  const leaveTrendData = team?.leaveTrend
    ? Object.entries(team.leaveTrend).map(([month, count]) => ({ month, count }))
    : []

  const attendanceRate = team?.teamAttendanceRate || 0

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
              {team?.departmentName || 'Department'} <span className="text-nexus-400 font-medium">| Overview</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-xs font-bold uppercase tracking-wider">
              Dept Manager
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Strategic department metrics and team operations for {user?.fullName}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/reports" className="px-5 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-indigo/20 active:scale-95 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Department Report
          </Link>
          <Link to="/recruitment" className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm backdrop-blur-md flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Requisitions
          </Link>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Department Size"
          value={team?.teamSize || 0}
          subtitle={`${team?.activeTeamMembers || 0} active`}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.1}
        />
        <KPICard
          title="Attendance Rate"
          value={`${attendanceRate.toFixed(1)}%`}
          icon={<CalendarDays className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.15}
        />
        <KPICard
          title="Org Headcount"
          value={hr?.totalHeadcount || 0}
          previousValue={(hr?.totalHeadcount || 0) - (hr?.headcountChangeThisMonth || 0)}
          icon={<Building2 className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-blue to-accent-cyan"
          delay={0.2}
        />
        <KPICard
          title="Attrition Rate"
          value={`${hr?.attritionRate || 0}%`}
          icon={<UserMinus className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-rose to-accent-orange"
          delay={0.25}
          reverseTrend
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Headcount Trend — 8 cols */}
        <GlassCard className="lg:col-span-8 p-6 flex flex-col h-[380px]" delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Organization Headcount</h2>
              <p className="text-sm text-nexus-400">Company growth trend over 6 months</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{hr?.headcountChangeThisMonth || 0} this month</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={headcountData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#dmAreaGrad)" activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Role Distribution — 4 cols */}
        <GlassCard className="lg:col-span-4 p-6" delay={0.35}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Team by Role</h2>
            <p className="text-sm text-nexus-400">Distribution across designations</p>
          </div>
          {roleData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-2">
                {roleData.map((role) => (
                  <div key={role.name} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                    <span className="text-[11px] text-nexus-400 truncate flex-1">{role.name}</span>
                    <span className="text-[11px] font-medium text-nexus-300">{role.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-nexus-500 text-sm">No role data</div>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Trend */}
        <GlassCard className="p-6 flex flex-col h-[350px]" delay={0.4}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Department Leaves</h2>
              <p className="text-sm text-nexus-400">Monthly leave pattern</p>
            </div>
            <Link to="/leaves" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <defs>
                  <linearGradient id="dmLeaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="url(#dmLeaveGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Department Quick Actions & Stats */}
        <GlassCard className="p-6 flex flex-col" delay={0.45}>
          <h2 className="text-lg font-bold text-white tracking-tight mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link to="/employees" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-indigo/30 transition-all group text-center">
              <Users className="w-6 h-6 text-accent-indigo mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">View Team</p>
            </Link>
            <Link to="/performance" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-violet/30 transition-all group text-center">
              <TrendingUp className="w-6 h-6 text-accent-violet mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">Reviews</p>
            </Link>
            <Link to="/recruitment" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-cyan/30 transition-all group text-center">
              <Briefcase className="w-6 h-6 text-accent-cyan mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">Hiring</p>
            </Link>
            <Link to="/reports" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-emerald/30 transition-all group text-center">
              <BarChart3 className="w-6 h-6 text-accent-emerald mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">Reports</p>
            </Link>
          </div>

          {/* Department Stats Summary */}
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-xs text-nexus-400">Pending Approvals</span>
              <span className="text-sm font-bold text-white">{team?.pendingLeaveApprovals || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-xs text-nexus-400">Goals In Progress</span>
              <span className="text-sm font-bold text-white">{team?.goalsInProgress || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-xs text-nexus-400">Open Requisitions</span>
              <span className="text-sm font-bold text-white">{hr?.openRequisitions || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-xs text-nexus-400">Avg Time to Fill</span>
              <span className="text-sm font-bold text-white">{hr?.avgTimeToFillDays || 0}d</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Team Members Grid */}
      <GlassCard className="p-6" delay={0.5}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Department Members</h2>
          <Link to="/employees" className="text-sm font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
            Full Directory <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {team?.teamMembers?.map((member: any, i: number) => (
            <Link to={`/employees/${member.employeeId}`} key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-indigo to-accent-violet flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 ${member.presentToday ? 'bg-accent-emerald' : 'bg-nexus-500'} border-2 border-background rounded-full`}></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                <p className="text-xs text-nexus-400 truncate">{member.designation || member.status}</p>
              </div>
            </Link>
          ))}
          {(!team?.teamMembers || team.teamMembers.length === 0) && (
            <p className="text-sm text-nexus-400 col-span-full text-center py-4">No department members found.</p>
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
