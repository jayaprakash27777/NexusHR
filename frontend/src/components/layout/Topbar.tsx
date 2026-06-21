import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, Menu, Command } from 'lucide-react'
import { useAuthStore, useUIStore } from '@/store'
import { getInitials } from '@/lib/utils'

export default function Topbar() {
  const { user } = useAuthStore()
  const { toggleSidebarCollapse } = useUIStore()
  const location = useLocation()
  
  // Create breadcrumb from pathname
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.05] bg-nexus-950/50 px-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebarCollapse}
          className="rounded-lg p-2 text-nexus-400 hover:bg-white/[0.05] hover:text-nexus-100 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Breadcrumbs */}
        <nav className="hidden sm:flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-nexus-400">
            <li>
              <span className="text-nexus-500">NexusHR</span>
            </li>
            {pathnames.map((value, index) => {
              const isLast = index === pathnames.length - 1
              return (
                <li key={index} className="flex items-center">
                  <span className="mx-2 text-nexus-600">/</span>
                  <span className={`capitalize ${isLast ? 'font-medium text-nexus-100' : 'text-nexus-400'}`}>
                    {value.replace('-', ' ')}
                  </span>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="flex h-9 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] pl-3 pr-2 text-sm text-nexus-400 transition-colors hover:bg-white/[0.04]">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline-block w-32 text-left">Search...</span>
          <kbd className="hidden sm:flex h-5 items-center justify-center rounded bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium">
            <Command className="h-3 w-3 mr-0.5" /> K
          </kbd>
        </button>

        {/* Notification */}
        <button className="relative rounded-full p-2 text-nexus-400 transition-colors hover:bg-white/[0.05] hover:text-nexus-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-accent-indigo" />
        </button>

        {/* User Profile */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/30 to-accent-violet/30 border border-accent-indigo/20 text-xs font-semibold text-nexus-100 cursor-pointer hover:border-accent-indigo/50 transition-colors">
          {getInitials(user?.fullName || 'Admin User')}
        </div>
      </div>
    </motion.header>
  )
}
