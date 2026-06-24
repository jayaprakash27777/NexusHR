import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Users, Briefcase, UserMinus, Clock, ChevronRight, AlertCircle, Sparkles, Shield, FileCheck, UserPlus,
  CalendarDays, ClipboardCheck, Building2, UserCheck, TrendingUp, BarChart3, PieChart as PieChartIcon
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import PageTransition from '@/components/animation/PageTransition'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'
import { Link } from 'react-router-dom'

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
const GENDER_COLORS: Record<string, string> = { MALE: '#3b82f6', FEMALE: '#ec4899', OTHER: '#8b5cf6' }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/[0.05] glass px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-nexus-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || '#fff' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-[var(--radius-2xl)]" />
        </div>
        <div>
          <Skeleton className="h-[400px] w-full rounded-[var(--radius-2xl)]" />
        </div>
      </div>
    </div>
  )
}

export default function HRDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'hr'],
    queryFn: dashboardApi.getHRDashboard,
    refetchInterval: 60000,
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-danger" />
        <p className="text-nexus-300">Failed to load HR dashboard data. Please check connection.</p>
      </div>
    )
  }

  const kpis = dashboard

  const headcountData = kpis?.headcountTrend
    ? Object.entries(kpis.headcountTrend).map(([month, count]) => ({
        month,
        count
      }))
    : []

  const deptData = kpis?.departmentHeadcount
    ? Object.entries(kpis.departmentHeadcount).map(([name, count], i) => ({
        name,
        count,
        fill: DEPT_COLORS[i % DEPT_COLORS.length]
      }))
    : []

  const genderData = kpis?.genderDistribution
    ? Object.entries(kpis.genderDistribution).map(([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
        color: GENDER_COLORS[name] || '#8b5cf6'
      }))
    : []

  const leaveData = kpis?.leaveStats
    ? Object.entries(kpis.leaveStats).map(([name, value]) => ({ name, value }))
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
              {getGreeting()}, <span className="text-gradient">{user?.fullName?.split(' ')[0] || 'HR'}</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-bold uppercase tracking-wider">
              HR Director
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Monitor headcount, recruitment pipeline, attrition trends, and workforce analytics.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/employees" className="px-5 py-2.5 bg-accent-rose hover:bg-accent-rose/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-rose/20 active:scale-95 text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Manage Employees
          </Link>
          <Link to="/recruitment" className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm backdrop-blur-md flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Report
          </Link>
        </div>
      </motion.div>

      {/* KPI Grid — Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Total Headcount"
          value={kpis?.totalHeadcount || 0}
          previousValue={(kpis?.totalHeadcount || 0) - (kpis?.headcountChangeThisMonth || 0)}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.1}
        />
        <KPICard
          title="New Hires This Month"
          value={kpis?.newHiresThisMonth || 0}
          icon={<UserPlus className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.15}
        />
        <KPICard
          title="Open Positions"
          value={kpis?.openRequisitions || 0}
          subtitle={`${kpis?.urgentRequisitions || 0} urgent`}
          icon={<Briefcase className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-blue to-accent-cyan"
          delay={0.2}
        />
        <KPICard
          title="Attrition Rate"
          value={`${kpis?.attritionRate || 0}%`}
          previousValue={(kpis?.attritionRate || 0) - (kpis?.attritionRateChange || 0)}
          icon={<UserMinus className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-rose to-accent-orange"
          delay={0.25}
          reverseTrend
        />
      </div>

      {/* KPI Grid — Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="On Probation"
          value={kpis?.employeesOnProbation || 0}
          icon={<UserCheck className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-violet to-accent-indigo"
          delay={0.3}
        />
        <KPICard
          title="Pending Approvals"
          value={kpis?.pendingApprovals || 0}
          icon={<ClipboardCheck className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-amber"
          delay={0.35}
        />
        <KPICard
          title="Avg Time to Fill"
          value={`${kpis?.avgTimeToFillDays || 0}d`}
          icon={<Clock className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-cyan to-accent-blue"
          delay={0.4}
        />
        <KPICard
          title="Leave Requests"
          value={leaveData.reduce((sum, d) => sum + d.value, 0)}
          icon={<CalendarDays className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-teal to-accent-emerald"
          delay={0.45}
        />
      </div>

      {/* Headcount Trend + Active Requisitions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount Trend Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[400px]" delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Headcount Growth</h2>
              <p className="text-sm text-nexus-400">Total employees over the last 6 months</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20">
              <TrendingUp className="w-3.5 h-3.5 text-accent-indigo" />
              <span className="text-xs font-semibold text-accent-indigo">6 Months</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={headcountData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="Headcount"
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#areaGradient)" 
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Active Requisitions */}
        <GlassCard className="p-6 h-[400px] flex flex-col" delay={0.4}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active Requisitions</h2>
              <p className="text-sm text-nexus-400">Recruitment pipeline</p>
            </div>
            <Link to="/recruitment" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-4">
              {kpis?.activeRequisitions?.map((req: any, i: number) => (
                <li key={i} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-accent-blue transition-colors">{req.title}</p>
                      <p className="text-xs text-nexus-400">{req.department} • {req.candidates} candidates</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      req.stage === 'Offered' ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald' :
                      req.stage === 'Interviewing' ? 'bg-accent-blue/10 border border-accent-blue/20 text-accent-blue' :
                      'bg-white/5 border border-white/10 text-nexus-300'
                    }`}>
                      {req.stage}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-accent-blue to-accent-indigo h-1.5 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${req.progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </li>
              ))}
              {!kpis?.activeRequisitions?.length && (
                <p className="text-sm text-nexus-400 text-center py-4">No active requisitions.</p>
              )}
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Department Headcount + Gender Diversity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[380px]" delay={0.45}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Department Headcount</h2>
              <p className="text-sm text-nexus-400">Employee distribution across departments</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-violet/10 border border-accent-violet/20">
              <Building2 className="w-3.5 h-3.5 text-accent-violet" />
              <span className="text-xs font-semibold text-accent-violet">{deptData.length} Depts</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="Employees" radius={[0, 6, 6, 0]} barSize={20}>
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Gender Diversity */}
        <GlassCard className="p-6 flex flex-col h-[380px]" delay={0.48}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Gender Diversity</h2>
            <p className="text-sm text-nexus-400">Workforce composition</p>
          </div>
          {genderData.length > 0 ? (
            <>
              <div className="flex items-center justify-center flex-1">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1200}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {genderData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-nexus-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-nexus-500 text-sm">No gender data</div>
          )}
        </GlassCard>
      </div>

      {/* Onboarding Pipeline & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Funnel */}
        <GlassCard className="p-6" delay={0.5}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Onboarding Pipeline</h2>
              <p className="text-sm text-nexus-400">New hire onboarding stages</p>
            </div>
            <Link to="/knowledge/onboarding" className="text-xs font-medium text-accent-emerald hover:text-accent-emerald/80 flex items-center transition-colors">
              Manage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { stage: 'Offer Accepted', count: kpis?.recentHires?.length || 3, color: 'bg-accent-emerald', pct: 100 },
              { stage: 'Documents Submitted', count: Math.max(0, (kpis?.recentHires?.length || 3) - 1), color: 'bg-accent-blue', pct: 80 },
              { stage: 'IT Setup Complete', count: Math.max(0, (kpis?.recentHires?.length || 3) - 2), color: 'bg-accent-indigo', pct: 55 },
              { stage: 'Orientation Done', count: Math.max(0, (kpis?.recentHires?.length || 3) - 3), color: 'bg-accent-violet', pct: 30 },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }} className="flex items-center gap-3">
                <div className="w-28 text-xs text-nexus-400 flex-shrink-0 text-right">{s.stage}</div>
                <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                  <motion.div
                    className={`h-full ${s.color} rounded-lg flex items-center justify-end pr-2`}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 1, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="text-[10px] font-bold text-white">{s.count}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* HR Compliance & Status */}
        <GlassCard className="p-6 flex flex-col" delay={0.52}>
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">HR Compliance</h2>
          <div className="space-y-3 flex-1">
            <div className="p-3 rounded-xl bg-success/5 border border-success/20 flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg"><Shield className="w-4 h-4 text-success" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Policy Documents</p>
                <p className="text-xs text-nexus-400">All up to date</p>
              </div>
              <span className="text-xs font-bold text-success">✓</span>
            </div>
            <div className="p-3 rounded-xl bg-accent-orange/5 border border-accent-orange/20 flex items-center gap-3">
              <div className="p-2 bg-accent-orange/10 rounded-lg"><FileCheck className="w-4 h-4 text-accent-orange" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Background Checks</p>
                <p className="text-xs text-nexus-400">{kpis?.recentHires?.length || 0} pending verification</p>
              </div>
              <span className="text-xs font-bold text-accent-orange">{kpis?.recentHires?.length || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-accent-blue/5 border border-accent-blue/20 flex items-center gap-3">
              <div className="p-2 bg-accent-blue/10 rounded-lg"><UserPlus className="w-4 h-4 text-accent-blue" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Diversity Score</p>
                <p className="text-xs text-nexus-400">Gender ratio within target</p>
              </div>
              <span className="text-xs font-bold text-accent-blue">Good</span>
            </div>
            <div className="p-3 rounded-xl bg-accent-violet/5 border border-accent-violet/20 flex items-center gap-3">
              <div className="p-2 bg-accent-violet/10 rounded-lg"><UserMinus className="w-4 h-4 text-accent-violet" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Attrition Risk</p>
                <p className="text-xs text-nexus-400">{kpis?.attritionRate || 0}% this quarter</p>
              </div>
              <span className={`text-xs font-bold ${(kpis?.attritionRate || 0) > 10 ? 'text-danger' : 'text-success'}`}>{(kpis?.attritionRate || 0) > 10 ? 'High' : 'Low'}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Hires */}
      <GlassCard className="p-6" delay={0.55}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Hires</h2>
          <Link to="/employees" className="text-sm font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
            Directory <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis?.recentHires?.map((hire: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/[0.08] transition-all"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-emerald to-accent-teal flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  {hire.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{hire.name}</p>
                <p className="text-xs text-nexus-400 truncate">{hire.role} • {hire.department}</p>
              </div>
            </motion.div>
          ))}
          {(!kpis?.recentHires || kpis.recentHires.length === 0) && (
              <p className="text-sm text-nexus-400 col-span-full text-center py-4">No recent hires.</p>
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
