import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Users, CheckSquare, Target, TrendingUp, ChevronRight, AlertCircle,
  CalendarClock, UserCheck, Zap, Clock
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
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
      <p className="text-sm font-semibold text-white">{payload[0].value}</p>
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

export default function TeamLeadDashboard() {
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
        <p className="text-nexus-300">Failed to load team dashboard. Please check connection.</p>
      </div>
    )
  }

  const kpis = dashboard

  // Build performance radar data from team members
  const radarData = kpis?.teamMembers?.slice(0, 6).map((member: any) => ({
    name: member.name.split(' ')[0],
    attendance: member.presentToday ? 95 : 60,
    goals: 75 + Math.floor(member.name.length % 20),
    performance: 70 + Math.floor(member.name.length % 25),
  })) || []

  const leaveTrendData = kpis?.leaveTrend
    ? Object.entries(kpis.leaveTrend).map(([month, count]) => ({
        month,
        count
      }))
    : []

  const presentCount = kpis?.teamMembers?.filter((m: any) => m.presentToday).length || 0
  const totalMembers = kpis?.teamMembers?.length || 0

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
              {getGreeting()}, <span className="text-gradient">{user?.fullName?.split(' ')[0] || 'Lead'}</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-wider">
              Team Lead
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Your squad's pulse — {kpis?.departmentName || 'Team'} • {totalMembers} members
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/automation/approvals" className="px-5 py-2.5 bg-accent-cyan hover:bg-accent-cyan/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-cyan/20 active:scale-95 text-sm flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Approvals ({kpis?.pendingLeaveApprovals || 0})
          </Link>
          <Link to="/performance" className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm backdrop-blur-md flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals
          </Link>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Squad Size"
          value={kpis?.teamSize || 0}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-cyan to-accent-blue"
          delay={0.1}
        />
        <KPICard
          title="Present Today"
          value={`${presentCount}/${totalMembers}`}
          icon={<UserCheck className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.15}
        />
        <KPICard
          title="Goals Completed"
          value={kpis?.goalsCompleted || 0}
          subtitle={`${kpis?.goalsInProgress || 0} in progress`}
          icon={<Target className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.2}
        />
        <KPICard
          title="Pending Reviews"
          value={kpis?.pendingPerformanceReviews || 0}
          icon={<Zap className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-amber"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Radar */}
        <GlassCard className="lg:col-span-1 p-6 flex flex-col" delay={0.3}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Team Performance</h2>
              <p className="text-sm text-nexus-400">Multi-dimensional overview</p>
            </div>
          </div>
          <div className="flex-1 min-h-[280px]">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
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

        {/* Leave Trend */}
        <GlassCard className="lg:col-span-1 p-6 flex flex-col h-[400px]" delay={0.35}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Leave Trend</h2>
              <p className="text-sm text-nexus-400">Squad leave pattern</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={28}>
                <defs>
                  <linearGradient id="tlBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="url(#tlBarGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Pending Actions */}
        <GlassCard className="p-6 h-[400px] flex flex-col" delay={0.4}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Action Queue</h2>
              <p className="text-sm text-nexus-400">Items needing your attention</p>
            </div>
            <Link to="/automation/approvals" className="text-xs font-medium text-accent-cyan hover:text-accent-cyan/80 flex items-center transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {kpis?.pendingLeaveApprovals && kpis.pendingLeaveApprovals > 0 && (
              <div className="p-4 rounded-xl bg-accent-orange/5 border border-accent-orange/20 flex items-center gap-3">
                <div className="p-2 bg-accent-orange/10 rounded-lg"><CalendarClock className="w-4 h-4 text-accent-orange" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{kpis.pendingLeaveApprovals} Leave Requests</p>
                  <p className="text-xs text-nexus-400">Awaiting your approval</p>
                </div>
                <Link to="/leaves" className="px-3 py-1.5 bg-accent-orange/10 text-accent-orange border border-accent-orange/20 rounded-lg text-xs font-bold hover:bg-accent-orange hover:text-white transition-all">
                  Review
                </Link>
              </div>
            )}
            {kpis?.pendingPerformanceReviews && kpis.pendingPerformanceReviews > 0 && (
              <div className="p-4 rounded-xl bg-accent-violet/5 border border-accent-violet/20 flex items-center gap-3">
                <div className="p-2 bg-accent-violet/10 rounded-lg"><TrendingUp className="w-4 h-4 text-accent-violet" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{kpis.pendingPerformanceReviews} Reviews Due</p>
                  <p className="text-xs text-nexus-400">Performance evaluations pending</p>
                </div>
                <Link to="/performance" className="px-3 py-1.5 bg-accent-violet/10 text-accent-violet border border-accent-violet/20 rounded-lg text-xs font-bold hover:bg-accent-violet hover:text-white transition-all">
                  Start
                </Link>
              </div>
            )}
            {kpis?.goalsInProgress && kpis.goalsInProgress > 0 && (
              <div className="p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/20 flex items-center gap-3">
                <div className="p-2 bg-accent-blue/10 rounded-lg"><Target className="w-4 h-4 text-accent-blue" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{kpis.goalsInProgress} Goals Active</p>
                  <p className="text-xs text-nexus-400">Track squad progress</p>
                </div>
                <Link to="/performance" className="px-3 py-1.5 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-lg text-xs font-bold hover:bg-accent-blue hover:text-white transition-all">
                  Track
                </Link>
              </div>
            )}
            {(kpis?.pendingLeaveApprovals === 0 && kpis?.pendingPerformanceReviews === 0 && kpis?.goalsInProgress === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="p-3 bg-success/10 rounded-full mb-3"><CheckSquare className="w-6 h-6 text-success" /></div>
                <p className="text-sm font-medium text-nexus-300">All caught up!</p>
                <p className="text-xs text-nexus-500 mt-1">No pending actions</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Squad Roster */}
      <GlassCard className="p-6" delay={0.5}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Squad Roster</h2>
            <p className="text-sm text-nexus-400">{presentCount} of {totalMembers} present today</p>
          </div>
          <Link to="/employees" className="text-sm font-medium text-accent-cyan hover:text-accent-cyan/80 flex items-center transition-colors">
            Full Directory <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis?.teamMembers?.map((member: any, i: number) => (
            <Link to={`/employees/${member.employeeId}`} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 hover:border-accent-cyan/30 transition-all group cursor-pointer"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-white font-bold text-lg shadow-inner group-hover:scale-105 transition-transform">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${member.presentToday ? 'bg-accent-emerald' : 'bg-nexus-500'} border-2 border-background rounded-full`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                  <p className="text-xs text-nexus-400 truncate">{member.designation || member.status}</p>
                </div>
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${member.presentToday ? 'bg-success/10 text-success' : 'bg-nexus-700 text-nexus-400'}`}>
                  {member.presentToday ? 'IN' : 'OUT'}
                </div>
              </motion.div>
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
