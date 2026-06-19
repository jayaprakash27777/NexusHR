import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Users, DollarSign, Activity, AlertTriangle, 
  ChevronDown, BrainCircuit, LineChart, Target, ArrowRight
} from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'

export default function ForecastingEngine() {
  const [timeframe, setTimeframe] = useState('Q4 2026')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleRecalculate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      toast.success('Forecast Updated', 'AI models have re-calculated the projections.')
    }, 2000)
  }

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent-indigo" />
            Workforce Forecasting Engine
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Predict headcount needs, attrition risks, and budget constraints using predictive analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="rounded-lg border border-white/10 bg-nexus-900/50 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:border-accent-indigo"
          >
            <option>Q3 2026</option>
            <option>Q4 2026</option>
            <option>Q1 2027</option>
            <option>FY 2027</option>
          </select>
          <button 
            onClick={handleRecalculate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {isGenerating ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><BrainCircuit className="h-4 w-4" /></motion.div> Analyzing...</>
            ) : (
              <><BrainCircuit className="h-4 w-4" /> Run AI Forecast</>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 space-y-6">
        
        {/* Top KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-indigo/10 blur-3xl rounded-full transition-transform group-hover:scale-150" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent-indigo/20 text-accent-indigo"><Users className="h-6 w-6" /></div>
              <span className="flex items-center gap-1 text-sm font-bold text-success bg-success/10 px-2 py-1 rounded-md border border-success/20">
                <TrendingUp className="h-3 w-3" /> +12%
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">1,240</div>
            <div className="text-sm font-medium text-nexus-400">Projected Headcount</div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 blur-3xl rounded-full transition-transform group-hover:scale-150" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-warning/20 text-warning"><Activity className="h-6 w-6" /></div>
              <span className="flex items-center gap-1 text-sm font-bold text-warning bg-warning/10 px-2 py-1 rounded-md border border-warning/20">
                <TrendingUp className="h-3 w-3" /> +2.4%
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">8.4%</div>
            <div className="text-sm font-medium text-nexus-400">Predicted Attrition Risk</div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 blur-3xl rounded-full transition-transform group-hover:scale-150" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-success/20 text-success"><DollarSign className="h-6 w-6" /></div>
              <span className="flex items-center gap-1 text-sm font-bold text-danger bg-danger/10 px-2 py-1 rounded-md border border-danger/20">
                <TrendingUp className="h-3 w-3" /> +15%
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">$14.2M</div>
            <div className="text-sm font-medium text-nexus-400">Payroll Budget Forecast</div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 blur-3xl rounded-full transition-transform group-hover:scale-150" />
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent-cyan/20 text-accent-cyan"><Target className="h-6 w-6" /></div>
              <span className="flex items-center gap-1 text-sm font-bold text-nexus-300 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                On Track
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">42</div>
            <div className="text-sm font-medium text-nexus-400">Open Requisitions Needed</div>
          </GlassCard>
        </div>

        {/* Main Charts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Growth Chart Dummy */}
          <GlassCard className="lg:col-span-2 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-nexus-50">Headcount vs Budget Trajectory</h3>
                <p className="text-xs text-nexus-400 mt-1">Predictive model showing required hiring vs available budget allocation.</p>
              </div>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-nexus-400">
                <LineChart className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 relative min-h-[300px] flex items-end justify-between gap-2 border-b border-l border-white/10 pl-4 pb-4">
              {/* Dummy Chart Bars */}
              {[40, 50, 45, 60, 75, 80, 85, 100].map((h, i) => (
                <div key={i} className="relative w-full group h-full flex items-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-accent-indigo/20 border border-accent-indigo/50 rounded-t-sm relative group-hover:bg-accent-indigo/40 transition-colors"
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded whitespace-nowrap">
                      {1000 + (h * 5)} HC
                    </div>
                  </motion.div>
                  {/* Budget Line Point */}
                  <motion.div 
                    initial={{ bottom: 0 }}
                    animate={{ bottom: `${h + (Math.random() * 20 - 10)}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute left-1/2 w-3 h-3 rounded-full bg-success border-2 border-nexus-900 -translate-x-1/2 z-10"
                  />
                </div>
              ))}
              {/* Dummy SVG Line */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
                <path d="M 50,250 C 150,220 250,240 350,180 C 450,120 550,100 650,80 C 750,60 850,50 950,20" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="3" strokeDasharray="6 6" />
              </svg>
            </div>
            <div className="flex justify-between mt-4 text-xs font-medium text-nexus-500 pl-4">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
            </div>
          </GlassCard>

          {/* AI Insights Panel */}
          <GlassCard className="p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="p-2 bg-accent-indigo/20 text-accent-indigo rounded-lg"><BrainCircuit className="h-5 w-5" /></div>
              <h3 className="text-lg font-bold text-nexus-50">AI Strategic Insights</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="p-4 rounded-xl border border-warning/20 bg-warning/5 flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-warning mb-1">High Attrition Risk in Engineering</h4>
                  <p className="text-xs text-nexus-300 leading-relaxed">Model predicts a 15% spike in Engineering turnover next quarter due to below-market compensation bands. Recommend immediate equity refresh review.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-success/20 bg-success/5 flex items-start gap-4">
                <TrendingUp className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-success mb-1">Sales Hiring on Target</h4>
                  <p className="text-xs text-nexus-300 leading-relaxed">Current hiring velocity for Account Executives perfectly aligns with the Q4 revenue goals. No intervention needed.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 flex items-start gap-4">
                <Target className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-accent-cyan mb-1">Budget Optimization Found</h4>
                  <p className="text-xs text-nexus-300 leading-relaxed">Delaying non-critical marketing hires by 30 days will yield $240k in free cash flow without impacting primary Q4 objectives.</p>
                </div>
              </div>
            </div>

            <button className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-nexus-200">
              View Full Analysis Report <ArrowRight className="h-4 w-4" />
            </button>
          </GlassCard>

        </div>
      </div>
    </PageTransition>
  )
}
