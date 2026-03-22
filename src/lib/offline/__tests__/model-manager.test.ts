// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDB = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  getAllFromIndex: vi.fn(),
}))

vi.mock('../db', () => ({
  getDB: vi.fn(() => Promise.resolve(mockDB)),
}))

import {
  OPUS_MT_MODELS,
  canPivotTranslate,
  getModelId,
  isModelDownloaded,
  recordModelDownload,
  getDownloadedModels,
  getModelsByType,
  deleteModel,
  getTotalModelStorage,
} from '../model-manager'

describe('model-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('OPUS_MT_MODELS', () => {
    it('should have de-en and en-de pairs', () => {
      expect(OPUS_MT_MODELS['de-en']).toBe('Xenova/opus-mt-de-en')
      expect(OPUS_MT_MODELS['en-de']).toBe('Xenova/opus-mt-en-de')
    })

    it('should have multiple language pairs', () => {
      expect(Object.keys(OPUS_MT_MODELS).length).toBeGreaterThan(20)
    })
  })

  describe('canPivotTranslate', () => {
    it('should return true for language pair that can pivot via English', () => {
      // de-en and en-fr both exist, so de->fr can pivot
      expect(canPivotTranslate('de', 'fr')).toBe(true)
    })

    it('should return false when source is English', () => {
      expect(canPivotTranslate('en', 'fr')).toBe(false)
    })

    it('should return false when target is English', () => {
      expect(canPivotTranslate('de', 'en')).toBe(false)
    })

    it('should return false for unsupported source language', () => {
      expect(canPivotTranslate('xx', 'fr')).toBe(false)
    })

    it('should return false for unsupported target language', () => {
      expect(canPivotTranslate('de', 'xx')).toBe(false)
    })
  })

  describe('getModelId', () => {
    it('should return model ID for known pair', () => {
      expect(getModelId('de', 'en')).toBe('Xenova/opus-mt-de-en')
    })

    it('should return null for unknown pair', () => {
      expect(getModelId('xx', 'yy')).toBeNull()
    })
  })

  describe('isModelDownloaded', () => {
    let mockCache: { keys: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> }
    let mockCachesOpen: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockCache = {
        keys: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      }
      mockCachesOpen = vi.fn().mockResolvedValue(mockCache)
      // @ts-expect-error mock global caches
      globalThis.caches = { open: mockCachesOpen }
    })

    it('should return true when metadata exists in IndexedDB', async () => {
      mockDB.get.mockResolvedValue({ id: 'Xenova/opus-mt-de-en' })
      const result = await isModelDownloaded('Xenova/opus-mt-de-en')
      expect(result).toBe(true)
    })

    it('should fall back to Cache API when metadata not in IndexedDB', async () => {
      mockDB.get.mockResolvedValue(undefined)
      mockDB.put.mockResolvedValue(undefined)
      mockCache.keys.mockResolvedValue([
        { url: 'https://cdn.example.com/Xenova/opus-mt-de-en/model.onnx' },
      ])

      const result = await isModelDownloaded('Xenova/opus-mt-de-en')
      expect(result).toBe(true)
    })

    it('should return false when model not found anywhere', async () => {
      mockDB.get.mockResolvedValue(undefined)
      mockCache.keys.mockResolvedValue([])

      const result = await isModelDownloaded('Xenova/opus-mt-xx-yy')
      expect(result).toBe(false)
    })

    it('should return false when both IndexedDB and Cache API fail', async () => {
      mockDB.get.mockRejectedValue(new Error('DB error'))
      mockCachesOpen.mockRejectedValue(new Error('Cache error'))

      const result = await isModelDownloaded('Xenova/opus-mt-de-en')
      expect(result).toBe(false)
    })
  })

  describe('recordModelDownload', () => {
    it('should store model metadata in IndexedDB', async () => {
      mockDB.put.mockResolvedValue(undefined)
      await recordModelDownload('Xenova/opus-mt-de-en', 'translation', 35000000)

      expect(mockDB.put).toHaveBeenCalledWith(
        'model-metadata',
        expect.objectContaining({
          id: 'Xenova/opus-mt-de-en',
          type: 'translation',
          sizeBytes: 35000000,
          downloadedAt: expect.any(Number),
          version: '1.0',
        })
      )
    })
  })

  describe('getDownloadedModels', () => {
    it('should return all models from IndexedDB', async () => {
      const models = [
        { id: 'model1', type: 'translation', sizeBytes: 100, downloadedAt: 1, version: '1.0' },
      ]
      mockDB.getAll.mockResolvedValue(models)
      const result = await getDownloadedModels()
      expect(result).toEqual(models)
      expect(mockDB.getAll).toHaveBeenCalledWith('model-metadata')
    })
  })

  describe('getModelsByType', () => {
    it('should return models filtered by type', async () => {
      const models = [
        { id: 'model1', type: 'translation', sizeBytes: 100, downloadedAt: 1, version: '1.0' },
      ]
      mockDB.getAllFromIndex.mockResolvedValue(models)
      const result = await getModelsByType('translation')
      expect(result).toEqual(models)
      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('model-metadata', 'by-type', 'translation')
    })
  })

  describe('deleteModel', () => {
    let mockCache: { keys: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> }

    beforeEach(() => {
      mockCache = {
        keys: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      }
      // @ts-expect-error mock global caches
      globalThis.caches = { open: vi.fn().mockResolvedValue(mockCache) }
    })

    it('should delete metadata from IndexedDB and cache', async () => {
      mockDB.delete.mockResolvedValue(undefined)
      mockCache.keys.mockResolvedValue([
        { url: 'https://cdn.example.com/Xenova%2Fopus-mt-de-en/model.onnx' },
      ])
      mockCache.delete.mockResolvedValue(true)

      await deleteModel('Xenova/opus-mt-de-en')

      expect(mockDB.delete).toHaveBeenCalledWith('model-metadata', 'Xenova/opus-mt-de-en')
      expect(mockCache.delete).toHaveBeenCalled()
    })

    it('should handle cache API not available', async () => {
      mockDB.delete.mockResolvedValue(undefined)
      // @ts-expect-error mock global caches
      globalThis.caches = { open: vi.fn().mockRejectedValue(new Error('not available')) }

      // Should not throw
      await expect(deleteModel('Xenova/opus-mt-de-en')).resolves.toBeUndefined()
      expect(mockDB.delete).toHaveBeenCalled()
    })
  })

  describe('getTotalModelStorage', () => {
    it('should sum up all model sizes', async () => {
      mockDB.getAll.mockResolvedValue([
        { id: 'm1', type: 'translation', sizeBytes: 1000, downloadedAt: 1, version: '1.0' },
        { id: 'm2', type: 'translation', sizeBytes: 2000, downloadedAt: 1, version: '1.0' },
      ])

      const total = await getTotalModelStorage()
      expect(total).toBe(3000)
    })

    it('should return 0 when no models downloaded', async () => {
      mockDB.getAll.mockResolvedValue([])
      const total = await getTotalModelStorage()
      expect(total).toBe(0)
    })
  })
})
