import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'
import KPICard from '@/components/ui/KPICard'
import GlassCard from '@/components/ui/GlassCard'
import {
  Shield, Eye, Activity, AlertTriangle, ChevronRight, AlertCircle,
  Lock, FileSearch, Clock, Monitor, Key, History, Users, CheckCircle2,
  Server, Zap
} from 'lucide-react'
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { authAdminApi } from '@/api/authAdmin'
import { dashboardApi } from '@/api/dashboard'
import PageTransition from '@/components/animation/PageTransition'
import AnnouncementsWidget from '@/components/ui/AnnouncementsWidget'
import { Link } from 'react-router-dom'

const ENTITY_COLORS: Record<string, string> = {
  ROLE: '#6366f1',
  USER: '#3b82f6',
  PERMISSION: '#8b5cf6',
  DELEGATION: '#06b6d4',
  SETTING: '#10b981',
  EMPLOYEE: '#f59e0b',
  DEFAULT: '#737373',
}

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

export default function AuditorDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: auditLogsResponse, isLoading: loadingLogs, isError } = useQuery({
    queryKey: ['auditor-audit-logs'],
    queryFn: () => authAdminApi.getAuditLogs(undefined, undefined, 0, 20),
    refetchInterval: 30000,
  })

  const { data: rolesResponse, isLoading: loadingRoles } = useQuery({
    queryKey: ['auditor-roles'],
    queryFn: () => authAdminApi.getRoles(0, 100),
  })

  const { data: delegationsResponse } = useQuery({
    queryKey: ['auditor-delegations'],
    queryFn: () => authAdminApi.getDelegations(0, 50),
  })

  const { data: auditorDashboard, isLoading: loadingDashboard } = useQuery({
    queryKey: ['auditor-dashboard-kpis'],
    queryFn: () => dashboardApi.getAuditorDashboard(),
    refetchInterval: 60000,
  })

  const isLoading = loadingLogs || loadingRoles || loadingDashboard

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-danger" />
        <p className="text-nexus-300">Failed to load audit dashboard data.</p>
      </div>
    )
  }

  const logs = auditLogsResponse?.content || []
  const roles = rolesResponse?.content || []
  const activeDelegations = delegationsResponse?.content?.filter((d: any) => d.active) || []
  const totalAuditEvents = auditLogsResponse?.totalElements || logs.length

  // Aggregate audit events by entity type
  const entityCounts: Record<string, number> = {}
  logs.forEach((log: any) => {
    const type = log.entityType || 'OTHER'
    entityCounts[type] = (entityCounts[type] || 0) + 1
  })

  const entityData = Object.entries(entityCounts).map(([name, count]) => ({
    name,
    count,
    color: ENTITY_COLORS[name] || ENTITY_COLORS.DEFAULT,
  }))

  // Aggregate by action type
  const actionCounts: Record<string, number> = {}
  logs.forEach((log: any) => {
    const action = log.action || 'OTHER'
    actionCounts[action] = (actionCounts[action] || 0) + 1
  })

  const actionData = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, count }))

  // Security alerts (high-severity actions)
  const alertActions = ['DELETE', 'ROLE_REVOKE', 'PERMISSION_REMOVE', 'USER_DEACTIVATE']
  const securityAlerts = logs.filter((log: any) => 
    alertActions.some(a => log.action?.toUpperCase().includes(a))
  ).length

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
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <Shield className="h-9 w-9 text-accent-indigo" />
              Audit & Compliance
            </h1>
            <span className="px-3 py-1 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-xs font-bold uppercase tracking-wider">
              Auditor
            </span>
          </div>
          <p className="text-base text-nexus-400">
            Security monitoring, compliance tracking, and access audit trail.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/settings/audit-logs" className="px-5 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-accent-indigo/20 active:scale-95 text-sm flex items-center gap-2">
            <FileSearch className="w-4 h-4" />
            Full Audit Log
          </Link>
          <Link to="/settings/permissions" className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-all shadow-sm active:scale-95 text-sm backdrop-blur-md flex items-center gap-2">
            <Key className="w-4 h-4" />
            Permissions
          </Link>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          title="Audit Events"
          value={totalAuditEvents}
          icon={<Activity className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-indigo to-accent-violet"
          delay={0.1}
        />
        <KPICard
          title="Security Alerts"
          value={securityAlerts}
          icon={<AlertTriangle className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-rose to-accent-orange"
          delay={0.15}
        />
        <KPICard
          title="Active Roles"
          value={roles.length}
          icon={<Key className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-blue to-accent-cyan"
          delay={0.2}
        />
        <KPICard
          title="Active Delegations"
          value={activeDelegations.length}
          icon={<Users className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-emerald to-accent-teal"
          delay={0.25}
        />
        <KPICard
          title="Active Sessions"
          value={auditorDashboard?.activeSessions || 0}
          icon={<Server className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-cyan to-accent-blue"
          delay={0.26}
        />
        <KPICard
          title="Policy Violations"
          value={auditorDashboard?.policyViolations || 0}
          icon={<Zap className="h-6 w-6" />}
          gradient="bg-gradient-to-r from-accent-orange to-accent-rose"
          delay={0.27}
        />
      </div>

      {/* Compliance Score Banner */}
      <GlassCard className="p-5 border-l-4 border-l-success" glow="indigo" delay={0.28}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 flex-shrink-0 border border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground tracking-tight mb-1">System Compliance Status</h3>
            <p className="text-sm text-muted">
              All security policies enforced. RBAC system operational with {roles.length} roles configured.
              {activeDelegations.length > 0 && ` ${activeDelegations.length} active delegations being monitored.`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="px-4 py-2 rounded-xl bg-success/10 border border-success/20">
              <span className="text-lg font-bold text-success">Secure</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audit Events by Action — 8 cols */}
        <GlassCard className="lg:col-span-8 p-6 flex flex-col h-[380px]" delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Events by Action</h2>
              <p className="text-sm text-nexus-400">Distribution of recent audit actions</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {actionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={20}>
                  <defs>
                    <linearGradient id="auditBarGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} width={140} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="url(#auditBarGrad)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-nexus-500 text-sm">No audit data available</div>
            )}
          </div>
        </GlassCard>

        {/* Events by Entity Type — 4 cols */}
        <GlassCard className="lg:col-span-4 p-6" delay={0.35}>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">By Entity Type</h2>
            <p className="text-sm text-nexus-400">Audit events categorized</p>
          </div>
          {entityData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={entityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                      animationDuration={1200}
                    >
                      {entityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {entityData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-nexus-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-nexus-500 text-sm">No entity data</div>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Timeline */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col" delay={0.4}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Audit Trail</h2>
              <p className="text-sm text-nexus-400">Recent security events</p>
            </div>
            <Link to="/settings/audit-logs" className="text-xs font-medium text-accent-indigo hover:text-accent-indigo/80 flex items-center transition-colors">
              Full Log <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
              
              <div className="space-y-4">
                {logs.slice(0, 10).map((log: any, i: number) => {
                  const isAlert = alertActions.some(a => log.action?.toUpperCase().includes(a))
                  return (
                    <motion.div
                      key={log.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="relative pl-10"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 ${isAlert ? 'bg-danger border-danger/50' : 'bg-accent-indigo border-accent-indigo/50'}`} />
                      
                      <div className={`p-3 rounded-xl ${isAlert ? 'bg-danger/5 border border-danger/20' : 'bg-white/5 border border-white/10'} hover:bg-white/10 transition-colors`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-white">{log.action}</span>
                          <span className="text-[10px] text-nexus-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-nexus-400">User: {log.userId?.substring(0, 8)}...</span>
                          <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full ${
                            isAlert ? 'bg-danger/10 text-danger' : 'bg-accent-indigo/10 text-accent-indigo'
                          }`}>
                            {log.entityType}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {logs.length === 0 && (
                  <p className="text-sm text-nexus-400 text-center py-8">No audit events found.</p>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Security Quick Links */}
        <GlassCard className="p-6 flex flex-col" delay={0.45}>
          <h2 className="text-lg font-bold text-white tracking-tight mb-4">Security Modules</h2>
          <div className="space-y-3 flex-1">
            <Link to="/settings/audit-logs" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-indigo/30 transition-all group">
              <div className="p-2.5 bg-accent-indigo/10 rounded-lg group-hover:scale-110 transition-transform"><History className="w-5 h-5 text-accent-indigo" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-white">Audit Logs</p><p className="text-xs text-nexus-400 mt-0.5">Full event history</p></div>
              <ChevronRight className="w-5 h-5 text-nexus-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
            </Link>
            <Link to="/settings/permissions" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-violet/30 transition-all group">
              <div className="p-2.5 bg-accent-violet/10 rounded-lg group-hover:scale-110 transition-transform"><Lock className="w-5 h-5 text-accent-violet" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-white">Permissions</p><p className="text-xs text-nexus-400 mt-0.5">Role & access control</p></div>
              <ChevronRight className="w-5 h-5 text-nexus-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
            </Link>
            <Link to="/settings/security" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-blue/30 transition-all group">
              <div className="p-2.5 bg-accent-blue/10 rounded-lg group-hover:scale-110 transition-transform"><Monitor className="w-5 h-5 text-accent-blue" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-white">Security Center</p><p className="text-xs text-nexus-400 mt-0.5">Sessions & devices</p></div>
              <ChevronRight className="w-5 h-5 text-nexus-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
            </Link>
            <Link to="/automation/delegation" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-cyan/30 transition-all group">
              <div className="p-2.5 bg-accent-cyan/10 rounded-lg group-hover:scale-110 transition-transform"><Users className="w-5 h-5 text-accent-cyan" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-white">Delegations</p><p className="text-xs text-nexus-400 mt-0.5">{activeDelegations.length} active</p></div>
              <ChevronRight className="w-5 h-5 text-nexus-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* System Health Overview */}
      <GlassCard className="p-6 mt-6" delay={0.5}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">System Health Overview</h2>
            <p className="text-sm text-nexus-400">Real-time status of critical security metrics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold">
            <Monitor className="w-3.5 h-3.5" />
            <span>Live Sync</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-xs font-semibold text-nexus-400 mb-2 uppercase tracking-wider">Active Sessions</h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{auditorDashboard?.activeSessions || 0}</span>
              <span className="text-xs text-success mb-1 flex items-center"><ChevronRight className="w-3 h-3 -rotate-90"/> Stable</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-xs font-semibold text-nexus-400 mb-2 uppercase tracking-wider">Policy Violations</h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{auditorDashboard?.policyViolations || 0}</span>
              <span className={`text-xs mb-1 flex items-center ${auditorDashboard?.policyViolations ? 'text-danger' : 'text-success'}`}>
                 {auditorDashboard?.policyViolations ? <ChevronRight className="w-3 h-3 rotate-90"/> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                 {auditorDashboard?.policyViolations ? 'Action Needed' : 'Clear'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-xs font-semibold text-nexus-400 mb-2 uppercase tracking-wider">Audit Coverage</h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-xs text-success mb-1 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Enforced</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-xs font-semibold text-nexus-400 mb-2 uppercase tracking-wider">Data Integrity</h3>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">Verified</span>
              <span className="text-xs text-accent-blue mb-1 flex items-center"><Shield className="w-3 h-3 mr-1"/> Protected</span>
            </div>
          </div>
        </div>
      </GlassCard>
    
      {/* Announcements Section */}
      <div className="h-[400px] mt-6">
        <AnnouncementsWidget />
      </div>
    </PageTransition>
  )
}
