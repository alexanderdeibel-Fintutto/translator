// Translation providers: Azure (cheapest paid) → Google → MyMemory (free) → LibreTranslate (free) → Offline (Opus-MT)
// Tier-aware: free tier only gets free providers; paid tiers get Azure/Google first.

import { getCachedTranslation, cacheTranslation } from './offline/translation-cache'
import { translateOffline, isLanguagePairAvailable } from './offline/translation-engine'
import { getNetworkStatus } from './offline/network-status'
import { getGoogleApiKey } from './api-key'
import { TIERS, type TierId } from './tiers'
import { recordTranslation } from './usage-tracker'
import { getContextHints, type TranslationContext } from './context-modes'
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const AZURE_TRANSLATE_URL = 'https://api.cognitive.microsofttranslator.com/translate'
const MYMEMORY_API = 'https://api.mymemory.translated.net/get'
const LIBRE_API = 'https://libretranslate.com/translate'

export interface TranslationResult {
  translatedText: string
  match: number
  provider?: 'google' | 'azure' | 'mymemory' | 'libre' | 'offline' | 'cache'
}

/** Azure API key — set via env or localStorage */
function getAzureApiKey(): string {
  try {
    return localStorage.getItem('gt_azure_key') || import.meta.env.VITE_AZURE_TRANSLATE_KEY || ''
  } catch {
    return ''
  }
}

function getAzureRegion(): string {
  try {
    return localStorage.getItem('gt_azure_region') || import.meta.env.VITE_AZURE_TRANSLATE_REGION || 'westeurope'
  } catch {
    return 'westeurope'
  }
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
  proxy: { failCount: 0, isOpen: false, resetAt: 0 },
  azure: { failCount: 0, isOpen: false, resetAt: 0 },
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

/** Fetch with AbortController timeout — prevents hanging requests from blocking the cascade */
const PROVIDER_TIMEOUT_MS = 6000 // 6 seconds per provider

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${PROVIDER_TIMEOUT_MS / 1000}s`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** Server-side proxy (Vercel Edge Function) — hides API keys, bypasses CSP/ad-blockers */
async function translateWithProxy(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  const response = await fetchWithTimeout('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source: sourceLang, target: targetLang }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Proxy failed (${response.status}): ${err}`)
  }

  const data = await response.json()
  if (!data.translatedText) {
    throw new Error('Proxy returned empty result')
  }

  return {
    translatedText: data.translatedText,
    match: data.match ?? 1.0,
    provider: (data.provider as TranslationResult['provider']) || 'google',
  }
}

async function translateWithGoogle(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  if (!getGoogleApiKey()) {
    throw new Error('Google API key not configured')
  }

  const response = await fetchWithTimeout(`${GOOGLE_TRANSLATE_URL}?key=${getGoogleApiKey()}`, {
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

  const response = await fetchWithTimeout(url)

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
  const response = await fetchWithTimeout(LIBRE_API, {
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

// --- Azure Translator (50% cheaper than Google, $10/1M chars) ---

async function translateWithAzure(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  const apiKey = getAzureApiKey()
  if (!apiKey) {
    throw new Error('Azure Translator API key not configured')
  }

  const url = `${AZURE_TRANSLATE_URL}?api-version=3.0&from=${sourceLang}&to=${targetLang}`

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Ocp-Apim-Subscription-Region': getAzureRegion(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ Text: text }]),
  })

  if (!response.ok) {
    const err = await response.text()
    const retryMs = response.status === 429 ? parseRetryAfter(response) : undefined
    throw Object.assign(
      new Error(`Azure Translate failed (${response.status}): ${err}`),
      { retryAfterMs: retryMs },
    )
  }

  const data = await response.json()
  const translated = data?.[0]?.translations?.[0]?.text

  if (!translated) {
    throw new Error('Azure Translate returned empty result')
  }

  return {
    translatedText: translated,
    match: 1.0,
    provider: 'azure',
  }
}

// --- Main translation function with cascading fallback ---

type ProviderDef = {
  name: string
  fn: (text: string, src: string, tgt: string) => Promise<TranslationResult>
  circuitKey?: string
}

// Provider cascade: Proxy (server-side, hides keys) → direct fallbacks
// Proxy internally cascades: Azure → Google → MyMemory
const paidProviders: ProviderDef[] = [
  { name: 'Proxy', fn: translateWithProxy, circuitKey: 'proxy' },
  { name: 'Azure', fn: translateWithAzure, circuitKey: 'azure' },
  { name: 'Google', fn: translateWithGoogle, circuitKey: 'google' },
  { name: 'MyMemory', fn: translateWithMyMemory, circuitKey: 'mymemory' },
  { name: 'LibreTranslate', fn: translateWithLibre },
]

const freeProviders: ProviderDef[] = [
  { name: 'Proxy', fn: translateWithProxy, circuitKey: 'proxy' },
  { name: 'Google', fn: translateWithGoogle, circuitKey: 'google' },
  { name: 'MyMemory', fn: translateWithMyMemory, circuitKey: 'mymemory' },
  { name: 'LibreTranslate', fn: translateWithLibre },
]

/** Get the provider cascade for a given tier */
function getProvidersForTier(tierId: TierId): ProviderDef[] {
  const tier = TIERS[tierId]
  if (!tier) return freeProviders
  if (tier.features.translationProvider === 'free') return freeProviders
  return paidProviders
}

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
  targetLang: string,
  tierId?: TierId,
  context?: TranslationContext,
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: '', match: 0 }
  }

  // Enforce max chars per request based on tier
  const tier = tierId ? TIERS[tierId] : undefined
  const maxChars = tier?.limits.maxCharsPerRequest ?? 5_000
  const trimmedText = text.length > maxChars ? text.slice(0, maxChars) : text

  // Prepend context-specific glossary hints to improve domain accuracy
  // e.g. medical context: "Rezept: Prescription (medical)" prevents wrong translation
  let textWithContext = trimmedText
  if (context && context !== 'general') {
    const hints = getContextHints(trimmedText, sourceLang, context)
    if (hints.length > 0) {
      textWithContext = `[Context hints: ${hints.join('; ')}]\n${trimmedText}`
    }
  }

  const cacheKey = getCacheKey(trimmedText, sourceLang, targetLang)

  // 1. In-memory cache (fastest, 5min TTL)
  const memCached = cache.get(cacheKey)
  if (memCached && Date.now() - memCached.timestamp < CACHE_TTL) {
    return memCached.result
  }

  // 1b. Deduplicate concurrent identical requests
  const existing = inflight.get(cacheKey)
  if (existing) return existing

  const activeProviders = getProvidersForTier(tierId ?? 'free')
  const promise = translateTextInner(textWithContext, sourceLang, targetLang, cacheKey, activeProviders)
  inflight.set(cacheKey, promise)
  try {
    const result = await promise
    // Record usage (only for non-cache hits — cache hits are recorded inside translateTextInner)
    if (result.provider !== 'cache') {
      recordTranslation(trimmedText.length, targetLang)
    }
    return result
  } finally {
    inflight.delete(cacheKey)
  }
}

async function translateTextInner(
  text: string,
  sourceLang: string,
  targetLang: string,
  cacheKey: string,
  activeProviders: ProviderDef[] = paidProviders,
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
  const networkMode = networkStatus.getMode()

  // 3-5. Online providers (try unless definitely offline or degraded with offline available)
  const providerErrors: string[] = []

  // DYNAMIC OFFLINE-FIRST: if network is degraded (slow/unreliable), prefer offline engine
  // to avoid long waits for cloud providers that will likely time out anyway.
  if (networkMode === 'degraded') {
    try {
      const offlineAvailable = await isLanguagePairAvailable(sourceLang, targetLang)
      if (offlineAvailable) {
        console.log('[Translate] Degraded network — using offline engine proactively')
        const result = await translateOffline(text, sourceLang, targetLang)
        cache.set(cacheKey, { result, timestamp: Date.now() })
        cacheTranslation(text, sourceLang, targetLang, result).catch(() => {})
        return result
      }
    } catch (err) {
      console.warn('[Translate] Offline engine failed on degraded network, trying cloud:', err)
    }
    // Offline not available or failed — fall through to cloud with reduced timeout
  }

  if (!networkStatus.isOffline) {
    // Use shorter timeout on degraded networks to fail fast and reach offline fallback sooner
    const effectiveTimeout = networkMode === 'degraded' ? 3000 : undefined
    if (effectiveTimeout) {
      // Temporarily patch PROVIDER_TIMEOUT_MS via a local override flag
      // We achieve this by wrapping each provider call with a race against a shorter timer
      const withFastTimeout = (fn: () => Promise<TranslationResult>): Promise<TranslationResult> => {
        return Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Fast-timeout on degraded network')), effectiveTimeout)
          ),
        ])
      }
      for (const provider of activeProviders) {
        if (provider.circuitKey && !isHealthy(provider.circuitKey)) {
          providerErrors.push(`${provider.name}: circuit-open`)
          continue
        }
        try {
          const result = await withFastTimeout(() => provider.fn(text, sourceLang, targetLang))
          if (provider.circuitKey) recordSuccess(provider.circuitKey)
          cache.set(cacheKey, { result, timestamp: Date.now() })
          cacheTranslation(text, sourceLang, targetLang, result).catch(() => {})
          if (cache.size > 500) {
            const now = Date.now()
            for (const [key, entry] of cache) {
              if (now - entry.timestamp > CACHE_TTL) cache.delete(key)
            }
          }
          return result
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          providerErrors.push(`${provider.name}: ${msg.slice(0, 80)}`)
          console.warn(`[Translate] ${provider.name} failed (degraded):`, err)
          const retryMs = (err as { retryAfterMs?: number }).retryAfterMs
          if (provider.circuitKey) recordFailure(provider.circuitKey, retryMs)
        }
      }
    } else {
    for (const provider of activeProviders) {
      if (provider.circuitKey && !isHealthy(provider.circuitKey)) {
        providerErrors.push(`${provider.name}: circuit-open`)
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
        const msg = err instanceof Error ? err.message : String(err)
        providerErrors.push(`${provider.name}: ${msg.slice(0, 80)}`)
        console.warn(`[Translate] ${provider.name} failed:`, err)
        const retryMs = (err as { retryAfterMs?: number }).retryAfterMs
        if (provider.circuitKey) recordFailure(provider.circuitKey, retryMs)
      }
    }

    // All online providers failed — log but continue to offline
    if (providerErrors.length > 0) {
      console.warn('[Translate] All online providers failed, trying offline engine...')
    }
    } // end else (normal timeout branch)
  } else {
    providerErrors.push('Network: offline')
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

  // Include provider details so the user can see WHY it failed
  const detail = providerErrors.length > 0
    ? providerErrors.join(' | ')
    : 'no providers available'

  throw new Error(
    networkStatus.isOffline
      ? 'OFFLINE_NO_MODEL'
      : `ALL_PROVIDERS_FAILED [${detail}]`
  )
}
