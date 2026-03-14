// Supabase Realtime transport — wraps the existing Supabase channel logic
// Used when internet is available (cloud mode)

import { supabase } from '@/lib/supabase'
import { getChannelName } from '@/lib/session'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { TranslationChunk, SessionInfo, StatusMessage, PresenceState } from '@/lib/session'
import type { BroadcastTransport, BroadcastHandlers, PresenceTransport, ListenerAnnounce } from './types'

const MAX_RETRIES = 5
const BASE_DELAY = 2000

// --- Broadcast ---

export class SupabaseBroadcastTransport implements BroadcastTransport {
  readonly type = 'supabase' as const
  private channel: RealtimeChannel | null = null
  private connected = false
  private retries = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private connectionListeners = new Set<(connected: boolean) => void>()
  private subscribeArgs: { code: string; handlers: BroadcastHandlers } | null = null
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null
  private visibilityHandler: (() => void) | null = null
  // Track when last message was received — used for listener-side staleness detection.
  // On mobile WebKit (Safari, Firefox iOS, Chrome iOS), the underlying WebSocket can
  // die silently without firing any status callback. The channel stays "connected"
  // but no broadcasts arrive. We detect this by checking lastMessageAt.
  private lastMessageAt = 0
  private receivedCount = 0
  private reconnectCount = 0

  get isConnected(): boolean {
    return this.connected
  }

  /** Diagnostic: when was the last broadcast message received (0 = never) */
  get diagnosticLastMessageAt(): number {
    return this.lastMessageAt
  }

  /** Diagnostic: total broadcast messages received since subscription */
  get diagnosticReceivedCount(): number {
    return this.receivedCount
  }

  /** Diagnostic: how many times the channel was reconnected */
  get diagnosticReconnectCount(): number {
    return this.reconnectCount
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback)
    return () => this.connectionListeners.delete(callback)
  }

  private setConnected(value: boolean) {
    if (this.connected === value) return
    this.connected = value
    this.connectionListeners.forEach(fn => fn(value))
  }

  private clearRetryTimer() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
  }

  subscribe(code: string, handlers: BroadcastHandlers): void {
    this.subscribeArgs = { code, handlers }
    this.retries = 0
    this.receivedCount = 0
    this.reconnectCount = 0
    this.clearRetryTimer()
    this.doSubscribe(code, handlers)

    // iOS/Firefox: WebSocket can silently disconnect when the browser goes to
    // background or the screen locks. Re-subscribe when the page becomes visible again.
    // Check both connected state AND message staleness — on iOS WebKit browsers
    // (Safari, Firefox, Chrome), the WebSocket can die without firing a close event,
    // leaving connected=true but no messages arriving.
    this.clearVisibilityHandler()
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && this.subscribeArgs) {
        const stale = this.lastMessageAt > 0 && (Date.now() - this.lastMessageAt) > 20_000
        if (!this.connected || stale) {
          console.error(`[Supabase] Page visible again, reconnecting (connected=${this.connected}, stale=${stale})`)
          this.retries = 0
          this.reconnectCount++
          this.doSubscribe(this.subscribeArgs.code, this.subscribeArgs.handlers)
        }
      }
    }
    document.addEventListener('visibilitychange', this.visibilityHandler)

    // Keepalive: periodically check if the channel is still alive.
    // Checks TWO conditions:
    // 1. Channel explicitly disconnected (connected=false) — normal failure path
    // 2. Channel "connected" but no messages for 30s — silent WebSocket death
    //    (common on iOS WebKit browsers: Safari, Firefox iOS, Chrome iOS)
    this.clearKeepalive()
    this.keepaliveTimer = setInterval(() => {
      if (!this.subscribeArgs) return
      const silentlyDead = this.connected && this.lastMessageAt > 0 &&
        (Date.now() - this.lastMessageAt) > 30_000
      if ((!this.connected && this.channel) || silentlyDead) {
        console.error(`[Supabase] Keepalive: reconnecting (connected=${this.connected}, lastMsg=${Date.now() - this.lastMessageAt}ms ago)`)
        this.retries = 0
        this.reconnectCount++
        this.doSubscribe(this.subscribeArgs.code, this.subscribeArgs.handlers)
      }
    }, 10_000) // check every 10 seconds
  }

  private clearVisibilityHandler() {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
      this.visibilityHandler = null
    }
  }

  private clearKeepalive() {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer)
      this.keepaliveTimer = null
    }
  }

  private subscribeGeneration = 0 // Prevents stale async callbacks from old doSubscribe calls

  private doSubscribe(code: string, handlers: BroadcastHandlers): void {
    // Increment generation — any in-flight subscribe from a previous call is now stale
    const generation = ++this.subscribeGeneration

    // Clean up existing — unsubscribe first, THEN remove
    if (this.channel) {
      const oldChannel = this.channel
      this.channel = null
      // Unsubscribe to tear down WebSocket listeners before removing from pool.
      // removeChannel alone doesn't reliably clean up handlers, causing
      // accumulated listeners on iOS reconnect cycles.
      try { oldChannel.unsubscribe() } catch { /* ignore */ }
      supabase.removeChannel(oldChannel)
    }

    // Enable broadcast acknowledgments so send() can detect failures.
    // Without ack, channel.send() is fire-and-forget and silently fails
    // if the channel is not fully connected (common on iOS Safari).
    const channel = supabase.channel(getChannelName(code), {
      config: { broadcast: { ack: true, self: false } },
    })

    if (handlers.onTranslation) {
      const handler = handlers.onTranslation
      channel.on('broadcast', { event: 'translation' }, ({ payload }) => {
        this.lastMessageAt = Date.now()
        this.receivedCount++
        const chunk = payload as TranslationChunk
        console.error(`[Supabase] Received translation (#${this.receivedCount}): lang=${chunk.targetLanguage}, text="${chunk.translatedText?.slice(0, 30)}..."`)
        handler(chunk)
      })
    }

    if (handlers.onSessionInfo) {
      const handler = handlers.onSessionInfo
      channel.on('broadcast', { event: 'session_info' }, ({ payload }) => {
        this.lastMessageAt = Date.now()
        handler(payload as SessionInfo)
      })
    }

    if (handlers.onStatus) {
      const handler = handlers.onStatus
      channel.on('broadcast', { event: 'status' }, ({ payload }) => {
        this.lastMessageAt = Date.now()
        handler(payload as StatusMessage)
      })
    }

    if (handlers.onListenerAnnounce) {
      const handler = handlers.onListenerAnnounce
      channel.on('broadcast', { event: 'listener_announce' }, ({ payload }) => {
        this.lastMessageAt = Date.now()
        handler(payload as ListenerAnnounce)
      })
    }

    // Also listen for heartbeat events (no handler needed, just updates lastMessageAt)
    channel.on('broadcast', { event: 'heartbeat' }, () => {
      this.lastMessageAt = Date.now()
      this.receivedCount++
    })

    const channelName = getChannelName(code)
    console.error(`[Supabase] Subscribing to channel: ${channelName} (gen=${generation})`)

    channel.subscribe((status) => {
      console.error(`[Supabase] Channel ${channelName} status: ${status} (gen=${generation}, current=${this.subscribeGeneration})`)
      // If a newer doSubscribe call has been made, this callback is stale — ignore it
      if (generation !== this.subscribeGeneration) {
        console.error(`[Supabase] Stale callback ignored (gen=${generation}, current=${this.subscribeGeneration})`)
        try { channel.unsubscribe() } catch { /* ignore */ }
        supabase.removeChannel(channel)
        return
      }
      if (status === 'SUBSCRIBED') {
        this.setConnected(true)
        this.lastMessageAt = Date.now() // Reset staleness timer on fresh subscribe
        this.retries = 0
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`[Supabase] Channel ${channelName} error: ${status}, retry ${this.retries}/${MAX_RETRIES}`)
        this.setConnected(false)
        if (this.retries < MAX_RETRIES && this.subscribeArgs) {
          const delay = BASE_DELAY * Math.pow(2, this.retries)
          this.retries++
          this.clearRetryTimer()
          this.retryTimer = setTimeout(() => {
            if (this.subscribeArgs) {
              this.doSubscribe(this.subscribeArgs.code, this.subscribeArgs.handlers)
            }
          }, delay)
        }
      } else if (status === 'CLOSED') {
        this.setConnected(false)
      }
    })

    this.channel = channel
  }

  broadcast(event: string, payload: Record<string, unknown>): void {
    if (!this.channel || !this.connected) {
      console.error(`[Supabase] Broadcast DROPPED: event=${event}, channel=${!!this.channel}, connected=${this.connected}`)
      return
    }
    // With ack enabled, send() returns Promise<'ok' | 'timed out' | 'error'>.
    // On failure, mark disconnected so keepalive triggers re-subscribe.
    this.channel.send({ type: 'broadcast', event, payload }).then((status) => {
      if (status === 'ok') return
      console.error(`[Supabase] Broadcast send failed: ${status}`)
      this.setConnected(false)
      // Immediate re-subscribe on error (don't wait for keepalive)
      if (this.subscribeArgs) {
        this.retries = 0
        this.doSubscribe(this.subscribeArgs.code, this.subscribeArgs.handlers)
      }
    }).catch(() => {
      // Network error — mark as disconnected, keepalive will reconnect
      this.setConnected(false)
    })
  }

  unsubscribe(): void {
    this.clearRetryTimer()
    this.clearVisibilityHandler()
    this.clearKeepalive()
    this.subscribeArgs = null
    this.retries = 0
    this.subscribeGeneration++ // Invalidate any in-flight callbacks
    if (this.channel) {
      try { this.channel.unsubscribe() } catch { /* ignore */ }
      supabase.removeChannel(this.channel)
      this.channel = null
    }
    this.setConnected(false)
  }
}

// --- Presence ---

export class SupabasePresenceTransport implements PresenceTransport {
  readonly type = 'supabase' as const
  private channel: RealtimeChannel | null = null
  private myPresence: PresenceState | null = null
  private syncListeners = new Set<(listeners: PresenceState[]) => void>()
  private visibilityHandler: (() => void) | null = null
  private lastCode: string | null = null

  onSync(callback: (listeners: PresenceState[]) => void): () => void {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  join(code: string, data: PresenceState): void {
    if (this.channel) {
      try { this.channel.unsubscribe() } catch { /* ignore */ }
      supabase.removeChannel(this.channel)
      this.channel = null
    }

    this.myPresence = data
    this.lastCode = code
    this.doJoin(code, data)

    // iOS Safari: re-join presence when the page becomes visible again
    // (WebSocket may have been suspended while in background)
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && this.lastCode && this.myPresence) {
        // Re-track presence to ensure speaker sees us
        if (this.channel) {
          this.channel.track(this.myPresence).catch(() => {
            // Channel might be stale, re-join entirely
            console.error('[Supabase] Presence re-track failed, re-joining...')
            if (this.lastCode && this.myPresence) {
              this.doJoin(this.lastCode, this.myPresence)
            }
          })
        }
      }
    }
    document.addEventListener('visibilitychange', this.visibilityHandler)
  }

  private doJoin(code: string, data: PresenceState): void {
    if (this.channel) {
      try { this.channel.unsubscribe() } catch { /* ignore */ }
      supabase.removeChannel(this.channel)
      this.channel = null
    }

    const channel = supabase.channel(getChannelName(code) + '-presence')

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>()
      const allListeners: PresenceState[] = []
      for (const key of Object.keys(state)) {
        for (const presence of state[key]) {
          allListeners.push({
            deviceName: presence.deviceName,
            targetLanguage: presence.targetLanguage,
            joinedAt: presence.joinedAt,
            // Pass through fallback translation data from speaker
            lastChunks: presence.lastChunks,
            lastChunkBatch: presence.lastChunkBatch,
          })
        }
      }
      this.syncListeners.forEach(fn => fn(allListeners))
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(data)
      }
    })

    this.channel = channel
  }

  async updatePresence(data: Partial<PresenceState>): Promise<void> {
    if (!this.channel || !this.myPresence) return
    const merged = { ...this.myPresence, ...data }
    this.myPresence = merged
    await this.channel.track(merged)
  }

  leave(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
      this.visibilityHandler = null
    }
    this.lastCode = null
    if (this.channel) {
      this.channel.untrack()
      try { this.channel.unsubscribe() } catch { /* ignore */ }
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
}
