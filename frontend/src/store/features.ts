import { create } from 'zustand'

export interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  environments: string[]
  createdAt: string
  updatedAt: string
}

const mockFlags: FeatureFlag[] = [
  {
    id: 'ff_1',
    key: 'beta_workflow_builder',
    name: 'Workflow Builder (Beta)',
    description: 'Enables the new drag-and-drop workflow automation engine.',
    enabled: true,
    rolloutPercentage: 20,
    environments: ['staging', 'production'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ff_2',
    key: 'ai_sentiment_analysis',
    name: 'AI Sentiment Analysis',
    description: 'Enables real-time sentiment tracking on employee pulses.',
    enabled: false,
    rolloutPercentage: 0,
    environments: ['development', 'staging'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ff_3',
    key: 'advanced_rbac',
    name: 'Granular Permissions Engine',
    description: 'Switches the authorization system from simple roles to granular RBAC.',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

interface FeatureState {
  flags: FeatureFlag[]
  isLoading: boolean
  isFeatureEnabled: (key: string) => boolean
  toggleFlag: (id: string, enabled: boolean) => void
  updateRollout: (id: string, percentage: number) => void
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  flags: mockFlags,
  isLoading: false,

  isFeatureEnabled: (key: string) => {
    const flag = get().flags.find((f) => f.key === key)
    if (!flag || !flag.enabled) return false
    
    // In a real app, we'd hash the user ID to determine if they fall within the rollout %
    // For this mock, if enabled is true and rollout > 0, we'll just return true
    return flag.rolloutPercentage > 0
  },

  toggleFlag: (id: string, enabled: boolean) => {
    set((state) => ({
      flags: state.flags.map((f) => 
        f.id === id ? { ...f, enabled, updatedAt: new Date().toISOString() } : f
      )
    }))
  },

  updateRollout: (id: string, percentage: number) => {
    set((state) => ({
      flags: state.flags.map((f) =>
        f.id === id ? { ...f, rolloutPercentage: percentage, updatedAt: new Date().toISOString() } : f
      )
    }))
  }
}))
