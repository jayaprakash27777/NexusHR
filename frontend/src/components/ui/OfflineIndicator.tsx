import { useEffect, useRef } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { toast } from '@/store/toast'

export default function OfflineIndicator() {
  const isOnline = useNetworkStatus()
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    if (!isOnline) {
      toast.error('You are offline', 'Changes will be saved locally and synced when you reconnect.', 0) // duration 0 = infinite
    } else {
      toast.success('Back online', 'Connection restored. Syncing pending changes...', 4000)
    }
  }, [isOnline])

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: -50 }}
          className="fixed left-1/2 top-0 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-b-xl border border-t-0 border-danger/30 bg-danger/10 px-4 py-1.5 text-xs font-semibold text-danger shadow-lg backdrop-blur-md"
        >
          <WifiOff className="h-3.5 w-3.5" />
          Offline Mode
        </motion.div>
      )}
    </AnimatePresence>
  )
}
