import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeStore } from '@/store'
import GlassCard from '@/components/ui/GlassCard'
import ScrollReveal from '@/components/animation/ScrollReveal'
import { AlertTriangle, Activity, Users, Zap } from 'lucide-react'

// Lazy load heavy components
import { lazy, Suspense } from 'react'
const AiNetworkScene = lazy(() => import('@/components/3d/AiNetworkScene'))
const PredictiveEngine = lazy(() => import('@/components/visualizations/PredictiveEngine'))
const LiveActivityFeed = lazy(() => import('@/components/realtime/LiveActivityFeed'))

export default function ExecutiveCommandCenter() {
  const [pulse, setPulse] = useState(false)
  const connectRealtime = useRealtimeStore(s => s.connect)

  // Initialize live STOMP connection when dashboard mounts
  useEffect(() => {
    connectRealtime('mock-token-for-live')
    
    // Simulate live data pulsing for the heatmaps/numbers
    const interval = setInterval(() => setPulse(p => !p), 3000)
    return () => clearInterval(interval)
  }, [connectRealtime])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-danger">Live</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-nexus-50">Executive Command Center</h1>
          <p className="text-sm text-nexus-400 mt-1">Real-time workforce intelligence and predictive analytics</p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs text-nexus-500 uppercase">Workforce Health</p>
            <p className="text-2xl font-bold text-success">92/100</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div>
            <p className="text-xs text-nexus-500 uppercase">Active Users</p>
            <motion.p animate={{ opacity: pulse ? 0.7 : 1 }} className="text-2xl font-bold text-accent-indigo">128</motion.p>
          </div>
        </div>
      </div>

      {/* Top Section: 3D Twin & Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Digital Twin */}
        <ScrollReveal className="lg:col-span-2">
          <GlassCard className="h-full overflow-hidden p-0" glow="indigo">
            <div className="absolute top-4 left-4 z-10">
              <h3 className="text-sm font-semibold text-nexus-100 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent-indigo" /> Workforce Digital Twin
              </h3>
              <p className="text-xs text-nexus-400 mt-0.5">Live neural representation of company structure</p>
            </div>
            <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-accent-indigo border-t-transparent rounded-full" /></div>}>
              <div className="h-[400px]">
                <AiNetworkScene />
              </div>
            </Suspense>
          </GlassCard>
        </ScrollReveal>

        {/* Predictive Radar */}
        <ScrollReveal delay={0.1}>
          <div className="h-[400px]">
            <Suspense fallback={<div className="h-full w-full rounded-xl bg-white/5 animate-pulse" />}>
              <PredictiveEngine />
            </Suspense>
          </div>
        </ScrollReveal>
      </div>

      {/* Middle Section: Heatmaps & Live Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attrition Risk Heatmap */}
        <ScrollReveal delay={0.2} className="lg:col-span-2">
          <GlassCard className="p-6 h-full" glow="blue">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-nexus-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" /> Attrition Risk Heatmap
                </h3>
                <p className="text-xs text-nexus-500 mt-0.5">Predictive departure signals by department</p>
              </div>
            </div>
            
            {/* Simulated Heatmap Grid */}
            <div className="grid grid-cols-6 gap-2">
              {['Engineering', 'Design', 'Sales', 'Finance', 'Marketing', 'HR'].map((dept, i) => (
                <div key={dept} className="flex flex-col gap-2">
                  <span className="text-[10px] text-nexus-400 font-medium truncate text-center">{dept}</span>
                  {[...Array(5)].map((_, j) => {
                    // Generate random risk colors, highlighting Finance/Sales for effect
                    const isHigh = (dept === 'Finance' && j > 2) || (dept === 'Sales' && j === 4)
                    const isMedium = (dept === 'Engineering' && j === 0)
                    const color = isHigh ? 'bg-danger/80' : isMedium ? 'bg-warning/80' : 'bg-success/80'
                    return (
                      <motion.div 
                        key={j} 
                        className={`h-12 w-full rounded-md ${color} border border-white/5`}
                        animate={isHigh ? { opacity: pulse ? 0.6 : 1 } : {}}
                        transition={{ duration: 1 }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* Live Activity Feed */}
        <ScrollReveal delay={0.3}>
          <GlassCard className="p-6 h-full" glow="violet">
            <h3 className="text-sm font-semibold text-nexus-100 flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-accent-violet" /> Live Activity Stream
            </h3>
            <Suspense fallback={<div className="h-full w-full rounded-xl bg-white/5 animate-pulse" />}>
              <LiveActivityFeed />
            </Suspense>
          </GlassCard>
        </ScrollReveal>
      </div>
    </motion.div>
  )
}
