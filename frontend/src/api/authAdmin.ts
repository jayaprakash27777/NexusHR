import api, { PagedResponse, ApiResponse } from './client'

export interface RoleDto {
  id: number
  name: string
  description: string
  roleType: 'SYSTEM' | 'CUSTOM'
  parentRoleId: number | null
  parentRoleName: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRoleRequest {
  name: string
  description: string
  parentRoleId?: number
}

export interface PermissionDto {
  id: string
  category: string
  action: string
  description: string
}

export interface AssignPermissionsRequest {
  permissionIds: string[]
}

export interface DelegationDto {
  id: string
  delegatorId: string
  delegatorName: string
  delegateeId: string
  delegateeName: string
  status: string
  roleId: number | null
  roleName: string | null
  startDate: string
  endDate: string
  active: boolean
}

export interface CreateDelegationRequest {
  delegateeId: string
  roleId?: number
  status: string
  startDate: string
  endDate: string
}

export interface ApprovalMatrixDto {
  id: string
  category: string
  action: string
  approvalLevel: number
  requiredRoleId: number
  requiredRoleName: string
}

export interface CreateApprovalMatrixRequest {
  category: string
  action: string
  approvalLevel: number
  requiredRoleId: number
}

export interface AuditLogDto {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  details: string
  ipAddress: string
  createdAt: string
}

export interface AccessPreviewDto {
  userId: string
  fullName: string
  email: string
  effectiveRoles: string[]
  effectivePermissions: string[]
  activeDelegations: DelegationDto[]
}

export const authAdminApi = {
  // Roles
  getRoles: async (page = 0, size = 50) => {
    const res = await api.get<ApiResponse<PagedResponse<RoleDto>>>('/auth/roles', { params: { page, size } })
    return res.data.data
  },
  createRole: async (data: CreateRoleRequest) => {
    const res = await api.post<ApiResponse<RoleDto>>('/auth/roles', data)
    return res.data.data
  },
  updateRole: async (id: number, data: CreateRoleRequest) => {
    const res = await api.put<ApiResponse<RoleDto>>(`/auth/roles/${id}`, data)
    return res.data.data
  },
  deleteRole: async (id: number) => {
    await api.delete(`/auth/roles/${id}`)
  },
  getRoleHierarchy: async (id: number) => {
    const res = await api.get<ApiResponse<RoleDto[]>>(`/auth/roles/${id}/hierarchy`)
    return res.data.data
  },
  assignPermissionsToRole: async (id: number, data: AssignPermissionsRequest) => {
    await api.post(`/auth/roles/${id}/permissions`, data)
  },
  revokePermissionFromRole: async (roleId: number, permissionId: string) => {
    await api.delete(`/auth/roles/${roleId}/permissions/${permissionId}`)
  },

  // Permissions
  getPermissions: async (category?: string, page = 0, size = 100) => {
    const res = await api.get<ApiResponse<PagedResponse<PermissionDto>>>('/auth/permissions', { params: { category, page, size } })
    return res.data.data
  },
  getPermissionCategories: async () => {
    const res = await api.get<ApiResponse<string[]>>('/auth/permissions/categories')
    return res.data.data
  },

  // Delegations
  getDelegations: async (page = 0, size = 50) => {
    const res = await api.get<ApiResponse<PagedResponse<DelegationDto>>>('/auth/delegations', { params: { page, size } })
    return res.data.data
  },
  createDelegation: async (delegatorId: string, data: CreateDelegationRequest) => {
    const res = await api.post<ApiResponse<DelegationDto>>(`/auth/delegations`, data, { params: { delegatorId } })
    return res.data.data
  },
  revokeDelegation: async (id: string) => {
    await api.delete(`/auth/delegations/${id}`)
  },

  // Approval Matrix
  getApprovalMatrices: async (page = 0, size = 50) => {
    const res = await api.get<ApiResponse<PagedResponse<ApprovalMatrixDto>>>('/auth/approval-matrix', { params: { page, size } })
    return res.data.data
  },
  createApprovalMatrix: async (data: CreateApprovalMatrixRequest) => {
    const res = await api.post<ApiResponse<ApprovalMatrixDto>>('/auth/approval-matrix', data)
    return res.data.data
  },
  deleteApprovalMatrix: async (id: string) => {
    await api.delete(`/auth/approval-matrix/${id}`)
  },

  // Audit Logs
  getAuditLogs: async (action?: string, entityType?: string, page = 0, size = 50) => {
    const res = await api.get<ApiResponse<PagedResponse<AuditLogDto>>>('/auth/audit-logs', { params: { action, entityType, page, size } })
    return res.data.data
  },

  // Access
  getAccessPreview: async (userId: string) => {
    const res = await api.get<ApiResponse<AccessPreviewDto>>(`/auth/access/preview/${userId}`)
    return res.data.data
  }
}
