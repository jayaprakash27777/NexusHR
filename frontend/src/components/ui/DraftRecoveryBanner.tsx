import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, X } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/dateUtils'

interface DraftRecoveryBannerProps {
  draftTimestamp: string | null
  onRestore: () => void
  onDismiss: () => void
}

export default function DraftRecoveryBanner({ draftTimestamp, onRestore, onDismiss }: DraftRecoveryBannerProps) {
  return (
    <AnimatePresence>
      {draftTimestamp && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between rounded-lg border border-accent-indigo/30 bg-accent-indigo/10 px-4 py-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 text-sm text-nexus-100">
              <RotateCcw className="h-4 w-4 text-accent-indigo" />
              <span>
                An unsaved draft from <span className="font-semibold text-white">{formatDistanceToNow(new Date(draftTimestamp), { addSuffix: true })}</span> was found.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRestore}
                className="rounded-md bg-accent-indigo px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors"
              >
                Restore Draft
              </button>
              <button
                onClick={onDismiss}
                className="rounded-md p-1.5 text-nexus-400 hover:bg-white/10 hover:text-nexus-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
