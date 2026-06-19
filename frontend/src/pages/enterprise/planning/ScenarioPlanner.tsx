import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitBranch, Plus, Copy, Save, Network, ArrowRight, 
  Trash2, Building, Users, Play
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

export default function ScenarioPlanner() {
  const [activeScenario, setActiveScenario] = useState('Acquisition of TechNova')
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulate = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      toast.success('Simulation Complete', 'The organizational impact analysis is ready.')
    }, 2000)
  }

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-accent-indigo" />
            Scenario Planning & Org Design
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Design "what if" organizational structures and simulate impact.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors">
            <Copy className="h-4 w-4" /> Duplicate Baseline
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
            <Save className="h-4 w-4" /> Save Scenario
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Scenarios Sidebar */}
        <div className="lg:w-1/4 xl:w-1/5 space-y-4">
          <GlassCard className="p-4 flex flex-col gap-2 h-full">
            <h3 className="text-sm font-semibold text-nexus-100 uppercase tracking-wider mb-2">Saved Scenarios</h3>
            
            {['Baseline (Current Org)', 'Acquisition of TechNova', 'Q4 Restructuring', 'European Expansion'].map(scenario => (
              <button
                key={scenario}
                onClick={() => setActiveScenario(scenario)}
                className={`text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                  activeScenario === scenario 
                    ? 'bg-accent-indigo/10 border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)] text-nexus-100' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-nexus-300'
                }`}
              >
                <Network className={`h-4 w-4 ${activeScenario === scenario ? 'text-accent-indigo' : 'text-nexus-500'}`} />
                <div className="text-sm font-semibold truncate">{scenario}</div>
              </button>
            ))}

            <button className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/20 text-nexus-400 hover:text-nexus-100 hover:border-white/40 transition-colors">
              <Plus className="h-4 w-4" /> New Scenario
            </button>
          </GlassCard>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col space-y-6">
          
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-nexus-50">{activeScenario}</h2>
                <p className="text-sm text-nexus-400 mt-1">Impact Analysis & Headcount Delta</p>
              </div>
              <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="flex items-center gap-2 rounded-full border border-accent-indigo bg-accent-indigo/10 text-accent-indigo px-6 py-2 text-sm font-bold transition-all hover:bg-accent-indigo/20 disabled:opacity-50"
              >
                {isSimulating ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Play className="h-4 w-4" /></motion.div> Running...</>
                ) : (
                  <><Play className="h-4 w-4" /> Run Simulation</>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/10">
              <div>
                <div className="text-sm text-nexus-400 mb-1">Total Headcount Impact</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                  1,420 <span className="text-sm text-success mb-1">+180 from Baseline</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-nexus-400 mb-1">Budget Delta</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                  +$24.5M <span className="text-sm text-danger mb-1">Exceeds limits by $2.1M</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-nexus-400 mb-1">Span of Control (Avg)</div>
                <div className="text-2xl font-bold text-white flex items-end gap-2">
                  1:8.4 <span className="text-sm text-success mb-1">Optimal</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexus-900/50 via-nexus-950 to-nexus-950">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            
            <div className="absolute inset-0 p-8 overflow-auto custom-scrollbar flex items-start justify-center min-w-[800px]">
              
              {/* Dummy Org Chart Tree */}
              <div className="flex flex-col items-center">
                
                {/* CEO Node */}
                <div className="relative group cursor-grab">
                  <div className="p-4 rounded-xl border-2 border-accent-indigo bg-nexus-900 shadow-[0_0_20px_rgba(99,102,241,0.2)] w-64">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent-indigo/20 flex items-center justify-center text-accent-indigo font-bold">SJ</div>
                      <div>
                        <div className="font-bold text-nexus-50">Sarah Jenkins</div>
                        <div className="text-xs text-accent-indigo font-medium">Chief Executive Officer</div>
                      </div>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/20 mx-auto" />
                </div>

                {/* Sub Tree Container */}
                <div className="flex gap-8 relative pt-4">
                  <div className="absolute top-0 left-[16%] right-[16%] h-px bg-white/20" />
                  
                  {/* Branch 1 */}
                  <div className="flex flex-col items-center relative">
                    <div className="absolute -top-4 left-1/2 w-px h-4 bg-white/20" />
                    <div className="p-4 rounded-xl border border-white/20 bg-nexus-900/80 hover:bg-nexus-900 hover:border-white/40 transition-colors cursor-grab w-64">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-nexus-800 flex items-center justify-center text-nexus-400 font-bold">DC</div>
                        <div>
                          <div className="font-bold text-nexus-50">David Chen</div>
                          <div className="text-xs text-nexus-400">VP, Engineering</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-nexus-500">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 142 Team</span>
                      </div>
                    </div>
                  </div>

                  {/* Branch 2 (The acquisition target) */}
                  <div className="flex flex-col items-center relative">
                    <div className="absolute -top-4 left-1/2 w-px h-4 bg-white/20" />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="p-4 rounded-xl border-2 border-dashed border-success bg-success/5 hover:bg-success/10 transition-colors cursor-grab w-64 relative"
                    >
                      <div className="absolute -top-3 -right-3 px-2 py-1 bg-success text-white text-[10px] font-bold rounded-md shadow-lg">
                        NEW ORG
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success"><Building className="h-5 w-5" /></div>
                        <div>
                          <div className="font-bold text-success">TechNova Group</div>
                          <div className="text-xs text-success/80">Acquisition Target</div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-success/20 flex justify-between text-xs text-success/80">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> +180 Headcount</span>
                      </div>
                    </motion.div>
                  </div>

                </div>
              </div>
            </div>

            {/* Toolbox */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl">
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-nexus-300 hover:text-white hover:bg-white/10 transition-colors">Add Role</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-nexus-300 hover:text-white hover:bg-white/10 transition-colors">Add Department</button>
              <div className="w-px h-6 bg-white/20 mx-2" />
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-nexus-300 hover:text-white hover:bg-white/10 transition-colors">Merge Teams</button>
            </div>
          </GlassCard>

        </div>
      </div>
    </PageTransition>
  )
}
