// Centralized Google Cloud API key access
// Priority: localStorage override (user-provided) → env variable (Vercel)
//
// SECURITY NOTE: No hardcoded fallback key. All Google API calls should go
// through the server-side proxy (/api/translate, /api/tts) which holds the
// key securely in process.env. The client-side key is only used as a direct
// fallback for features that cannot use the proxy (e.g. Camera Translate,
// direct STT). If no key is set, those features are disabled gracefully.

const STORAGE_KEY = 'fintutto_google_api_key'

export function getGoogleApiKey(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored
  // Only use env variable — no hardcoded fallback for security
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
