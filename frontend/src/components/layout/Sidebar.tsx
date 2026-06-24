import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, useAuthStore, useChatStore } from '@/store'
import { cn, getInitials } from '@/lib/utils'
import {
  LayoutDashboard, Users, Clock, CalendarDays, Wallet, Briefcase,
  TrendingUp, Sparkles, Bell, ChevronLeft, LogOut, Settings,
  Command, MessageSquare, MonitorPlay, Building2, Shield, Settings2, FileText, Workflow, GitMerge, UserSquare, Rocket, Map, BookOpen, GraduationCap, BrainCircuit, GitBranch, PieChart, Crown, Milestone
} from 'lucide-react'
import HasPermission from '@/components/auth/HasPermission'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

// Role-specific dashboard path mapping
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  'ROLE_SUPER_ADMIN': '/executive',
  'ROLE_ADMIN': '/dashboard',
  'ROLE_HR_DIRECTOR': '/dashboard/hr',
  'ROLE_HR_EXECUTIVE': '/dashboard/hr-exec',
  'ROLE_FINANCE_MANAGER': '/dashboard/finance',
  'ROLE_DEPARTMENT_MANAGER': '/dashboard/dept-manager',
  'ROLE_MANAGER': '/dashboard/manager',
  'ROLE_TEAM_LEAD': '/dashboard/team-lead',
  'ROLE_AUDITOR': '/dashboard/auditor',
  'ROLE_EMPLOYEE': '/dashboard/employee',
}

// Role display labels
const ROLE_LABEL_MAP: Record<string, string> = {
  'ROLE_SUPER_ADMIN': 'Super Admin',
  'ROLE_ADMIN': 'Administrator',
  'ROLE_HR_DIRECTOR': 'HR Director',
  'ROLE_HR_EXECUTIVE': 'HR Executive',
  'ROLE_FINANCE_MANAGER': 'Finance Manager',
  'ROLE_DEPARTMENT_MANAGER': 'Dept Manager',
  'ROLE_MANAGER': 'Manager',
  'ROLE_TEAM_LEAD': 'Team Lead',
  'ROLE_AUDITOR': 'Auditor',
  'ROLE_EMPLOYEE': 'Employee',
}

// Define which nav items each role can see
function getNavItems(role: string) {
  const dashboardPath = ROLE_DASHBOARD_MAP[role] || '/dashboard/employee'
  
  // Base items everyone sees
  const base = [
    { path: dashboardPath, label: 'Dashboard', icon: LayoutDashboard },
  ]

  // Items by role category
  const isSuperAdmin = role === 'ROLE_SUPER_ADMIN'
  const isAdmin = role === 'ROLE_ADMIN' || isSuperAdmin
  const isHR = role.startsWith('ROLE_HR')
  const isFinance = role.startsWith('ROLE_FINANCE')
  const isManager = role === 'ROLE_MANAGER' || role === 'ROLE_DEPARTMENT_MANAGER' || role === 'ROLE_TEAM_LEAD'
  const isAuditor = role === 'ROLE_AUDITOR'

  // Admin / Super Admin: Everything
  if (isAdmin) {
    return [
      ...(isSuperAdmin ? [{ path: '/executive', label: 'Command Center', icon: MonitorPlay }] : []),
      { path: dashboardPath, label: 'Dashboard', icon: LayoutDashboard },
      { path: '/employees', label: 'Employees', icon: Users },
      { path: '/attendance', label: 'Attendance', icon: Clock },
      { path: '/leaves', label: 'Leaves', icon: CalendarDays },
      { path: '/payroll', label: 'Payroll', icon: Wallet },
      { path: '/performance', label: 'Performance', icon: TrendingUp },
      { path: '/recruitment', label: 'Recruitment', icon: Briefcase },
      { path: '/analytics', label: 'Analytics', icon: PieChart },
      { path: '/reports', label: 'Reports', icon: FileText },
      { path: '/ai-insights', label: 'AI Insights', icon: Sparkles },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/security/rbac', label: 'Access Control', icon: Shield },
      { path: '/notifications', label: 'Notifications', icon: Bell },
    ]
  }

  // HR roles
  if (isHR) {
    return [
      ...base,
      { path: '/employees', label: 'Employees', icon: Users },
      { path: '/attendance', label: 'Attendance', icon: Clock },
      { path: '/leaves', label: 'Leaves', icon: CalendarDays },
      { path: '/recruitment', label: 'Recruitment', icon: Briefcase },
      { path: '/performance', label: 'Performance', icon: TrendingUp },
      { path: '/analytics', label: 'Analytics', icon: PieChart },
      { path: '/reports', label: 'Reports', icon: FileText },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/notifications', label: 'Notifications', icon: Bell },
    ]
  }

  // Finance roles
  if (isFinance) {
    return [
      ...base,
      { path: '/payroll', label: 'Payroll', icon: Wallet },
      { path: '/employees', label: 'Employees', icon: Users },
      { path: '/reports', label: 'Reports', icon: FileText },
      { path: '/analytics', label: 'Analytics', icon: PieChart },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/notifications', label: 'Notifications', icon: Bell },
    ]
  }

  // Manager / Team Lead / Dept Manager
  if (isManager) {
    return [
      ...base,
      { path: '/employees', label: 'Team', icon: Users },
      { path: '/attendance', label: 'Attendance', icon: Clock },
      { path: '/leaves', label: 'Leaves', icon: CalendarDays },
      { path: '/performance', label: 'Performance', icon: TrendingUp },
      { path: '/documents', label: 'Documents', icon: FileText },
      { path: '/notifications', label: 'Notifications', icon: Bell },
    ]
  }

  // Auditor
  if (isAuditor) {
    return [
      ...base,
      { path: '/settings/audit-logs', label: 'Audit Logs', icon: FileText },
      { path: '/security/rbac', label: 'Access Control', icon: Shield },
      { path: '/settings/security', label: 'Security Center', icon: Settings },
      { path: '/notifications', label: 'Notifications', icon: Bell },
    ]
  }

  // Default: Employee
  return [
    ...base,
    { path: '/attendance', label: 'Attendance', icon: Clock },
    { path: '/leaves', label: 'Leaves', icon: CalendarDays },
    { path: '/performance', label: 'My Goals', icon: TrendingUp },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ]
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()
  const { user, logout } = useAuthStore()
  const toggleChatSidebar = useChatStore(s => s.toggleChatSidebar)
  const location = useLocation()

  const userRole = user?.role || 'ROLE_EMPLOYEE'
  const navItems = getNavItems(userRole)
  const roleLabel = ROLE_LABEL_MAP[userRole] || userRole.replace('ROLE_', '').replace(/_/g, ' ')
  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_SUPER_ADMIN'

  return (
    <motion.aside
      className={cn(
        'fixed left-4 top-4 bottom-4 z-40 flex flex-col overflow-hidden',
        'rounded-[var(--radius-2xl)] border border-border bg-surface/60',
        'backdrop-blur-3xl backdrop-saturate-[200%] shadow-2xl',
        'transition-all duration-500 ease-[var(--ease-out-expo)]'
      )}
      animate={{ width: sidebarCollapsed ? 64 : 252 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-5">
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
              <span className="text-sm font-semibold text-foreground tracking-tight">NexusHR</span>
              <span className="text-[10px] font-medium text-muted uppercase tracking-widest">Enterprise</span>
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
                    ? 'text-foreground font-semibold'
                    : 'text-muted hover:text-foreground hover:bg-foreground/5'
                )}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 right-0 top-0 bottom-0 -z-10 rounded-[var(--radius-lg)] bg-accent-indigo/10 shadow-[inset_0_0_12px_rgba(99,102,241,0.1)] border border-accent-indigo/20 backdrop-blur-md"
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

        {/* Enterprise Platform — only for admins */}
        {isAdmin && !sidebarCollapsed && (
          <div className="mt-6 mb-2">
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-accent-indigo">
              Enterprise Platform
            </div>
            <div className="mt-1 space-y-1">
              <NavLink to="/enterprise" className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive ? "bg-accent-indigo/10 text-accent-indigo" : "text-nexus-400 hover:bg-white/5 hover:text-nexus-200"
              )}>
                <Settings className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="truncate font-medium">Enterprise Hub</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Quick Actions */}
      <div className="border-t border-border/50 p-3 space-y-2">
        {/* Chat toggle */}
        <button
          onClick={toggleChatSidebar}
          className="flex w-full items-center justify-center lg:justify-start gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-muted hover:bg-foreground/5 hover:text-foreground transition-colors"
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
      <div className="border-t border-border/50 p-3">
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo/30 to-accent-violet/30 text-xs font-semibold text-foreground">
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
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.fullName || 'Admin User'}
                </p>
                <p className="text-[10px] text-accent-indigo font-semibold truncate">
                  {roleLabel}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={logout} className="p-2 text-muted hover:text-danger hover:bg-foreground/5 rounded-lg transition-colors" aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
