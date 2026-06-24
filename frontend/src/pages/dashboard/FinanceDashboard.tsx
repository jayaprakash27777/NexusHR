import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Wallet, TrendingUp, AlertCircle, FileText, ChevronRight, DollarSign, DownloadCloud, Calendar, PieChart as PieChartIcon
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
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
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm font-semibold text-white" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
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

export default function FinanceDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'finance'],
    queryFn: dashboardApi.getFinanceDashboard,
    refetchInterval: 60000,
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-danger" />
        <p className="text-nexus-300">Failed to load finance dashboard data. Please check connection.</p>
      </div>
    )
  }

  const kpis = dashboard

  // Map real payroll and expense trend data from backend
  const financeData: any[] = []
  
  if (kpis?.payrollTrend || kpis?.expenseTrend) {
    // Collect all unique months from both trends
    const months = new Set([
      ...(kpis?.payrollTrend ? Object.keys(kpis.payrollTrend) : []),
      ...(kpis?.expenseTrend ? Object.keys(kpis.expenseTrend) : [])
    ])
    
    months.forEach(month => {
      financeData.push({
        month,
        expense: kpis?.expenseTrend?.[month] || 0,
        payroll: kpis?.payrollTrend?.[month] || 0
      })
    })
  }

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
              Finance & Payroll <span className="text-nexus-400 font-medium">| Overview</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-bold uppercase tracking-wider">
              Finance
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Monitor payroll distributions, bonuses, and expense claims.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-accent-emerald hover:bg-accent-emerald/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-emerald/20 active:scale-95 text-sm flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Monthly Payroll"
          value={`$${kpis?.totalMonthlyPayroll?.toLocaleString() || 0}`}
          previousValue={kpis?.totalMonthlyPayroll ? Number(kpis.totalMonthlyPayroll) * (1 - (kpis.payrollChangePercentage/100)) : 0}
          icon={<Wallet className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.1}
          isCurrency
        />
        <KPICard
          title="YTD Bonuses"
          value={`$${kpis?.ytdBonusPayouts?.toLocaleString() || 0}`}
          previousValue={kpis?.ytdBonusPayouts ? Number(kpis.ytdBonusPayouts) * (1 - (kpis.bonusChangePercentage/100)) : 0}
          icon={<TrendingUp className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.15}
          isCurrency
        />
        <KPICard
          title="Pending Claims"
          value={`$${kpis?.pendingReimbursements?.toLocaleString() || 0}`}
          previousValue={kpis?.pendingReimbursements ? Number(kpis.pendingReimbursements) * (1 - (kpis.reimbursementChangePercentage/100)) : 0}
          icon={<FileText className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-amber"
          delay={0.2}
          isCurrency
          reverseTrend
        />
        <KPICard
          title="Tax Withheld (YTD)"
          value={`$${kpis?.taxWithheldYtd?.toLocaleString() || 0}`}
          previousValue={kpis?.taxWithheldYtd ? Number(kpis.taxWithheldYtd) * (1 - (kpis.taxChangePercentage/100)) : 0}
          icon={<DollarSign className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-rose to-accent-pink"
          delay={0.25}
          isCurrency
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll & Expense Trend Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[400px]" delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Payroll & Expense Trends</h2>
              <p className="text-sm text-nexus-400">Total expenditure over the last 4 months</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.8}/>
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
                  yAxisId="left"
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val/1000}k`} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val/1000}k`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="payroll" name="Payroll" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="expense" name="Expenses" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#1a1b23', stroke: '#f59e0b', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Expenses & Claims List */}
        <GlassCard className="p-6 h-[400px] flex flex-col" delay={0.4}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Pending Claims</h2>
              <p className="text-sm text-nexus-400">Expense reports awaiting review</p>
            </div>
            <Link to="/automation/expenses" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-3">
              {kpis?.pendingExpenses?.map((item: any, i: number) => (
                <li key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent-emerald/50 transition-all flex justify-between items-center group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-accent-emerald/10 text-accent-emerald rounded-lg flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.description}</p>
                      <p className="text-xs text-nexus-400 mt-0.5 truncate">{item.employeeName}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-bold text-accent-emerald">{item.amount}</p>
                    <p className="text-xs text-nexus-400 mt-0.5">{item.date}</p>
                  </div>
                </li>
              ))}
              {!kpis?.pendingExpenses?.length && (
                <p className="text-sm text-nexus-400 text-center py-4">No pending claims.</p>
              )}
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6" delay={0.45}>
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">Finance Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-emerald/30 transition-all group text-center">
              <DownloadCloud className="w-6 h-6 text-accent-emerald mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">Export CSV</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-blue/30 transition-all group text-center">
              <FileText className="w-6 h-6 text-accent-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">PDF Report</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-violet/30 transition-all group text-center">
              <Calendar className="w-6 h-6 text-accent-violet mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">Tax Calendar</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-orange/30 transition-all group text-center">
              <PieChartIcon className="w-6 h-6 text-accent-orange mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-semibold text-white">Budget Plan</p>
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-xs text-nexus-400">Total Payroll Cost</span>
              <span className="text-sm font-bold text-white">${(kpis?.totalPayrollCost || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-xs text-nexus-400">Avg Salary</span>
              <span className="text-sm font-bold text-white">${(kpis?.avgSalary || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-xs text-nexus-400">Pending Expenses</span>
              <span className="text-sm font-bold text-accent-orange">{kpis?.pendingExpenseClaims || 0}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" delay={0.48}>
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">Payroll by Department</h2>
          {kpis?.departmentPayroll && Object.keys(kpis.departmentPayroll).length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={Object.entries(kpis.departmentPayroll).map(([dept, cost]) => ({ name: dept, value: cost }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1200}
                    >
                      {Object.entries(kpis.departmentPayroll).map((_, index) => (
                        <Cell key={index} fill={['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][index % 6]} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {Object.entries(kpis.departmentPayroll).map(([dept, cost], i) => (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][i % 6] }} />
                      <span className="text-xs text-nexus-400 truncate">{dept}</span>
                    </div>
                    <span className="text-xs font-bold text-white">${(cost as number).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-nexus-500 text-sm">No department payroll data</div>
          )}
        </GlassCard>
      </div>

      {/* Recent Payroll Runs */}
      <GlassCard className="p-6" delay={0.5}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Recent Payroll Runs</h2>
          <Link to="/payroll" className="text-sm font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
            All Runs <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full text-left text-sm text-nexus-300">
            <thead className="text-xs text-nexus-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">Month</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold rounded-tr-xl">Processed Date</th>
              </tr>
            </thead>
            <tbody>
              {kpis?.recentPayrollRuns?.map((run: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{run.month}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                      run.status === 'Completed' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 
                      run.status === 'Drafting' ? 'bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20' : 
                      'bg-white/10 text-white border border-white/20'
                    }`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{run.amount}</td>
                  <td className="px-6 py-4 text-nexus-400">{run.date}</td>
                </tr>
              ))}
              {(!kpis?.recentPayrollRuns || kpis.recentPayrollRuns.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-nexus-400">No payroll runs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    
      {/* Announcements Section */}
      <div className="h-[400px] mt-6">
        <AnnouncementsWidget />
      </div>
    </PageTransition>
  )
}
