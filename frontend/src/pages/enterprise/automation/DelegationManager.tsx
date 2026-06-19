import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Calendar, Shield, ArrowRight, Plus, X, Save, 
  UserSquare, AlertCircle, Clock
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import { format, addDays } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAdminApi } from '@/api/authAdmin'
import { employeesApi } from '@/api/employees'
import { useAuthStore } from '@/store'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function DelegationManager() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const currentUser = useAuthStore(s => s.user)

  // New Rule State
  const [delegateeId, setDelegateeId] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'))
  const [scopes, setScopes] = useState<string[]>(['FULL_ROLE'])

  const { data: delegationsRes, isLoading: loadingDel } = useQuery({
    queryKey: ['admin-delegations'],
    queryFn: () => authAdminApi.getDelegations(0, 100)
  })

  const { data: employeesRes, isLoading: loadingEmp } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeesApi.getAll({ size: 100 })
  })

  const createMut = useMutation({
    mutationFn: (data: any) => authAdminApi.createDelegation(currentUser?.id || '', data),
    onSuccess: () => {
      toast.success('Delegation Active', `Responsibility delegated.`)
      queryClient.invalidateQueries({ queryKey: ['admin-delegations'] })
      setShowModal(false)
    }
  })

  const revokeMut = useMutation({
    mutationFn: (id: string) => authAdminApi.revokeDelegation(id),
    onSuccess: () => {
      toast.success('Delegation Revoked', 'The delegation rule has been terminated early.')
      queryClient.invalidateQueries({ queryKey: ['admin-delegations'] })
    }
  })

  const availableScopes = ['FULL_ROLE']

  const handleCreateRule = () => {
    if (!delegateeId) {
      toast.error('Validation Error', 'Please select a delegatee.')
      return
    }

    createMut.mutate({
      delegateeId,
      status: 'FULL_ROLE',
      startDate: `${startDate}T00:00:00`,
      endDate: `${endDate}T23:59:59`
    })
  }

  const handleRevoke = (id: string) => {
    revokeMut.mutate(id)
  }

  if (loadingDel || loadingEmp) return <LoadingScreen />

  const rules = delegationsRes?.content || []
  const employees = employeesRes?.content || []

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Users className="h-6 w-6 text-accent-indigo" />
            Delegation Management
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Temporarily delegate approval authorities and role permissions.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> New Delegation Rule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Active Rules */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-nexus-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-success" /> Active Delegations
          </h2>
          {rules.filter(r => r.active).length === 0 ? (
            <div className="text-center py-8 text-nexus-500 border border-dashed border-white/10 rounded-xl">No active delegations.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rules.filter(r => r.active).map(rule => (
                <GlassCard key={rule.id} className="p-5 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-success"></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-success/20 text-success border border-success/30">
                      Active
                    </span>
                    <button onClick={() => handleRevoke(rule.id)} className="text-xs text-nexus-400 hover:text-danger transition-colors">
                      Revoke
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-nexus-900/50 rounded-lg p-3 border border-white/5 mb-4">
                    <div className="flex flex-col items-center flex-1">
                      <UserSquare className="h-6 w-6 text-nexus-300 mb-1" />
                      <span className="text-[11px] text-nexus-400">Delegator</span>
                      <span className="text-sm font-semibold text-nexus-100 text-center">{rule.delegatorName}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-accent-indigo flex-shrink-0" />
                    <div className="flex flex-col items-center flex-1">
                      <Shield className="h-6 w-6 text-accent-indigo mb-1" />
                      <span className="text-[11px] text-nexus-400">Delegatee</span>
                      <span className="text-sm font-semibold text-accent-indigo text-center">{rule.delegateeName}</span>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="text-[11px] font-medium text-nexus-500 uppercase mb-1">Duration</div>
                      <div className="flex items-center gap-2 text-sm text-nexus-200 bg-white/5 rounded px-2 py-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {rule.startDate} to {rule.endDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-nexus-500 uppercase mb-1">Scopes</div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-1 rounded bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/20 text-xs">
                          {rule.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Expired Rules */}
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-nexus-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-nexus-500" /> Past Delegations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.filter(r => !r.active).map(rule => (
              <GlassCard key={rule.id} className="p-5 flex flex-col opacity-60">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-nexus-800 text-nexus-400 border border-white/10">
                    Expired / Revoked
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 bg-nexus-900/50 rounded-lg p-3 border border-white/5 mb-4">
                  <div className="flex flex-col items-center flex-1">
                    <UserSquare className="h-5 w-5 text-nexus-500 mb-1" />
                    <span className="text-xs font-semibold text-nexus-300 text-center">{rule.delegatorName}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-nexus-600 flex-shrink-0" />
                  <div className="flex flex-col items-center flex-1">
                    <Shield className="h-5 w-5 text-nexus-500 mb-1" />
                    <span className="text-xs font-semibold text-nexus-300 text-center">{rule.delegateeName}</span>
                  </div>
                </div>

                <div className="text-xs text-nexus-500">
                  {rule.status}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* New Delegation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-nexus-900 p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-indigo to-accent-violet" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Create Delegation Rule</h3>
                <button onClick={() => setShowModal(false)} className="text-nexus-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-nexus-300">Delegator (You)</label>
                  <input type="text" value={currentUser?.fullName || ''} disabled className="w-full rounded-lg border border-white/10 bg-nexus-950 px-4 py-2 text-sm text-nexus-500 cursor-not-allowed" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-nexus-300">Delegatee</label>
                  <select 
                    value={delegateeId}
                    onChange={(e) => setDelegateeId(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-nexus-950 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none"
                  >
                    <option value="" disabled>Select an employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.designation})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-nexus-300">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-nexus-950 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-nexus-300">End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-nexus-950 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-nexus-300">Scope of Delegation</label>
                  <div className="space-y-2 bg-nexus-950 p-3 rounded-xl border border-white/5">
                    {availableScopes.map(scope => (
                      <label key={scope} className="flex items-center gap-3 cursor-pointer group p-2 rounded hover:bg-white/5 transition-colors">
                        <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                          scopes.includes(scope) ? 'border-accent-indigo bg-accent-indigo' : 'border-white/20 bg-transparent'
                        }`}>
                          {scopes.includes(scope) && <div className="h-2.5 w-2.5 rounded-sm bg-white" />}
                        </div>
                        <span className="text-sm text-nexus-200 group-hover:text-white">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning">
                    The delegatee will receive notifications for all selected scopes and will be able to approve/reject on your behalf until the rule expires or is manually revoked.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-nexus-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleCreateRule} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-indigo text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-500">
                  <Save className="h-4 w-4" /> Save Rule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
