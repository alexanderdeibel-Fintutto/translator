import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies before importing translate
vi.mock('../offline/translation-cache', () => ({
  getCachedTranslation: vi.fn().mockResolvedValue(null),
  cacheTranslation: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../offline/translation-engine', () => ({
  translateOffline: vi.fn().mockRejectedValue(new Error('No model')),
  isLanguagePairAvailable: vi.fn().mockResolvedValue(false),
}))

vi.mock('../offline/network-status', () => ({
  getNetworkStatus: vi.fn().mockReturnValue({ isOnline: true, isOffline: false }),
}))

vi.mock('../api-key', () => ({
  getGoogleApiKey: vi.fn().mockReturnValue(''),
}))

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { translateText, _resetInternals } from '../translate'
import { getGoogleApiKey } from '../api-key'
import { getNetworkStatus } from '../offline/network-status'
import { getCachedTranslation } from '../offline/translation-cache'
import { isLanguagePairAvailable, translateOffline } from '../offline/translation-engine'

beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockReset()
  _resetInternals()
})

describe('translateText cascade', () => {
  it('returns empty result for empty text', async () => {
    const result = await translateText('', 'de', 'en')
    expect(result.translatedText).toBe('')
    expect(result.match).toBe(0)
  })

  it('returns cached result from IndexedDB if available', async () => {
    vi.mocked(getCachedTranslation).mockResolvedValueOnce({
      translatedText: 'Hello cached',
      match: 0.95,
    })

    const result = await translateText('Hallo', 'de', 'en')
    expect(result.translatedText).toBe('Hello cached')
    expect(result.provider).toBe('cache')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('skips Google when no API key is configured', async () => {
    vi.mocked(getGoogleApiKey).mockReturnValue('')

    // MyMemory responds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        responseStatus: 200,
        responseData: { translatedText: 'Hello from MyMemory', match: 0.85 },
      }),
    })

    const result = await translateText('Hallo', 'de', 'en')
    expect(result.translatedText).toBe('Hello from MyMemory')
    expect(result.provider).toBe('mymemory')
  })

  it('falls back to MyMemory when Google fails', async () => {
    vi.mocked(getGoogleApiKey).mockReturnValue('fake-key')

    // Google fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    })

    // MyMemory succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        responseStatus: 200,
        responseData: { translatedText: 'Hello fallback', match: 0.8 },
      }),
    })

    const result = await translateText('Hallo', 'de', 'en')
    expect(result.translatedText).toBe('Hello fallback')
    expect(result.provider).toBe('mymemory')
  })

  it('falls back to LibreTranslate when Google and MyMemory fail', async () => {
    vi.mocked(getGoogleApiKey).mockReturnValue('fake-key')

    // Google fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limited'),
    })

    // MyMemory fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Service Unavailable',
    })

    // Libre succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ translatedText: 'Hello libre' }),
    })

    const result = await translateText('Hallo', 'de', 'en')
    expect(result.translatedText).toBe('Hello libre')
    expect(result.provider).toBe('libre')
  })

  it('falls back to offline engine when all online providers fail', async () => {
    vi.mocked(getGoogleApiKey).mockReturnValue('')

    // MyMemory fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Service Unavailable',
    })

    // Libre fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Error',
    })

    // Offline engine available
    vi.mocked(isLanguagePairAvailable).mockResolvedValueOnce(true)
    vi.mocked(translateOffline).mockResolvedValueOnce({
      translatedText: 'Hello offline',
      match: 0.7,
      provider: 'offline',
    })

    const result = await translateText('Hallo', 'de', 'en')
    expect(result.translatedText).toBe('Hello offline')
    expect(result.provider).toBe('offline')
  })

  it('throws when all providers fail and offline unavailable', async () => {
    vi.mocked(getGoogleApiKey).mockReturnValue('')

    // MyMemory fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Error',
    })

    // Libre fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Error',
    })

    // Offline not available
    vi.mocked(isLanguagePairAvailable).mockResolvedValueOnce(false)

    await expect(translateText('Hallo', 'de', 'en')).rejects.toThrow()
  })

  it('skips online providers when offline', async () => {
    vi.mocked(getNetworkStatus).mockReturnValue({ isOnline: false, isOffline: true } as ReturnType<typeof getNetworkStatus>)

    // Offline engine available
    vi.mocked(isLanguagePairAvailable).mockResolvedValueOnce(true)
    vi.mocked(translateOffline).mockResolvedValueOnce({
      translatedText: 'Hello offline',
      match: 0.7,
      provider: 'offline',
    })

    const result = await translateText('Hallo', 'de', 'en')
    expect(result.translatedText).toBe('Hello offline')
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
