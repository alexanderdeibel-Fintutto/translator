import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
})

// Must import after mocking
import { getGoogleApiKey, setGoogleApiKey, hasGoogleApiKey } from '../api-key'

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k]
})

describe('api-key', () => {
  it('returns empty string when no key is configured', () => {
    expect(getGoogleApiKey()).toBe('')
    expect(hasGoogleApiKey()).toBe(false)
  })

  it('does NOT contain a hardcoded default API key', () => {
    // Regression: previously had a hardcoded AIzaSy... key
    const key = getGoogleApiKey()
    expect(key).not.toMatch(/^AIzaSy/)
  })

  it('returns localStorage key when set', () => {
    setGoogleApiKey('test-key-123')
    expect(getGoogleApiKey()).toBe('test-key-123')
    expect(hasGoogleApiKey()).toBe(true)
  })

  it('clears key when set to empty string', () => {
    setGoogleApiKey('my-key')
    expect(hasGoogleApiKey()).toBe(true)

    setGoogleApiKey('')
    expect(getGoogleApiKey()).toBe('')
    expect(hasGoogleApiKey()).toBe(false)
  })

  it('trims whitespace from key', () => {
    setGoogleApiKey('  spaced-key  ')
    expect(getGoogleApiKey()).toBe('spaced-key')
  })
})
