import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-950 overflow-hidden">
      {/* Background ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent-indigo/[0.08] blur-[80px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <div className="relative z-10 flex flex-col items-center gap-8">
        
        {/* Animated SVG Logo */}
        <div className="relative h-20 w-20 flex items-center justify-center">
          {/* Pulsing background circle */}
          <motion.div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 blur-md"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Inner crystal glass container */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
            {/* SVG Path drawing animation */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <motion.path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
              <motion.path
                d="M2 17L12 22L22 17"
                stroke="url(#gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
              <motion.path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
              <defs>
                <linearGradient id="gradient" x1="2" y1="17" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Text Reveal */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-xl font-bold tracking-tight text-white">NexusHR</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-indigo animate-pulse" />
            <span className="text-[11px] font-semibold text-nexus-400 uppercase tracking-[0.2em]">Authenticating</span>
          </motion.div>
        </div>

        {/* Minimal Progress Bar */}
        <motion.div
          className="relative h-[2px] w-40 overflow-hidden rounded-full bg-white/5"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-indigo via-accent-violet to-accent-cyan"
            initial={{ width: '0%', x: '-100%' }}
            animate={{ width: '50%', x: '200%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  )
}
