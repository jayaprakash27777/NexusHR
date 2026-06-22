import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light')
    else if (theme === 'light') setTheme('dark')
    else setTheme('system')
  }

  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center justify-center p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors overflow-hidden border border-transparent hover:border-border group"
      aria-label="Toggle theme"
      title={`Current theme: ${theme}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'light' && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        )}
        {theme === 'dark' && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
        {theme === 'system' && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Monitor className="h-5 w-5" />
          </motion.div>
        )}
      </div>
    </button>
  )
}
