import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { planningApi, type CareerRoleNode } from '@/api/planning'
import { 
  Milestone, ArrowRight, BookOpen, Star, Lock,
  TrendingUp, PlayCircle, Code, Users, Loader2
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'

export default function CareerPathing() {
  const [activeTrack, setActiveTrack] = useState<'ic' | 'management'>('ic')
  const [selectedRole, setSelectedRole] = useState<CareerRoleNode | null>(null)

  const { data: careerPaths, isLoading } = useQuery({
    queryKey: ['careerPaths'],
    queryFn: () => planningApi.getCareerPaths()
  })

  // Automatically select the first role when data loads
  useEffect(() => {
    if (careerPaths && careerPaths[activeTrack] && careerPaths[activeTrack].length > 0) {
      // Prefer setting the "next" or "current" status role if possible
      const targetRole = careerPaths[activeTrack].find(r => r.status === 'next') || careerPaths[activeTrack][0];
      setSelectedRole(targetRole);
    }
  }, [careerPaths, activeTrack])

  if (isLoading) {
    return (
      <PageTransition className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
      </PageTransition>
    )
  }

  if (!careerPaths || !selectedRole) {
    return null
  }

  const currentPath = careerPaths ? careerPaths[activeTrack] : []

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Milestone className="h-6 w-6 text-accent-cyan" />
            Career Path Visualization
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Explore potential career tracks, required skills, and compensation expectations.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 h-[calc(100vh-180px)]">
        
        {/* Journey Map */}
        <div className="lg:w-2/3 flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => { 
                setActiveTrack('ic'); 
                if (careerPaths && careerPaths.ic.length > 0) setSelectedRole(careerPaths.ic[0]) 
              }}
              className={`flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${
                activeTrack === 'ic' 
                  ? 'bg-accent-indigo/10 border-accent-indigo text-accent-indigo' 
                  : 'bg-white/5 border-transparent text-nexus-300 hover:bg-white/10'
              }`}
            >
              <Code className="h-5 w-5" />
              <div className="font-bold">Individual Contributor Track</div>
            </button>
            <button
              onClick={() => { 
                setActiveTrack('management'); 
                if (careerPaths && careerPaths.management.length > 0) setSelectedRole(careerPaths.management[0]) 
              }}
              className={`flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-3 ${
                activeTrack === 'management' 
                  ? 'bg-accent-indigo/10 border-accent-indigo text-accent-indigo' 
                  : 'bg-white/5 border-transparent text-nexus-300 hover:bg-white/10'
              }`}
            >
              <Users className="h-5 w-5" />
              <div className="font-bold">Management Track</div>
            </button>
          </div>

          <GlassCard className="flex-1 p-8 relative overflow-hidden flex flex-col justify-center">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-16 right-16 h-1 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-accent-indigo"
              />
            </div>

            <div className="relative flex justify-between items-center z-10 w-full max-w-4xl mx-auto">
              {currentPath.map((role, idx) => (
                <div key={role.id} className="flex flex-col items-center relative group cursor-pointer" onClick={() => setSelectedRole(role)}>
                  
                  {/* Status Indicator */}
                  <div className="mb-4 h-6 flex items-center justify-center">
                    {role.status === 'current' && <span className="px-2 py-1 rounded text-[10px] font-bold bg-success/20 text-success border border-success/30 uppercase tracking-wider">Current Role</span>}
                    {role.status === 'next' && <span className="px-2 py-1 rounded text-[10px] font-bold bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30 uppercase tracking-wider">Next Step</span>}
                  </div>

                  {/* Node */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={`h-16 w-16 rounded-full border-4 flex items-center justify-center bg-nexus-900 shadow-xl transition-colors ${
                      selectedRole.id === role.id ? 'border-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 
                      role.status === 'current' ? 'border-success' :
                      role.status === 'next' ? 'border-accent-indigo' : 'border-white/20 text-nexus-500'
                    }`}
                  >
                    {role.status === 'future' ? <Lock className="h-6 w-6" /> : <Star className={`h-6 w-6 ${role.status === 'current' ? 'text-success' : 'text-accent-indigo'}`} />}
                  </motion.div>
                  
                  <div className={`mt-4 text-center transition-colors ${selectedRole.id === role.id ? 'text-accent-cyan' : 'text-nexus-300 group-hover:text-white'}`}>
                    <div className="font-bold text-lg">{role.title}</div>
                    <div className="text-sm font-mono opacity-80">{role.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Role Details Panel */}
        <div className="lg:w-1/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRole.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-nexus-300 font-mono">
                      Level: {selectedRole.level}
                    </span>
                    {selectedRole.status === 'next' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30">
                        Target Role
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-nexus-50 mb-2">{selectedRole.title}</h2>
                  <p className="text-sm text-nexus-400 leading-relaxed">{selectedRole.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-nexus-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" /> Compensation Band
                  </h3>
                  <div className="p-4 rounded-xl border border-white/10 bg-black/20 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-nexus-500 font-medium mb-1">Base Minimum</div>
                      <div className="text-lg font-bold text-white">${(selectedRole.baseRange[0] / 1000).toFixed(0)}k</div>
                    </div>
                    <div className="h-px w-8 bg-white/20" />
                    <div className="text-right">
                      <div className="text-xs text-nexus-500 font-medium mb-1">Base Maximum</div>
                      <div className="text-lg font-bold text-white">${(selectedRole.baseRange[1] / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-bold text-nexus-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent-indigo" /> Promotion Requirements
                  </h3>
                  <ul className="space-y-3">
                    {selectedRole.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-nexus-300">
                        <ArrowRight className="h-4 w-4 text-accent-indigo mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedRole.status === 'next' && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-indigo px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
                      <PlayCircle className="h-5 w-5" /> Enroll in Growth Plan
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </PageTransition>
  )
}
