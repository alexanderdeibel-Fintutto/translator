// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  requestPersistentStorage,
  isPersisted,
  getStorageEstimate,
  formatBytes,
  isIOSSafariStandalone,
  isIOSSafariNotStandalone,
  checkOfflineSupport,
} from '../storage-manager'

beforeEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('storage-manager', () => {
  describe('requestPersistentStorage()', () => {
    it('returns true when persistent storage is granted', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: vi.fn().mockResolvedValue(true),
          persisted: vi.fn().mockResolvedValue(true),
          estimate: vi.fn(),
        },
        configurable: true,
      })

      const result = await requestPersistentStorage()
      expect(result).toBe(true)
    })

    it('returns false when persistent storage is denied', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: vi.fn().mockResolvedValue(false),
          persisted: vi.fn(),
          estimate: vi.fn(),
        },
        configurable: true,
      })

      const result = await requestPersistentStorage()
      expect(result).toBe(false)
    })

    it('returns false when persist API is not available', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {},
        configurable: true,
      })

      const result = await requestPersistentStorage()
      expect(result).toBe(false)
    })

    it('returns false on persist() error', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          persist: vi.fn().mockRejectedValue(new Error('Not supported')),
        },
        configurable: true,
      })

      const result = await requestPersistentStorage()
      expect(result).toBe(false)
    })
  })

  describe('isPersisted()', () => {
    it('returns true when already persisted', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          persisted: vi.fn().mockResolvedValue(true),
        },
        configurable: true,
      })

      const result = await isPersisted()
      expect(result).toBe(true)
    })

    it('returns false when not persisted', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          persisted: vi.fn().mockResolvedValue(false),
        },
        configurable: true,
      })

      const result = await isPersisted()
      expect(result).toBe(false)
    })

    it('returns false when persisted API not available', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {},
        configurable: true,
      })

      const result = await isPersisted()
      expect(result).toBe(false)
    })
  })

  describe('getStorageEstimate()', () => {
    it('returns usage and quota from navigator.storage.estimate', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: vi.fn().mockResolvedValue({
            usage: 1024 * 1024 * 50, // 50 MB
            quota: 1024 * 1024 * 1024, // 1 GB
          }),
        },
        configurable: true,
      })

      const estimate = await getStorageEstimate()

      expect(estimate.usageBytes).toBe(1024 * 1024 * 50)
      expect(estimate.quotaBytes).toBe(1024 * 1024 * 1024)
      expect(estimate.percentUsed).toBeCloseTo(4.88, 1)
    })

    it('returns zero values when estimate API not available', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {},
        configurable: true,
      })

      const estimate = await getStorageEstimate()

      expect(estimate.usageBytes).toBe(0)
      expect(estimate.quotaBytes).toBe(0)
      expect(estimate.percentUsed).toBe(0)
    })

    it('handles zero quota without division error', async () => {
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: vi.fn().mockResolvedValue({ usage: 0, quota: 0 }),
        },
        configurable: true,
      })

      const estimate = await getStorageEstimate()
      expect(estimate.percentUsed).toBe(0)
    })
  })

  describe('formatBytes()', () => {
    it('formats 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B')
    })

    it('formats bytes', () => {
      expect(formatBytes(500)).toBe('500 B')
    })

    it('formats kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.0 KB')
    })

    it('formats megabytes', () => {
      expect(formatBytes(1024 * 1024 * 5.5)).toBe('5.5 MB')
    })

    it('formats gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024 * 2)).toBe('2.0 GB')
    })
  })

  describe('isIOSSafariStandalone()', () => {
    it('returns false in non-standalone mode', () => {
      // Default jsdom does not set navigator.standalone
      expect(isIOSSafariStandalone()).toBe(false)
    })
  })

  describe('isIOSSafariNotStandalone()', () => {
    it('returns false in jsdom (not iOS Safari)', () => {
      expect(isIOSSafariNotStandalone()).toBe(false)
    })
  })

  describe('checkOfflineSupport()', () => {
    it('returns object with support flags', () => {
      const support = checkOfflineSupport()

      expect(support).toHaveProperty('indexedDB')
      expect(support).toHaveProperty('cacheAPI')
      expect(support).toHaveProperty('serviceWorker')
      expect(support).toHaveProperty('webAssembly')
      expect(support).toHaveProperty('persistentStorage')
    })

    it('all values are booleans', () => {
      const support = checkOfflineSupport()

      for (const value of Object.values(support)) {
        expect(typeof value).toBe('boolean')
      }
    })
  })
})
