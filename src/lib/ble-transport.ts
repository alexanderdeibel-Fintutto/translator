// BLE GATT Transport — direct text transport over BLE for micro-groups (2-5 people).
// Speaker runs as GATT Server (peripheral), Listeners connect as GATT Clients (central).
// Used as Tier 4 fallback when no WiFi/hotspot is available.

import { Capacitor, registerPlugin } from '@capacitor/core'
import type { PresenceState } from '@/lib/session'
import type {
  BroadcastTransport,
  BroadcastHandlers,
  PresenceTransport,
} from '@/lib/transport/types'

// --- Native plugin interface ---

interface BleTransportNative {
  startServer(options: {
    sessionCode: string
    sourceLanguage: string
    deviceName?: string
  }): Promise<{ started: boolean; deviceName: string }>

  broadcast(options: { data: string }): Promise<{ sent: boolean; subscribers: number }>
  stopServer(): Promise<{ stopped: boolean }>
  getStatus(): Promise<{ isRunning: boolean; connectedListeners: number; sessionCode: string }>

  addListener(
    event: 'presenceJoined',
    callback: (data: { device: string; data: string }) => void,
  ): Promise<{ remove: () => void }>
  addListener(
    event: 'presenceSync',
    callback: (data: { listeners: string }) => void,
  ): Promise<{ remove: () => void }>
}

const BleTransport = registerPlugin<BleTransportNative>('BleTransport')
export default BleTransport

// --- GATT Transport UUIDs (must match native side) ---

export const BLE_TRANSPORT_SERVICE_UUID = 'd7e84cb2-ff5c-4f3d-a066-1f3f4d54e3a7'
export const BLE_TRANSLATION_CHAR_UUID  = 'd7e84cb3-ff5c-4f3d-a066-1f3f4d54e3a7'
export const BLE_SESSION_INFO_CHAR_UUID = 'd7e84cb4-ff5c-4f3d-a066-1f3f4d54e3a7'
export const BLE_PRESENCE_WRITE_UUID    = 'd7e84cb5-ff5c-4f3d-a066-1f3f4d54e3a7'
export const BLE_PRESENCE_SYNC_UUID     = 'd7e84cb6-ff5c-4f3d-a066-1f3f4d54e3a7'

// Standard CCCD for enabling notifications
const CCCD_UUID = '00002902-0000-1000-8000-00805f9b34fb'

/**
 * Check if BLE GATT transport is available (native platform only).
 */
export function isBleTransportAvailable(): boolean {
  return Capacitor.isNativePlatform()
}

// --- Speaker-side: GATT Server wrapper ---

/**
 * Start the BLE GATT server (speaker side).
 */
export async function startBleServer(
  sessionCode: string,
  sourceLanguage: string,
): Promise<{ deviceName: string }> {
  const result = await BleTransport.startServer({
    sessionCode,
    sourceLanguage,
    deviceName: `GT-${sessionCode}`,
  })
  return { deviceName: result.deviceName }
}

/**
 * Broadcast a translation to all connected BLE listeners.
 */
export async function broadcastViaBle(data: Record<string, unknown>): Promise<number> {
  const json = JSON.stringify(data)
  const result = await BleTransport.broadcast({ data: json })
  return result.subscribers
}

/**
 * Stop the BLE GATT server.
 */
export async function stopBleServer(): Promise<void> {
  await BleTransport.stopServer()
}

// --- Listener-side: GATT Client using @capacitor-community/bluetooth-le ---

// Chunk reassembly buffer per characteristic
const chunkBuffers = new Map<string, Uint8Array[]>()

/**
 * Reassemble chunked BLE notifications.
 * Returns the complete message when all chunks received, null otherwise.
 */
function reassembleChunks(charUuid: string, chunk: DataView): string | null {
  const flags = chunk.getUint8(0)
  const hasMore = (flags & 0x80) !== 0
  const payload = new Uint8Array(chunk.buffer, chunk.byteOffset + 1, chunk.byteLength - 1)

  if (!chunkBuffers.has(charUuid)) {
    chunkBuffers.set(charUuid, [])
  }
  chunkBuffers.get(charUuid)!.push(payload)

  if (hasMore) return null

  // Combine all chunks
  const chunks = chunkBuffers.get(charUuid)!
  chunkBuffers.delete(charUuid)

  const totalLen = chunks.reduce((sum, c) => sum + c.length, 0)
  const combined = new Uint8Array(totalLen)
  let offset = 0
  for (const c of chunks) {
    combined.set(c, offset)
    offset += c.length
  }

  return new TextDecoder().decode(combined)
}

// --- BLE Broadcast Transport (Listener side — connects to GATT server) ---

export class BleBroadcastTransport implements BroadcastTransport {
  readonly type = 'ble' as const
  private connected = false
  private connectionListeners = new Set<(connected: boolean) => void>()
  private cleanups: (() => void)[] = []
  private deviceId: string | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempt = 0
  private maxReconnectAttempts = 5
  private destroyed = false
  private lastCode: string | null = null
  private lastHandlers: BroadcastHandlers | null = null

  constructor(private targetDeviceId: string) {
    this.deviceId = targetDeviceId
  }

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

  private scheduleReconnect() {
    if (this.destroyed || this.reconnectAttempt >= this.maxReconnectAttempts) {
      console.warn(`[BLE Transport] Giving up after ${this.reconnectAttempt} attempts`)
      return
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 16000)
    this.reconnectAttempt++
    console.log(`[BLE Transport] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt}/${this.maxReconnectAttempts})`)
    this.reconnectTimer = setTimeout(() => {
      if (this.destroyed || !this.lastCode || !this.lastHandlers) return
      this.connectAndSubscribe(this.lastCode, this.lastHandlers)
    }, delay)
  }

  async subscribe(code: string, handlers: BroadcastHandlers): Promise<void> {
    this.cleanupConnection()
    this.destroyed = false
    this.reconnectAttempt = 0
    this.lastCode = code
    this.lastHandlers = handlers
    await this.connectAndSubscribe(code, handlers)
  }

  private async connectAndSubscribe(code: string, handlers: BroadcastHandlers): Promise<void> {
    try {
      const { BleClient } = await import('@capacitor-community/bluetooth-le')

      await BleClient.initialize()

      // Connect to the speaker's GATT server
      await BleClient.connect(this.deviceId!, (_deviceId) => {
        console.log('[BLE Transport] Disconnected from', _deviceId)
        this.setConnected(false)
        this.scheduleReconnect()
      })

      this.setConnected(true)
      this.reconnectAttempt = 0 // Reset on successful connection

      // Read session info
      const sessionInfoData = await BleClient.read(
        this.deviceId!,
        BLE_TRANSPORT_SERVICE_UUID,
        BLE_SESSION_INFO_CHAR_UUID,
      )
      try {
        const sessionInfoJson = new TextDecoder().decode(sessionInfoData.buffer)
        const sessionInfo = JSON.parse(sessionInfoJson)
        handlers.onSessionInfo?.({
          sessionCode: sessionInfo.sessionCode,
          speakerName: '',
          sourceLanguage: sessionInfo.sourceLanguage,
          listenerCount: 0,
        })
      } catch (err) {
        console.warn('[BLE Transport] Failed to parse session info:', err)
      }

      // Subscribe to translation notifications
      await BleClient.startNotifications(
        this.deviceId!,
        BLE_TRANSPORT_SERVICE_UUID,
        BLE_TRANSLATION_CHAR_UUID,
        (value) => {
          const json = reassembleChunks(BLE_TRANSLATION_CHAR_UUID, value)
          if (!json) return // Still receiving chunks

          try {
            const data = JSON.parse(json)

            if (data.event === 'translation' && handlers.onTranslation) {
              handlers.onTranslation(data.payload ?? data)
            }
            if (data.event === 'session_info' && handlers.onSessionInfo) {
              handlers.onSessionInfo(data.payload ?? data)
            }
            if (data.event === 'status' && handlers.onStatus) {
              handlers.onStatus(data.payload ?? data)
            }
          } catch (err) {
            console.warn('[BLE Transport] Failed to parse translation:', err)
          }
        },
      )

      this.cleanups.push(() => {
        BleClient.stopNotifications(
          this.deviceId!,
          BLE_TRANSPORT_SERVICE_UUID,
          BLE_TRANSLATION_CHAR_UUID,
        ).catch(() => {})
      })

    } catch (err) {
      console.error('[BLE Transport] Connection failed:', err)
      this.setConnected(false)
      this.scheduleReconnect()
    }
  }

  broadcast(_event: string, _payload: Record<string, unknown>): void {
    // Listeners don't broadcast in BLE mode — speaker uses native plugin directly
    console.warn('[BLE Transport] broadcast() called on listener — not supported in BLE mode')
  }

  private cleanupConnection(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.cleanups.forEach(fn => fn())
    this.cleanups = []
  }

  unsubscribe(): void {
    this.destroyed = true
    this.cleanupConnection()

    if (this.deviceId) {
      import('@capacitor-community/bluetooth-le').then(({ BleClient }) => {
        BleClient.disconnect(this.deviceId!).catch(() => {})
      }).catch(() => {})
    }

    this.setConnected(false)
    this.lastCode = null
    this.lastHandlers = null
    chunkBuffers.clear()
  }
}

// --- BLE Presence Transport (Listener side) ---

export class BlePresenceTransport implements PresenceTransport {
  readonly type = 'ble' as const
  private syncListeners = new Set<(listeners: PresenceState[]) => void>()
  private cleanups: (() => void)[] = []
  private myPresence: PresenceState | null = null

  constructor(private targetDeviceId: string) {}

  onSync(callback: (listeners: PresenceState[]) => void): () => void {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  async join(_code: string, data: PresenceState): Promise<void> {
    this.leave()
    this.myPresence = data

    try {
      const { BleClient } = await import('@capacitor-community/bluetooth-le')

      // Subscribe to presence sync notifications
      await BleClient.startNotifications(
        this.targetDeviceId,
        BLE_TRANSPORT_SERVICE_UUID,
        BLE_PRESENCE_SYNC_UUID,
        (value) => {
          const json = reassembleChunks(BLE_PRESENCE_SYNC_UUID, value)
          if (!json) return

          try {
            const msg = JSON.parse(json)
            if (msg.type === 'presence_sync' && Array.isArray(msg.listeners)) {
              this.syncListeners.forEach(fn => fn(msg.listeners))
            }
          } catch (err) {
            console.warn('[BLE Presence] Failed to parse presence sync:', err)
          }
        },
      )

      this.cleanups.push(() => {
        BleClient.stopNotifications(
          this.targetDeviceId,
          BLE_TRANSPORT_SERVICE_UUID,
          BLE_PRESENCE_SYNC_UUID,
        ).catch(() => {})
      })

      // Write our presence to the speaker
      const presenceData = new TextEncoder().encode(JSON.stringify(data))
      const dataView = new DataView(presenceData.buffer)
      await BleClient.write(
        this.targetDeviceId,
        BLE_TRANSPORT_SERVICE_UUID,
        BLE_PRESENCE_WRITE_UUID,
        dataView,
      )

    } catch (err) {
      console.error('[BLE Presence] Join failed:', err)
    }
  }

  async updatePresence(data: Partial<PresenceState>): Promise<void> {
    if (!this.myPresence) return
    this.myPresence = { ...this.myPresence, ...data }

    try {
      const { BleClient } = await import('@capacitor-community/bluetooth-le')
      const encoded = new TextEncoder().encode(JSON.stringify(this.myPresence))
      const dataView = new DataView(encoded.buffer)
      await BleClient.write(
        this.targetDeviceId,
        BLE_TRANSPORT_SERVICE_UUID,
        BLE_PRESENCE_WRITE_UUID,
        dataView,
      )
    } catch (err) {
      console.warn('[BLE Presence] Update failed:', err)
    }
  }

  leave(): void {
    this.cleanups.forEach(fn => fn())
    this.cleanups = []
    this.myPresence = null
  }
}

// --- Speaker-side BLE Transport (uses native plugin for server + notifies JS) ---

/**
 * Speaker-side broadcast transport.
 * Uses native BleTransport plugin for GATT server.
 * The broadcast() method sends data via the native plugin.
 */
export class BleSpeakerBroadcastTransport implements BroadcastTransport {
  readonly type = 'ble' as const
  private connected = false
  private connectionListeners = new Set<(connected: boolean) => void>()
  private presenceCleanup: { remove: () => void } | null = null

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

  async subscribe(code: string, handlers: BroadcastHandlers): Promise<void> {
    // Speaker: no-op for subscribe — the GATT server is started separately
    // We just mark ourselves as connected once the server is running
    try {
      const status = await BleTransport.getStatus()
      this.setConnected(status.isRunning)
    } catch {
      this.setConnected(false)
    }
  }

  broadcast(event: string, payload: Record<string, unknown>): void {
    const data = JSON.stringify({ event, payload })
    BleTransport.broadcast({ data }).catch(err => {
      console.warn('[BLE Speaker] Broadcast failed:', err)
    })
  }

  unsubscribe(): void {
    this.presenceCleanup?.remove()
    this.presenceCleanup = null
    this.setConnected(false)
  }
}

/**
 * Speaker-side presence transport.
 * Listens for presence events from the native GATT server.
 */
export class BleSpeakerPresenceTransport implements PresenceTransport {
  readonly type = 'ble' as const
  private syncListeners = new Set<(listeners: PresenceState[]) => void>()
  private cleanups: { remove: () => void }[] = []

  onSync(callback: (listeners: PresenceState[]) => void): () => void {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  async join(_code: string, _data: PresenceState): Promise<void> {
    // Listen for presence sync events from native
    const listener = await BleTransport.addListener('presenceSync', (event) => {
      try {
        const listeners = JSON.parse(event.listeners) as PresenceState[]
        this.syncListeners.forEach(fn => fn(listeners))
      } catch (err) {
        console.warn('[BLE Speaker Presence] Failed to parse:', err)
      }
    })

    this.cleanups.push(listener)
  }

  updatePresence(_data: Partial<PresenceState>): void {
    // Speaker presence is managed locally, not via BLE
  }

  leave(): void {
    this.cleanups.forEach(c => c.remove())
    this.cleanups = []
  }
}
