import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import GlassCard from '@/components/ui/GlassCard'
import { CalendarDays, CheckCircle, XCircle, Clock, Plus, Loader2, X } from 'lucide-react'
import { leavesApi, type LeaveApplyRequest, type LeaveRequestResponse } from '@/api/leaves'
import { useToastStore } from '@/store/toast'
import PageTransition from '@/components/animation/PageTransition'
import { useAuthStore } from '@/store'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

const COLORS = {
  CASUAL_LEAVE: '#3b82f6',
  SICK_LEAVE: '#f43f5e',
  EARNED_LEAVE: '#10b981',
  WORK_FROM_HOME: '#8b5cf6'
}

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  PENDING: { color: 'text-warning bg-warning/10 border-warning/20', icon: Clock },
  APPROVED: { color: 'text-success bg-success/10 border-success/20', icon: CheckCircle },
  REJECTED: { color: 'text-danger bg-danger/10 border-danger/20', icon: XCircle },
  CANCELLED: { color: 'text-nexus-400 bg-nexus-800 border-white/10', icon: XCircle },
}

function ApplyLeaveModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [form, setForm] = useState<Partial<LeaveApplyRequest>>({
    leaveType: 'CASUAL_LEAVE'
  })

  const mutation = useMutation({
    mutationFn: (data: LeaveApplyRequest) => leavesApi.applyLeave(user?.employeeId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      addToast({ title: 'Leave Applied', description: 'Your leave request has been submitted successfully.', type: 'success' })
      onClose()
    },
    onError: (err: any) => {
      addToast({ title: 'Application Failed', description: err?.response?.data?.message || 'Failed to apply for leave.', type: 'error' })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.startDate || !form.endDate || !form.reason || !form.leaveType) return
    mutation.mutate(form as LeaveApplyRequest)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-nexus-900 shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-nexus-50">Apply for Leave</h2>
            <p className="text-sm text-nexus-400 mt-0.5">Submit a new time-off request</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-nexus-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Leave Type</label>
            <select
              value={form.leaveType}
              onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
            >
              <option value="EARNED_LEAVE">Earned Leave</option>
              <option value="SICK_LEAVE">Sick Leave</option>
              <option value="CASUAL_LEAVE">Casual Leave</option>
              <option value="WORK_FROM_HOME">Work From Home</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Start Date</label>
              <input
                required type="date" value={form.startDate || ''}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">End Date</label>
              <input
                required type="date" value={form.endDate || ''}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Reason</label>
            <textarea
              required value={form.reason || ''}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none resize-none h-24"
              placeholder="Provide a short explanation..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-sm text-nexus-300 hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-accent-indigo text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function LeavesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'MY_LEAVES' | 'TEAM_LEAVES'>('MY_LEAVES')

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  // Fetch My Leaves
  const { data: myLeavesData, isLoading: isLoadingMy } = useQuery({
    queryKey: ['leaves', 'my', user?.employeeId],
    queryFn: () => leavesApi.getByEmployee(user?.employeeId as string, 0, 50),
    enabled: !!user?.employeeId && activeTab === 'MY_LEAVES',
  })

  // Fetch Team Leaves (if Manager)
  const { data: teamLeavesData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['leaves', 'team', user?.employeeId],
    queryFn: () => leavesApi.getAllForManager(user?.employeeId as string, 0, 50),
    enabled: !!user?.employeeId && isManager && activeTab === 'TEAM_LEAVES',
  })

  // Fetch Leave Balances
  const { data: balances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ['leaves', 'balance', user?.employeeId],
    queryFn: () => leavesApi.getLeaveBalances(user?.employeeId as string),
    enabled: !!user?.employeeId,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => leavesApi.approveLeave(id, user?.employeeId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      addToast({ title: 'Leave Approved', description: 'The request has been approved.', type: 'success' })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => leavesApi.rejectLeave(id, user?.employeeId as string, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      addToast({ title: 'Leave Rejected', description: 'The request has been rejected.', type: 'success' })
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => leavesApi.cancelLeave(id, user?.employeeId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      addToast({ title: 'Leave Cancelled', description: 'The request has been cancelled.', type: 'success' })
    }
  })

  const handleApprove = (id: string) => approveMutation.mutate(id)

  const handleReject = (id: string) => {
    const reason = window.prompt("Enter rejection reason:")
    if (reason) rejectMutation.mutate({ id, reason })
  }

  const handleCancel = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      cancelMutation.mutate(id)
    }
  }

  const currentLeaves = activeTab === 'MY_LEAVES' ? (myLeavesData?.content || []) : (teamLeavesData?.content || [])
  const isLoading = activeTab === 'MY_LEAVES' ? isLoadingMy : isLoadingTeam

  const pendingCount = currentLeaves.filter((l: any) => l.status === 'PENDING').length
  const approvedCount = currentLeaves.filter((l: any) => l.status === 'APPROVED').length
  const rejectedCount = currentLeaves.filter((l: any) => l.status === 'REJECTED').length

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">Time Off Management</h1>
          <p className="text-sm text-nexus-400 mt-1">Review and manage leave requests</p>
        </div>
        <motion.button 
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-accent-indigo to-accent-violet px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-indigo/20" 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" /> Request Time Off
        </motion.button>
      </div>

      {isManager && (
        <div className="flex gap-4 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab('MY_LEAVES')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'MY_LEAVES' ? 'border-accent-indigo text-white' : 'border-transparent text-nexus-400 hover:text-nexus-200'}`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('TEAM_LEAVES')}
            className={`pb-2 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'TEAM_LEAVES' ? 'border-accent-indigo text-white' : 'border-transparent text-nexus-400 hover:text-nexus-200'}`}
          >
            Team Approvals
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending', value: pendingCount, color: 'text-warning' },
          { label: 'Approved', value: approvedCount, color: 'text-success' },
          { label: 'Rejected', value: rejectedCount, color: 'text-danger' },
        ].map((s, i) => (
          <GlassCard key={s.label} className="p-5" delay={i * 0.05}>
            <p className="text-xs text-nexus-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-2 ${s.color}`}>{isLoading ? '-' : s.value}</p>
          </GlassCard>
        ))}
      </div>

      {activeTab === 'MY_LEAVES' && balances && balances.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((b, i) => {
            const usedColor = COLORS[b.leaveType as keyof typeof COLORS] || '#6366f1'
            const data = [
              { name: 'Used', value: b.usedDays, fill: usedColor },
              { name: 'Remaining', value: b.remainingDays, fill: 'rgba(255,255,255,0.05)' }
            ]
            
            return (
              <GlassCard key={b.leaveType} className="p-5 flex flex-col items-center justify-center relative" delay={0.1 + i * 0.05}>
                <h4 className="text-xs font-semibold text-nexus-300 uppercase tracking-wider mb-2">{b.leaveType.replace(/_/g, ' ')}</h4>
                <div className="h-[120px] w-[120px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#11111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-white">{b.remainingDays}</span>
                    <span className="text-[10px] text-nexus-500 uppercase">Left</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-nexus-400 font-medium">
                  {b.usedDays} used of {b.totalDays} total
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      <GlassCard className="overflow-hidden" delay={0.15}>
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Employee', 'Type', 'Duration', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-nexus-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 text-accent-indigo animate-spin mx-auto" />
                  </td>
                </tr>
              ) : currentLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-nexus-400">
                    No leave requests found.
                  </td>
                </tr>
              ) : currentLeaves.map((req: any, i: number) => {
                const config = statusConfig[req.status] || statusConfig['PENDING']
                const StatusIcon = config.icon
                return (
                  <motion.tr key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-nexus-200">
                      <div>
                        {req.employeeName || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-nexus-400">{req.leaveType.replace('_', ' ')}</td>
                    <td className="px-5 py-3.5 text-xs text-nexus-400">{new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-xs text-nexus-300">{req.totalDays}d</td>
                    <td className="px-5 py-3.5 text-xs text-nexus-500 max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${config.color}`}>
                        <StatusIcon className="h-3 w-3" /> {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          {activeTab === 'TEAM_LEAVES' && (
                            <>
                              <button 
                                onClick={() => handleApprove(req.id)}
                                disabled={approveMutation.isPending && approveMutation.variables === req.id}
                                className="rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleReject(req.id)}
                                disabled={rejectMutation.isPending && rejectMutation.variables?.id === req.id}
                                className="rounded-md bg-danger/10 px-2 py-1 text-[10px] font-medium text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {activeTab === 'MY_LEAVES' && (
                            <button 
                              onClick={() => handleCancel(req.id)}
                              disabled={cancelMutation.isPending && cancelMutation.variables === req.id}
                              className="rounded-md bg-nexus-500/10 px-2 py-1 text-[10px] font-medium text-nexus-300 hover:bg-nexus-500/20 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AnimatePresence>
        {showApplyModal && <ApplyLeaveModal onClose={() => setShowApplyModal(false)} />}
      </AnimatePresence>
    </PageTransition>
  )
}
