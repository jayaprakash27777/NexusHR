import { useEffect, useRef } from 'react'

type KeyCombo = string
type Handler = (event: KeyboardEvent) => void

interface Options {
  preventDefault?: boolean
  enableOnFormTags?: boolean
}

/**
 * A custom hook to manage global keyboard shortcuts.
 * Automatically handles attaching/detaching event listeners.
 * 
 * @example
 * useHotkeys('ctrl+k', (e) => {
 *   e.preventDefault()
 *   openCommandMenu()
 * })
 */
export function useHotkeys(keys: KeyCombo, callback: Handler, options: Options = {}) {
  const { preventDefault = true, enableOnFormTags = false } = options
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input field unless explicitly enabled
      if (!enableOnFormTags) {
        const target = event.target as HTMLElement
        const tagName = target.tagName.toLowerCase()
        const isContentEditable = target.isContentEditable
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isContentEditable) {
          return
        }
      }

      const keysArray = keys.toLowerCase().split('+').map((k) => k.trim())
      const isCtrl = keysArray.includes('ctrl') || keysArray.includes('cmd')
      const isShift = keysArray.includes('shift')
      const isAlt = keysArray.includes('alt')
      
      const targetKey = keysArray.find(k => !['ctrl', 'cmd', 'shift', 'alt'].includes(k))

      const ctrlMatch = isCtrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey)
      const shiftMatch = isShift ? event.shiftKey : !event.shiftKey
      const altMatch = isAlt ? event.altKey : !event.altKey
      
      let keyMatch = false
      if (targetKey) {
        if (targetKey === 'esc') keyMatch = event.key === 'Escape'
        else if (targetKey === 'enter') keyMatch = event.key === 'Enter'
        else if (targetKey === 'space') keyMatch = event.key === ' '
        else if (targetKey === '/') keyMatch = event.key === '/'
        else if (targetKey === '?') keyMatch = event.key === '?'
        else keyMatch = event.key.toLowerCase() === targetKey
      } else {
        keyMatch = true // If only modifiers were specified
      }

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        if (preventDefault) {
          event.preventDefault()
        }
        callbackRef.current(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keys, preventDefault, enableOnFormTags])
}
