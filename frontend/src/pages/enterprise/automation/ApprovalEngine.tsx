import { useState, useEffect } from 'react'
import { 
  GitMerge, UserCheck, ShieldCheck, Clock, Settings, Plus, 
  Save, AlertCircle, ArrowDown, Users, Bell
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAdminApi } from '@/api/authAdmin'
import LoadingScreen from '@/components/ui/LoadingScreen'

const PROCESS_MAP: Record<string, { category: string, action: string }> = {
  'Leave Request': { category: 'LEAVE', action: 'APPROVE' },
  'Payroll Approval': { category: 'PAYROLL', action: 'APPROVE' },
  'Expense Report': { category: 'PAYMENT', action: 'APPROVE' },
}

export default function ApprovalEngine() {
  const queryClient = useQueryClient()
  const [activeProcess, setActiveProcess] = useState('Leave Request')
  
  // Local state for editing the chain before saving
  const [localSteps, setLocalSteps] = useState<any[]>([])

  const { data: matrixRes, isLoading: loadingMatrix } = useQuery({
    queryKey: ['admin-approval-matrix'],
    queryFn: () => authAdminApi.getApprovalMatrices(0, 100)
  })

  const { data: rolesRes, isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => authAdminApi.getRoles(0, 100)
  })

  // Whenever matrix or active process changes, sync local state
  useEffect(() => {
    if (matrixRes && rolesRes) {
      const mapping = PROCESS_MAP[activeProcess]
      if (!mapping) {
        setLocalSteps([])
        return
      }

      // Filter matrix rules for this category/action
      const rules = matrixRes.content.filter(m => m.category === mapping.category && m.action === mapping.action)
      
      // Map to local UI format
      const steps = rules.map(r => ({
        id: r.id,
        isNew: false,
        title: `Level ${r.approvalLevel}`,
        requiredRoleId: r.requiredRoleId,
        approvalLevel: r.approvalLevel
      })).sort((a, b) => a.approvalLevel - b.approvalLevel)

      setLocalSteps(steps)
    }
  }, [matrixRes, rolesRes, activeProcess])

  // Simple save mutation (deletes old ones for this process, saves new ones)
  // For robustness, we'd normally just diff, but let's do a simplified version:
  const saveChainMut = useMutation({
    mutationFn: async (stepsToSave: any[]) => {
      const mapping = PROCESS_MAP[activeProcess]
      
      // Ideally delete old rules for this category/action first, but our API only has delete by ID.
      // So let's delete the existing ones from matrixRes.
      const oldRules = matrixRes?.content.filter(m => m.category === mapping.category && m.action === mapping.action) || []
      for (const rule of oldRules) {
        await authAdminApi.deleteApprovalMatrix(rule.id)
      }

      // Now save new ones
      for (let i = 0; i < stepsToSave.length; i++) {
        await authAdminApi.createApprovalMatrix({
          category: mapping.category,
          action: mapping.action,
          approvalLevel: i + 1,
          requiredRoleId: parseInt(stepsToSave[i].requiredRoleId)
        })
      }
    },
    onSuccess: () => {
      toast.success('Approval Chain Saved', `The chain for ${activeProcess} is updated.`)
      queryClient.invalidateQueries({ queryKey: ['admin-approval-matrix'] })
    }
  })

  const handleSave = () => {
    saveChainMut.mutate(localSteps)
  }

  const addStep = () => {
    setLocalSteps([...localSteps, { 
      id: Math.random().toString(36).substring(7), 
      isNew: true,
      title: `Level ${localSteps.length + 1}`, 
      requiredRoleId: rolesRes?.content[0]?.id || 0,
      approvalLevel: localSteps.length + 1
    }])
  }

  const removeStep = (id: string) => {
    setLocalSteps(localSteps.filter(s => s.id !== id))
  }

  if (loadingMatrix || loadingRoles) return <LoadingScreen />

  const roles = rolesRes?.content || []

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <GitMerge className="h-6 w-6 text-accent-indigo" />
            Advanced Approval Engine
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Configure multi-stage approval chains based on roles.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saveChainMut.isPending}
          className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Save Configuration
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Process List Sidebar */}
        <div className="lg:w-1/4 xl:w-1/5 space-y-4">
          <GlassCard className="p-4 flex flex-col gap-2 h-full">
            <h3 className="text-sm font-semibold text-nexus-100 uppercase tracking-wider mb-2">Core Processes</h3>
            {Object.keys(PROCESS_MAP).map(proc => (
              <button
                key={proc}
                onClick={() => setActiveProcess(proc)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  activeProcess === proc 
                    ? 'bg-accent-indigo/10 border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)] text-nexus-100' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-nexus-300'
                }`}
              >
                <div className="text-sm font-semibold">{proc}</div>
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Chain Configuration Area */}
        <div className="flex-1 space-y-6">
          <GlassCard className="p-6 h-full flex flex-col overflow-hidden">
            <div className="mb-6 flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-nexus-50">{activeProcess} Chain</h2>
                <p className="text-sm text-nexus-400 mt-1">When an employee submits a {activeProcess.toLowerCase()}, it will follow this path.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col items-center">
              
              <div className="w-full max-w-2xl space-y-0">
                {/* Initiator */}
                <div className="relative flex flex-col items-center">
                  <div className="w-full rounded-xl border border-white/10 bg-nexus-900/50 p-4 text-center">
                    <UserCheck className="h-6 w-6 text-nexus-400 mx-auto mb-2" />
                    <div className="text-sm font-semibold text-nexus-100">Employee Initiates Request</div>
                  </div>
                  <div className="h-8 w-px bg-gradient-to-b from-white/20 to-accent-indigo/50 relative my-2">
                    <ArrowDown className="h-4 w-4 absolute -bottom-4 left-1/2 -translate-x-1/2 text-accent-indigo/50" />
                  </div>
                </div>

                {/* Steps */}
                {localSteps.map((step, index) => (
                  <div key={step.id} className="relative flex flex-col items-center mt-6">
                    <div className="w-full rounded-xl border border-accent-indigo/30 bg-accent-indigo/5 p-5 shadow-[0_0_30px_rgba(99,102,241,0.05)] relative group transition-all hover:border-accent-indigo/50">
                      
                      <button 
                        onClick={() => removeStep(step.id)}
                        className="absolute top-4 right-4 text-nexus-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-accent-indigo/20 text-accent-indigo">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold text-nexus-50 bg-transparent border-none focus:outline-none">
                          Level {index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-nexus-300 flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" /> Required Role Approver
                          </label>
                          <select 
                            value={step.requiredRoleId}
                            onChange={(e) => {
                              const newSteps = [...localSteps]
                              newSteps[index].requiredRoleId = e.target.value
                              setLocalSteps(newSteps)
                            }}
                            className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-3 py-2 text-sm text-white focus:outline-none"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name} {r.isSystem ? '(System)' : ''}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                    </div>
                    
                    {/* Connecting Line to next step */}
                    {index < localSteps.length - 1 && (
                      <div className="h-8 w-px bg-gradient-to-b from-accent-indigo/50 to-accent-indigo/50 relative my-2">
                        <ArrowDown className="h-4 w-4 absolute -bottom-4 left-1/2 -translate-x-1/2 text-accent-indigo/50" />
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-8 pt-4 flex justify-center border-t border-dashed border-white/10">
                  <button onClick={addStep} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 hover:text-nexus-100 transition-colors">
                    <Plus className="h-4 w-4" /> Add Approval Stage
                  </button>
                </div>
                
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  )
}
