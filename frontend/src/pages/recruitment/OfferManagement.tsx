import { Plus, FileText, CheckCircle, Clock } from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'

export default function OfferManagement() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Offer Management</h1>
            <p className="text-sm text-muted">Generate and track candidate offers</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-[var(--radius-lg)] hover:bg-success/90 transition-colors text-sm font-medium shadow-lg shadow-success/20">
            <Plus className="h-4 w-4" />
            Create Offer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Drafts</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
          <div className="p-5 rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
          <div className="p-5 rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Accepted</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-surface/50 border border-border backdrop-blur-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/30">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Candidate</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Salary</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">No offers generated yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  )
}
