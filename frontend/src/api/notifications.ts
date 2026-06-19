import apiClient, { type ApiResponse, type PagedResponse } from './client'

export type NotificationType = 
  'LEAVE_REQUEST' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED' |
  'PAYROLL_GENERATED' | 'REVIEW_DUE' | 'REVIEW_COMPLETED' |
  'GOAL_ASSIGNED' | 'EMPLOYEE_CREATED' | 'EMPLOYEE_UPDATED' |
  'SYSTEM' | 'ANNOUNCEMENT' | 'ROLE_CHANGE'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  isDelivered: boolean
  entityId?: string
  entityType?: string
  actionUrl?: string
  createdAt: string
  readAt?: string
}

export interface NotificationQueryParams {
  page?: number
  size?: number
  isRead?: boolean
  type?: NotificationType
}

export const notificationsApi = {
  getAll: async (params: NotificationQueryParams = {}): Promise<PagedResponse<Notification>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Notification>>>('/notifications', { params })
    return res.data.data
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
    return res.data.data.count
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`)
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all')
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`)
  },

  clearAll: async (): Promise<void> => {
    await apiClient.delete('/notifications/clear')
  },
}
