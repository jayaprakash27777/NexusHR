import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import GlassCard from '@/components/ui/GlassCard'
import { TrendingUp, Target, Star, Users, Loader2 } from 'lucide-react'
import { performanceApi } from '@/api/performance'
import PageTransition from '@/components/animation/PageTransition'

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`h-3.5 w-3.5 ${star <= rating ? 'fill-warning text-warning' : 'text-nexus-700'}`} />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-nexus-300">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'goals'>('reviews')

  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', { page: 0 }],
    queryFn: () => performanceApi.getReviews({ page: 0, size: 50 }),
  })

  const { data: goalsData, isLoading: isLoadingGoals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => performanceApi.getGoals(),
  })

  const { data: trendData } = useQuery({
    queryKey: ['performanceTrend'],
    queryFn: () => performanceApi.getPerformanceTrend(),
  })

  const reviews = reviewsData?.content || []
  const goals = goalsData || []

  const completedReviews = reviews.filter(r => r.status === 'COMPLETED').length
  const pendingReviews = reviews.filter(r => r.status.startsWith('PENDING')).length
  const completedGoals = goals.filter(g => g.status === 'COMPLETED').length
  
  // Calculate average rating
  const avgRating = trendData?.length 
    ? trendData[trendData.length - 1].averageScore 
    : (reviews.reduce((acc, r) => acc + (r.overallRating || 0), 0) / (completedReviews || 1))

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-success bg-success/10 border-success/20'
      case 'PENDING_SELF': return 'text-warning bg-warning/10 border-warning/20'
      case 'PENDING_MANAGER': return 'text-accent-indigo bg-accent-indigo/10 border-accent-indigo/20'
      default: return 'text-nexus-400 bg-nexus-800 border-white/10'
    }
  }

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-success bg-success/10 border-success/20'
      case 'IN_PROGRESS': return 'text-accent-indigo bg-accent-indigo/10 border-accent-indigo/20'
      case 'NOT_STARTED': return 'text-warning bg-warning/10 border-warning/20'
      default: return 'text-nexus-400 bg-nexus-800 border-white/10'
    }
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nexus-50">Performance</h1>
          <p className="text-sm text-nexus-400 mt-1">Track reviews, goals, and team performance</p>
        </div>
        <div className="flex gap-2 p-1 bg-nexus-900/50 rounded-lg border border-white/5">
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'reviews' ? 'bg-white/10 text-white shadow-sm' : 'text-nexus-400 hover:text-nexus-200'}`}
          >
            Reviews
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'goals' ? 'bg-white/10 text-white shadow-sm' : 'text-nexus-400 hover:text-nexus-200'}`}
          >
            Goals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: 'Completed Reviews', value: completedReviews, icon: TrendingUp, color: 'text-accent-indigo' },
          { label: 'Pending Reviews', value: pendingReviews, icon: Users, color: 'text-warning' },
          { label: 'Avg Rating', value: avgRating.toFixed(1), icon: Star, color: 'text-warning' },
          { label: 'Goals Completed', value: completedGoals, icon: Target, color: 'text-success' },
        ].map((s, i) => (
          <GlassCard key={s.label} className="p-5" delay={i * 0.05}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-nexus-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{isLoadingReviews || isLoadingGoals ? '-' : s.value}</p>
              </div>
              <s.icon className={`h-5 w-5 ${s.color} opacity-40`} />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="overflow-hidden min-h-[400px]" delay={0.2}>
        <div className="overflow-x-auto">
          {activeTab === 'reviews' ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Employee', 'Period', 'Rating', 'Status', 'Reviewer'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-nexus-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoadingReviews ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12"><Loader2 className="h-6 w-6 text-accent-indigo animate-spin mx-auto" /></td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm text-nexus-400">No reviews found.</td>
                  </tr>
                ) : (
                  reviews.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-nexus-200">{r.employeeName}</td>
                      <td className="px-5 py-3.5 text-xs text-nexus-400">{r.reviewPeriod}</td>
                      <td className="px-5 py-3.5">{r.overallRating ? <RatingStars rating={r.overallRating} /> : <span className="text-xs text-nexus-600">—</span>}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${getReviewStatusColor(r.status)}`}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-nexus-400">{r.reviewerName}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {['Employee', 'Goal Title', 'Category', 'Progress', 'Status', 'Target Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-nexus-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoadingGoals ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 text-accent-indigo animate-spin mx-auto" /></td>
                  </tr>
                ) : goals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-nexus-400">No goals found.</td>
                  </tr>
                ) : (
                  goals.map((g, i) => (
                    <motion.tr key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-nexus-200">{g.employeeName}</td>
                      <td className="px-5 py-3.5 text-sm text-nexus-100 max-w-[250px] truncate" title={g.description}>{g.title}</td>
                      <td className="px-5 py-3.5 text-xs text-nexus-400">{g.category}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-indigo rounded-full" style={{ width: `${g.progressPercentage}%` }} />
                          </div>
                          <span className="text-[10px] text-nexus-400 font-mono">{g.progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${getGoalStatusColor(g.status)}`}>
                          {g.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-nexus-400">{new Date(g.targetDate).toLocaleDateString()}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>
    </PageTransition>
  )
}
