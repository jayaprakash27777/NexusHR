import api, { ApiResponse, PagedResponse } from './client'

export type AnnouncementType = 'GLOBAL' | 'HR' | 'FINANCE' | 'DEPARTMENT' | 'TEAM'

export interface AnnouncementDto {
  id: string
  title: string
  content: string
  type: AnnouncementType
  authorId: string
  authorName: string
  authorAvatar: string | null
  createdAt: string
  reactionCount: number
  userReacted: boolean
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
  type: AnnouncementType
}

export const announcementsApi = {
  getAnnouncements: async (page = 0, size = 10) => {
    const res = await api.get<ApiResponse<PagedResponse<AnnouncementDto>>>('/api/announcements', { params: { page, size } })
    return res.data.data
  },
  createAnnouncement: async (data: CreateAnnouncementRequest) => {
    const res = await api.post<ApiResponse<AnnouncementDto>>('/api/announcements', data)
    return res.data.data
  },
  reactToAnnouncement: async (id: string, type: string = 'ACKNOWLEDGE') => {
    await api.post(`/api/announcements/${id}/react`, { type })
  }
}
