// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module
const mockGet = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()
const mockCount = vi.fn()
const mockClear = vi.fn()
const mockTransaction = vi.fn()

const mockDb = {
  get: mockGet,
  put: mockPut,
  delete: mockDelete,
  count: mockCount,
  clear: mockClear,
  transaction: mockTransaction,
}

vi.mock('../db', () => ({
  getDB: vi.fn().mockResolvedValue({
    get: (...args: any[]) => mockGet(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
    count: (...args: any[]) => mockCount(...args),
    clear: (...args: any[]) => mockClear(...args),
    transaction: (...args: any[]) => mockTransaction(...args),
  }),
  evictOldEntries: vi.fn(),
}))

import {
  getCachedTranslation,
  cacheTranslation,
  getCacheStats,
  clearTranslationCache,
} from '../translation-cache'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('translation-cache', () => {
  describe('getCachedTranslation()', () => {
    it('returns cached translation when found', async () => {
      mockGet.mockResolvedValue({
        key: 'de|en|hallo',
        translatedText: 'Hello',
        provider: 'google',
        match: 1.0,
        timestamp: Date.now(),
      })

      const result = await getCachedTranslation('Hallo', 'de', 'en')

      expect(result).not.toBeNull()
      expect(result!.translatedText).toBe('Hello')
      expect(result!.provider).toBe('google')
      expect(result!.match).toBe(1.0)
    })

    it('returns null on cache miss', async () => {
      mockGet.mockResolvedValue(undefined)

      const result = await getCachedTranslation('Unknown', 'de', 'en')

      expect(result).toBeNull()
    })

    it('returns null for expired entries (TTL)', async () => {
      const thirtyOneDaysAgo = Date.now() - (31 * 24 * 60 * 60 * 1000)
      mockGet.mockResolvedValue({
        key: 'de|en|alt',
        translatedText: 'Old',
        provider: 'cache',
        match: 1.0,
        timestamp: thirtyOneDaysAgo,
      })

      const result = await getCachedTranslation('Alt', 'de', 'en')

      expect(result).toBeNull()
      // Should also delete the expired entry
      expect(mockDelete).toHaveBeenCalledWith('translation-cache', expect.any(String))
    })

    it('does not return expired entries within 30 days', async () => {
      const twentyNineDaysAgo = Date.now() - (29 * 24 * 60 * 60 * 1000)
      mockGet.mockResolvedValue({
        key: 'de|en|recent',
        translatedText: 'Recent',
        provider: 'azure',
        match: 0.95,
        timestamp: twentyNineDaysAgo,
      })

      const result = await getCachedTranslation('Recent', 'de', 'en')

      expect(result).not.toBeNull()
      expect(result!.translatedText).toBe('Recent')
    })

    it('returns null on database error', async () => {
      mockGet.mockRejectedValue(new Error('DB error'))

      const result = await getCachedTranslation('Test', 'de', 'en')

      expect(result).toBeNull()
    })

    it('uses normalized cache key (trimmed, lowercase)', async () => {
      mockGet.mockResolvedValue(undefined)

      await getCachedTranslation('  Hello World  ', 'en', 'de')

      expect(mockGet).toHaveBeenCalledWith(
        'translation-cache',
        'en|de|hello world',
      )
    })
  })

  describe('cacheTranslation()', () => {
    it('stores translation in IndexedDB', async () => {
      mockCount.mockResolvedValue(100)

      await cacheTranslation('Hallo', 'de', 'en', {
        translatedText: 'Hello',
        match: 1.0,
        provider: 'google',
      })

      expect(mockPut).toHaveBeenCalledWith(
        'translation-cache',
        expect.objectContaining({
          key: 'de|en|hallo',
          translatedText: 'Hello',
          provider: 'google',
          match: 1.0,
          timestamp: expect.any(Number),
        }),
      )
    })

    it('triggers eviction when over MAX_ENTRIES', async () => {
      mockCount.mockResolvedValue(11_000)

      const { evictOldEntries } = await import('../db')

      await cacheTranslation('Test', 'de', 'en', {
        translatedText: 'Test',
        match: 1.0,
      })

      expect(evictOldEntries).toHaveBeenCalled()
    })

    it('handles write errors gracefully', async () => {
      mockPut.mockRejectedValue(new Error('Write failed'))

      // Should not throw
      await expect(
        cacheTranslation('Test', 'de', 'en', {
          translatedText: 'Test',
          match: 1.0,
        }),
      ).resolves.toBeUndefined()
    })

    it('uses "unknown" as default provider', async () => {
      mockCount.mockResolvedValue(0)

      await cacheTranslation('Hallo', 'de', 'en', {
        translatedText: 'Hello',
        match: 1.0,
      })

      expect(mockPut).toHaveBeenCalledWith(
        'translation-cache',
        expect.objectContaining({
          provider: 'unknown',
        }),
      )
    })
  })

  describe('getCacheStats()', () => {
    it('returns zero stats for empty cache', async () => {
      mockCount.mockResolvedValue(0)

      const stats = await getCacheStats()

      expect(stats.entryCount).toBe(0)
      expect(stats.oldestTimestamp).toBeNull()
      expect(stats.newestTimestamp).toBeNull()
    })

    it('returns entry count', async () => {
      const mockIndex = {
        openCursor: vi.fn()
          .mockResolvedValueOnce({ value: { timestamp: 1000 } }) // oldest
          .mockResolvedValueOnce({ value: { timestamp: 9000 } }), // newest
      }
      const mockStore = { index: vi.fn().mockReturnValue(mockIndex) }
      mockCount.mockResolvedValue(42)
      mockTransaction.mockReturnValue({ store: mockStore })

      const stats = await getCacheStats()

      expect(stats.entryCount).toBe(42)
    })
  })

  describe('clearTranslationCache()', () => {
    it('clears all entries', async () => {
      await clearTranslationCache()

      expect(mockClear).toHaveBeenCalledWith('translation-cache')
    })
  })
})
