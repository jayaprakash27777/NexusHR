import { useEffect, useState, useRef } from 'react'

interface AutoSaveOptions<T> {
  key: string
  data: T
  intervalMs?: number
  enabled?: boolean
  onSave?: (data: T) => void
}

/**
 * Hook to automatically save form drafts to localStorage
 * so they can be recovered if the browser crashes.
 */
export function useAutoSave<T>({ key, data, intervalMs = 3000, enabled = true, onSave }: AutoSaveOptions<T>) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const dataRef = useRef(data)

  // Keep ref up to date to avoid putting data in dependency array and triggering effect
  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (!enabled) return

    const saveDraft = () => {
      try {
        localStorage.setItem(`nexushr_draft_${key}`, JSON.stringify({
          data: dataRef.current,
          timestamp: new Date().toISOString()
        }))
        setLastSaved(new Date())
        if (onSave) onSave(dataRef.current)
      } catch (e) {
        console.error('Failed to auto-save draft:', e)
      }
    }

    const interval = setInterval(saveDraft, intervalMs)

    // Save on unmount
    return () => {
      clearInterval(interval)
      saveDraft()
    }
  }, [key, intervalMs, enabled, onSave])

  return { lastSaved }
}

export function getSavedDraft<T>(key: string): { data: T; timestamp: string } | null {
  try {
    const item = localStorage.getItem(`nexushr_draft_${key}`)
    if (item) {
      return JSON.parse(item)
    }
  } catch (e) {
    console.error('Failed to parse draft:', e)
  }
  return null
}

export function clearSavedDraft(key: string) {
  localStorage.removeItem(`nexushr_draft_${key}`)
}
