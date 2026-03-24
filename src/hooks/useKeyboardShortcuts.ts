import { useEffect, useRef } from 'react'

interface ShortcutMap {
  [key: string]: () => void
}

/**
 * Global keyboard shortcut hook.
 * Keys: 'ctrl+enter', 'escape', 'ctrl+shift+s', etc.
 * Uses a ref internally so callers don't need to memoize the shortcuts object.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    if (!enabled) return

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'SELECT'
      const isTextarea = target.tagName === 'TEXTAREA'
      const isEditable = target.isContentEditable

      let combo = ''
      if (e.ctrlKey || e.metaKey) combo += 'ctrl+'
      if (e.shiftKey) combo += 'shift+'
      if (e.altKey) combo += 'alt+'
      combo += e.key.toLowerCase()

      // Allow Escape everywhere, ctrl combos in textareas, block in other inputs
      if ((isInput || isEditable) && combo !== 'escape') return
      if (isTextarea && !combo.startsWith('ctrl+') && combo !== 'escape') return

      const action = shortcutsRef.current[combo]
      if (action) {
        e.preventDefault()
        action()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled])
}
