// Offline Admin Mode
// Queues admin operations (content edits, status changes) when offline
// Syncs automatically when connection is restored

const ADMIN_QUEUE_KEY = 'fw_admin_offline_queue'

export interface OfflineAdminOp {
  id: string
  table: string
  operation: 'insert' | 'update' | 'delete'
  data: Record<string, unknown>
  recordId?: string
  timestamp: number
  retries: number
}

/**
 * Check if we're in offline admin mode.
 */
export function isOfflineAdminMode(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

/**
 * Queue an admin operation for later sync.
 */
export function queueAdminOp(op: Omit<OfflineAdminOp, 'id' | 'timestamp' | 'retries'>): void {
  const queue = getAdminQueue()
  queue.push({
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retries: 0,
  })
  localStorage.setItem(ADMIN_QUEUE_KEY, JSON.stringify(queue))
}

/**
 * Get the current offline admin queue.
 */
export function getAdminQueue(): OfflineAdminOp[] {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * Get pending operation count.
 */
export function getPendingCount(): number {
  return getAdminQueue().length
}

/**
 * Clear the queue after successful sync.
 */
export function clearAdminQueue(): void {
  localStorage.removeItem(ADMIN_QUEUE_KEY)
}

/**
 * Remove a single operation from the queue.
 */
export function removeFromQueue(opId: string): void {
  const queue = getAdminQueue().filter(op => op.id !== opId)
  localStorage.setItem(ADMIN_QUEUE_KEY, JSON.stringify(queue))
}

/**
 * Process the offline queue (called when back online).
 */
export async function syncAdminQueue(
  executor: (op: OfflineAdminOp) => Promise<boolean>,
): Promise<{ synced: number; failed: number }> {
  const queue = getAdminQueue()
  let synced = 0
  let failed = 0

  // Process in order (oldest first)
  const sorted = [...queue].sort((a, b) => a.timestamp - b.timestamp)

  for (const op of sorted) {
    try {
      const success = await executor(op)
      if (success) {
        removeFromQueue(op.id)
        synced++
      } else {
        op.retries++
        if (op.retries >= 3) {
          removeFromQueue(op.id)
          failed++
        }
      }
    } catch {
      op.retries++
      failed++
    }
  }

  return { synced, failed }
}

/**
 * Register online/offline listeners for auto-sync.
 */
export function registerAutoSync(
  executor: (op: OfflineAdminOp) => Promise<boolean>,
): () => void {
  const handler = () => {
    if (navigator.onLine && getPendingCount() > 0) {
      syncAdminQueue(executor)
    }
  }

  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}
