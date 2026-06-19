import apiClient, { type ApiResponse, type PagedResponse } from './client'

export interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  content: string
  category: string
  tags?: string[]
  authorId?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  views: number
  helpfulCount: number
  unhelpfulCount: number
  createdAt: string
  updatedAt: string
}

export interface KnowledgeArticleRequest {
  title: string
  content: string
  category: string
  tags?: string[]
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export const knowledgeApi = {
  getAll: async (params: { search?: string; category?: string; page?: number; size?: number } = {}): Promise<PagedResponse<KnowledgeArticle>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<KnowledgeArticle>>>('/knowledge/articles', { params })
    return res.data.data
  },

  getById: async (id: string): Promise<KnowledgeArticle> => {
    const res = await apiClient.get<ApiResponse<KnowledgeArticle>>(`/knowledge/articles/${id}`)
    return res.data.data
  },

  getBySlug: async (slug: string): Promise<KnowledgeArticle> => {
    const res = await apiClient.get<ApiResponse<KnowledgeArticle>>(`/knowledge/articles/slug/${slug}`)
    return res.data.data
  },

  create: async (data: KnowledgeArticleRequest): Promise<KnowledgeArticle> => {
    const res = await apiClient.post<ApiResponse<KnowledgeArticle>>('/knowledge/articles', data)
    return res.data.data
  },

  update: async (id: string, data: KnowledgeArticleRequest): Promise<KnowledgeArticle> => {
    const res = await apiClient.put<ApiResponse<KnowledgeArticle>>(`/knowledge/articles/${id}`, data)
    return res.data.data
  },

  markHelpful: async (id: string, isHelpful: boolean): Promise<KnowledgeArticle> => {
    const res = await apiClient.post<ApiResponse<KnowledgeArticle>>(`/knowledge/articles/${id}/helpful?isHelpful=${isHelpful}`)
    return res.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge/articles/${id}`)
  },
}
