import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function RoleBasedRedirect() {
  const { user, isInitialized, isAuthenticated } = useAuthStore()

  if (!isInitialized) {
    return <LoadingScreen />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const role = user.role

  // Super Admin → Executive Command Center
  if (role === 'ROLE_SUPER_ADMIN') {
    return <Navigate to="/executive" replace />
  }

  // Admin → Admin Dashboard
  if (role === 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  // HR Director → HR Dashboard
  if (role === 'ROLE_HR_DIRECTOR') {
    return <Navigate to="/dashboard/hr" replace />
  }

  // HR Executive → HR Executive Dashboard
  if (role === 'ROLE_HR_EXECUTIVE') {
    return <Navigate to="/dashboard/hr-exec" replace />
  }

  // Finance Manager → Finance Dashboard
  if (role === 'ROLE_FINANCE_MANAGER') {
    return <Navigate to="/dashboard/finance" replace />
  }

  // Department Manager → Dept Manager Dashboard
  if (role === 'ROLE_DEPARTMENT_MANAGER') {
    return <Navigate to="/dashboard/dept-manager" replace />
  }

  // Manager → Manager Dashboard
  if (role === 'ROLE_MANAGER') {
    return <Navigate to="/dashboard/manager" replace />
  }

  // Team Lead → Team Lead Dashboard
  if (role === 'ROLE_TEAM_LEAD') {
    return <Navigate to="/dashboard/team-lead" replace />
  }

  // Auditor → Auditor Dashboard
  if (role === 'ROLE_AUDITOR') {
    return <Navigate to="/dashboard/auditor" replace />
  }

  // Fallback: check for common role patterns
  if (role?.startsWith('ROLE_HR')) {
    return <Navigate to="/dashboard/hr" replace />
  }

  if (role?.startsWith('ROLE_FINANCE')) {
    return <Navigate to="/dashboard/finance" replace />
  }

  if (role?.endsWith('MANAGER') || role?.endsWith('LEAD')) {
    return <Navigate to="/dashboard/manager" replace />
  }

  // Default for normal employees and any unrecognized roles
  return <Navigate to="/dashboard/employee" replace />
}
