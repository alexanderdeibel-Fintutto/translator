// Supabase Realtime transport — wraps the existing Supabase channel logic
// Used when internet is available (cloud mode)

import { supabase } from '@/lib/supabase'
import { getChannelName } from '@/lib/session'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { TranslationChunk, SessionInfo, StatusMessage, PresenceState } from '@/lib/session'
import type { BroadcastTransport, BroadcastHandlers, PresenceTransport } from './types'

const MAX_RETRIES = 8
const BASE_DELAY = 1500

// Timeout for initial subscription — if not connected within this window, retry
const SUBSCRIBE_TIMEOUT_MS = 10_000

// --- Broadcast ---

export class SupabaseBroadcastTransport implements BroadcastTransport {
  readonly type = 'supabase' as const
  private channel: RealtimeChannel | null = null
  private connected = false
  private retries = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private subscribeTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  private connectionListeners = new Set<(connected: boolean) => void>()
  private subscribeArgs: { code: string; handlers: BroadcastHandlers } | null = null

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

  private clearSubscribeTimeout() {
    if (this.subscribeTimeoutTimer) {
      clearTimeout(this.subscribeTimeoutTimer)
      this.subscribeTimeoutTimer = null
    }
  }

  subscribe(code: string, handlers: BroadcastHandlers): void {
    this.subscribeArgs = { code, handlers }
    this.retries = 0
    this.clearRetryTimer()
    this.clearSubscribeTimeout()
    this.doSubscribe(code, handlers)
  }

  private doSubscribe(code: string, handlers: BroadcastHandlers): void {
    // Clean up existing
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }

    console.info(`[Supabase:Broadcast] Subscribing to channel "${getChannelName(code)}" (attempt ${this.retries + 1})`)

    const channel = supabase.channel(getChannelName(code), {
      config: { broadcast: { ack: true } },
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

    // Set a timeout — if we don't reach SUBSCRIBED within the window, force retry
    this.clearSubscribeTimeout()
    this.subscribeTimeoutTimer = setTimeout(() => {
      if (!this.connected && this.subscribeArgs) {
        console.warn(`[Supabase:Broadcast] Subscription timeout after ${SUBSCRIBE_TIMEOUT_MS}ms — retrying`)
        this.scheduleRetry()
      }
    }, SUBSCRIBE_TIMEOUT_MS)

    channel.subscribe((status) => {
      console.info(`[Supabase:Broadcast] Channel status: ${status}`)
      if (status === 'SUBSCRIBED') {
        this.clearSubscribeTimeout()
        this.setConnected(true)
        this.retries = 0
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        this.clearSubscribeTimeout()
        this.setConnected(false)
        this.scheduleRetry()
      } else if (status === 'CLOSED') {
        this.clearSubscribeTimeout()
        this.setConnected(false)
      }
    })

    this.channel = channel
  }

  private scheduleRetry() {
    if (this.retries >= MAX_RETRIES || !this.subscribeArgs) {
      console.error(`[Supabase:Broadcast] Max retries (${MAX_RETRIES}) reached — giving up`)
      return
    }
    const delay = BASE_DELAY * Math.pow(2, Math.min(this.retries, 4))
    this.retries++
    console.warn(`[Supabase:Broadcast] Retry in ${delay}ms (${this.retries}/${MAX_RETRIES})`)
    this.clearRetryTimer()
    this.retryTimer = setTimeout(() => {
      if (this.subscribeArgs) {
        this.doSubscribe(this.subscribeArgs.code, this.subscribeArgs.handlers)
      }
    }, delay)
  }

  broadcast(event: string, payload: Record<string, unknown>): void {
    if (!this.channel) {
      console.warn('[Supabase:Broadcast] Cannot broadcast — no channel')
      return
    }
    if (!this.connected) {
      console.warn('[Supabase:Broadcast] Broadcasting while disconnected — message may be lost')
    }
    this.channel.send({ type: 'broadcast', event, payload })
  }

  unsubscribe(): void {
    this.clearRetryTimer()
    this.clearSubscribeTimeout()
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
  private joinArgs: { code: string; data: PresenceState } | null = null
  private retries = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private subscribeTimeoutTimer: ReturnType<typeof setTimeout> | null = null

  onSync(callback: (listeners: PresenceState[]) => void): () => void {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  join(code: string, data: PresenceState): void {
    this.joinArgs = { code, data }
    this.retries = 0
    this.clearTimers()
    this.doJoin(code, data)
  }

  private clearTimers() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    if (this.subscribeTimeoutTimer) {
      clearTimeout(this.subscribeTimeoutTimer)
      this.subscribeTimeoutTimer = null
    }
  }

  private doJoin(code: string, data: PresenceState): void {
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }

    this.myPresence = data
    const channelName = getChannelName(code) + '-presence'
    console.info(`[Supabase:Presence] Joining channel "${channelName}" (attempt ${this.retries + 1})`)

    const channel = supabase.channel(channelName)

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

    // Set subscription timeout
    this.subscribeTimeoutTimer = setTimeout(() => {
      if (this.joinArgs && this.retries < MAX_RETRIES) {
        console.warn(`[Supabase:Presence] Subscription timeout after ${SUBSCRIBE_TIMEOUT_MS}ms — retrying`)
        this.scheduleRetry()
      }
    }, SUBSCRIBE_TIMEOUT_MS)

    channel.subscribe(async (status) => {
      console.info(`[Supabase:Presence] Channel status: ${status}`)
      if (status === 'SUBSCRIBED') {
        this.clearTimers()
        this.retries = 0
        try {
          await channel.track(data)
          console.info('[Supabase:Presence] Presence tracked successfully')
        } catch (err) {
          console.error('[Supabase:Presence] Failed to track presence:', err)
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        this.clearTimers()
        this.scheduleRetry()
      } else if (status === 'CLOSED') {
        this.clearTimers()
      }
    })

    this.channel = channel
  }

  private scheduleRetry() {
    if (this.retries >= MAX_RETRIES || !this.joinArgs) {
      console.error(`[Supabase:Presence] Max retries (${MAX_RETRIES}) reached — giving up`)
      return
    }
    const delay = BASE_DELAY * Math.pow(2, Math.min(this.retries, 4))
    this.retries++
    console.warn(`[Supabase:Presence] Retry in ${delay}ms (${this.retries}/${MAX_RETRIES})`)
    this.retryTimer = setTimeout(() => {
      if (this.joinArgs) {
        this.doJoin(this.joinArgs.code, this.joinArgs.data)
      }
    }, delay)
  }

  async updatePresence(data: Partial<PresenceState>): Promise<void> {
    if (!this.channel || !this.myPresence) return
    const merged = { ...this.myPresence, ...data }
    this.myPresence = merged
    await this.channel.track(merged)
  }

  leave(): void {
    this.clearTimers()
    this.joinArgs = null
    this.retries = 0
    if (this.channel) {
      this.channel.untrack()
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
}
