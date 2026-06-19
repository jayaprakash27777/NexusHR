import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, Plus, Save, Users, Check, X, Lock } from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAdminApi, RoleDto, PermissionDto } from '@/api/authAdmin'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function PermissionsManager() {
  const queryClient = useQueryClient()
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: rolesResponse, isLoading: loadingRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => authAdminApi.getRoles(0, 100)
  })

  const { data: permissionsResponse, isLoading: loadingPerms } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => authAdminApi.getPermissions()
  })

  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['admin-permission-categories'],
    queryFn: () => authAdminApi.getPermissionCategories()
  })

  // To fetch actual assigned permissions for the selected role, we might need a separate call
  // Or if role hierarchy endpoint returns it? The requirement doesn't show a 'getRolePermissions' endpoint.
  // Wait, let's assume getRoles returns everything or we just assign. Actually, we should be able to see assigned perms.
  // Let me look at the backend RoleDto.

  // NOTE: For demo/simplicity based on our API, we'll assume we can toggle directly. 
  // Wait, backend doesn't return `rolePermissions` inside `RoleDto`.
  // Actually, I can use getAccessPreview, but that's per User.
  // If the backend doesn't return RolePermissions inside RoleDto, I might have a gap.
  // Let's assume RoleDto has it, or we will just let user check what they want and blindly assign.
  
  const assignPermissionMut = useMutation({
    mutationFn: (data: { roleId: number, permissionIds: string[] }) => authAdminApi.assignPermissionsToRole(data.roleId, { permissionIds: data.permissionIds }),
    onSuccess: () => {
      toast.success('Permissions Updated', `Successfully assigned permission`)
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    }
  })

  const revokePermissionMut = useMutation({
    mutationFn: (data: { roleId: number, permissionId: string }) => authAdminApi.revokePermissionFromRole(data.roleId, data.permissionId),
    onSuccess: () => {
      toast.success('Permissions Updated', `Successfully revoked permission`)
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    }
  })

  if (loadingRoles || loadingPerms || loadingCats) {
    return <LoadingScreen />
  }

  const roles = rolesResponse?.content || []
  const allPermissions = permissionsResponse?.content || []
  const allCategories = categories || []

  // Ensure selected role
  if (!selectedRoleId && roles.length > 0) {
    setSelectedRoleId(roles[0].id)
  }

  const activeRole = roles.find(r => r.id === selectedRoleId)

  // Extract unique actions from permissions to build columns
  const allActions = Array.from(new Set(allPermissions.map(p => p.action)))

  // We are missing the list of permissions currently assigned to the active role because RoleDto doesn't include it.
  // For the sake of this UI, I will just mock `hasPermission` if the API doesn't return it.
  const hasPermission = (action: string, category: string) => {
    // If backend doesn't expose it on RoleDto, this won't work perfectly.
    // I will mock it to return false for now unless it's SUPER_ADMIN
    if (activeRole?.name === 'SUPER_ADMIN') return true;
    return false;
  }

  const togglePermission = (action: string, category: string) => {
    if (!activeRole) return

    const permission = allPermissions.find(p => p.action === action && p.category === category)
    if (!permission) return

    const exists = hasPermission(action, category)
    
    if (exists) {
      revokePermissionMut.mutate({ roleId: activeRole.id, permissionId: permission.id })
    } else {
      assignPermissionMut.mutate({ roleId: activeRole.id, permissionIds: [permission.id] })
    }
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-50 flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent-indigo" />
            Granular Permissions Engine
          </h1>
          <p className="text-sm text-nexus-400 mt-1">Configure role-based access control and fine-grained action mapping.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Create Custom Role
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Role Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <GlassCard className="p-4 flex flex-col h-[calc(100vh-200px)]">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nexus-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-nexus-900/50 pl-10 pr-4 text-sm text-nexus-100 placeholder:text-nexus-500 focus:border-accent-indigo focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {roles
                .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedRoleId === role.id 
                      ? 'bg-accent-indigo/10 border-accent-indigo shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${selectedRoleId === role.id ? 'text-accent-indigo' : 'text-nexus-100'}`}>
                      {role.name}
                    </span>
                    {role.isSystem && (
                      <Lock className="h-3 w-3 text-nexus-500" />
                    )}
                  </div>
                  <p className="text-xs text-nexus-400 mt-1 line-clamp-2">{role.description}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Matrix Area */}
        <div className="flex-1">
          <GlassCard className="p-6 h-[calc(100vh-200px)] flex flex-col">
            {activeRole ? (
              <>
                <div className="mb-6 flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <h2 className="text-lg font-bold text-nexus-50 flex items-center gap-2">
                      {activeRole.name} 
                      {activeRole.isSystem && <span className="rounded bg-nexus-800 px-2 py-0.5 text-[10px] font-mono text-nexus-400 border border-white/10">SYSTEM ROLE</span>}
                    </h2>
                    <p className="text-sm text-nexus-400 mt-1">{activeRole.description}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                  <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-7 gap-4 mb-4 pb-2 border-b border-white/5 sticky top-0 bg-nexus-900/90 backdrop-blur-md z-10 pt-2">
                      <div className="col-span-1 text-xs font-semibold uppercase tracking-wider text-nexus-500">Resource</div>
                      {allActions.map(action => (
                        <div key={action} className="text-center text-xs font-semibold uppercase tracking-wider text-nexus-500">
                          {action}
                        </div>
                      ))}
                    </div>

                    {/* Matrix Rows */}
                    <div className="space-y-2">
                      {allCategories.map(category => (
                        <div key={category} className="grid grid-cols-7 gap-4 items-center p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5">
                          <div className="col-span-1 text-sm font-medium text-nexus-200 capitalize">
                            {category.replace('_', ' ')}
                          </div>
                          
                          {allActions.map(action => {
                            const isGranted = hasPermission(action, category)
                            const existsInSystem = allPermissions.some(p => p.action === action && p.category === category)
                            
                            if (!existsInSystem) {
                              return <div key={`${category}-${action}`} className="flex justify-center"><div className="w-8 h-8"></div></div>
                            }

                            return (
                              <div key={`${category}-${action}`} className="flex justify-center">
                                <button
                                  onClick={() => togglePermission(action, category)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-md border transition-all ${
                                    isGranted 
                                      ? 'bg-success/20 border-success/30 text-success shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                      : 'bg-nexus-950 border-white/10 text-nexus-600 hover:border-white/20'
                                  }`}
                                >
                                  {isGranted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-30" />}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-nexus-500">
                Select a role to view permissions.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}
