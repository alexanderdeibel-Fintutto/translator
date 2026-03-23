// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('../i18n', () => ({
  getTranslation: vi.fn((_lang: string, key: string) => `translated:${key}`),
}))

vi.mock('../api-key', () => ({
  getGoogleApiKey: vi.fn(() => 'test-api-key'),
}))

import { detectSentenceBoundary, createWebSpeechEngine, createAppleSpeechAnalyzerEngine, createGoogleCloudSTTEngine, getBestSTTEngine } from '../stt'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('detectSentenceBoundary', () => {
  it('returns null when no sentence boundary found', () => {
    expect(detectSentenceBoundary('hello world')).toBeNull()
  })

  it('detects period followed by space', () => {
    const result = detectSentenceBoundary('Hello world. How are you')
    expect(result).toEqual({ final: 'Hello world.', remainder: 'How are you' })
  })

  it('detects exclamation mark followed by space', () => {
    const result = detectSentenceBoundary('Wow! That is great')
    expect(result).toEqual({ final: 'Wow!', remainder: 'That is great' })
  })

  it('detects question mark followed by space', () => {
    const result = detectSentenceBoundary('How are you? I am fine')
    expect(result).toEqual({ final: 'How are you?', remainder: 'I am fine' })
  })

  it('detects period at end of string', () => {
    const result = detectSentenceBoundary('Hello world.')
    expect(result).toEqual({ final: 'Hello world.', remainder: '' })
  })

  it('handles multiple sentences — returns up to last boundary', () => {
    const result = detectSentenceBoundary('First. Second. Third part')
    expect(result).toEqual({ final: 'First. Second.', remainder: 'Third part' })
  })

  it('detects CJK sentence-ending punctuation followed by space', () => {
    const result = detectSentenceBoundary('\u3053\u3093\u306B\u3061\u306F\u3002 \u5143\u6C17')
    expect(result).toEqual({ final: '\u3053\u3093\u306B\u3061\u306F\u3002', remainder: '\u5143\u6C17' })
  })

  it('detects CJK sentence-ending punctuation at end of string', () => {
    const result = detectSentenceBoundary('\u3053\u3093\u306B\u3061\u306F\u3002')
    expect(result).toEqual({ final: '\u3053\u3093\u306B\u3061\u306F\u3002', remainder: '' })
  })

  it('returns null for CJK punctuation not followed by space or end', () => {
    // The regex requires whitespace or end-of-string after the punctuation
    const result = detectSentenceBoundary('\u3053\u3093\u306B\u3061\u306F\u3002\u5143\u6C17')
    expect(result).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(detectSentenceBoundary('')).toBeNull()
  })

  it('handles semicolon as sentence boundary', () => {
    const result = detectSentenceBoundary('Part one; part two')
    expect(result).toEqual({ final: 'Part one;', remainder: 'part two' })
  })
})

describe('createWebSpeechEngine', () => {
  it('returns engine with provider "web-speech"', () => {
    const engine = createWebSpeechEngine()
    expect(engine.provider).toBe('web-speech')
  })

  it('reports isSupported based on window.SpeechRecognition', () => {
    // jsdom does not have SpeechRecognition
    const engine = createWebSpeechEngine()
    expect(engine.isSupported).toBe(false)
  })

  it('reports isSupported true when webkitSpeechRecognition exists', () => {
    // Temporarily add webkitSpeechRecognition
    const orig = (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = class {}
    const engine = createWebSpeechEngine()
    expect(engine.isSupported).toBe(true)
    // Restore
    if (orig === undefined) {
      delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    } else {
      ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = orig
    }
  })

  it('stop() does not throw when called without start', () => {
    const engine = createWebSpeechEngine()
    expect(() => engine.stop()).not.toThrow()
  })

  it('calls onError when not in secure context', async () => {
    // Simulate webkitSpeechRecognition existing
    ;(window as unknown as Record<string, unknown>).webkitSpeechRecognition = class {}
    Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true })

    const engine = createWebSpeechEngine()
    const onResult = vi.fn()
    const onError = vi.fn()

    await engine.start('en-US', onResult, onError)
    expect(onError).toHaveBeenCalledWith('Voice input requires HTTPS. Please use a secure connection.')

    // Cleanup
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition
  })
})

describe('createAppleSpeechAnalyzerEngine', () => {
  it('returns engine with provider "apple-speech-analyzer"', () => {
    const engine = createAppleSpeechAnalyzerEngine()
    expect(engine.provider).toBe('apple-speech-analyzer')
  })

  it('is not supported in standard browser environment', () => {
    const engine = createAppleSpeechAnalyzerEngine()
    expect(engine.isSupported).toBe(false)
  })

  it('calls onError on start since it is a stub', async () => {
    const engine = createAppleSpeechAnalyzerEngine()
    const onResult = vi.fn()
    const onError = vi.fn()
    await engine.start('de-DE', onResult, onError)
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('translated:'))
  })

  it('stop() does not throw', () => {
    const engine = createAppleSpeechAnalyzerEngine()
    expect(() => engine.stop()).not.toThrow()
  })
})

describe('createGoogleCloudSTTEngine', () => {
  it('returns engine with provider "google-cloud-stt"', () => {
    const engine = createGoogleCloudSTTEngine()
    expect(engine.provider).toBe('google-cloud-stt')
  })

  it('stop() does not throw when called without start', () => {
    const engine = createGoogleCloudSTTEngine()
    expect(() => engine.stop()).not.toThrow()
  })

  it('calls onError when mic permission denied', async () => {
    // Mock getUserMedia to reject with NotAllowedError
    const mockGetUserMedia = vi.fn().mockRejectedValue(
      Object.assign(new DOMException('Permission denied', 'NotAllowedError'))
    )
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      configurable: true,
    })

    const engine = createGoogleCloudSTTEngine()
    const onResult = vi.fn()
    const onError = vi.fn()

    await engine.start('en-US', onResult, onError)
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('translated:error.micDeniedHint'))
  })

  it('calls onError when mic unavailable', async () => {
    const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('No mic'))
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      configurable: true,
    })

    const engine = createGoogleCloudSTTEngine()
    const onResult = vi.fn()
    const onError = vi.fn()

    await engine.start('en-US', onResult, onError)
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('translated:error.micUnavailableHint'))
  })
})

describe('getBestSTTEngine', () => {
  it('returns an STTEngine object with required properties', () => {
    const engine = getBestSTTEngine()
    expect(engine).toHaveProperty('provider')
    expect(engine).toHaveProperty('isSupported')
    expect(engine).toHaveProperty('start')
    expect(engine).toHaveProperty('stop')
  })

  it('returns a valid provider type', () => {
    const engine = getBestSTTEngine()
    expect(['web-speech', 'apple-speech-analyzer', 'google-cloud-stt', 'whisper']).toContain(engine.provider)
  })
})
