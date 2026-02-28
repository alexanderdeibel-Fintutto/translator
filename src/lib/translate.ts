// Translation providers: Google Cloud (primary) → MyMemory (fallback) → LibreTranslate (fallback) → Offline (Opus-MT)

import { getCachedTranslation, cacheTranslation } from './offline/translation-cache'
import { translateOffline, isLanguagePairAvailable } from './offline/translation-engine'
import { getNetworkStatus } from './offline/network-status'
import { getGoogleApiKey } from './api-key'
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const MYMEMORY_API = 'https://api.mymemory.translated.net/get'
const LIBRE_API = 'https://libretranslate.com/translate'

export interface TranslationResult {
  translatedText: string
  match: number
  provider?: 'google' | 'mymemory' | 'libre' | 'offline' | 'cache'
}

// In-memory cache to avoid duplicate API calls for same text+language pair
const cache = new Map<string, { result: TranslationResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// In-flight request dedup: concurrent identical requests share a single promise
const inflight = new Map<string, Promise<TranslationResult>>()

// Circuit breaker state per provider
interface CircuitState {
  failCount: number
  isOpen: boolean
  resetAt: number
}

const circuits: Record<string, CircuitState> = {
  google: { failCount: 0, isOpen: false, resetAt: 0 },
  mymemory: { failCount: 0, isOpen: false, resetAt: 0 },
}
const CIRCUIT_THRESHOLD = 3
const CIRCUIT_RESET_MS = 30_000 // 30 seconds

function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang}|${targetLang}|${text.trim().toLowerCase()}`
}

function isHealthy(provider: string): boolean {
  const c = circuits[provider]
  if (!c || !c.isOpen) return true
  if (Date.now() > c.resetAt) {
    c.isOpen = false
    c.failCount = 0
    return true
  }
  return false
}

function recordFailure(provider: string, retryAfterMs?: number) {
  const c = circuits[provider]
  if (!c) return
  c.failCount++
  if (c.failCount >= CIRCUIT_THRESHOLD) {
    c.isOpen = true
    c.resetAt = Date.now() + (retryAfterMs || CIRCUIT_RESET_MS)
    console.warn(`[Translate] ${provider} circuit breaker open for ${(retryAfterMs || CIRCUIT_RESET_MS) / 1000}s`)
  }
}

/** Parse Retry-After header (seconds or HTTP-date) into ms */
function parseRetryAfter(response: Response): number | undefined {
  const val = response.headers?.get?.('Retry-After')
  if (!val) return undefined
  const secs = Number(val)
  if (!isNaN(secs)) return secs * 1000
  const date = Date.parse(val)
  if (!isNaN(date)) return Math.max(0, date - Date.now())
  return undefined
}

function recordSuccess(provider: string) {
  const c = circuits[provider]
  if (!c) return
  c.failCount = 0
  c.isOpen = false
}

// --- Provider implementations ---

async function translateWithGoogle(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  if (!getGoogleApiKey()) {
    throw new Error('Google API key not configured')
  }

  const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${getGoogleApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text',
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    const retryMs = response.status === 429 ? parseRetryAfter(response) : undefined
    const error = Object.assign(
      new Error(`Google Translate failed (${response.status}): ${err}`),
      { retryAfterMs: retryMs },
    )
    throw error
  }

  const data = await response.json()
  const translated = data.data?.translations?.[0]?.translatedText

  if (!translated) {
    throw new Error('Google Translate returned empty result')
  }

  return {
    translatedText: translated,
    match: 1.0,
    provider: 'google',
  }
}

async function translateWithMyMemory(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  const langPair = `${sourceLang}|${targetLang}`
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`MyMemory failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(data.responseDetails || 'MyMemory translation failed')
  }

  return {
    translatedText: data.responseData.translatedText,
    match: data.responseData.match,
    provider: 'mymemory',
  }
}

async function translateWithLibre(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  const response = await fetch(LIBRE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text',
    }),
  })

  if (!response.ok) {
    throw new Error(`LibreTranslate failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    translatedText: data.translatedText,
    match: 0.8,
    provider: 'libre',
  }
}

// --- Main translation function with cascading fallback ---

type ProviderDef = {
  name: string
  fn: (text: string, src: string, tgt: string) => Promise<TranslationResult>
  circuitKey?: string
}

const providers: ProviderDef[] = [
  { name: 'Google', fn: translateWithGoogle, circuitKey: 'google' },
  { name: 'MyMemory', fn: translateWithMyMemory, circuitKey: 'mymemory' },
  { name: 'LibreTranslate', fn: translateWithLibre },
]

/** @internal — exposed for testing only */
export function _resetInternals() {
  cache.clear()
  for (const key of Object.keys(circuits)) {
    circuits[key] = { failCount: 0, isOpen: false, resetAt: 0 }
  }
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: '', match: 0 }
  }

  const cacheKey = getCacheKey(text, sourceLang, targetLang)

  // 1. In-memory cache (fastest, 5min TTL)
  const memCached = cache.get(cacheKey)
  if (memCached && Date.now() - memCached.timestamp < CACHE_TTL) {
    return memCached.result
  }

  // 1b. Deduplicate concurrent identical requests
  const existing = inflight.get(cacheKey)
  if (existing) return existing

  const promise = translateTextInner(text, sourceLang, targetLang, cacheKey)
  inflight.set(cacheKey, promise)
  try {
    return await promise
  } finally {
    inflight.delete(cacheKey)
  }
}

async function translateTextInner(
  text: string,
  sourceLang: string,
  targetLang: string,
  cacheKey: string,
): Promise<TranslationResult> {

  // 2. IndexedDB persistent cache (30-day TTL)
  try {
    const idbCached = await getCachedTranslation(text, sourceLang, targetLang)
    if (idbCached) {
      const result = { ...idbCached, provider: 'cache' as const }
      cache.set(cacheKey, { result, timestamp: Date.now() })
      return result
    }
  } catch {
    // IndexedDB not available — continue
  }

  const networkStatus = getNetworkStatus()

  // 3-5. Online providers (only if network available)
  if (networkStatus.isOnline) {
    let lastError: Error | null = null

    for (const provider of providers) {
      if (provider.circuitKey && !isHealthy(provider.circuitKey)) {
        continue
      }

      try {
        const result = await provider.fn(text, sourceLang, targetLang)
        if (provider.circuitKey) recordSuccess(provider.circuitKey)

        // Store in both caches
        cache.set(cacheKey, { result, timestamp: Date.now() })
        cacheTranslation(text, sourceLang, targetLang, result).catch(() => {})

        // Evict old in-memory entries
        if (cache.size > 500) {
          const now = Date.now()
          for (const [key, entry] of cache) {
            if (now - entry.timestamp > CACHE_TTL) cache.delete(key)
          }
        }

        return result
      } catch (err) {
        console.warn(`[Translate] ${provider.name} failed:`, err)
        const retryMs = (err as { retryAfterMs?: number }).retryAfterMs
        if (provider.circuitKey) recordFailure(provider.circuitKey, retryMs)
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    // All online providers failed — log but continue to offline
    if (lastError) {
      console.warn('[Translate] All online providers failed, trying offline engine...')
    }
  }

  // 6. Offline translation engine (Opus-MT via Transformers.js)
  try {
    const offlineAvailable = await isLanguagePairAvailable(sourceLang, targetLang)
    if (offlineAvailable) {
      const result = await translateOffline(text, sourceLang, targetLang)

      // Store in both caches
      cache.set(cacheKey, { result, timestamp: Date.now() })
      cacheTranslation(text, sourceLang, targetLang, result).catch(() => {})

      return result
    }
  } catch (err) {
    console.warn('[Translate] Offline engine failed:', err)
  }

  throw new Error(
    networkStatus.isOffline
      ? 'OFFLINE_NO_MODEL'
      : 'ALL_PROVIDERS_FAILED'
  )
}
