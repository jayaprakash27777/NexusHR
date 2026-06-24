import { create } from 'zustand'
import { featureFlagsApi, type FeatureFlag } from '@/api/featureFlags'

interface FeatureState {
  flags: FeatureFlag[]
  isLoading: boolean
  isFeatureEnabled: (key: string) => boolean
  fetchFlags: () => Promise<void>
  toggleFlag: (id: string, enabled: boolean) => Promise<void>
  updateRollout: (id: string, percentage: number) => Promise<void>
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  flags: [],
  isLoading: false,

  isFeatureEnabled: (key: string) => {
    const flag = get().flags.find((f) => f.flagKey === key)
    if (!flag || !flag.enabled) return false
    
    // Simplistic rollout logic for UI
    return flag.rolloutPercentage > 0
  },

  fetchFlags: async () => {
    set({ isLoading: true })
    try {
      const data = await featureFlagsApi.getEnabled('production')
      set({ flags: data, isLoading: false })
    } catch (e) {
      console.error('Failed to fetch feature flags', e)
      set({ isLoading: false })
    }
  },

  toggleFlag: async (id: string, enabled: boolean) => {
    try {
      const updatedFlag = await featureFlagsApi.toggle(id)
      set((state) => ({
        flags: state.flags.map((f) => 
          f.id === id ? updatedFlag : f
        )
      }))
    } catch (e) {
      console.error('Failed to toggle flag', e)
    }
  },

  updateRollout: async (id: string, percentage: number) => {
    try {
      const currentFlag = get().flags.find(f => f.id === id)
      if (!currentFlag) return
      
      const updatedFlag = await featureFlagsApi.update(id, {
        flagKey: currentFlag.flagKey,
        name: currentFlag.name,
        enabled: currentFlag.enabled,
        rolloutPercentage: percentage
      })
      
      set((state) => ({
        flags: state.flags.map((f) =>
          f.id === id ? updatedFlag : f
        )
      }))
    } catch (e) {
      console.error('Failed to update rollout', e)
    }
  }
}))

