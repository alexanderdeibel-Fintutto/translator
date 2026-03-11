// Supabase Realtime transport — wraps the existing Supabase channel logic
// Used when internet is available (cloud mode)

import { supabase } from '@/lib/supabase'
import { getChannelName } from '@/lib/session'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { TranslationChunk, SessionInfo, StatusMessage, PresenceState } from '@/lib/session'
import type { BroadcastTransport, BroadcastHandlers, PresenceTransport } from './types'

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

  get isConnected(): boolean {
    return this.connected
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
    this.clearRetryTimer()
    this.doSubscribe(code, handlers)

    // iOS Safari: WebSocket can silently disconnect when the browser goes to
    // background or the screen locks. Re-subscribe when the page becomes visible again.
    this.clearVisibilityHandler()
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && this.subscribeArgs && !this.connected) {
        console.log('[Supabase] Page visible again, reconnecting broadcast channel...')
        this.retries = 0
        this.doSubscribe(this.subscribeArgs.code, this.subscribeArgs.handlers)
      }
    }
    document.addEventListener('visibilitychange', this.visibilityHandler)

    // Keepalive: periodically check if the channel is still alive.
    // Supabase Realtime channels can silently drop on mobile browsers.
    this.clearKeepalive()
    this.keepaliveTimer = setInterval(() => {
      if (!this.subscribeArgs) return
      if (!this.connected && this.channel) {
        console.log('[Supabase] Keepalive detected disconnected channel, re-subscribing...')
        this.retries = 0
        this.doSubscribe(this.subscribeArgs.code, this.subscribeArgs.handlers)
      }
    }, 15_000) // check every 15 seconds
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

  private doSubscribe(code: string, handlers: BroadcastHandlers): void {
    // Clean up existing
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
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
        handler(payload as TranslationChunk)
      })
    }

    if (handlers.onSessionInfo) {
      const handler = handlers.onSessionInfo
      channel.on('broadcast', { event: 'session_info' }, ({ payload }) => {
        handler(payload as SessionInfo)
      })
    }

    if (handlers.onStatus) {
      const handler = handlers.onStatus
      channel.on('broadcast', { event: 'status' }, ({ payload }) => {
        handler(payload as StatusMessage)
      })
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        this.setConnected(true)
        this.retries = 0
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
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
    if (!this.channel || !this.connected) return
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
    if (this.channel) {
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
            console.log('[Supabase] Presence re-track failed, re-joining...')
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
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
}
