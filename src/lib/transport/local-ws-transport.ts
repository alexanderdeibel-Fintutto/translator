// Local WebSocket transport — connects to a relay server on the local network
// Used for offline mode with portable WiFi router or phone hotspot

import type { PresenceState } from '@/lib/session'
import type {
  BroadcastTransport,
  BroadcastHandlers,
  PresenceTransport,
  ClientMessage,
  ServerMessage,
} from './types'

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000] // Exponential backoff
const PING_INTERVAL = 10_000

/**
 * Shared WebSocket connection for a session.
 * Both broadcast and presence share the same socket.
 */
class LocalWebSocketConnection {
  private ws: WebSocket | null = null
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingTimer: ReturnType<typeof setInterval> | null = null
  private messageListeners = new Set<(msg: ServerMessage) => void>()
  private connectionListeners = new Set<(connected: boolean) => void>()
  private connected = false
  private sessionCode: string | null = null
  private destroyed = false

  constructor(private serverUrl: string) {}

  get isConnected(): boolean {
    return this.connected
  }

  onMessage(callback: (msg: ServerMessage) => void): () => void {
    this.messageListeners.add(callback)
    return () => this.messageListeners.delete(callback)
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback)
    return () => this.connectionListeners.delete(callback)
  }

  connect(sessionCode: string): void {
    this.sessionCode = sessionCode
    this.destroyed = false
    this.doConnect()
  }

  private doConnect(): void {
    if (this.destroyed) return

    try {
      // Connect with session code as query parameter
      const url = `${this.serverUrl}?session=${encodeURIComponent(this.sessionCode || '')}`
      this.ws = new WebSocket(url)
    } catch (err) {
      console.error('[LocalWS] Failed to create WebSocket:', err)
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      console.log('[LocalWS] Connected to', this.serverUrl)
      this.setConnected(true)
      this.reconnectAttempt = 0
      this.startPing()

      // Join session
      if (this.sessionCode) {
        this.send({ type: 'join_session', code: this.sessionCode })
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ServerMessage
        this.messageListeners.forEach(fn => fn(msg))
      } catch (err) {
        console.warn('[LocalWS] Invalid message:', event.data, err)
      }
    }

    this.ws.onclose = () => {
      console.log('[LocalWS] Disconnected')
      this.setConnected(false)
      this.stopPing()
      if (!this.destroyed) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (err) => {
      console.error('[LocalWS] Error:', err)
    }
  }

  send(msg: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify(msg))
  }

  disconnect(): void {
    this.destroyed = true
    this.clearReconnectTimer()
    this.stopPing()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.setConnected(false)
    this.messageListeners.clear()
    this.connectionListeners.clear()
  }

  private setConnected(value: boolean) {
    if (this.connected === value) return
    this.connected = value
    this.connectionListeners.forEach(fn => fn(value))
  }

  private scheduleReconnect() {
    this.clearReconnectTimer()
    const delay = RECONNECT_DELAYS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)]
    this.reconnectAttempt++
    console.log(`[LocalWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt})`)
    this.reconnectTimer = setTimeout(() => this.doConnect(), delay)
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startPing() {
    this.stopPing()
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping')
      }
    }, PING_INTERVAL)
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }
}

// Connection pool — reuse connections per server URL
const connections = new Map<string, LocalWebSocketConnection>()

function getConnection(serverUrl: string): LocalWebSocketConnection {
  let conn = connections.get(serverUrl)
  if (!conn) {
    conn = new LocalWebSocketConnection(serverUrl)
    connections.set(serverUrl, conn)
  }
  return conn
}

export function releaseConnection(serverUrl: string): void {
  const conn = connections.get(serverUrl)
  if (conn) {
    conn.disconnect()
    connections.delete(serverUrl)
  }
}

// --- Broadcast ---

export class LocalBroadcastTransport implements BroadcastTransport {
  readonly type = 'local-ws' as const
  private conn: LocalWebSocketConnection | null = null
  private cleanups: (() => void)[] = []
  private connectionListeners = new Set<(connected: boolean) => void>()

  constructor(private serverUrl: string) {}

  get isConnected(): boolean {
    return this.conn?.isConnected ?? false
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback)
    return () => this.connectionListeners.delete(callback)
  }

  subscribe(code: string, handlers: BroadcastHandlers): void {
    this.unsubscribe()

    this.conn = getConnection(this.serverUrl)

    // Forward connection state
    const connCleanup = this.conn.onConnectionChange((connected) => {
      this.connectionListeners.forEach(fn => fn(connected))
    })
    this.cleanups.push(connCleanup)

    // Listen for broadcast messages
    const msgCleanup = this.conn.onMessage((msg) => {
      if (msg.type !== 'broadcast') return

      if (msg.event === 'translation' && handlers.onTranslation) {
        handlers.onTranslation(msg.payload as never)
      }
      if (msg.event === 'session_info' && handlers.onSessionInfo) {
        handlers.onSessionInfo(msg.payload as never)
      }
      if (msg.event === 'status' && handlers.onStatus) {
        handlers.onStatus(msg.payload as never)
      }
    })
    this.cleanups.push(msgCleanup)

    // Connect
    this.conn.connect(code)

    // Notify initial connection state on next tick
    setTimeout(() => {
      this.connectionListeners.forEach(fn => fn(this.conn?.isConnected ?? false))
    }, 0)
  }

  broadcast(event: string, payload: Record<string, unknown>): void {
    this.conn?.send({ type: 'broadcast', event, payload })
  }

  unsubscribe(): void {
    this.cleanups.forEach(fn => fn())
    this.cleanups = []
    if (this.conn) {
      releaseConnection(this.serverUrl)
      this.conn = null
    }
    this.connectionListeners.forEach(fn => fn(false))
  }
}

// --- Presence ---

export class LocalPresenceTransport implements PresenceTransport {
  readonly type = 'local-ws' as const
  private conn: LocalWebSocketConnection | null = null
  private cleanups: (() => void)[] = []
  private syncListeners = new Set<(listeners: PresenceState[]) => void>()
  private myPresence: PresenceState | null = null

  constructor(private serverUrl: string) {}

  onSync(callback: (listeners: PresenceState[]) => void): () => void {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  join(code: string, data: PresenceState): void {
    this.leave()

    this.myPresence = data
    this.conn = getConnection(this.serverUrl)

    // Listen for presence sync messages
    const msgCleanup = this.conn.onMessage((msg) => {
      if (msg.type === 'presence_sync') {
        this.syncListeners.forEach(fn => fn(msg.listeners))
      }
    })
    this.cleanups.push(msgCleanup)

    // Wait for connection, then send join
    const connCleanup = this.conn.onConnectionChange((connected) => {
      if (connected && this.myPresence) {
        const role = data.targetLanguage === '_speaker' ? 'speaker' : 'listener'
        this.conn?.send({
          type: 'presence_join',
          data: this.myPresence,
          role,
        })
      }
    })
    this.cleanups.push(connCleanup)

    // Connect (may already be connected via broadcast)
    this.conn.connect(code)

    // If already connected, send join immediately
    if (this.conn.isConnected) {
      const role = data.targetLanguage === '_speaker' ? 'speaker' : 'listener'
      this.conn.send({ type: 'presence_join', data, role })
    }
  }

  updatePresence(data: Partial<PresenceState>): void {
    if (!this.myPresence) return
    this.myPresence = { ...this.myPresence, ...data }
    this.conn?.send({ type: 'presence_update', data })
  }

  leave(): void {
    this.conn?.send({ type: 'presence_leave' })
    this.cleanups.forEach(fn => fn())
    this.cleanups = []
    // Don't release the connection — broadcast may still need it
    this.conn = null
    this.myPresence = null
  }
}
