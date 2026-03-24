// @vitest-environment jsdom
// Tests for Fintutto World — Offline Background Sync
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing the module
const mockFrom = vi.fn()
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn()
const mockUpsert = vi.fn().mockResolvedValue({ error: null })
const mockEq = vi.fn()

vi.mock('../../supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => {
      mockFrom(...args)
      return {
        insert: mockInsert,
        update: (...uArgs: unknown[]) => {
          mockUpdate(...uArgs)
          return { eq: mockEq.mockReturnValue({ error: null }) }
        },
        upsert: mockUpsert,
      }
    },
  },
}))

import {
  queueOfflineOperation,
  getQueueSize,
  clearQueue,
  processQueue,
  queueProfileUpdate,
  queuePoiInteraction,
} from '../offline-sync'

const SYNC_QUEUE_KEY = 'fw_offline_sync_queue'
const SYNC_IN_PROGRESS_KEY = 'fw_sync_in_progress'

describe('offline-sync', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── Queue Management ──────────────────────────────────────────────

  describe('queueOfflineOperation', () => {
    it('adds an item to the queue with auto-generated id, timestamp, and retries=0', () => {
      queueOfflineOperation({
        type: 'profile_update',
        table: 'fw_visitor_profiles',
        operation: 'update',
        data: { name: 'Test' },
        filter: { column: 'id', value: 'abc-123' },
      })

      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)!)
      expect(queue).toHaveLength(1)
      expect(queue[0].id).toBeDefined()
      expect(queue[0].queuedAt).toBeDefined()
      expect(queue[0].retries).toBe(0)
      expect(queue[0].type).toBe('profile_update')
      expect(queue[0].table).toBe('fw_visitor_profiles')
      expect(queue[0].data.name).toBe('Test')
    })

    it('appends multiple items without overwriting', () => {
      queueOfflineOperation({ type: 'poi_interaction', table: 't1', operation: 'insert', data: { a: 1 } })
      queueOfflineOperation({ type: 'visit_record', table: 't2', operation: 'insert', data: { b: 2 } })
      queueOfflineOperation({ type: 'dialog_message', table: 't3', operation: 'insert', data: { c: 3 } })

      expect(getQueueSize()).toBe(3)
    })
  })

  describe('getQueueSize', () => {
    it('returns 0 for empty queue', () => {
      expect(getQueueSize()).toBe(0)
    })

    it('returns correct count after adding items', () => {
      queueOfflineOperation({ type: 'poi_interaction', table: 't', operation: 'insert', data: {} })
      queueOfflineOperation({ type: 'poi_interaction', table: 't', operation: 'insert', data: {} })
      expect(getQueueSize()).toBe(2)
    })

    it('returns 0 for corrupted localStorage data', () => {
      localStorage.setItem(SYNC_QUEUE_KEY, 'not-json')
      expect(getQueueSize()).toBe(0)
    })
  })

  describe('clearQueue', () => {
    it('empties the queue', () => {
      queueOfflineOperation({ type: 'poi_interaction', table: 't', operation: 'insert', data: {} })
      expect(getQueueSize()).toBe(1)

      clearQueue()
      expect(getQueueSize()).toBe(0)
    })
  })

  // ── Sync Engine ───────────────────────────────────────────────────

  describe('processQueue', () => {
    it('returns zeros for empty queue', async () => {
      const result = await processQueue()
      expect(result).toEqual({ processed: 0, failed: 0 })
    })

    it('prevents concurrent sync (in-progress guard)', async () => {
      localStorage.setItem(SYNC_IN_PROGRESS_KEY, 'true')
      queueOfflineOperation({ type: 'poi_interaction', table: 't', operation: 'insert', data: {} })

      const result = await processQueue()
      expect(result).toEqual({ processed: 0, failed: 0 })
      // Queue should remain untouched
      expect(getQueueSize()).toBe(1)
    })

    it('processes insert operations successfully', async () => {
      mockInsert.mockResolvedValueOnce({ error: null })

      queueOfflineOperation({ type: 'poi_interaction', table: 'fw_poi_interactions', operation: 'insert', data: { poi_id: 'x' } })

      const result = await processQueue()
      expect(result).toEqual({ processed: 1, failed: 0 })
      expect(getQueueSize()).toBe(0)
      expect(mockFrom).toHaveBeenCalledWith('fw_poi_interactions')
    })

    it('processes update operations with filter', async () => {
      mockEq.mockReturnValueOnce({ error: null })

      queueOfflineOperation({
        type: 'profile_update',
        table: 'fw_visitor_profiles',
        operation: 'update',
        data: { name: 'Updated' },
        filter: { column: 'id', value: 'prof-1' },
      })

      const result = await processQueue()
      expect(result).toEqual({ processed: 1, failed: 0 })
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('processes upsert operations', async () => {
      mockUpsert.mockResolvedValueOnce({ error: null })

      queueOfflineOperation({
        type: 'favorite_toggle',
        table: 'fw_favorites',
        operation: 'upsert',
        data: { user_id: 'u1', item_id: 'i1' },
        matchColumns: ['user_id', 'item_id'],
      })

      const result = await processQueue()
      expect(result).toEqual({ processed: 1, failed: 0 })
      expect(mockUpsert).toHaveBeenCalled()
    })

    it('retries failed items up to 5 times, then marks as failed', async () => {
      mockInsert.mockResolvedValue({ error: new Error('Network error') })

      queueOfflineOperation({ type: 'poi_interaction', table: 't', operation: 'insert', data: {} })

      // First 4 runs: item stays in queue with retries incremented
      for (let i = 0; i < 4; i++) {
        const result = await processQueue()
        expect(result.processed).toBe(0)
        expect(result.failed).toBe(0)
        expect(getQueueSize()).toBe(1)

        const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)!)
        expect(queue[0].retries).toBe(i + 1)
      }

      // 5th run: item exceeds retry limit, marked as failed
      const finalResult = await processQueue()
      expect(finalResult).toEqual({ processed: 0, failed: 1 })
      expect(getQueueSize()).toBe(0)
    })

    it('clears the in-progress flag after processing', async () => {
      queueOfflineOperation({ type: 'poi_interaction', table: 't', operation: 'insert', data: {} })
      mockInsert.mockResolvedValueOnce({ error: null })

      await processQueue()
      expect(localStorage.getItem(SYNC_IN_PROGRESS_KEY)).toBeNull()
    })
  })

  // ── Convenience Helpers ───────────────────────────────────────────

  describe('queueProfileUpdate', () => {
    it('queues update when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      queueProfileUpdate('prof-1', { display_name: 'Alice' })

      expect(getQueueSize()).toBe(1)
      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)!)
      expect(queue[0].type).toBe('profile_update')
      expect(queue[0].table).toBe('fw_visitor_profiles')
      expect(queue[0].operation).toBe('update')
      expect(queue[0].data.display_name).toBe('Alice')
      expect(queue[0].data.updated_at).toBeDefined()
      expect(queue[0].filter).toEqual({ column: 'id', value: 'prof-1' })

      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    })
  })

  describe('queuePoiInteraction', () => {
    it('queues insert when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })

      queuePoiInteraction({
        visitor_id: 'v-1',
        poi_type: 'artwork',
        poi_id: 'art-42',
        poi_name: 'Mona Lisa',
        interaction_type: 'view',
        language_used: 'de',
      })

      expect(getQueueSize()).toBe(1)
      const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)!)
      expect(queue[0].type).toBe('poi_interaction')
      expect(queue[0].table).toBe('fw_poi_interactions')
      expect(queue[0].operation).toBe('insert')
      expect(queue[0].data.poi_id).toBe('art-42')
      expect(queue[0].data.poi_name).toBe('Mona Lisa')
      expect(queue[0].data.viewed_at).toBeDefined()
      expect(queue[0].data.detection_method).toBe('manual')

      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    })
  })
})
