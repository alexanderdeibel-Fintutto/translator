// Fintutto World — Offline Background Sync
// Queues profile updates and POI interactions when offline
// Syncs to Supabase when connection is restored

import { supabase } from '../supabase'

const SYNC_QUEUE_KEY = 'fw_offline_sync_queue'
const SYNC_IN_PROGRESS_KEY = 'fw_sync_in_progress'

interface SyncItem {
  id: string
  type: 'profile_update' | 'poi_interaction' | 'visit_record' | 'dialog_message' | 'favorite_toggle'
  table: string
  operation: 'insert' | 'update' | 'upsert'
  data: Record<string, unknown>
  matchColumns?: string[]  // for upsert
  filter?: { column: string; value: string }  // for update
  queuedAt: string
  retries: number
}

// ── Queue Management ────────────────────────────────────────────────────

/** Add an operation to the offline sync queue */
export function queueOfflineOperation(item: Omit<SyncItem, 'id' | 'queuedAt' | 'retries'>): void {
  const queue = getQueue()
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
    retries: 0,
  })
  saveQueue(queue)
}

/** Get current queue size */
export function getQueueSize(): number {
  return getQueue().length
}

/** Clear the entire queue */
export function clearQueue(): void {
  saveQueue([])
}

// ── Sync Engine ─────────────────────────────────────────────────────────

/** Process all queued operations (call when coming back online) */
export async function processQueue(): Promise<{ processed: number; failed: number }> {
  // Prevent concurrent sync
  if (localStorage.getItem(SYNC_IN_PROGRESS_KEY) === 'true') {
    return { processed: 0, failed: 0 }
  }

  localStorage.setItem(SYNC_IN_PROGRESS_KEY, 'true')

  const queue = getQueue()
  if (queue.length === 0) {
    localStorage.removeItem(SYNC_IN_PROGRESS_KEY)
    return { processed: 0, failed: 0 }
  }

  let processed = 0
  let failed = 0
  const remaining: SyncItem[] = []

  for (const item of queue) {
    try {
      let error: Error | null = null

      switch (item.operation) {
        case 'insert': {
          const result = await supabase.from(item.table).insert(item.data)
          if (result.error) error = result.error
          break
        }
        case 'update': {
          if (item.filter) {
            const result = await supabase
              .from(item.table)
              .update(item.data)
              .eq(item.filter.column, item.filter.value)
            if (result.error) error = result.error
          }
          break
        }
        case 'upsert': {
          const result = await supabase
            .from(item.table)
            .upsert(item.data, { onConflict: item.matchColumns?.join(',') || 'id' })
          if (result.error) error = result.error
          break
        }
      }

      if (error) throw error
      processed++
    } catch {
      item.retries++
      if (item.retries < 5) {
        remaining.push(item) // retry later
      } else {
        failed++ // give up after 5 retries
      }
    }
  }

  saveQueue(remaining)
  localStorage.removeItem(SYNC_IN_PROGRESS_KEY)

  return { processed, failed }
}

// ── Auto-Sync on Reconnect ──────────────────────────────────────────────

let listenerAttached = false

/** Start listening for online events to auto-sync */
export function startAutoSync(): void {
  if (listenerAttached) return
  listenerAttached = true

  window.addEventListener('online', async () => {
    console.log('[OfflineSync] Back online — processing queue...')
    const result = await processQueue()
    if (result.processed > 0 || result.failed > 0) {
      console.log(`[OfflineSync] Synced: ${result.processed} ok, ${result.failed} failed`)
    }
  })

  // Also try to sync on page load if online
  if (navigator.onLine && getQueue().length > 0) {
    processQueue()
  }
}

// ── Convenience Helpers ─────────────────────────────────────────────────

/** Queue a visitor profile update (works offline) */
export function queueProfileUpdate(profileId: string, updates: Record<string, unknown>): void {
  if (navigator.onLine) {
    // Try immediately
    supabase
      .from('fw_visitor_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .then(({ error }) => {
        if (error) {
          // Fallback to queue
          queueOfflineOperation({
            type: 'profile_update',
            table: 'fw_visitor_profiles',
            operation: 'update',
            data: { ...updates, updated_at: new Date().toISOString() },
            filter: { column: 'id', value: profileId },
          })
        }
      })
  } else {
    queueOfflineOperation({
      type: 'profile_update',
      table: 'fw_visitor_profiles',
      operation: 'update',
      data: { ...updates, updated_at: new Date().toISOString() },
      filter: { column: 'id', value: profileId },
    })
  }
}

/** Queue a POI interaction (works offline) */
export function queuePoiInteraction(interaction: {
  visitor_id: string
  visit_id?: string
  poi_type: string
  poi_id: string
  poi_name?: string
  interaction_type: string
  language_used?: string
}): void {
  const data = {
    ...interaction,
    viewed_at: new Date().toISOString(),
    detection_method: 'manual',
  }

  if (navigator.onLine) {
    supabase.from('fw_poi_interactions').insert(data).then(({ error }) => {
      if (error) {
        queueOfflineOperation({
          type: 'poi_interaction',
          table: 'fw_poi_interactions',
          operation: 'insert',
          data,
        })
      }
    })
  } else {
    queueOfflineOperation({
      type: 'poi_interaction',
      table: 'fw_poi_interactions',
      operation: 'insert',
      data,
    })
  }
}

// ── Internal ────────────────────────────────────────────────────────────

function getQueue(): SyncItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQueue(queue: SyncItem[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  } catch {
    // localStorage full — drop oldest items
    if (queue.length > 10) {
      saveQueue(queue.slice(-10))
    }
  }
}
