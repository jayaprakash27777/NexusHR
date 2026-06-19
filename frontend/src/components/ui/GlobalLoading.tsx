import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

export default function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timeout)
  }, [location.pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-0 top-0 z-[200] h-[3px] w-full"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-accent-indigo via-accent-cyan to-accent-violet shadow-[0_0_10px_rgba(139,92,246,0.8)]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, ease: 'anticipate' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
