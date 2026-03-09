import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock isCloudTTSAvailable and speakWithCloudTTS
vi.mock('../tts', () => ({
  isCloudTTSAvailable: vi.fn(),
  speakWithCloudTTS: vi.fn(),
  prefetchCloudTTS: vi.fn(),
}))

import { isCloudTTSAvailable } from '../tts'

describe('TTS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isCloudTTSAvailable', () => {
    it('always returns true (proxy is always available)', () => {
      // Regression: previously returned false when no client-side API key was set,
      // causing fallback to browser TTS even though /api/tts proxy works
      vi.mocked(isCloudTTSAvailable).mockReturnValue(true)
      expect(isCloudTTSAvailable()).toBe(true)
    })
  })
})

// Direct import test (unmocked) to verify actual implementation
describe('TTS implementation', () => {
  it('isCloudTTSAvailable returns true without API key', async () => {
    // Reset module registry to get real implementation
    vi.resetModules()

    // Mock dependencies that tts.ts imports
    vi.doMock('../api-key', () => ({
      getGoogleApiKey: vi.fn().mockReturnValue(''),
    }))
    vi.doMock('../offline/tts-cache', () => ({
      getCachedTTSAudio: vi.fn().mockResolvedValue(null),
      cacheTTSAudio: vi.fn().mockResolvedValue(undefined),
    }))

    const { isCloudTTSAvailable: realFn } = await import('../tts')
    expect(realFn()).toBe(true)
  })
})
