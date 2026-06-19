import { useEffect, useCallback } from 'react'
// React Router unstable_useBlocker removed

/**
 * Hook to prevent the user from accidentally leaving a page with unsaved changes.
 * Handles both browser refresh/close (beforeunload) and React Router internal navigation.
 */
export function useUnsavedChanges(isDirty: boolean) {
  // 1. Handle browser close or refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        // The return value is required in some older browsers to show the prompt
        return (e.returnValue = 'You have unsaved changes. Are you sure you want to leave?')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // 2. Handle React Router internal navigation
  // Note: useBlocker is currently disabled until React Router > 6.4 is fully integrated.
}
