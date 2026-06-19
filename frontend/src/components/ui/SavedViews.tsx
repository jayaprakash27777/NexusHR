import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Save, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SavedView {
  id: string
  name: string
  filters: Record<string, string[]>
}

interface SavedViewsProps {
  currentFilters: Record<string, string[]>
  onApplyView: (filters: Record<string, string[]>) => void
}

export default function SavedViews({ currentFilters, onApplyView }: SavedViewsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [views, setViews] = useState<SavedView[]>([
    { id: '1', name: 'High Performers', filters: { performance: ['outstanding', 'exceeds'] } },
    { id: '2', name: 'Engineering Team', filters: { department: ['engineering'] } }
  ])
  const [isSaving, setIsSaving] = useState(false)
  const [newViewName, setNewViewName] = useState('')

  const handleSaveView = () => {
    if (!newViewName.trim()) return
    const newView: SavedView = {
      id: Math.random().toString(),
      name: newViewName,
      filters: currentFilters
    }
    setViews([...views, newView])
    setIsSaving(false)
    setNewViewName('')
  }

  const handleDeleteView = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setViews(views.filter(v => v.id !== id))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-nexus-300 transition-colors hover:bg-white/10",
          isOpen && "bg-white/10 text-nexus-100"
        )}
      >
        <Bookmark className="h-4 w-4" />
        Saved Views
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[var(--radius-xl)] border border-white/10 bg-nexus-900/95 p-2 shadow-2xl backdrop-blur-xl"
            >
              {views.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-nexus-500">
                    Your Views
                  </div>
                  {views.map(view => (
                    <div
                      key={view.id}
                      className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-nexus-200 hover:bg-white/5"
                      onClick={() => {
                        onApplyView(view.filters)
                        setIsOpen(false)
                      }}
                    >
                      <span>{view.name}</span>
                      <button
                        onClick={(e) => handleDeleteView(e, view.id)}
                        className="opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-white/10 pt-2">
                {!isSaving ? (
                  <button
                    onClick={() => setIsSaving(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent-indigo hover:bg-accent-indigo/10"
                    disabled={Object.keys(currentFilters).length === 0}
                  >
                    <Save className="h-4 w-4" />
                    Save Current View
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 p-1">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Name this view..."
                      value={newViewName}
                      onChange={(e) => setNewViewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveView()}
                      className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-nexus-100 outline-none focus:border-accent-indigo/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveView}
                        className="flex-1 rounded-md bg-accent-indigo px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsSaving(false)}
                        className="flex-1 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-nexus-300 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
