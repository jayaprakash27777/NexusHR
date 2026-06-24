import apiClient, { type ApiResponse } from './client'

export interface SystemConfigModule {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

export const configApi = {
  getModules: async (): Promise<SystemConfigModule[]> => {
    const res = await apiClient.get<ApiResponse<SystemConfigModule[]>>('/config/modules')
    return res.data.data
  }
}
