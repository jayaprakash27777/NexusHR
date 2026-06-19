import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, useAuthStore, useChatStore } from '@/store'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Users, Clock, CalendarDays, Wallet,
  TrendingUp, Sparkles, Bell, ChevronLeft, LogOut, Settings,
  Command, MessageSquare, MonitorPlay, Building2, Shield, Settings2, FileText, Workflow, GitMerge, UserSquare, Rocket, Map, BookOpen, GraduationCap, BrainCircuit, GitBranch, PieChart, Crown, Milestone
} from 'lucide-react'
import HasPermission from '@/components/auth/HasPermission'

const navItems = [
  { path: '/executive', label: 'Command Center', icon: MonitorPlay },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  { path: '/leaves', label: 'Leaves', icon: CalendarDays },
  { path: '/payroll', label: 'Payroll', icon: Wallet },
  { path: '/performance', label: 'Performance', icon: TrendingUp },
  { path: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { path: '/notifications', label: 'Notifications', icon: Bell },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()
  const { user, logout } = useAuthStore()
  const toggleChatSidebar = useChatStore(s => s.toggleChatSidebar)
  const location = useLocation()

  return (
    <motion.aside
      className={cn(
        'fixed left-4 top-4 bottom-4 z-40 flex flex-col overflow-hidden',
        'rounded-[var(--radius-2xl)] border border-white/[0.05] bg-nexus-900/40',
        'backdrop-blur-3xl backdrop-saturate-[200%] shadow-2xl',
        'transition-all duration-500 ease-[var(--ease-out-expo)]'
      )}
      animate={{ width: sidebarCollapsed ? 64 : 252 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.04] px-5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-accent-indigo to-accent-violet shadow-lg shadow-accent-indigo/20">
          <span className="text-xs font-bold text-white">N</span>
          <div className="absolute inset-0 rounded-[var(--radius-md)] bg-gradient-to-br from-accent-indigo to-accent-violet opacity-50 blur-lg" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-sm font-semibold text-nexus-50 tracking-tight">NexusHR</span>
              <span className="text-[10px] font-medium text-nexus-500 uppercase tracking-widest">Enterprise</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" role="navigation" aria-label="Main navigation">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="block"
              aria-label={item.label}
            >
              <motion.div
                className={cn(
                  'relative flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5',
                  'transition-all duration-200',
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-nexus-400 hover:text-nexus-200 hover:bg-white/[0.02]'
                )}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-1 right-1 top-1 bottom-1 -z-10 rounded-[var(--radius-md)] bg-white/[0.06] shadow-sm border border-white/[0.02]"
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                  />
                )}

                <Icon className={cn('h-[18px] w-[18px] flex-shrink-0', isActive && 'text-accent-indigo')} />

                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Notification badge for Notifications */}
                {item.path === '/notifications' && !sidebarCollapsed && (
                  <motion.span
                    className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-indigo/20 px-1.5 text-[10px] font-semibold text-accent-indigo"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    3
                  </motion.span>
                )}
              </motion.div>
            </NavLink>
          )
        })}
        {/* Enterprise Platform */}
        {!sidebarCollapsed && (
          <div className="mt-6 mb-2">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-accent-indigo">
              Enterprise Platform
            </div>
            <div className="mt-1 space-y-1">
              <HasPermission category="SETTINGS" action="UPDATE">
                <NavLink to="/features" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <Settings className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Feature Flags</span>
                </NavLink>
                <NavLink to="/settings/tenant" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <Building2 className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Tenant Config</span>
                </NavLink>
              </HasPermission>
              <HasPermission category="ROLES" action="UPDATE">
                <NavLink to="/settings/permissions" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <Shield className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Permissions Engine</span>
                </NavLink>
              </HasPermission>
              <HasPermission category="AUDIT" action="READ">
                <NavLink to="/settings/audit-logs" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <Shield className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Audit Logs</span>
                </NavLink>
              </HasPermission>
              <HasPermission category="SETTINGS" action="UPDATE">
                <NavLink to="/settings/platform" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <Settings2 className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Platform Config</span>
                </NavLink>
              </HasPermission>
              <HasPermission category="SETTINGS" action="UPDATE">
                <NavLink to="/automation/forms" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <FileText className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Form Builder</span>
                </NavLink>
                <NavLink to="/automation/workflows" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <Workflow className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Workflow Engine</span>
                </NavLink>
                <NavLink to="/automation/approvals" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <GitMerge className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Approval Engine</span>
                </NavLink>
                <NavLink to="/automation/delegation" className={({ isActive }) => cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
                )}>
                  <UserSquare className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="truncate font-medium">Delegation Engine</span>
                </NavLink>
              </HasPermission>
              <NavLink to="/knowledge/releases" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <Rocket className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Release Notes</span>
              </NavLink>
              <NavLink to="/knowledge/onboarding" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <Map className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Product Tours</span>
              </NavLink>
              <NavLink to="/knowledge/wiki" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <BookOpen className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Knowledge Base</span>
              </NavLink>
              <NavLink to="/knowledge/learning" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <GraduationCap className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Learning Center</span>
              </NavLink>
              <NavLink to="/planning/forecast" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <BrainCircuit className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Workforce Forecast</span>
              </NavLink>
              <NavLink to="/planning/scenarios" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <GitBranch className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Scenario Planning</span>
              </NavLink>
              <NavLink to="/planning/compensation" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <PieChart className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Compensation</span>
              </NavLink>
              <NavLink to="/planning/succession" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <Crown className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Succession Bench</span>
              </NavLink>
              <NavLink to="/planning/careers" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <Milestone className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Career Pathing</span>
              </NavLink>
            </div>
          </div>
        )}
        {/* Favorites / Pinned Section */}
        {!sidebarCollapsed && (
          <div className="mt-6">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-nexus-500">
              Pinned Favorites
            </div>
            <div className="mt-1 space-y-1">
              <NavLink to="/dashboard" className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-nexus-400 hover:bg-white/5 hover:text-nexus-200 transition-colors">
                <span className="truncate">High Performers</span>
              </NavLink>
              <NavLink to="/payroll" className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-nexus-400 hover:bg-white/5 hover:text-nexus-200 transition-colors">
                <span className="truncate">Q2 Payroll Review</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Quick Actions */}
      <div className="border-t border-white/[0.04] p-3 space-y-2">
        {/* Chat toggle */}
        <button
          onClick={toggleChatSidebar}
          className="flex w-full items-center justify-center lg:justify-start gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-nexus-500 hover:bg-white/[0.03] hover:text-nexus-300 transition-colors"
          aria-label="Open team chat"
        >
          <MessageSquare className="h-4 w-4" />
          {!sidebarCollapsed && <span className="text-xs">Team Chat</span>}
        </button>

        {/* Cmd+K hint */}
        {!sidebarCollapsed && (
          <button
            className="flex w-full items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-nexus-500 hover:bg-white/[0.03] hover:text-nexus-300 transition-colors"
            aria-label="Open command palette"
          >
            <Command className="h-4 w-4" />
            <span className="text-xs">Command Menu</span>
            <kbd className="ml-auto rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-mono text-nexus-500">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCollapse}
          className="flex w-full items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-nexus-500 hover:bg-white/[0.03] hover:text-nexus-300 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs">
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* User Profile */}
      <div className="border-t border-white/[0.04] p-3">
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/30 to-accent-violet/30 text-xs font-semibold text-nexus-100">
            {getInitials(user?.fullName || 'Admin User')}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-medium text-nexus-200 truncate">
                  {user?.fullName || 'Admin User'}
                </p>
                <p className="text-[10px] text-nexus-500 truncate">
                  {user?.role || 'ADMIN'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <button onClick={logout} className="text-nexus-500 hover:text-danger transition-colors" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
