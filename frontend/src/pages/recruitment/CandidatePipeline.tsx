import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, MoreHorizontal, Calendar, Mail, Phone } from 'lucide-react'
import { recruitmentApi } from '@/api/recruitment'

const STAGES = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED']

export default function CandidatePipeline() {
  const { jobId } = useParams<{ jobId: string }>()

  const { data: job } = useQuery({
    queryKey: ['recruitment-job', jobId],
    queryFn: () => recruitmentApi.getJobById(jobId!),
    enabled: !!jobId
  })

  const { data: applications, isLoading } = useQuery({
    queryKey: ['recruitment-applications', jobId],
    queryFn: () => recruitmentApi.getApplications(jobId!),
    enabled: !!jobId
  })

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/recruitment"
          className="p-2 rounded-[var(--radius-md)] bg-surface/50 border border-border hover:bg-foreground/5 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{job?.title || 'Loading...'}</h1>
          <p className="text-sm text-muted">Pipeline & Candidates</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full items-start min-w-max">
          {STAGES.map((stage) => {
            const stageApps = applications?.filter(app => app.status === stage) || []
            
            return (
              <div 
                key={stage}
                className="w-80 flex-shrink-0 flex flex-col h-full rounded-[var(--radius-xl)] bg-surface/30 border border-border overflow-hidden"
              >
                <div className="p-3 border-b border-border bg-surface/50 flex justify-between items-center backdrop-blur-md">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{stage}</h3>
                  <span className="h-5 w-5 rounded-full bg-background flex items-center justify-center text-[10px] font-bold text-muted">
                    {stageApps.length}
                  </span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stageApps.map((app) => (
                    <motion.div
                      layoutId={app.id}
                      key={app.id}
                      className="p-4 rounded-xl bg-background border border-border shadow-sm hover:shadow-md hover:border-accent-indigo/50 transition-all cursor-grab active:cursor-grabbing relative group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 flex items-center justify-center text-xs font-bold text-foreground">
                            {app.candidate.firstName[0]}{app.candidate.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {app.candidate.firstName} {app.candidate.lastName}
                            </p>
                            <p className="text-[10px] text-muted">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-3">
                        <a href={`mailto:${app.candidate.email}`} className="text-muted hover:text-accent-indigo transition-colors" title="Email">
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                        <a href={`tel:${app.candidate.phone}`} className="text-muted hover:text-accent-indigo transition-colors" title="Call">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <button className="text-muted hover:text-accent-indigo transition-colors" title="Schedule">
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {stageApps.length === 0 && !isLoading && (
                    <div className="h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center opacity-50">
                      <span className="text-xs text-muted font-medium">Drop candidates here</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
