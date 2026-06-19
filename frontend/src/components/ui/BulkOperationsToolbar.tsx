import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Trash2, Download, X } from 'lucide-react'

interface BulkOperationsToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onApprove?: () => void
  onReject?: () => void
  onDelete?: () => void
  onExport?: () => void
}

export default function BulkOperationsToolbar({
  selectedCount,
  onClearSelection,
  onApprove,
  onReject,
  onDelete,
  onExport
}: BulkOperationsToolbarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-nexus-900/90 px-6 py-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <div className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-accent-indigo px-1.5 text-xs font-bold text-white shadow-sm">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-nexus-100">selected</span>
          </div>

          <div className="flex items-center gap-2">
            {onApprove && (
              <button onClick={onApprove} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-success hover:bg-success/10 transition-colors">
                <CheckCircle className="h-4 w-4" /> Approve
              </button>
            )}
            {onReject && (
              <button onClick={onReject} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-warning hover:bg-warning/10 transition-colors">
                <XCircle className="h-4 w-4" /> Reject
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10 transition-colors">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
            {onExport && (
              <button onClick={onExport} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-accent-blue hover:bg-accent-blue/10 transition-colors">
                <Download className="h-4 w-4" /> Export
              </button>
            )}
          </div>

          <div className="pl-2">
            <button 
              onClick={onClearSelection}
              className="rounded-full p-1.5 text-nexus-500 hover:bg-white/10 hover:text-nexus-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
