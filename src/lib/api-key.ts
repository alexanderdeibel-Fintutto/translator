// Centralized Google Cloud API key access
// Priority: localStorage override → env variable → empty string

const STORAGE_KEY = 'guidetranslator_google_api_key'

export function getGoogleApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored
  return import.meta.env.VITE_GOOGLE_TTS_API_KEY || ''
}

export function setGoogleApiKey(key: string) {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim())
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function hasGoogleApiKey(): boolean {
  return getGoogleApiKey().length > 0
}
