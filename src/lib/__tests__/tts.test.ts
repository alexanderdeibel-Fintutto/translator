// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetCachedTTSAudio = vi.hoisted(() => vi.fn())
const mockCacheTTSAudio = vi.hoisted(() => vi.fn())
const mockGetGoogleApiKey = vi.hoisted(() => vi.fn())

vi.mock('../offline/tts-cache', () => ({
  getCachedTTSAudio: mockGetCachedTTSAudio,
  cacheTTSAudio: mockCacheTTSAudio,
}))

vi.mock('../api-key', () => ({
  getGoogleApiKey: mockGetGoogleApiKey,
}))

import { isCloudTTSAvailable, mapTierTtsQuality, speakWithCloudTTS, prefetchCloudTTS } from '../tts'

beforeEach(() => {
  vi.clearAllMocks()
  mockGetGoogleApiKey.mockReturnValue('test-api-key')
  mockGetCachedTTSAudio.mockResolvedValue(null)
  mockCacheTTSAudio.mockResolvedValue(undefined)
})

describe('isCloudTTSAvailable', () => {
  it('returns true when API key is set', () => {
    mockGetGoogleApiKey.mockReturnValue('some-key')
    expect(isCloudTTSAvailable()).toBe(true)
  })

  it('returns false when API key is empty', () => {
    mockGetGoogleApiKey.mockReturnValue('')
    expect(isCloudTTSAvailable()).toBe(false)
  })

  it('returns false when API key is undefined', () => {
    mockGetGoogleApiKey.mockReturnValue(undefined)
    expect(isCloudTTSAvailable()).toBe(false)
  })
})

describe('mapTierTtsQuality', () => {
  it('maps chirp3hd to chirp3hd', () => {
    expect(mapTierTtsQuality('chirp3hd')).toBe('chirp3hd')
  })

  it('maps neural2 to neural2', () => {
    expect(mapTierTtsQuality('neural2')).toBe('neural2')
  })

  it('maps standard to neural2', () => {
    expect(mapTierTtsQuality('standard')).toBe('neural2')
  })

  it('maps browser to neural2', () => {
    expect(mapTierTtsQuality('browser')).toBe('neural2')
  })
})

describe('speakWithCloudTTS', () => {
  it('returns cached audio when available', async () => {
    const fakeBlob = new Blob(['audio'], { type: 'audio/mp3' })
    mockGetCachedTTSAudio.mockResolvedValue(fakeBlob)

    const audio = await speakWithCloudTTS('Hello', 'en-US')
    expect(audio).toBeInstanceOf(HTMLAudioElement)
    expect(mockGetCachedTTSAudio).toHaveBeenCalledWith('Hello', 'en-US', 'neural2')
  })

  it('falls through to proxy when cache misses', async () => {
    mockGetCachedTTSAudio.mockResolvedValue(null)

    // Mock fetch for proxy call
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ audioContent: btoa('fake-audio-data') }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const audio = await speakWithCloudTTS('Hallo', 'de-DE')
    expect(audio).toBeInstanceOf(HTMLAudioElement)
    // First fetch call should be to proxy
    expect(mockFetch).toHaveBeenCalledWith('/api/tts', expect.objectContaining({
      method: 'POST',
    }))

    vi.unstubAllGlobals()
  })

  it('falls back to direct API when proxy fails', async () => {
    mockGetCachedTTSAudio.mockResolvedValue(null)

    let callCount = 0
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      callCount++
      if (callCount === 1) {
        // Proxy fails
        return Promise.resolve({ ok: false, status: 500 })
      }
      // Direct API succeeds
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ audioContent: btoa('audio-bytes') }),
      })
    })
    vi.stubGlobal('fetch', mockFetch)

    const audio = await speakWithCloudTTS('Test', 'en-US')
    expect(audio).toBeInstanceOf(HTMLAudioElement)
    expect(mockFetch).toHaveBeenCalledTimes(2)

    vi.unstubAllGlobals()
  })

  it('throws when no API key and proxy fails', async () => {
    mockGetCachedTTSAudio.mockResolvedValue(null)
    mockGetGoogleApiKey.mockReturnValue('')

    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', mockFetch)

    await expect(speakWithCloudTTS('Test', 'en-US')).rejects.toThrow('Google Cloud TTS API key not configured')

    vi.unstubAllGlobals()
  })

  it('throws on direct API error for non-chirp quality', async () => {
    mockGetCachedTTSAudio.mockResolvedValue(null)

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 }) // proxy fails
      .mockResolvedValueOnce({ ok: false, status: 400, text: () => Promise.resolve('Bad request') }) // direct API fails
    vi.stubGlobal('fetch', mockFetch)

    await expect(speakWithCloudTTS('Test', 'en-US', 'neural2')).rejects.toThrow('Cloud TTS failed (400)')

    vi.unstubAllGlobals()
  })

  it('caches audio after successful API call', async () => {
    mockGetCachedTTSAudio.mockResolvedValue(null)

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ audioContent: btoa('audio-data') }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await speakWithCloudTTS('Cache me', 'en-US')
    expect(mockCacheTTSAudio).toHaveBeenCalledWith('Cache me', 'en-US', 'neural2', expect.any(Blob))

    vi.unstubAllGlobals()
  })

  it('continues when cache read fails', async () => {
    mockGetCachedTTSAudio.mockRejectedValue(new Error('IndexedDB error'))

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ audioContent: btoa('audio') }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const audio = await speakWithCloudTTS('Hello', 'en-US')
    expect(audio).toBeInstanceOf(HTMLAudioElement)

    vi.unstubAllGlobals()
  })
})

describe('prefetchCloudTTS', () => {
  it('calls speakWithCloudTTS internally (does not throw)', () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ audioContent: btoa('audio') }),
    })
    vi.stubGlobal('fetch', mockFetch)

    // prefetchCloudTTS is fire-and-forget, should not throw
    expect(() => prefetchCloudTTS('Hello', 'en-US')).not.toThrow()

    vi.unstubAllGlobals()
  })

  it('does not prefetch the same key twice simultaneously', async () => {
    // Use a unique text to avoid collisions with other tests' prefetch keys
    const uniqueText = 'unique-dedup-test-' + Date.now()
    let resolveFirst: (v: unknown) => void
    const firstPromise = new Promise(r => { resolveFirst = r })
    let fetchCallCount = 0

    const mockFetch = vi.fn().mockImplementation(() => {
      fetchCallCount++
      if (fetchCallCount === 1) {
        return firstPromise // first call hangs
      }
      // Subsequent calls resolve immediately (shouldn't happen for same key)
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ audioContent: btoa('audio') }),
      })
    })
    vi.stubGlobal('fetch', mockFetch)

    prefetchCloudTTS(uniqueText, 'en-US', 'neural2')
    prefetchCloudTTS(uniqueText, 'en-US', 'neural2')

    // Give microtasks a chance to run
    await new Promise(r => setTimeout(r, 10))

    // Only one fetch call — second prefetch was deduplicated
    expect(fetchCallCount).toBe(1)

    // Cleanup: resolve the hanging promise
    resolveFirst!({
      ok: true,
      json: () => Promise.resolve({ audioContent: btoa('audio') }),
    })

    vi.unstubAllGlobals()
  })
})
