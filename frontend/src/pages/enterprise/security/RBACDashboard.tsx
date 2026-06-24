import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Shield, Key, History, Users, Plus, ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import HasPermission from '@/components/auth/HasPermission'
import { authAdminApi } from '@/api/authAdmin'

export default function RBACDashboard() {
  const { data: rolesResponse, isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => authAdminApi.getRoles(0, 100)
  })

  const { data: delegationsResponse, isLoading: loadingDelegations } = useQuery({
    queryKey: ['admin-delegations'],
    queryFn: () => authAdminApi.getDelegations(0, 50)
  })

  const { data: auditLogsResponse, isLoading: loadingAudits } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => authAdminApi.getAuditLogs(undefined, undefined, 0, 10)
  })

  const roles = rolesResponse?.content || []
  const activeDelegations = delegationsResponse?.content?.filter(d => d.active) || []
  const recentLogs = auditLogsResponse?.content || []

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent-indigo" />
            Access Control
          </h1>
          <p className="text-sm text-muted">Manage roles, permissions, delegations, and view security logs.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo">
            <Key className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Total Roles</p>
            <p className="text-3xl font-bold text-foreground">{loadingRoles ? '-' : roles.length}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Active Delegations</p>
            <p className="text-3xl font-bold text-foreground">{loadingDelegations ? '-' : activeDelegations.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">System Status</p>
            <p className="text-3xl font-bold text-foreground">Secure</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        
        {/* Navigation Modules */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Security Modules</h2>
          
          <Link to="/settings/permissions">
            <GlassCard className="p-5 hover:bg-surface-hover transition-colors group cursor-pointer mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent-indigo/10 flex items-center justify-center text-accent-indigo group-hover:scale-110 transition-transform">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Permissions Engine</h3>
                    <p className="text-xs text-muted mt-1">Configure role-based access control and user assignments.</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted group-hover:text-foreground transition-colors group-hover:translate-x-1" />
              </div>
            </GlassCard>
          </Link>

          <Link to="/automation/delegation">
            <GlassCard className="p-5 hover:bg-surface-hover transition-colors group cursor-pointer mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-accent-violet/10 flex items-center justify-center text-accent-violet group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Delegation Manager</h3>
                    <p className="text-xs text-muted mt-1">Manage temporary role and permission delegations.</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted group-hover:text-foreground transition-colors group-hover:translate-x-1" />
              </div>
            </GlassCard>
          </Link>

          <Link to="/settings/audit-logs">
            <GlassCard className="p-5 hover:bg-surface-hover transition-colors group cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-nexus-500/10 flex items-center justify-center text-nexus-400 group-hover:scale-110 transition-transform">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Audit Logs</h3>
                    <p className="text-xs text-muted mt-1">View system security and audit trail records.</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted group-hover:text-foreground transition-colors group-hover:translate-x-1" />
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Recent Audit Logs Preview */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Audit Activity</h2>
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-border">
              {loadingAudits ? (
                <div className="p-8 text-center text-muted">Loading logs...</div>
              ) : recentLogs.length === 0 ? (
                <div className="p-8 text-center text-muted">No recent activity.</div>
              ) : (
                recentLogs.map((log: any) => (
                  <div key={log.id} className="p-4 hover:bg-surface/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-foreground">{log.action}</span>
                      <span className="text-xs text-muted">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted">User: {log.userId}</span>
                      <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-accent-indigo/10 text-accent-indigo">
                        {log.entityType}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border bg-surface-hover/50 text-center">
              <Link to="/settings/audit-logs" className="text-xs font-semibold text-accent-indigo hover:text-accent-indigo/80">
                View All Logs &rarr;
              </Link>
            </div>
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  )
}
