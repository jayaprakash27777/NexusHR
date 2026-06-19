import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flag, Search, Filter, Plus, Power, Globe, Users, 
  AlertTriangle, History, Server, Loader2, X
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import { formatDistanceToNow } from '@/lib/dateUtils'
import { featureFlagsApi, type FeatureFlag, type FeatureFlagRequest } from '@/api/featureFlags'
import { useDebounce } from '@/hooks/useDebounce'

function AddFlagModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Partial<FeatureFlagRequest>>({
    environment: 'production',
    flagType: 'BOOLEAN',
    enabled: false,
    rolloutPercentage: 100
  })

  const mutation = useMutation({
    mutationFn: featureFlagsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] })
      toast.success('Feature Flag Created', 'New feature flag has been added.')
      onClose()
    },
    onError: (err: any) => {
      toast.error('Creation Failed', err?.response?.data?.message || 'Failed to create feature flag.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.flagKey || !form.name) return
    mutation.mutate(form as FeatureFlagRequest)
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
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-nexus-900 shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-nexus-50">Create Feature Flag</h2>
            <p className="text-sm text-nexus-400 mt-0.5">Define a new flag for deployment</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-nexus-400 hover:text-white hover:bg-white/5 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Flag Key *</label>
            <input
              required type="text" value={form.flagKey || ''}
              onChange={(e) => setForm(f => ({ ...f, flagKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
              className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              placeholder="e.g. new_dashboard_beta"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Name *</label>
            <input
              required type="text" value={form.name || ''}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              placeholder="New Dashboard Beta"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none resize-none h-24"
              placeholder="What does this flag control?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Environment</label>
              <select
                value={form.environment || 'production'}
                onChange={(e) => setForm(f => ({ ...f, environment: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-nexus-400 uppercase tracking-wider mb-2">Rollout %</label>
              <input
                type="number" min="0" max="100" value={form.rolloutPercentage || 0}
                onChange={(e) => setForm(f => ({ ...f, rolloutPercentage: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-white/10 bg-nexus-800/50 px-4 py-2.5 text-sm text-white focus:border-accent-indigo focus:outline-none"
              />
            </div>
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
              Create Flag
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function FeatureFlagCenter() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['featureFlags', { search: debouncedSearch }],
    queryFn: () => featureFlagsApi.getAll({ search: debouncedSearch || undefined, size: 50 }),
  })

  const toggleMutation = useMutation({
    mutationFn: featureFlagsApi.toggle,
    onSuccess: (updatedFlag) => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] })
      toast.success('Feature Flag Updated', `Flag has been ${updatedFlag.enabled ? 'enabled' : 'disabled'} globally.`)
    }
  })

  const rolloutMutation = useMutation({
    mutationFn: ({ id, flag, val }: { id: string, flag: FeatureFlag, val: number }) => {
      return featureFlagsApi.update(id, {
        flagKey: flag.flagKey,
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        rolloutPercentage: val,
        environment: flag.environment,
        flagType: flag.flagType,
        allowedRoles: flag.allowedRoles
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] })
    }
  })

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id)
  }

  const handleRolloutChange = (flag: FeatureFlag, val: number) => {
    rolloutMutation.mutate({ id: flag.id, flag, val })
  }

  const flags = data?.content || []

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Flag className="h-6 w-6 text-accent-indigo" />
            Feature Flag Center
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Manage global rollouts, A/B tests, and beta features.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 transition-colors hover:bg-white/10">
            <History className="h-4 w-4" /> Audit Logs
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-[var(--radius-md)] bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> New Flag
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <GlassCard className="p-4 flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-400" />
          <input
            type="text"
            placeholder="Search by name or key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/10 bg-nexus-900/50 pl-10 pr-4 text-sm text-nexus-100 placeholder:text-nexus-500 focus:border-accent-indigo focus:outline-none focus:ring-1 focus:ring-accent-indigo transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-nexus-300 hover:bg-white/10 hover:text-nexus-100">
            <Server className="h-3.5 w-3.5" /> Environment: All
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-nexus-300 hover:bg-white/10 hover:text-nexus-100">
            <Filter className="h-3.5 w-3.5" /> More Filters
          </button>
        </div>
      </GlassCard>

      {/* Flag List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {flags.map((flag) => (
            <GlassCard key={flag.id} className="p-0 overflow-hidden transition-all hover:border-white/10 hover:shadow-xl">
              <div className="p-5 flex flex-col lg:flex-row gap-6 lg:items-center">
                
                {/* Info section */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-nexus-50">{flag.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-nexus-800 border border-white/5 text-[10px] font-mono text-nexus-400">
                      {flag.flagKey}
                    </span>
                    {!flag.enabled && (
                      <span className="px-2 py-0.5 rounded-md bg-danger/10 border border-danger/20 text-[10px] font-bold text-danger">
                        KILLED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-nexus-400 mb-4">{flag.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-nexus-300">
                      <Globe className="h-3.5 w-3.5 text-accent-blue" />
                      {flag.environment}
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-1.5 text-nexus-300">
                      <History className="h-3.5 w-3.5" />
                      Updated {formatDistanceToNow(flag.updatedAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Controls section */}
                <div className="flex flex-col gap-4 lg:min-w-[300px] p-4 rounded-xl bg-nexus-900/50 border border-white/5">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Power className={`h-4 w-4 ${flag.enabled ? 'text-success' : 'text-nexus-500'}`} />
                      <span className="text-sm font-semibold text-nexus-100">Global State</span>
                    </div>
                    
                    {/* Custom Toggle Switch */}
                    <button 
                      onClick={() => handleToggle(flag.id)}
                      disabled={toggleMutation.isPending && toggleMutation.variables === flag.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${flag.enabled ? 'bg-success' : 'bg-nexus-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="h-px w-full bg-white/5" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-nexus-100">
                        <Users className="h-4 w-4 text-accent-violet" />
                        Rollout
                      </div>
                      <span className="text-xs font-mono font-medium text-accent-violet">{flag.rolloutPercentage}%</span>
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={flag.rolloutPercentage}
                      onChange={(e) => handleRolloutChange(flag, parseInt(e.target.value))}
                      disabled={!flag.enabled || (rolloutMutation.isPending && rolloutMutation.variables?.id === flag.id)}
                      className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${!flag.enabled ? 'opacity-50 grayscale' : ''}`}
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${flag.rolloutPercentage}%, rgba(255,255,255,0.1) ${flag.rolloutPercentage}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                    {flag.enabled && flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100 && (
                      <p className="text-[10px] text-warning mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Canary release active
                      </p>
                    )}
                  </div>

                </div>

              </div>
            </GlassCard>
          ))}
          {flags.length === 0 && (
            <div className="text-center py-12">
              <p className="text-nexus-400">No feature flags found.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && <AddFlagModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </PageTransition>
  )
}
