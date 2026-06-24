import apiClient, { type ApiResponse } from './client'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  employeeId?: string
  avatar?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: AuthUser
}

export interface Session {
  id: number
  token: string
  ipAddress?: string
  userAgent?: string
  deviceType?: string
  createdAt: string
  expiresAt: string
}

export interface LoginHistoryEntry {
  id: string
  ipAddress?: string
  userAgent?: string
  location?: string
  status: string
  failureReason?: string
  createdAt: string
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return res.data.data
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('nexushr_refresh_token')
    await apiClient.post('/auth/logout', { refreshToken })
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    )
    return res.data.data
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiClient.get<ApiResponse<AuthUser>>('/auth/me')
    return res.data.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/change-password', data)
  },

  getSessions: async (): Promise<Session[]> => {
    const res = await apiClient.get<ApiResponse<Session[]>>('/auth/sessions')
    return res.data.data
  },

  revokeSession: async (tokenId: number): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${tokenId}`)
  },

  getLoginHistory: async (page = 0, size = 20): Promise<PagedResponse<LoginHistoryEntry>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<LoginHistoryEntry>>>('/auth/login-history', {
      params: { page, size }
    })
    return res.data.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  resetPassword: async (data: { token: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  }
}
