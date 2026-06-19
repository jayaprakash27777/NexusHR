import React from 'react'
import { Navigate } from 'react-router-dom'
import { usePermissionStore } from '../../store/permissions'
import LoadingScreen from '../ui/LoadingScreen'
import { ShieldAlert } from 'lucide-react'

interface RequirePermissionProps {
  category: string
  action: string
  children: React.ReactNode
}

export default function RequirePermission({ category, action, children }: RequirePermissionProps) {
  const can = usePermissionStore(s => s.can)
  const isLoaded = usePermissionStore(s => s.isLoaded)

  if (!isLoaded) {
    return <LoadingScreen />
  }

  if (!can(category, action)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <ShieldAlert className="h-8 w-8 text-danger" />
        </div>
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-nexus-400 text-center max-w-md">
          You do not have the required permissions ({category}:{action}) to view this page. 
          Please contact your system administrator if you believe this is an error.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
