import { useState, useEffect } from 'react'
import { Settings2, CalendarDays, Wallet, Workflow, Lock, BookOpen } from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

import { useQuery } from '@tanstack/react-query'
import { configApi, type SystemConfigModule } from '@/api/config'
import { Loader2, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'CalendarDays': CalendarDays,
  'Wallet': Wallet,
  'Workflow': Workflow,
  'Lock': Lock,
  'BookOpen': BookOpen
}

export default function PlatformConfigCenter() {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const { data: configModules, isLoading } = useQuery({
    queryKey: ['systemModules'],
    queryFn: () => configApi.getModules(),
  })

  // Automatically select first module when loaded
  useEffect(() => {
    if (configModules && configModules.length > 0 && activeModule === null) {
      setActiveModule(configModules[0].id)
    }
  }, [configModules, activeModule])

  if (isLoading) {
    return (
      <PageTransition className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-indigo" />
      </PageTransition>
    )
  }

  const handleSave = () => {
    toast.success('Configuration Saved', 'Platform settings have been updated.')
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-accent-indigo" />
            Platform Configuration Center
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Central management for HR rules, policies, and global system behaviors.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Module Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <GlassCard className="p-4 flex flex-col gap-2">
            {configModules?.map(module => {
              const Icon = iconMap[module.icon] || Settings2
              const isActive = activeModule === module.id
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-start gap-3 w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-accent-indigo/10 border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isActive ? module.color : 'text-nexus-500'}`} />
                  <div>
                    <span className={`block font-semibold text-sm ${isActive ? 'text-nexus-100' : 'text-nexus-300'}`}>
                      {module.name}
                    </span>
                    <span className="block text-[11px] text-nexus-400 mt-1 line-clamp-2 leading-tight">
                      {module.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </GlassCard>
        </div>

        {/* Configuration Area */}
        <div className="flex-1">
          <GlassCard className="p-6 h-full min-h-[500px] flex flex-col relative">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-nexus-50">
                {configModules?.find(m => m.id === activeModule)?.name} Settings
              </h2>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
              >
                Save Changes
              </button>
            </div>

            {/* Mock Config UI based on active module */}
            {activeModule === 'leave_policies' && (
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-nexus-300">Default Annual Leave (Days)</label>
                    <input type="number" defaultValue={21} className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-nexus-300">Accrual Cycle</label>
                    <select className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:border-accent-indigo focus:outline-none">
                      <option>Monthly</option>
                      <option>Annually</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-nexus-100">Rollover Policy</h3>
                      <p className="text-xs text-nexus-400 mt-1">Allow employees to carry forward unused leaves to the next year.</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-success">
                      <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeModule !== 'leave_policies' && (
              <div className="flex-1 flex items-center justify-center text-nexus-500 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                <div className="text-center">
                  <Settings2 className="h-10 w-10 mx-auto text-nexus-600 mb-3" />
                  <p>Advanced configuration panel for {configModules?.find(m => m.id === activeModule)?.name}</p>
                </div>
              </div>
            )}
            
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}
