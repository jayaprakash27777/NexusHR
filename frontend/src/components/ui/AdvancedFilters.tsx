import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Plus, Calendar, Users, Briefcase, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FilterOption = {
  id: string
  label: string
  type: 'select' | 'date' | 'boolean'
  options?: { value: string; label: string }[]
}

interface AdvancedFiltersProps {
  availableFilters: FilterOption[]
  activeFilters: Record<string, string[]>
  onFilterChange: (filters: Record<string, string[]>) => void
}

export default function AdvancedFilters({ availableFilters, activeFilters, onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilterConfig, setSelectedFilterConfig] = useState<FilterOption | null>(null)

  const handleAddFilter = (filterId: string, value: string) => {
    const current = activeFilters[filterId] || []
    if (current.includes(value)) {
      onFilterChange({ ...activeFilters, [filterId]: current.filter(v => v !== value) })
    } else {
      onFilterChange({ ...activeFilters, [filterId]: [...current, value] })
    }
  }

  const handleRemoveFilter = (filterId: string, value?: string) => {
    if (value) {
      const current = activeFilters[filterId] || []
      onFilterChange({ ...activeFilters, [filterId]: current.filter(v => v !== value) })
    } else {
      const newFilters = { ...activeFilters }
      delete newFilters[filterId]
      onFilterChange(newFilters)
    }
  }

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0)

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
            hasActiveFilters || isOpen
              ? "border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo"
              : "border-white/10 bg-white/5 text-nexus-300 hover:bg-white/10"
          )}
        >
          <Filter className="h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-indigo px-1 text-[10px] font-bold text-white">
              {Object.values(activeFilters).reduce((acc, curr) => acc + curr.length, 0)}
            </span>
          )}
        </button>

        {/* Active Filter Badges */}
        <AnimatePresence>
          {Object.entries(activeFilters).map(([filterId, values]) => {
            const config = availableFilters.find(f => f.id === filterId)
            if (!config || values.length === 0) return null
            
            return values.map(val => {
              const optionLabel = config.options?.find(o => o.value === val)?.label || val
              return (
                <motion.div
                  key={`${filterId}-${val}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 rounded-lg border border-accent-violet/30 bg-accent-violet/10 px-2 py-1.5 text-xs text-nexus-100 backdrop-blur-md"
                >
                  <span className="text-nexus-400">{config.label}:</span>
                  <span className="font-medium">{optionLabel}</span>
                  <button
                    onClick={() => handleRemoveFilter(filterId, val)}
                    className="ml-1 rounded-sm text-nexus-400 hover:bg-white/10 hover:text-nexus-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              )
            })
          })}
        </AnimatePresence>
        
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange({})}
            className="text-xs text-nexus-500 hover:text-nexus-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 top-full z-50 mt-2 w-64 rounded-[var(--radius-xl)] border border-white/10 bg-nexus-900/95 shadow-2xl backdrop-blur-xl"
            >
              {!selectedFilterConfig ? (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-nexus-500">
                    Add Filter
                  </div>
                  {availableFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilterConfig(filter)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-nexus-200 hover:bg-white/5"
                    >
                      {filter.label}
                      <Plus className="h-4 w-4 text-nexus-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button 
                      onClick={() => setSelectedFilterConfig(null)}
                      className="text-nexus-400 hover:text-nexus-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-semibold uppercase tracking-wider text-nexus-300">
                      {selectedFilterConfig.label}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {selectedFilterConfig.options?.map(opt => {
                      const isActive = activeFilters[selectedFilterConfig.id]?.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAddFilter(selectedFilterConfig.id, opt.value)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-nexus-200 hover:bg-white/5"
                        >
                          {opt.label}
                          {isActive && <Check className="h-4 w-4 text-accent-indigo" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
