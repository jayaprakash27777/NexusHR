import { useQuery } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { recruitmentApi } from '@/api/recruitment'
import PageTransition from '@/components/animation/PageTransition'

export default function JobManagement() {
  const { data: pagedJobs, isLoading } = useQuery({
    queryKey: ['recruitment-jobs'],
    queryFn: () => recruitmentApi.getJobs(0, 50)
  })

  const jobs = pagedJobs?.content || []

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Management</h1>
            <p className="text-sm text-muted">Create and manage job postings</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent-indigo text-white rounded-[var(--radius-lg)] hover:bg-accent-indigo/90 transition-colors text-sm font-medium">
            <Plus className="h-4 w-4" />
            Create Job
          </button>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/30">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Department</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted">No jobs found.</td></tr>
              ) : (
                jobs.map(job => (
                  <tr key={job.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{job.title}</td>
                    <td className="p-4 text-sm text-muted">{job.departmentName || 'N/A'}</td>
                    <td className="p-4 text-sm text-muted">{job.location}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold tracking-wider uppercase">
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button className="p-1.5 text-muted hover:text-accent-indigo transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-muted hover:text-error transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  )
}
