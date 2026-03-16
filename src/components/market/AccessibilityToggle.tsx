/**
 * Accessibility / Large Text Toggle
 *
 * Allows users to switch to a large-text mode for better readability.
 * Persists the preference in localStorage.
 *
 * Used by: ngo-client, school-student, authority-visitor
 */

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { Eye } from 'lucide-react'

const STORAGE_KEY = 'ft-large-text'

interface AccessibilityContextValue {
  largeText: boolean
  toggleLargeText: () => void
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  largeText: false,
  toggleLargeText: () => {},
})

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (largeText) {
      root.classList.add('ft-large-text')
    } else {
      root.classList.remove('ft-large-text')
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(largeText))
    } catch {}
  }, [largeText])

  const toggleLargeText = () => setLargeText(prev => !prev)

  return (
    <AccessibilityContext.Provider value={{ largeText, toggleLargeText }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Toggle button for large text mode.
 * Can be placed in any app's header or settings.
 */
export function LargeTextToggle() {
  const { largeText, toggleLargeText } = useAccessibility()

  return (
    <button
      onClick={toggleLargeText}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        largeText
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
      title={largeText ? 'Normale Schrift' : 'Grosse Schrift'}
    >
      <Eye className="h-3.5 w-3.5" />
      {largeText ? 'Aa+' : 'Aa'}
    </button>
  )
}
