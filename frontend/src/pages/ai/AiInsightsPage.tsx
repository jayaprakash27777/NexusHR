import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import ScrollReveal from '@/components/animation/ScrollReveal'
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, Brain, RefreshCw } from 'lucide-react'

const AiNetworkScene = lazy(() => import('@/components/3d/AiNetworkScene'))

const insights = [
  { type: 'ATTRITION_RISK', title: 'Attrition Risk: Vikram Singh', description: 'High attrition risk (68%) detected based on declining attendance, below-average ratings, and compensation gap.', priority: 'HIGH', icon: AlertTriangle, color: 'text-danger border-danger/20 bg-danger/5' },
  { type: 'RECOMMENDATION', title: 'Retention Strategy', description: 'Implement quarterly skill-development workshops aligned with industry trends to boost engagement by 23%.', priority: 'MEDIUM', icon: Lightbulb, color: 'text-accent-indigo border-accent-indigo/20 bg-accent-indigo/5' },
  { type: 'WORKFORCE_SUMMARY', title: 'Workforce Health: 78/100', description: 'Overall health score improved by 3 points. Engineering shows highest engagement at 94%. Finance needs attention.', priority: 'MEDIUM', icon: TrendingUp, color: 'text-success border-success/20 bg-success/5' },
  { type: 'DEPARTMENT_INSIGHT', title: 'Engineering Analysis', description: 'Team productivity index at 1.2x benchmark. Average tenure: 2.8 years. Salary is 8% below market median.', priority: 'LOW', icon: Brain, color: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5' },
]

export default function AiInsightsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">AI Insights</h1>
          <p className="text-sm text-nexus-400 mt-1">AI-powered workforce intelligence and analytics</p>
        </div>
        <motion.button className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-accent-indigo to-accent-violet px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-indigo/20" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <RefreshCw className="h-4 w-4" /> Generate Insights
        </motion.button>
      </div>

      {/* 3D Workforce Network Visualization */}
      <ScrollReveal>
        <GlassCard className="overflow-hidden" delay={0.05} glow="indigo">
          <div className="p-4 pb-0">
            <h3 className="text-sm font-semibold text-nexus-100">Workforce Relationship Network</h3>
            <p className="text-xs text-nexus-500 mt-0.5">Real-time department connections · Red nodes indicate attrition risk</p>
          </div>
          <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="skeleton h-8 w-40" /></div>}>
            <AiNetworkScene />
          </Suspense>
        </GlassCard>
      </ScrollReveal>

      {/* AI Provider Badge */}
      <GlassCard className="p-4" delay={0.05}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20">
            <Sparkles className="h-4 w-4 text-accent-indigo" />
          </div>
          <div>
            <p className="text-xs font-semibold text-nexus-200">AI Provider: MockAI (Rule-Based)</p>
            <p className="text-[10px] text-nexus-500">Swap to OpenAI or Gemini by implementing AiProvider interface</p>
          </div>
        </div>
      </GlassCard>

      {/* Insights Grid */}
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <GlassCard key={i} className="p-6" delay={0.1 + i * 0.08} glow={insight.priority === 'HIGH' ? 'violet' : 'none'}>
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-lg)] border ${insight.color}`}>
                <insight.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-nexus-100">{insight.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${insight.priority === 'HIGH' ? 'bg-danger/10 text-danger' : insight.priority === 'MEDIUM' ? 'bg-warning/10 text-warning' : 'bg-nexus-700 text-nexus-400'}`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="text-xs text-nexus-400 leading-relaxed">{insight.description}</p>
              </div>
              <button className="flex-shrink-0 text-xs text-nexus-600 hover:text-nexus-400 transition-colors">
                Dismiss
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  )
}
