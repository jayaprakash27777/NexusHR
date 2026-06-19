import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-950">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative h-16 w-16">
            {/* Orbital rings */}
            <motion.div
              className="absolute inset-0 rounded-full border border-accent-indigo/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border border-accent-violet/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
            {/* Core */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-accent-indigo to-accent-violet" />
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-accent-indigo/20 blur-xl" />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-lg font-semibold text-nexus-50 tracking-tight">NexusHR</span>
          <span className="text-xs text-nexus-400 tracking-wide uppercase">Loading workspace</span>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="h-0.5 w-48 overflow-hidden rounded-full bg-nexus-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-indigo to-accent-violet"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      </div>
    </div>
  )
}
