import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const COUNTDOWN_MS = 60 * 1000 // 60 seconds warning

export default function SessionTimeoutProtection() {
  const { isAuthenticated, logout } = useAuthStore()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = () => {
    if (!isAuthenticated) return

    if (showWarning) {
      setShowWarning(false)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setTimeLeft(60)
      
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, IDLE_TIMEOUT_MS - COUNTDOWN_MS)
  }

  const handleLogout = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    setShowWarning(false)
    logout()
  }

  useEffect(() => {
    if (!isAuthenticated) return

    // Initialize timer
    resetTimer()

    // Activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const handleActivity = () => {
      // Don't reset if warning is already showing (force them to click 'Continue')
      if (!showWarning) {
        resetTimer()
      }
    }

    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }))

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [isAuthenticated, showWarning])

  if (!isAuthenticated) return null

  return (
    <AnimatePresence>
      {showWarning && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-nexus-950/80 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-warning/30 bg-nexus-900 shadow-2xl pointer-events-auto"
            >
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
                  <ShieldAlert className="h-8 w-8 text-warning" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-nexus-50">Session Expiring Soon</h2>
                <p className="mb-6 text-sm text-nexus-400">
                  For your security, your session will automatically expire due to inactivity.
                </p>
                
                <div className="mb-8">
                  <span className="text-5xl font-black tabular-nums text-warning drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    {timeLeft}
                  </span>
                  <span className="ml-2 text-sm text-nexus-500 font-medium">seconds</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-nexus-300 transition-colors hover:bg-white/5"
                  >
                    Log Out Now
                  </button>
                  <button
                    onClick={resetTimer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent-indigo px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  >
                    Continue Session
                  </button>
                </div>
              </div>
              
              {/* Progress bar representing time left */}
              <div className="h-1.5 w-full bg-white/5">
                <motion.div 
                  className="h-full bg-warning"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 60) * 100}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
