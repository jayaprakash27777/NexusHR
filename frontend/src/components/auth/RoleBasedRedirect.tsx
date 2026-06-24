import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import LoadingScreen from '@/components/ui/LoadingScreen'

// Client-side role-to-dashboard mapping (fallback if backend doesn't provide dashboardUrl)
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

export default function RoleBasedRedirect() {
  const { user, isInitialized, isAuthenticated } = useAuthStore()

  if (!isInitialized) {
    return <LoadingScreen />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // 1. Use the dynamic dashboard URL provided by the backend (from the roles table)
  if (user.dashboardUrl && user.dashboardUrl !== '/dashboard/employee') {
    return <Navigate to={user.dashboardUrl} replace />
  }

  // 2. Client-side fallback based on role name
  const role = user.role || 'ROLE_EMPLOYEE'
  const dashboardPath = ROLE_DASHBOARD_MAP[role] || ROLE_DASHBOARD_MAP[`ROLE_${role}`] || '/dashboard/employee'
  
  return <Navigate to={dashboardPath} replace />
}
