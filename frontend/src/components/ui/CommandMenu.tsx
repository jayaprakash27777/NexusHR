import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, UserPlus, Building, CalendarPlus, Wallet, BarChart3, 
  Sparkles, X, FileText, Activity, User, CalendarDays, Bell, Folder
} from 'lucide-react'
import { useUIStore, useChatStore } from '@/store'
import { useHotkeys } from '@/hooks/useHotkeys'
import { searchApi } from '@/api/search'
import { useDebounce } from '@/hooks/useDebounce'

type CommandGroup = {
  heading: string
  items: CommandItem[]
}

type CommandItem = {
  id: string
  title: string
  subtitle?: string
  icon: any
  shortcut?: string[]
  action: () => void
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'employee': return User
    case 'leave': return CalendarDays
    case 'payroll': return Wallet
    case 'review': return BarChart3
    case 'department': return Building
    case 'notification': return Bell
    default: return FileText
  }
}

export default function CommandMenu() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const toggleChatSidebar = useChatStore(s => s.toggleChatSidebar)
  const navigate = useNavigate()
  
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { data: searchData, isLoading } = useQuery({
    queryKey: ['globalSearch', debouncedSearch],
    queryFn: () => searchApi.globalSearch(debouncedSearch),
    enabled: debouncedSearch.length > 1,
    staleTime: 60000,
  })

  // Toggle with Ctrl+K
  useHotkeys('ctrl+k', () => setCommandPaletteOpen(!commandPaletteOpen))
  
  // Close on Esc
  useHotkeys('esc', () => setCommandPaletteOpen(false), { enableOnFormTags: true })

  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  const defaultGroups: CommandGroup[] = [
    {
      heading: 'Quick Actions',
      items: [
        { id: 'new-emp', title: 'Create Employee', icon: UserPlus, shortcut: ['N'], action: () => { navigate('/employees'); setCommandPaletteOpen(false) } },
        { id: 'apply-leave', title: 'Apply Leave', icon: CalendarPlus, action: () => { navigate('/leaves'); setCommandPaletteOpen(false) } },
        { id: 'gen-payroll', title: 'Generate Payroll', icon: Wallet, action: () => { navigate('/payroll'); setCommandPaletteOpen(false) } },
      ]
    },
    {
      heading: 'Navigation',
      items: [
        { id: 'nav-exec', title: 'Executive Command Center', icon: Activity, action: () => { navigate('/executive'); setCommandPaletteOpen(false) } },
        { id: 'nav-knowledge', title: 'Knowledge Base', icon: Folder, action: () => { navigate('/enterprise/knowledge'); setCommandPaletteOpen(false) } },
        { id: 'nav-analytics', title: 'Performance & Analytics', icon: BarChart3, action: () => { navigate('/performance'); setCommandPaletteOpen(false) } },
      ]
    },
    {
      heading: 'AI & Tools',
      items: [
        { id: 'ai-copilot', title: 'Open AI Copilot', icon: Sparkles, shortcut: ['Ctrl', 'I'], action: () => { setCommandPaletteOpen(false) } },
        { id: 'team-chat', title: 'Open Team Chat', icon: Search, shortcut: ['Ctrl', 'M'], action: () => { toggleChatSidebar(); setCommandPaletteOpen(false) } },
      ]
    }
  ]

  // Combine static filtered groups + dynamic DB results
  const staticGroups = defaultGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()))
  })).filter(group => group.items.length > 0)

  const dynamicGroup: CommandGroup | null = (searchData?.results?.length && search.length > 1) ? {
    heading: 'Database Results',
    items: searchData.results.map(res => ({
      id: res.id,
      title: res.title,
      subtitle: res.subtitle,
      icon: getIconForType(res.type),
      action: () => {
        navigate(res.url)
        setCommandPaletteOpen(false)
      }
    }))
  } : null

  const filteredGroups = dynamicGroup ? [...staticGroups, dynamicGroup] : staticGroups

  // Flatten for keyboard navigation
  const flatItems = filteredGroups.flatMap(g => g.items)

  useEffect(() => {
    setSelectedIndex(0)
  }, [search, searchData])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % flatItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length)
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      e.preventDefault()
      flatItems[selectedIndex].action()
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]') as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-nexus-950/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[10vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-nexus-900/90 shadow-2xl backdrop-blur-2xl pointer-events-auto flex flex-col max-h-[80vh]"
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className={`h-5 w-5 ${isLoading ? 'text-accent-indigo animate-pulse' : 'text-nexus-400'}`} />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search globally..."
                  className="flex-1 bg-transparent px-4 py-4 text-base text-nexus-50 outline-none placeholder:text-nexus-500"
                />
                <button 
                  onClick={() => setCommandPaletteOpen(false)}
                  className="rounded-md p-1 text-nexus-500 hover:bg-white/10 hover:text-nexus-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Results */}
              <div ref={listRef} className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {filteredGroups.length === 0 && !isLoading ? (
                  <div className="py-14 text-center text-sm text-nexus-400">
                    No results found for "<span className="text-nexus-200">{search}</span>"
                  </div>
                ) : (
                  filteredGroups.map((group, groupIndex) => (
                    <div key={group.heading} className="mb-4 last:mb-0">
                      <div className="px-3 py-1.5 text-xs font-semibold text-nexus-500 uppercase tracking-wider">
                        {group.heading}
                      </div>
                      {group.items.map((item) => {
                        const globalIndex = flatItems.findIndex(i => i.id === item.id)
                        const isSelected = globalIndex === selectedIndex

                        return (
                          <div
                            key={item.id}
                            data-selected={isSelected}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            onClick={item.action}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                              isSelected ? 'bg-accent-indigo/20 text-nexus-50' : 'text-nexus-300 hover:bg-white/5 hover:text-nexus-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-accent-indigo/20' : 'bg-white/5'}`}>
                                <item.icon className={`h-4 w-4 ${isSelected ? 'text-accent-indigo' : 'text-nexus-400'}`} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{item.title}</span>
                                {item.subtitle && <span className="text-xs text-nexus-500">{item.subtitle}</span>}
                              </div>
                            </div>
                            {item.shortcut && (
                              <div className="flex items-center gap-1">
                                {item.shortcut.map(key => (
                                  <kbd key={key} className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-nexus-400 shadow-sm">
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>
              
              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between border-t border-white/5 bg-nexus-950/50 px-4 py-2 text-[10px] text-nexus-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1 font-mono">↑↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1 font-mono">↵</kbd> to select</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1 font-mono">esc</kbd> to close</span>
                </div>
                <div className="flex items-center gap-2">
                  {searchData?.timeTaken && <span>Search took {searchData.timeTaken}ms</span>}
                  <span>NexusHR Global Search</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
