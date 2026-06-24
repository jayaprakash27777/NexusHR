import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import GlassCard from '@/components/ui/GlassCard'
import ScrollReveal from '@/components/animation/ScrollReveal'
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, Brain, RefreshCw, Loader2 } from 'lucide-react'
import { aiApi } from '@/api/ai'

const AiNetworkScene = lazy(() => import('@/components/3d/AiNetworkScene'))

export default function AiInsightsPage() {
  const queryClient = useQueryClient()

  const { data: insights, isLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => aiApi.getInsights(10)
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => aiApi.dismissInsight(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiInsights'] })
    }
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'ATTRITION_RISK': return AlertTriangle;
      case 'RECOMMENDATION': return Lightbulb;
      case 'WORKFORCE_SUMMARY': return TrendingUp;
      default: return Brain;
    }
  }

  const getColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH': return 'text-danger border-danger/20 bg-danger/5';
      case 'MEDIUM': return 'text-warning border-warning/20 bg-warning/5';
      default: return 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5';
    }
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">AI Insights</h1>
          <p className="text-sm text-nexus-400 mt-1">AI-powered workforce intelligence and analytics</p>
        </div>
        <motion.button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['aiInsights'] })}
          className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-accent-indigo to-accent-violet px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-indigo/20" 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Insights
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent-indigo" />
          </div>
        ) : !insights || insights.length === 0 ? (
          <GlassCard className="p-12 text-center" delay={0.1}>
            <Brain className="h-12 w-12 text-nexus-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">No Insights Available</h3>
            <p className="text-sm text-nexus-400">The AI model hasn't generated any new insights yet.</p>
          </GlassCard>
        ) : (
          insights.map((insight, i) => {
            const Icon = getIcon(insight.type);
            const colorClass = getColor(insight.priority);
            return (
              <GlassCard key={insight.id} className="p-6" delay={0.1 + i * 0.08} glow={insight.priority === 'HIGH' || insight.priority === 'CRITICAL' ? 'violet' : 'none'}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-lg)] border ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-nexus-100">{insight.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${insight.priority === 'CRITICAL' || insight.priority === 'HIGH' ? 'bg-danger/10 text-danger' : insight.priority === 'MEDIUM' ? 'bg-warning/10 text-warning' : 'bg-nexus-700 text-nexus-400'}`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-xs text-nexus-400 leading-relaxed">{insight.description}</p>
                    {insight.recommendation && (
                      <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                        <p className="text-xs font-semibold text-nexus-200 mb-1 flex items-center gap-1.5"><Lightbulb className="h-3 w-3 text-accent-indigo" /> Recommendation</p>
                        <p className="text-xs text-nexus-400">{insight.recommendation}</p>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => dismissMutation.mutate(insight.id)}
                    disabled={dismissMutation.isPending && dismissMutation.variables === insight.id}
                    className="flex-shrink-0 text-xs text-nexus-600 hover:text-nexus-400 transition-colors disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </motion.div>
  )
}
