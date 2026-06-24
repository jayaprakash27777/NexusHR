import api from './client'

export interface Course {
  id: string
  title: string
  category: string
  duration: string
  totalModules: number
  thumbnail: string
}

export interface CourseEnrollment {
  id: string
  courseId: string
  title: string
  category: string
  duration: string
  totalModules: number
  thumbnail: string
  employeeId: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  progress: number
  dueDate?: string
  completedAt?: string
}

export interface TourStep {
  id: string
  title: string
  content: string
  targetSelector: string
  stepOrder: number
}

export interface ProductTour {
  id: string
  name: string
  description: string
  active: boolean
  steps: TourStep[]
}

export const learningApi = {
  // Learning Center
  getCatalog: async () => {
    const { data } = await api.get<{ data: Course[] }>('/knowledge/learning/catalog')
    return data.data
  },
  
  getMyLearning: async () => {
    const { data } = await api.get<{ data: CourseEnrollment[] }>('/knowledge/learning/my-learning')
    return data.data
  },
  
  launchCourse: async (enrollmentId: string) => {
    const { data } = await api.post<{ data: void }>(`/knowledge/learning/enrollments/${enrollmentId}/launch`)
    return data.data
  },

  // Onboarding Manager
  getTours: async () => {
    const { data } = await api.get<{ data: ProductTour[] }>('/knowledge/onboarding/tours')
    return data.data
  },

  toggleTourStatus: async (tourId: string) => {
    const { data } = await api.post<{ data: ProductTour }>(`/knowledge/onboarding/tours/${tourId}/toggle`)
    return data.data
  },

  updateTour: async (tourId: string, payload: Partial<ProductTour>) => {
    const { data } = await api.put<{ data: ProductTour }>(`/knowledge/onboarding/tours/${tourId}`, payload)
    return data.data
  }
}
