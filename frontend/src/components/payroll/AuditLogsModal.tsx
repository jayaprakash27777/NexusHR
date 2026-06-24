import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { payrollApi } from '@/api/payroll'
import GlassCard from '@/components/ui/GlassCard'

interface AuditLogsModalProps {
  isOpen: boolean
  onClose: () => void
  month: number
  year: number
}

export default function AuditLogsModal({ isOpen, onClose, month, year }: AuditLogsModalProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['payroll', 'audit-logs', month, year],
    queryFn: () => payrollApi.getAuditLogs(month, year),
    enabled: isOpen
  })

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl z-10 max-h-[80vh] flex flex-col"
        >
          <GlassCard className="p-0 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Payroll Audit Logs</h2>
                <p className="text-sm text-nexus-400">Activity for {month}/{year}</p>
              </div>
              <button onClick={onClose} className="p-2 text-nexus-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent-indigo" />
                </div>
              ) : !logs || logs.length === 0 ? (
                <div className="text-center p-12 text-nexus-400">
                  No audit logs found for this period.
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                  {logs.map((log: any, index: number) => (
                    <div key={log.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-nexus-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <div className="w-2 h-2 rounded-full bg-accent-indigo"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <div className="flex flex-col mb-1">
                          <span className="text-xs font-semibold text-accent-indigo uppercase tracking-wider">{log.action}</span>
                          <time className="text-[10px] text-nexus-500">{new Date(log.timestamp).toLocaleString()}</time>
                        </div>
                        <div className="text-sm text-nexus-200 mt-1">
                          {log.details || 'No details provided.'}
                        </div>
                        <div className="text-xs text-nexus-400 mt-2 flex items-center gap-1">
                          <span className="opacity-70">By:</span> {log.performedByName || 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
