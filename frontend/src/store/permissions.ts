import { create } from 'zustand'
import { authAdminApi } from '../api/authAdmin'

interface PermissionState {
  userPermissions: string[] // List of "CATEGORY:ACTION" strings
  effectiveRoles: string[]
  isLoaded: boolean
  can: (category: string, action: string) => boolean
  hasRole: (roleName: string) => boolean
  fetchMyPermissions: (userId: string) => Promise<void>
  clearPermissions: () => void
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  userPermissions: [],
  effectiveRoles: [],
  isLoaded: false,

  can: (category, action) => {
    const { userPermissions, effectiveRoles } = get()
    // Super admin bypass
    if (effectiveRoles.includes('ROLE_SUPER_ADMIN') || effectiveRoles.includes('SUPER_ADMIN')) {
      return true
    }
    return userPermissions.includes(`${category}:${action}`.toUpperCase())
  },

  hasRole: (roleName: string) => {
    const { effectiveRoles } = get()
    return effectiveRoles.includes(roleName) || effectiveRoles.includes(`ROLE_${roleName}`)
  },

  fetchMyPermissions: async (userId: string) => {
    try {
      const accessPreview = await authAdminApi.getAccessPreview(userId)
      set({
        userPermissions: accessPreview.effectivePermissions,
        effectiveRoles: accessPreview.effectiveRoles,
        isLoaded: true
      })
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
      set({ isLoaded: true })
    }
  },

  clearPermissions: () => {
    set({ userPermissions: [], effectiveRoles: [], isLoaded: false })
  }
}))
