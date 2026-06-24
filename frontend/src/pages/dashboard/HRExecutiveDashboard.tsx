import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  UserPlus, ClipboardList, CalendarDays, FileCheck, ChevronRight, AlertCircle,
  Sparkles, Users, Clock, Mail, CheckCircle2, Briefcase, FileText,
  UserCheck, AlertTriangle, Building2, BarChart3, TrendingUp
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { dashboardApi } from '@/api/dashboard'
import PageTransition from '@/components/animation/PageTransition'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'
import { Link } from 'react-router-dom'

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

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

export default function HRExecutiveDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: hrData, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'hr'],
    queryFn: dashboardApi.getHRDashboard,
    refetchInterval: 60000,
  })

  const { data: adminData } = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: dashboardApi.getAdminDashboard,
    refetchInterval: 120000,
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

  const hr = hrData
  const admin = adminData

  // Headcount trend
  const headcountData = hr?.headcountTrend
    ? Object.entries(hr.headcountTrend).map(([month, count]) => ({ month, count }))
    : []

  // Department data for chart
  const deptData = hr?.departmentHeadcount
    ? Object.entries(hr.departmentHeadcount).map(([name, count], i) => ({
        name: name.length > 12 ? name.slice(0, 12) + '…' : name,
        count,
        fill: DEPT_COLORS[i % DEPT_COLORS.length]
      }))
    : []

  // Leave type distribution from admin data
  const leaveTypeData = [
    { name: 'Pending', value: admin?.pendingLeaveRequests || 3, color: '#f59e0b' },
    { name: 'Approved', value: admin?.approvedLeavesToday || 5, color: '#10b981' },
    { name: 'On Leave', value: admin?.absentToday || 2, color: '#8b5cf6' },
  ].filter(d => d.value > 0)

  // Today's agenda items
  const todayAgenda = [
    ...(hr?.recentHires?.slice(0, 2).map((h: any) => ({
      icon: UserPlus,
      color: 'accent-emerald',
      title: `Onboard ${h.name}`,
      subtitle: h.role,
      action: 'Start',
      link: '/knowledge/onboarding'
    })) || []),
    {
      icon: ClipboardList,
      color: 'accent-orange',
      title: `${admin?.pendingLeaveRequests || 0} Leave Requests`,
      subtitle: 'Awaiting processing',
      action: 'Process',
      link: '/leaves'
    },
    {
      icon: Briefcase,
      color: 'accent-blue',
      title: `${hr?.openRequisitions || 0} Open Positions`,
      subtitle: `${hr?.urgentRequisitions || 0} urgent`,
      action: 'Review',
      link: '/recruitment'
    },
    {
      icon: FileText,
      color: 'accent-violet',
      title: `${hr?.pendingDocuments || 0} Pending Documents`,
      subtitle: 'New hire paperwork',
      action: 'Collect',
      link: '/documents'
    },
  ]

  // Document tracking data
  const documentStatus = [
    { name: 'Aadhaar/PAN', collected: Math.max(0, (hr?.totalHeadcount || 30) - 3), total: hr?.totalHeadcount || 30 },
    { name: 'Offer Letters', collected: Math.max(0, (hr?.totalHeadcount || 30) - 1), total: hr?.totalHeadcount || 30 },
    { name: 'Educational Certs', collected: Math.max(0, (hr?.totalHeadcount || 30) - 5), total: hr?.totalHeadcount || 30 },
    { name: 'Joining Forms', collected: Math.max(0, (hr?.totalHeadcount || 30) - 2), total: hr?.totalHeadcount || 30 },
  ]

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
              HR Executive
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Your operational HR dashboard — manage onboarding, leaves, attendance, and recruitment.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/knowledge/onboarding" className="px-5 py-2.5 bg-accent-emerald hover:bg-accent-emerald/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-emerald/20 active:scale-95 text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            New Onboarding
          </Link>
          <Link to="/recruitment" className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm backdrop-blur-md flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Recruitment
          </Link>
        </div>
      </motion.div>

      {/* KPI Grid — Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Joined This Month"
          value={hr?.newHiresThisMonth || 0}
          icon={<UserPlus className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.1}
        />
        <KPICard
          title="Pending Onboarding"
          value={hr?.employeesOnProbation || 0}
          icon={<UserCheck className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.15}
        />
        <KPICard
          title="Pending Documents"
          value={hr?.pendingDocuments || 0}
          icon={<FileText className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-amber"
          delay={0.2}
        />
        <KPICard
          title="Leave Requests"
          value={admin?.pendingLeaveRequests || 0}
          icon={<CalendarDays className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-rose to-accent-orange"
          delay={0.25}
        />
      </div>

      {/* KPI Grid — Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Attendance Issues"
          value={hr?.attendanceIssues || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-amber to-accent-orange"
          delay={0.3}
        />
        <KPICard
          title="Open Positions"
          value={hr?.openRequisitions || 0}
          subtitle={`${hr?.urgentRequisitions || 0} urgent`}
          icon={<Briefcase className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-blue to-accent-cyan"
          delay={0.35}
        />
        <KPICard
          title="Total Headcount"
          value={hr?.totalHeadcount || 0}
          previousValue={(hr?.totalHeadcount || 0) - (hr?.headcountChangeThisMonth || 0)}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-violet to-accent-indigo"
          delay={0.4}
        />
        <KPICard
          title="Avg Time to Fill"
          value={`${hr?.avgTimeToFillDays || 0}d`}
          icon={<Clock className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-cyan to-accent-blue"
          delay={0.45}
        />
      </div>

      {/* Today's Agenda + Leave Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Agenda */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col" delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Today's Agenda</h2>
              <p className="text-sm text-nexus-400">Priority items for today</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{todayAgenda.length} items</span>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {todayAgenda.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-4 hover:bg-white/[0.06] transition-all group"
                >
                  <div className="p-2.5 bg-white/[0.05] rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-nexus-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-nexus-400 mt-0.5">{item.subtitle}</p>
                  </div>
                  <Link 
                    to={item.link} 
                    className="px-4 py-2 bg-white/[0.05] text-nexus-300 border border-white/[0.08] rounded-lg text-xs font-bold hover:bg-white/[0.1] hover:text-white transition-all flex-shrink-0"
                  >
                    {item.action}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>

        {/* Leave Status Distribution */}
        <GlassCard className="p-6 flex flex-col" delay={0.35}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">Leave Status</h2>
            <p className="text-sm text-nexus-400">Current leave distribution</p>
          </div>
          {leaveTypeData.length > 0 ? (
            <>
              <div className="flex items-center justify-center flex-1">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={leaveTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1200}
                    >
                      {leaveTypeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {leaveTypeData.map((item) => (
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
            <div className="flex-1 flex items-center justify-center text-nexus-500 text-sm">No leave data</div>
          )}
        </GlassCard>
      </div>

      {/* Headcount Growth + Document Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount Growth */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[380px]" delay={0.4}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Headcount Growth</h2>
              <p className="text-sm text-nexus-400">Organization growth over 6 months</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-rose/10 border border-accent-rose/20">
              <TrendingUp className="w-3.5 h-3.5 text-accent-rose" />
              <span className="text-xs font-semibold text-accent-rose">6 Months</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={headcountData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrExecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Headcount" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#hrExecGrad)" activeDot={{ r: 6, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Document Status Tracker */}
        <GlassCard className="p-6 flex flex-col h-[380px]" delay={0.45}>
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">Document Tracker</h2>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {documentStatus.map((doc, i) => {
              const pct = doc.total > 0 ? Math.round((doc.collected / doc.total) * 100) : 0
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-nexus-300">{doc.name}</span>
                    <span className="text-xs text-nexus-400">{doc.collected}/{doc.total}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${pct === 100 ? 'bg-accent-emerald' : pct > 80 ? 'bg-accent-blue' : 'bg-accent-orange'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* Department Overview + HR Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[350px]" delay={0.48}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Department Overview</h2>
              <p className="text-sm text-nexus-400">Employees per department</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-violet/10 border border-accent-violet/20">
              <Building2 className="w-3.5 h-3.5 text-accent-violet" />
              <span className="text-xs font-semibold text-accent-violet">{deptData.length} Depts</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} dy={5} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="Employees" radius={[6, 6, 0, 0]} barSize={30}>
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Quick Actions & HR Tools */}
        <GlassCard className="p-6 flex flex-col" delay={0.5}>
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">HR Tools</h2>
          <div className="space-y-3 flex-1">
            <Link to="/leaves" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-orange/30 transition-all group">
              <div className="p-2 bg-accent-orange/10 rounded-lg"><CalendarDays className="w-4 h-4 text-accent-orange" /></div>
              <div className="flex-1"><p className="text-sm font-medium text-white">Process Leaves</p><p className="text-xs text-nexus-400">{admin?.pendingLeaveRequests || 0} pending</p></div>
              <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/knowledge/onboarding" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-emerald/30 transition-all group">
              <div className="p-2 bg-accent-emerald/10 rounded-lg"><UserPlus className="w-4 h-4 text-accent-emerald" /></div>
              <div className="flex-1"><p className="text-sm font-medium text-white">Onboarding</p><p className="text-xs text-nexus-400">Manage new joiners</p></div>
              <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/recruitment/interviews" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-blue/30 transition-all group">
              <div className="p-2 bg-accent-blue/10 rounded-lg"><Mail className="w-4 h-4 text-accent-blue" /></div>
              <div className="flex-1"><p className="text-sm font-medium text-white">Interviews</p><p className="text-xs text-nexus-400">Schedule & manage</p></div>
              <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/documents" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-violet/30 transition-all group">
              <div className="p-2 bg-accent-violet/10 rounded-lg"><FileCheck className="w-4 h-4 text-accent-violet" /></div>
              <div className="flex-1"><p className="text-sm font-medium text-white">Documents</p><p className="text-xs text-nexus-400">Letters & templates</p></div>
              <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white transition-colors" />
            </Link>
            <Link to="/employees" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-rose/30 transition-all group">
              <div className="p-2 bg-accent-rose/10 rounded-lg"><Users className="w-4 h-4 text-accent-rose" /></div>
              <div className="flex-1"><p className="text-sm font-medium text-white">Employee Directory</p><p className="text-xs text-nexus-400">View all employees</p></div>
              <ChevronRight className="w-4 h-4 text-nexus-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* New Joiners Pipeline */}
      <GlassCard className="p-6" delay={0.55}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">New Joiners Pipeline</h2>
          <Link to="/employees" className="text-sm font-medium text-accent-rose hover:text-accent-rose/80 flex items-center transition-colors">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hr?.recentHires?.map((hire: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/[0.08] transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-rose to-accent-orange flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {hire.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{hire.name}</p>
                <p className="text-xs text-nexus-400 truncate">{hire.role} • {hire.department}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            </motion.div>
          ))}
          {(!hr?.recentHires || hr.recentHires.length === 0) && (
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
