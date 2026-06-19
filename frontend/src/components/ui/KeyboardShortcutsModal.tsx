import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useHotkeys } from '@/hooks/useHotkeys'

const shortcutGroups = [
  {
    title: 'Global Navigation',
    shortcuts: [
      { keys: ['Ctrl', 'K'], desc: 'Open Command Palette' },
      { keys: ['/'], desc: 'Global Search' },
      { keys: ['Shift', '?'], desc: 'Show Keyboard Shortcuts' },
      { keys: ['Esc'], desc: 'Close Modal / Cancel' }
    ]
  },
  {
    title: 'Quick Actions',
    shortcuts: [
      { keys: ['N'], desc: 'New Employee' },
      { keys: ['Ctrl', 'S'], desc: 'Save Changes' },
      { keys: ['Ctrl', 'Enter'], desc: 'Submit Form' }
    ]
  },
  {
    title: 'Communication',
    shortcuts: [
      { keys: ['Ctrl', 'M'], desc: 'Toggle Team Chat' },
      { keys: ['Ctrl', 'I'], desc: 'Toggle AI Copilot' }
    ]
  }
]

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false)

  // Toggle with Shift + ?
  useHotkeys('shift+?', () => setIsOpen(true))
  useHotkeys('esc', () => setIsOpen(false))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-nexus-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-nexus-900/90 shadow-2xl backdrop-blur-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3 text-nexus-100">
                  <Keyboard className="h-5 w-5 text-accent-indigo" />
                  <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1.5 text-nexus-500 hover:bg-white/10 hover:text-nexus-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {shortcutGroups.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-nexus-500">
                      {group.title}
                    </h3>
                    <div className="space-y-2">
                      {group.shortcuts.map((shortcut, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between py-1 text-sm">
                          <span className="text-nexus-300">{shortcut.desc}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key) => (
                              <kbd key={key} className="flex h-6 min-w-[24px] items-center justify-center rounded-md border border-white/10 bg-white/5 px-1.5 text-[11px] font-mono font-medium text-nexus-100 shadow-sm">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
