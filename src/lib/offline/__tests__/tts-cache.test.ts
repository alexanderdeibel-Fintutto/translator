import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDB = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  clear: vi.fn(),
}))

const mockEvictOldEntries = vi.hoisted(() => vi.fn())

vi.mock('../db', () => ({
  getDB: vi.fn(() => Promise.resolve(mockDB)),
  evictOldEntries: mockEvictOldEntries,
}))

import {
  getCachedTTSAudio,
  cacheTTSAudio,
  getTTSCacheStats,
  clearTTSCache,
} from '../tts-cache'

describe('tts-cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('getCachedTTSAudio', () => {
    it('should return null when no entry exists', async () => {
      mockDB.get.mockResolvedValue(undefined)
      const result = await getCachedTTSAudio('hello', 'en-US', 'neural2')
      expect(result).toBeNull()
      expect(mockDB.get).toHaveBeenCalledWith(
        'tts-audio-cache',
        'en-US|hello|neural2'
      )
    })

    it('should return cached audio blob when entry exists and not expired', async () => {
      const blob = new Blob(['audio'], { type: 'audio/mp3' })
      mockDB.get.mockResolvedValue({
        key: 'en-US|hello|neural2',
        audioBlob: blob,
        timestamp: Date.now() - 1000, // 1 second ago
      })

      const result = await getCachedTTSAudio('hello', 'en-US', 'neural2')
      expect(result).toBe(blob)
    })

    it('should return null and delete entry when TTL expired', async () => {
      const blob = new Blob(['audio'])
      const expiredTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 days ago
      mockDB.get.mockResolvedValue({
        key: 'en-US|hello|neural2',
        audioBlob: blob,
        timestamp: expiredTimestamp,
      })
      mockDB.delete.mockResolvedValue(undefined)

      const result = await getCachedTTSAudio('hello', 'en-US', 'neural2')
      expect(result).toBeNull()
      expect(mockDB.delete).toHaveBeenCalledWith(
        'tts-audio-cache',
        'en-US|hello|neural2'
      )
    })

    it('should normalize text (trim and lowercase) in cache key', async () => {
      mockDB.get.mockResolvedValue(undefined)
      await getCachedTTSAudio('  Hello World  ', 'de-DE', 'chirp3hd')
      expect(mockDB.get).toHaveBeenCalledWith(
        'tts-audio-cache',
        'de-DE|hello world|chirp3hd'
      )
    })

    it('should return null on DB error', async () => {
      mockDB.get.mockRejectedValue(new Error('DB error'))
      const result = await getCachedTTSAudio('hello', 'en-US', 'neural2')
      expect(result).toBeNull()
    })
  })

  describe('cacheTTSAudio', () => {
    it('should store audio in the database', async () => {
      const blob = new Blob(['audio'])
      mockDB.put.mockResolvedValue(undefined)
      mockDB.count.mockResolvedValue(10)

      await cacheTTSAudio('hello', 'en-US', 'neural2', blob)

      expect(mockDB.put).toHaveBeenCalledWith(
        'tts-audio-cache',
        expect.objectContaining({
          key: 'en-US|hello|neural2',
          audioBlob: blob,
          timestamp: expect.any(Number),
        })
      )
    })

    it('should trigger eviction when count exceeds MAX_ENTRIES', async () => {
      const blob = new Blob(['audio'])
      mockDB.put.mockResolvedValue(undefined)
      mockDB.count.mockResolvedValue(2001) // exceeds 2000

      await cacheTTSAudio('hello', 'en-US', 'neural2', blob)

      expect(mockEvictOldEntries).toHaveBeenCalledWith(
        'tts-audio-cache',
        30 * 24 * 60 * 60 * 1000
      )
    })

    it('should not trigger eviction when count is within limit', async () => {
      const blob = new Blob(['audio'])
      mockDB.put.mockResolvedValue(undefined)
      mockDB.count.mockResolvedValue(500)

      await cacheTTSAudio('hello', 'en-US', 'neural2', blob)

      expect(mockEvictOldEntries).not.toHaveBeenCalled()
    })

    it('should handle DB write errors gracefully', async () => {
      const blob = new Blob(['audio'])
      mockDB.put.mockRejectedValue(new Error('Write error'))

      // Should not throw
      await expect(
        cacheTTSAudio('hello', 'en-US', 'neural2', blob)
      ).resolves.toBeUndefined()
    })
  })

  describe('getTTSCacheStats', () => {
    it('should return the entry count', async () => {
      mockDB.count.mockResolvedValue(42)
      const stats = await getTTSCacheStats()
      expect(stats).toEqual({ entryCount: 42 })
    })

    it('should return 0 on error', async () => {
      mockDB.count.mockRejectedValue(new Error('fail'))
      const stats = await getTTSCacheStats()
      expect(stats).toEqual({ entryCount: 0 })
    })
  })

  describe('clearTTSCache', () => {
    it('should clear the tts-audio-cache store', async () => {
      mockDB.clear.mockResolvedValue(undefined)
      await clearTTSCache()
      expect(mockDB.clear).toHaveBeenCalledWith('tts-audio-cache')
    })
  })
})
