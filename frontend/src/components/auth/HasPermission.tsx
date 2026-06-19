import React from 'react'
import { usePermissionStore } from '../../store/permissions'

interface HasPermissionProps {
  category: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function HasPermission({ category, action, children, fallback = null }: HasPermissionProps) {
  const can = usePermissionStore(s => s.can)
  const isLoaded = usePermissionStore(s => s.isLoaded)

  if (!isLoaded) return null

  if (can(category, action)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
