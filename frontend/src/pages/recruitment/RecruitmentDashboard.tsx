import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Briefcase, Users, Plus, ChevronRight, Search } from 'lucide-react'
import { recruitmentApi } from '@/api/recruitment'
import { Link } from 'react-router-dom'
import HasPermission from '@/components/auth/HasPermission'
import PageTransition from '@/components/animation/PageTransition'

export default function RecruitmentDashboard() {
  const { data: pagedJobs, isLoading } = useQuery({
    queryKey: ['recruitment-jobs'],
    queryFn: () => recruitmentApi.getJobs(0, 50)
  })
  
  const jobs = pagedJobs?.content || []

  return (
    <PageTransition className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recruitment Hub</h1>
          <p className="text-sm text-muted">Manage job postings and candidate pipelines</p>
        </div>
        
        <HasPermission category="RECRUITMENT" action="CREATE">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent-indigo text-white rounded-[var(--radius-lg)] hover:bg-accent-indigo/90 transition-colors shadow-lg shadow-accent-indigo/20 text-sm font-medium">
            <Plus className="h-4 w-4" />
            New Job Posting
          </button>
        </HasPermission>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/recruitment/jobs" className="p-5 rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl flex items-center gap-4 hover:bg-surface/80 transition-colors">
          <div className="h-10 w-10 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">All Jobs</p>
            <p className="text-2xl font-bold text-foreground">{jobs?.length || 0}</p>
          </div>
        </Link>
        <Link to="/recruitment/interviews" className="p-5 rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl flex items-center gap-4 hover:bg-surface/80 transition-colors">
          <div className="h-10 w-10 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Interviews</p>
            <p className="text-2xl font-bold text-foreground">View</p>
          </div>
        </Link>
        <Link to="/recruitment/offers" className="p-5 rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl flex items-center gap-4 hover:bg-surface/80 transition-colors">
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wider">Offers</p>
            <p className="text-2xl font-bold text-foreground">Manage</p>
          </div>
        </Link>
      </div>

      {/* Jobs List */}
      <div className="rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-sm font-semibold text-foreground">Active Job Postings</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search roles..." 
              className="pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent-indigo transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : (
          <div className="divide-y divide-border">
            {jobs?.map((job) => (
              <Link 
                key={job.id} 
                to={`/recruitment/jobs/${job.id}`}
                className="group p-4 flex items-center justify-between hover:bg-foreground/5 transition-colors block"
              >
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-accent-indigo transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {job.departmentName || 'Department'}
                    </span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-7 w-7 rounded-full bg-surface border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted shadow-sm">
                        C{i}
                      </div>
                    ))}
                    <div className="h-7 w-7 rounded-full bg-surface border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted shadow-sm">
                      +
                    </div>
                  </div>
                  
                  <span className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold tracking-wider uppercase">
                    {job.status}
                  </span>
                  
                  <ChevronRight className="h-5 w-5 text-muted group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
            
            {jobs?.length === 0 && (
              <div className="p-8 text-center text-muted">No job postings found.</div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
