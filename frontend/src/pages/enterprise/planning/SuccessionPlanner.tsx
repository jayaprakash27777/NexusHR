import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, UserPlus, AlertTriangle, ShieldCheck, 
  ChevronRight, TrendingUp, UserMinus, Plus
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

interface Successor {
  id: string
  name: string
  currentRole: string
  readiness: 'ready_now' | 'ready_1_year' | 'ready_3_years'
  flightRisk: 'low' | 'medium' | 'high'
}

interface KeyRole {
  id: string
  title: string
  incumbent: string
  incumbentRisk: 'low' | 'medium' | 'high'
  department: string
  successors: Successor[]
}

const mockKeyRoles: KeyRole[] = [
  {
    id: '1',
    title: 'Chief Technology Officer',
    incumbent: 'Marcus Chen',
    incumbentRisk: 'medium',
    department: 'Executive',
    successors: [
      { id: 's1', name: 'Sarah Jenkins', currentRole: 'VP Engineering', readiness: 'ready_now', flightRisk: 'low' },
      { id: 's2', name: 'David Lee', currentRole: 'Director, Platform', readiness: 'ready_1_year', flightRisk: 'medium' }
    ]
  },
  {
    id: '2',
    title: 'VP of Global Sales',
    incumbent: 'Amanda Smith',
    incumbentRisk: 'high',
    department: 'Sales',
    successors: [
      { id: 's3', name: 'James Wilson', currentRole: 'Director, EMEA Sales', readiness: 'ready_1_year', flightRisk: 'high' }
    ]
  },
  {
    id: '3',
    title: 'Lead Security Architect',
    incumbent: 'Robert Taylor',
    incumbentRisk: 'low',
    department: 'Engineering',
    successors: []
  }
]

export default function SuccessionPlanner() {
  const [activeRole, setActiveRole] = useState<KeyRole>(mockKeyRoles[0])
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddSuccessor = () => {
    toast.success('Talent Pool Opened', 'Select an employee to add to the succession bench.')
  }

  const getReadinessColor = (status: string) => {
    switch (status) {
      case 'ready_now': return 'bg-success/20 text-success border-success/30'
      case 'ready_1_year': return 'bg-warning/20 text-warning border-warning/30'
      case 'ready_3_years': return 'bg-accent-indigo/20 text-accent-indigo border-accent-indigo/30'
      default: return 'bg-nexus-800 text-nexus-400 border-white/10'
    }
  }
  
  const getReadinessLabel = (status: string) => {
    switch (status) {
      case 'ready_now': return 'Ready Now'
      case 'ready_1_year': return 'Ready in 1-2 Yrs'
      case 'ready_3_years': return 'Ready in 3-5 Yrs'
      default: return status
    }
  }

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Crown className="h-6 w-6 text-warning" />
            Succession Planning Center
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Identify critical roles, build talent benches, and mitigate key-person risk.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
            <UserPlus className="h-4 w-4" /> Nominate Key Role
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Key Roles Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <GlassCard className="p-4 flex flex-col h-full gap-3">
            <div className="mb-2">
              <input 
                type="text" 
                placeholder="Search critical roles..."
                className="w-full rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-indigo"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {mockKeyRoles.map(role => (
                <div
                  key={role.id}
                  onClick={() => setActiveRole(role)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                    activeRole.id === role.id 
                      ? 'bg-accent-indigo/10 border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`font-bold text-sm ${activeRole.id === role.id ? 'text-accent-indigo' : 'text-nexus-50'}`}>
                      {role.title}
                    </div>
                    {role.successors.length === 0 && (
                      <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-nexus-400 mb-3">{role.department} • Incumbent: {role.incumbent}</div>
                  
                  <div className="flex items-center gap-1">
                    {role.successors.length > 0 ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success">
                        <ShieldCheck className="h-3 w-3" /> Bench Strength: {role.successors.length}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-danger">
                        <UserMinus className="h-3 w-3" /> Critical Risk
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Succession Bench Details */}
        <div className="flex-1">
          <GlassCard className="p-6 h-full flex flex-col">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-nexus-400 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/5">
                    {activeRole.department}
                  </span>
                  <ChevronRight className="h-3 w-3" /> Critical Role
                </div>
                <h2 className="text-3xl font-bold text-nexus-50 mb-4">{activeRole.title}</h2>
                
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-nexus-400 uppercase tracking-wider font-semibold mb-1">Current Incumbent</div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-nexus-800 flex items-center justify-center font-bold text-nexus-300">
                        {activeRole.incumbent.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white">{activeRole.incumbent}</div>
                        <div className="text-xs flex items-center gap-1 mt-0.5">
                          <span className="text-nexus-400">Flight Risk:</span>
                          <span className={`font-bold ${activeRole.incumbentRisk === 'high' ? 'text-danger' : activeRole.incumbentRisk === 'medium' ? 'text-warning' : 'text-success'}`}>
                            {activeRole.incumbentRisk.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-nexus-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent-indigo" /> Succession Bench
              </h3>
              <button onClick={handleAddSuccessor} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-nexus-200 hover:bg-white/10 transition-colors">
                <Plus className="h-4 w-4" /> Add Successor
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeRole.successors.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-nexus-500 border-2 border-dashed border-danger/30 rounded-xl bg-danger/5">
                  <AlertTriangle className="h-10 w-10 mb-3 text-danger/50" />
                  <p className="font-medium text-danger">No Successors Identified</p>
                  <p className="text-sm mt-1 text-nexus-400">This role poses a critical continuity risk to the organization.</p>
                  <button onClick={handleAddSuccessor} className="mt-4 px-4 py-2 rounded-lg bg-danger/20 text-danger text-sm font-bold hover:bg-danger/30 transition-colors">
                    Identify Candidates
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRole.successors.map((successor, index) => (
                    <div key={successor.id} className="p-5 rounded-xl border border-white/10 bg-nexus-900/50 flex items-center gap-6 group hover:border-white/20 transition-all">
                      <div className="text-4xl font-bold text-nexus-800 group-hover:text-nexus-700 transition-colors">
                        #{index + 1}
                      </div>
                      
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-accent-indigo/20 flex items-center justify-center font-bold text-accent-indigo text-lg">
                          {successor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-nexus-50 text-lg mb-1">{successor.name}</div>
                          <div className="text-sm text-nexus-400">{successor.currentRole}</div>
                        </div>
                      </div>

                      <div className="flex gap-4 items-center">
                        <div>
                          <div className="text-[10px] text-nexus-500 uppercase tracking-wider font-semibold mb-1">Readiness</div>
                          <div className={`px-3 py-1 rounded text-xs font-bold border ${getReadinessColor(successor.readiness)}`}>
                            {getReadinessLabel(successor.readiness)}
                          </div>
                        </div>

                        <div className="w-px h-8 bg-white/10" />

                        <div>
                          <div className="text-[10px] text-nexus-500 uppercase tracking-wider font-semibold mb-1">Flight Risk</div>
                          <div className={`text-sm font-bold ${successor.flightRisk === 'high' ? 'text-danger' : successor.flightRisk === 'medium' ? 'text-warning' : 'text-success'}`}>
                            {successor.flightRisk.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="pl-4">
                        <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-nexus-300 hover:bg-white/10 hover:text-white transition-colors">
                          <TrendingUp className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  )
}
