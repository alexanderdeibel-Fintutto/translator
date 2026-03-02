// Admin Dashboard Reporter
// Batches events and sends them to the fintutto-admin API
// Events are queued locally and flushed periodically

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL as string | undefined
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY as string | undefined
const FLUSH_INTERVAL_MS = 30_000 // 30 seconds
const MAX_QUEUE_SIZE = 200
const MAX_RETRY = 2

interface QueuedEvent {
  event: string
  params: Record<string, unknown>
  timestamp: number
  sessionId: string
  url: string
  userAgent: string
}

let queue: QueuedEvent[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null
let sessionId = ''

function getSessionId(): string {
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
  return sessionId
}

export function reportEvent(event: string, params: Record<string, unknown> = {}) {
  const entry: QueuedEvent = {
    event,
    params,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    url: location.pathname,
    userAgent: navigator.userAgent,
  }

  queue.push(entry)

  // Prevent unbounded memory growth
  if (queue.length > MAX_QUEUE_SIZE) {
    queue = queue.slice(-MAX_QUEUE_SIZE)
  }
}

async function flush() {
  if (queue.length === 0 || !ADMIN_API_URL) return

  const batch = queue.splice(0)

  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const response = await fetch(`${ADMIN_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(ADMIN_API_KEY && { 'X-API-Key': ADMIN_API_KEY }),
        },
        body: JSON.stringify({
          source: 'translator',
          events: batch,
        }),
        keepalive: true,
      })

      if (response.ok) return

      // Non-retryable status codes
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        console.warn(`[AdminReporter] Server rejected events (${response.status})`)
        return
      }
    } catch {
      // Network error — retry
    }

    // Exponential backoff before retry
    if (attempt < MAX_RETRY) {
      await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
    }
  }

  // All retries failed — re-queue events (drop oldest if over limit)
  queue.unshift(...batch)
  if (queue.length > MAX_QUEUE_SIZE) {
    queue = queue.slice(-MAX_QUEUE_SIZE)
  }
}

export function initAdminReporter() {
  if (!ADMIN_API_URL) {
    console.warn('[AdminReporter] VITE_ADMIN_API_URL not set — admin reporting disabled')
    return
  }

  // Periodic flush
  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS)

  // Flush on page visibility change (user leaving)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flush()
    }
  })

  // Flush on beforeunload
  window.addEventListener('beforeunload', () => {
    if (queue.length > 0 && ADMIN_API_URL) {
      // Use sendBeacon for reliability during page unload
      const payload = JSON.stringify({
        source: 'translator',
        events: queue.splice(0),
      })
      navigator.sendBeacon(
        `${ADMIN_API_URL}/api/events`,
        new Blob([payload], { type: 'application/json' })
      )
    }
  })
}

export function stopAdminReporter() {
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }
  flush()
}
