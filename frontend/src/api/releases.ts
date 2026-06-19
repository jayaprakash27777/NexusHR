import apiClient, { type ApiResponse, type PagedResponse } from './client'

export interface ReleaseNote {
  id: string
  version: string
  title: string
  releaseType: 'MAJOR' | 'MINOR' | 'PATCH' | 'HOTFIX' | 'SECURITY'
  description?: string
  changes?: string // JSON string
  published: boolean
  publishedAt?: string
  authorId?: string
  createdAt: string
  updatedAt: string
}

export interface ReleaseNoteRequest {
  version: string
  title: string
  releaseType: 'MAJOR' | 'MINOR' | 'PATCH' | 'HOTFIX' | 'SECURITY'
  description?: string
  changes?: string // JSON string
  published: boolean
}

export const releasesApi = {
  getAll: async (params: { search?: string; published?: boolean; page?: number; size?: number } = {}): Promise<PagedResponse<ReleaseNote>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ReleaseNote>>>('/releases', { params })
    return res.data.data
  },

  getById: async (id: string): Promise<ReleaseNote> => {
    const res = await apiClient.get<ApiResponse<ReleaseNote>>(`/releases/${id}`)
    return res.data.data
  },

  getByVersion: async (version: string): Promise<ReleaseNote> => {
    const res = await apiClient.get<ApiResponse<ReleaseNote>>(`/releases/version/${version}`)
    return res.data.data
  },

  create: async (data: ReleaseNoteRequest): Promise<ReleaseNote> => {
    const res = await apiClient.post<ApiResponse<ReleaseNote>>('/releases', data)
    return res.data.data
  },

  update: async (id: string, data: ReleaseNoteRequest): Promise<ReleaseNote> => {
    const res = await apiClient.put<ApiResponse<ReleaseNote>>(`/releases/${id}`, data)
    return res.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/releases/${id}`)
  },
}
