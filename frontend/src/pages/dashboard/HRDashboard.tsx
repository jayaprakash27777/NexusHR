import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Users, Briefcase, UserMinus, Clock, ChevronRight, AlertCircle, Sparkles, Shield, FileCheck, UserPlus
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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
      <p className="text-sm font-semibold text-white">{payload[0].value} Employees</p>
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
              Human Resources <span className="text-nexus-400 font-medium">| Overview</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-bold uppercase tracking-wider">
              HR Director
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Monitor headcount, recruitment pipeline, and attrition trends.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-accent-rose hover:bg-accent-rose/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-rose/20 active:scale-95 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
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
          title="Open Requisitions"
          value={kpis?.openRequisitions || 0}
          subtitle={`${kpis?.urgentRequisitions || 0} urgent`}
          icon={<Briefcase className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-blue to-accent-cyan"
          delay={0.15}
        />
        <KPICard
          title="Attrition Rate"
          value={`${kpis?.attritionRate || 0}%`}
          previousValue={(kpis?.attritionRate || 0) - (kpis?.attritionRateChange || 0)}
          icon={<UserMinus className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-rose to-accent-orange"
          delay={0.2}
          reverseTrend
        />
        <KPICard
          title="Avg Time to Fill"
          value={`${kpis?.avgTimeToFillDays || 0}d`}
          icon={<Clock className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount Trend Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[400px]" delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Headcount Growth</h2>
              <p className="text-sm text-nexus-400">Total employees over the last 6 months</p>
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
                    <span className="text-xs font-medium px-2 py-1 bg-white/5 border border-white/10 rounded-md text-nexus-300">
                      {req.stage}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-accent-blue to-accent-indigo h-1.5 rounded-full" 
                      style={{ width: `${req.progressPercentage}%` }}
                    ></div>
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

      {/* Onboarding Pipeline & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Funnel */}
        <GlassCard className="p-6" delay={0.45}>
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
                <div className="w-24 text-xs text-nexus-400 flex-shrink-0 text-right">{s.stage}</div>
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

        {/* Compliance & Diversity */}
        <GlassCard className="p-6 flex flex-col" delay={0.48}>
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
      <GlassCard className="p-6" delay={0.5}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Hires</h2>
          <Link to="/employees" className="text-sm font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
            Directory <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis?.recentHires?.map((hire: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-emerald to-accent-teal flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  {hire.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{hire.name}</p>
                <p className="text-xs text-nexus-400 truncate">{hire.role}</p>
              </div>
            </div>
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
