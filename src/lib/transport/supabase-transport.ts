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
  }

  private doSubscribe(code: string, handlers: BroadcastHandlers): void {
    // Clean up existing
    if (this.channel) {
      supabase.removeChannel(this.channel)
      this.channel = null
    }

    const channel = supabase.channel(getChannelName(code))

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
          console.warn(`[Supabase] Retry in ${delay}ms (${this.retries}/${MAX_RETRIES})`)
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
    if (!this.channel) return
    this.channel.send({ type: 'broadcast', event, payload })
  }

  unsubscribe(): void {
    this.clearRetryTimer()
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
    if (this.channel) {
      this.channel.untrack()
      supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
}
