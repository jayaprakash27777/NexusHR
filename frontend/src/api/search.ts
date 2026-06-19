import apiClient, { type ApiResponse } from './client'

export interface SearchResult {
  id: string
  type: 'employee' | 'leave' | 'payroll' | 'review' | 'department' | 'notification'
  title: string
  subtitle: string
  url: string
  avatar?: string
  metadata?: Record<string, string>
}

export interface GlobalSearchResponse {
  results: SearchResult[]
  total: number
  query: string
  timeTaken: number
}

export const searchApi = {
  globalSearch: async (query: string, limit: number = 10): Promise<GlobalSearchResponse> => {
    const res = await apiClient.get<ApiResponse<GlobalSearchResponse>>(
      `/search?q=${encodeURIComponent(query)}&limit=${limit}`
    )
    return res.data.data
  },
}
