import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, Plus, Save, Users, Check, X, Lock, UserPlus, Trash2 } from 'lucide-react'
import PageTransition from '@/components/animation/PageTransition'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from '@/store/toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAdminApi } from '@/api/authAdmin'
import { employeesApi } from '@/api/employees'
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function PermissionsManager() {
  const queryClient = useQueryClient()
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>('permissions')

  const [employeeSearch, setEmployeeSearch] = useState('')

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

  // Employee search query for user assignment
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees-search', employeeSearch],
    queryFn: () => employeesApi.getAll({ search: employeeSearch, size: 5 }),
    enabled: employeeSearch.length > 1
  })

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

  const assignRoleMut = useMutation({
    mutationFn: (data: { roleId: number, userId: string }) => authAdminApi.assignRoleToUser(data.roleId, data.userId),
    onSuccess: () => {
      toast.success('Role Assigned', `User has been assigned to this role`)
      setEmployeeSearch('')
    },
    onError: () => {
      toast.error('Assignment Failed', 'Could not assign role to user.')
    }
  })

  if (loadingRoles || loadingPerms || loadingCats) {
    return <LoadingScreen />
  }

  const roles = rolesResponse?.content || []
  const allPermissions = permissionsResponse?.content || []
  const allCategories = categories || []

  if (!selectedRoleId && roles.length > 0) {
    setSelectedRoleId(roles[0].id)
  }

  const activeRole = roles.find(r => r.id === selectedRoleId)
  const allActions = Array.from(new Set(allPermissions.map(p => p.action)))

  const hasPermission = (action: string, category: string) => {
    if (!activeRole) return false;
    if (activeRole.name === 'SUPER_ADMIN') return true;
    return activeRole.permissions?.some(p => p.action === action && p.category === category) || false;
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
    <PageTransition className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent-indigo" />
            Permissions & Assignments
          </h1>
          <p className="text-sm text-muted mt-1">Configure role-based access control and assign users to roles.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500">
          <Plus className="h-4 w-4" /> Create Custom Role
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        
        {/* Role Sidebar */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <GlassCard className="p-4 flex flex-col h-[calc(100vh-200px)]">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent-indigo focus:outline-none"
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
                      : 'bg-surface border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${selectedRoleId === role.id ? 'text-accent-indigo' : 'text-foreground'}`}>
                      {role.name}
                    </span>
                    {role.isSystem && (
                      <Lock className="h-3 w-3 text-muted" />
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{role.description}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Matrix & Users Area */}
        <div className="flex-1">
          <GlassCard className="p-6 h-[calc(100vh-200px)] flex flex-col">
            {activeRole ? (
              <>
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      {activeRole.name} 
                      {activeRole.isSystem && <span className="rounded bg-surface-hover px-2 py-0.5 text-[10px] font-mono text-muted border border-border">SYSTEM ROLE</span>}
                    </h2>
                    <p className="text-sm text-muted mt-1">{activeRole.description}</p>
                  </div>

                  {/* Tabs */}
                  <div className="flex bg-surface border border-border rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('permissions')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'permissions' ? 'bg-accent-indigo text-white' : 'text-muted hover:text-foreground'}`}
                    >
                      Permissions
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-accent-indigo text-white' : 'text-muted hover:text-foreground'}`}
                    >
                      Assigned Users
                    </button>
                  </div>
                </div>

                {activeTab === 'permissions' && (
                  <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                    <div className="min-w-[800px]">
                      {/* Header Row */}
                      <div className="grid grid-cols-7 gap-4 mb-4 pb-2 border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-10 pt-2">
                        <div className="col-span-1 text-xs font-semibold uppercase tracking-wider text-muted">Resource</div>
                        {allActions.map(action => (
                          <div key={action} className="text-center text-xs font-semibold uppercase tracking-wider text-muted">
                            {action}
                          </div>
                        ))}
                      </div>

                      {/* Matrix Rows */}
                      <div className="space-y-2">
                        {allCategories.map(category => (
                          <div key={category} className="grid grid-cols-7 gap-4 items-center p-3 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors">
                            <div className="col-span-1 text-sm font-medium text-foreground capitalize">
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
                                    disabled={activeRole.isSystem}
                                    className={`flex h-8 w-8 items-center justify-center rounded-md border transition-all ${
                                      isGranted 
                                        ? 'bg-success/20 border-success/30 text-success shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                        : 'bg-surface border-border text-muted hover:border-muted'
                                    } ${activeRole.isSystem ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                )}

                {activeTab === 'users' && (
                  <div className="flex-1 flex flex-col space-y-6">
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                      <input
                        type="text"
                        placeholder="Search employee to assign..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent-indigo focus:outline-none"
                      />
                      {employeesResponse?.content && employeeSearch.length > 1 && (
                        <div className="absolute top-12 left-0 w-full bg-surface border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                          {employeesResponse.content.map(emp => (
                            <button
                              key={emp.id}
                              onClick={() => assignRoleMut.mutate({ roleId: activeRole.id, userId: emp.id })}
                              className="w-full text-left px-4 py-3 hover:bg-surface-hover flex items-center justify-between border-b border-border last:border-0"
                            >
                              <div>
                                <p className="text-sm font-semibold text-foreground">{emp.fullName}</p>
                                <p className="text-xs text-muted">{emp.email}</p>
                              </div>
                              <UserPlus className="h-4 w-4 text-accent-indigo" />
                            </button>
                          ))}
                          {employeesResponse.content.length === 0 && (
                            <div className="p-4 text-sm text-muted text-center">No employees found.</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
                      <Users className="h-10 w-10 text-muted mx-auto mb-3" />
                      <p className="text-sm text-muted">Use the search bar above to assign this role to users.</p>
                      <p className="text-xs text-muted mt-1">Assignments take effect immediately.</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted">
                Select a role to view permissions and assignments.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  )
}
