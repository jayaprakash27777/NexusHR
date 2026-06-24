import { useQuery } from '@tanstack/react-query'
import { Calendar as CalendarIcon, Clock, User, Video } from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
// A simplified custom calendar view for the demo

export default function InterviewCalendar() {
  // Fetching global interviews API not yet fully integrated, returning empty state for now.
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interview Calendar</h1>
            <p className="text-sm text-muted">Manage scheduled candidate interviews</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-border text-foreground rounded-[var(--radius-lg)] text-sm font-medium hover:bg-foreground/5 transition-colors">
              Today
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent-violet text-white rounded-[var(--radius-lg)] hover:bg-accent-violet/90 transition-colors text-sm font-medium">
              <CalendarIcon className="h-4 w-4" />
              Schedule Interview
            </button>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl p-6">
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Interviews Scheduled</h3>
            <p className="text-sm text-muted mt-1">There are no upcoming interviews for this week.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
