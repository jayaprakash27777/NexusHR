import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Search, Filter, ShieldAlert } from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { useQuery } from '@tanstack/react-query'
import { authAdminApi } from '@/api/authAdmin'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { format } from 'date-fns'

export default function AuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => authAdminApi.getAuditLogs(undefined, undefined, 0, 100)
  })

  if (isLoading) return <LoadingScreen />

  const logs = logsRes?.content || []

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-warning" />
            Security Audit Logs
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Immutable record of all authorization and security events.</p>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-400" />
            <input
              type="text"
              placeholder="Search logs by action, entity, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-nexus-900/50 pl-10 pr-4 text-sm text-white placeholder:text-nexus-500 focus:border-accent-indigo focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-nexus-800 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/5 transition-colors">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-nexus-200">
            <thead className="border-b border-white/10 bg-nexus-900/50 text-xs font-semibold uppercase text-nexus-400">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3">Entity ID</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-nexus-300">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-accent-indigo/10 px-2.5 py-0.5 text-xs font-medium text-accent-indigo border border-accent-indigo/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-nexus-100">{log.entityType}</td>
                  <td className="px-4 py-3 text-nexus-400 font-mono text-xs">{log.entityId}</td>
                  <td className="px-4 py-3 text-nexus-400 font-mono text-xs">{log.userId}</td>
                  <td className="px-4 py-3 text-nexus-500">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-nexus-300 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-nexus-500">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageTransition>
  )
}
