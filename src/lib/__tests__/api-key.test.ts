// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getGoogleApiKey, setGoogleApiKey, hasGoogleApiKey } from '../api-key'

describe('api-key', () => {
  const STORAGE_KEY = 'fintutto_google_api_key'

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('getGoogleApiKey', () => {
    it('should return the default API key when nothing is stored', () => {
      const key = getGoogleApiKey()
      expect(typeof key).toBe('string')
      expect(key.length).toBeGreaterThan(0)
    })

    it('should return value from localStorage when set', () => {
      localStorage.setItem(STORAGE_KEY, 'my-custom-key')
      expect(getGoogleApiKey()).toBe('my-custom-key')
    })

    it('should prefer localStorage over default', () => {
      localStorage.setItem(STORAGE_KEY, 'stored-key')
      const key = getGoogleApiKey()
      expect(key).toBe('stored-key')
    })
  })

  describe('setGoogleApiKey', () => {
    it('should store a key in localStorage', () => {
      setGoogleApiKey('test-api-key-123')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('test-api-key-123')
    })

    it('should trim whitespace from the key', () => {
      setGoogleApiKey('  trimmed-key  ')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('trimmed-key')
    })

    it('should remove the key from localStorage when set to empty string', () => {
      localStorage.setItem(STORAGE_KEY, 'existing-key')
      setGoogleApiKey('')
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('should remove the key from localStorage when set to whitespace only', () => {
      localStorage.setItem(STORAGE_KEY, 'existing-key')
      setGoogleApiKey('   ')
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('should overwrite an existing key', () => {
      setGoogleApiKey('first-key')
      setGoogleApiKey('second-key')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('second-key')
    })
  })

  describe('hasGoogleApiKey', () => {
    it('should return true when a key is stored', () => {
      setGoogleApiKey('some-key')
      expect(hasGoogleApiKey()).toBe(true)
    })

    it('should return true when using the default key (no localStorage)', () => {
      // Default key is hardcoded, so hasGoogleApiKey should be true even without localStorage
      expect(hasGoogleApiKey()).toBe(true)
    })

    it('should roundtrip: set, get, has', () => {
      setGoogleApiKey('roundtrip-key')
      expect(getGoogleApiKey()).toBe('roundtrip-key')
      expect(hasGoogleApiKey()).toBe(true)
    })

    it('should roundtrip: set then clear', () => {
      setGoogleApiKey('temp-key')
      expect(hasGoogleApiKey()).toBe(true)
      setGoogleApiKey('')
      // After clearing, falls back to default key which is non-empty
      expect(hasGoogleApiKey()).toBe(true)
    })
  })

  describe('get/set roundtrip', () => {
    it('should return the set value from get', () => {
      setGoogleApiKey('my-key-abc')
      expect(getGoogleApiKey()).toBe('my-key-abc')
    })

    it('should return default after clearing', () => {
      setGoogleApiKey('custom')
      setGoogleApiKey('')
      const key = getGoogleApiKey()
      // Should fall back to env or default
      expect(key).not.toBe('custom')
      expect(key.length).toBeGreaterThan(0)
    })
  })
})
