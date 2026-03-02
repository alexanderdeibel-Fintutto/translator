import { useState, useCallback } from 'react'

export interface FavoriteEntry {
  id: string
  sourceText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  timestamp: number
}

const STORAGE_KEY = 'fintutto-translator-favorites'
const MAX_FAVORITES = 200

function loadFavorites(): FavoriteEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveFavorites(entries: FavoriteEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_FAVORITES)))
  } catch {
    // localStorage quota exceeded
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(loadFavorites)

  const addFavorite = useCallback((entry: Omit<FavoriteEntry, 'id' | 'timestamp'>) => {
    setFavorites(prev => {
      // Don't add duplicates (same source text + target lang)
      const exists = prev.some(
        f => f.sourceText === entry.sourceText && f.targetLang === entry.targetLang
      )
      if (exists) return prev

      const newEntry: FavoriteEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }
      const updated = [newEntry, ...prev].slice(0, MAX_FAVORITES)
      saveFavorites(updated)
      return updated
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveFavorites(updated)
      return updated
    })
  }, [])

  const isFavorite = useCallback((sourceText: string, targetLang: string) => {
    return favorites.some(f => f.sourceText === sourceText && f.targetLang === targetLang)
  }, [favorites])

  const toggleFavorite = useCallback((entry: Omit<FavoriteEntry, 'id' | 'timestamp'>) => {
    const existing = favorites.find(
      f => f.sourceText === entry.sourceText && f.targetLang === entry.targetLang
    )
    if (existing) {
      removeFavorite(existing.id)
    } else {
      addFavorite(entry)
    }
  }, [favorites, addFavorite, removeFavorite])

  const clearFavorites = useCallback(() => {
    setFavorites([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, clearFavorites }
}
