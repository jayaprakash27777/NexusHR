import apiClient, { type ApiResponse, type PagedResponse } from './client'

export interface FeatureFlag {
  id: string
  flagKey: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  environment: string
  flagType: string
  allowedRoles?: string[]
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface FeatureFlagRequest {
  flagKey: string
  name: string
  description?: string
  enabled: boolean
  rolloutPercentage: number
  environment?: string
  flagType?: string
  allowedRoles?: string[]
  expiresAt?: string
}

export const featureFlagsApi = {
  getAll: async (params: { search?: string; environment?: string; page?: number; size?: number } = {}): Promise<PagedResponse<FeatureFlag>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<FeatureFlag>>>('/features', { params })
    return res.data.data
  },

  getEnabled: async (environment: string = 'production'): Promise<FeatureFlag[]> => {
    const res = await apiClient.get<ApiResponse<FeatureFlag[]>>(`/features/enabled?environment=${environment}`)
    return res.data.data
  },

  getByKey: async (key: string): Promise<FeatureFlag> => {
    const res = await apiClient.get<ApiResponse<FeatureFlag>>(`/features/${key}`)
    return res.data.data
  },

  create: async (data: FeatureFlagRequest): Promise<FeatureFlag> => {
    const res = await apiClient.post<ApiResponse<FeatureFlag>>('/features', data)
    return res.data.data
  },

  update: async (id: string, data: FeatureFlagRequest): Promise<FeatureFlag> => {
    const res = await apiClient.put<ApiResponse<FeatureFlag>>(`/features/${id}`, data)
    return res.data.data
  },

  toggle: async (id: string): Promise<FeatureFlag> => {
    const res = await apiClient.patch<ApiResponse<FeatureFlag>>(`/features/${id}/toggle`)
    return res.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/features/${id}`)
  },
}
