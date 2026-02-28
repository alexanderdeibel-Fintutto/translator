// Connection manager — detects available transports and manages switching
// Priority: local WebSocket (if configured/available) > Supabase (if online)

import { getNetworkStatus } from '@/lib/offline/network-status'
import { SupabaseBroadcastTransport, SupabasePresenceTransport } from './supabase-transport'
import { LocalBroadcastTransport, LocalPresenceTransport, releaseConnection } from './local-ws-transport'
import type { BroadcastTransport, PresenceTransport, ConnectionMode, ConnectionConfig, HotspotInfo } from './types'

// Default relay server port (matches relay-server/server.js)
const DEFAULT_LOCAL_PORT = 8765

// Common router gateway IPs to probe
const COMMON_ROUTER_IPS = [
  '192.168.8.1',   // GL.iNet default
  '192.168.1.1',   // Most common router IP
  '192.168.0.1',   // Alternative common
  '10.0.0.1',      // Some hotspots
  '172.20.10.1',   // iOS Personal Hotspot
  '192.168.43.1',  // Android Hotspot
]

export interface TransportPair {
  broadcast: BroadcastTransport
  presence: PresenceTransport
  mode: 'cloud' | 'local' | 'ble'
  serverUrl?: string
  /** Populated when mode was 'hotspot' — contains WiFi credentials for QR code */
  hotspotInfo?: HotspotInfo
}

/**
 * Probe a local WebSocket server to check if it's running.
 * Uses HTTP health endpoint for quick check.
 */
export async function probeLocalServer(url: string, timeoutMs = 2000): Promise<boolean> {
  try {
    // Convert ws:// to http:// for health check
    const httpUrl = url.replace(/^ws(s)?:\/\//, 'http$1://').replace(/\/$/, '')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(`${httpUrl}/health`, {
      signal: controller.signal,
      mode: 'cors',
    })
    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Auto-discover a local relay server on the network.
 * Probes common router IPs in parallel.
 */
export async function discoverLocalServer(port = DEFAULT_LOCAL_PORT): Promise<string | null> {
  const probes = COMMON_ROUTER_IPS.map(async (ip) => {
    const url = `ws://${ip}:${port}`
    const found = await probeLocalServer(url, 1500)
    return found ? url : null
  })

  const results = await Promise.all(probes)
  return results.find(url => url !== null) ?? null
}

/**
 * Create the appropriate transport pair based on configuration.
 */
export function createTransports(config: ConnectionConfig, hotspotInfo?: HotspotInfo): TransportPair {
  if ((config.mode === 'local' || config.mode === 'hotspot') && config.localServerUrl) {
    return {
      broadcast: new LocalBroadcastTransport(config.localServerUrl),
      presence: new LocalPresenceTransport(config.localServerUrl),
      mode: 'local',
      serverUrl: config.localServerUrl,
      hotspotInfo,
    }
  }

  // Default: Supabase cloud
  return {
    broadcast: new SupabaseBroadcastTransport(),
    presence: new SupabasePresenceTransport(),
    mode: 'cloud',
  }
}

/**
 * Start a hotspot + embedded relay server on this device.
 * Android: Creates LocalOnlyHotspot programmatically.
 * iOS: Starts relay only; user must enable Personal Hotspot manually.
 *
 * Returns a TransportPair connected to the embedded relay, plus hotspot credentials.
 */
export async function startHotspotTransport(port = DEFAULT_LOCAL_PORT): Promise<TransportPair> {
  const { default: HotspotRelay } = await import('@/lib/hotspot-relay')

  const result = await HotspotRelay.startHotspot({ port })

  const hotspotInfo: HotspotInfo = {
    ssid: result.ssid,
    password: result.password,
    serverUrl: result.serverUrl,
    gatewayIp: result.gatewayIp,
    port: result.port,
    manualHotspotRequired: result.manualHotspotRequired,
  }

  return createTransports(
    { mode: 'hotspot', localServerUrl: result.serverUrl },
    hotspotInfo,
  )
}

/**
 * Create BLE transport pair for the speaker side.
 * Starts the native GATT server and returns speaker transports.
 */
export async function startBleTransport(
  sessionCode: string,
  sourceLanguage: string,
): Promise<TransportPair> {
  const { startBleServer, BleSpeakerBroadcastTransport, BleSpeakerPresenceTransport } =
    await import('@/lib/ble-transport')

  await startBleServer(sessionCode, sourceLanguage)

  return {
    broadcast: new BleSpeakerBroadcastTransport(),
    presence: new BleSpeakerPresenceTransport(),
    mode: 'ble',
  }
}

/**
 * Create BLE transport pair for the listener side.
 * Connects to the speaker's GATT server via BLE device ID.
 */
export async function createBleListenerTransports(bleDeviceId: string): Promise<TransportPair> {
  const { BleBroadcastTransport, BlePresenceTransport } = await import('@/lib/ble-transport')

  return {
    broadcast: new BleBroadcastTransport(bleDeviceId),
    presence: new BlePresenceTransport(bleDeviceId),
    mode: 'ble',
  }
}

/**
 * Stop the BLE GATT server.
 */
export async function stopBleTransport(): Promise<void> {
  try {
    const { stopBleServer } = await import('@/lib/ble-transport')
    await stopBleServer()
  } catch (err) {
    console.warn('[ConnectionManager] Error stopping BLE transport:', err)
  }
}

/**
 * Stop the hotspot and embedded relay server.
 */
export async function stopHotspotTransport(): Promise<void> {
  try {
    const { default: HotspotRelay } = await import('@/lib/hotspot-relay')
    await HotspotRelay.stopHotspot()
  } catch (err) {
    console.warn('[ConnectionManager] Error stopping hotspot:', err)
  }
}

/**
 * Auto-select the best transport:
 * 1. If localServerUrl is provided, use it
 * 2. If offline, try to discover local server
 * 3. If online, use Supabase
 */
export async function autoSelectTransport(
  config: ConnectionConfig
): Promise<TransportPair> {
  const network = getNetworkStatus()

  // Hotspot mode — start embedded relay on this device
  if (config.mode === 'hotspot') {
    return startHotspotTransport()
  }

  // BLE mode — direct GATT transport (no WiFi needed)
  if (config.mode === 'ble') {
    if (config.bleDeviceId) {
      // Listener side — connect to speaker's GATT server
      return await createBleListenerTransports(config.bleDeviceId)
    }
    if (config.bleSessionCode) {
      // Speaker side — start GATT server with session code
      return startBleTransport(config.bleSessionCode, config.bleSourceLanguage || 'de')
    }
    // Fallback — no session code yet, return placeholder
    return createTransports({ mode: 'cloud' })
  }

  // Explicit local mode
  if (config.mode === 'local') {
    let serverUrl = config.localServerUrl

    if (!serverUrl) {
      // Try to discover
      serverUrl = await discoverLocalServer() ?? undefined
    }

    if (serverUrl) {
      const reachable = await probeLocalServer(serverUrl)
      if (reachable) {
        return createTransports({ mode: 'local', localServerUrl: serverUrl })
      }
    }

    // Local requested but not available — still try, will reconnect
    if (serverUrl) {
      return createTransports({ mode: 'local', localServerUrl: serverUrl })
    }
  }

  // Auto mode
  if (config.mode === 'auto') {
    // If offline, try local discovery
    if (network.isOffline) {
      const serverUrl = config.localServerUrl || await discoverLocalServer()
      if (serverUrl) {
        return createTransports({ mode: 'local', localServerUrl: serverUrl })
      }
    }

    // If local server URL is configured, check if reachable
    if (config.localServerUrl) {
      const reachable = await probeLocalServer(config.localServerUrl)
      if (reachable) {
        return createTransports({ mode: 'local', localServerUrl: config.localServerUrl })
      }
    }
  }

  // Default: cloud
  return createTransports({ mode: 'cloud' })
}

/**
 * Clean up all local connections.
 */
export function cleanupLocalConnections(serverUrl?: string): void {
  if (serverUrl) {
    releaseConnection(serverUrl)
  }
}

/**
 * Build the session URL for QR code.
 * For local mode, includes the WebSocket server URL as a parameter.
 */
export function getSessionUrlWithTransport(
  code: string,
  transport: TransportPair
): string {
  const base = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://translator.fintutto.cloud'

  const url = new URL(`${base}/live/${code}`)

  if (transport.mode === 'local' && transport.serverUrl) {
    url.searchParams.set('ws', transport.serverUrl)
  }

  if (transport.mode === 'ble') {
    url.searchParams.set('ble', '1')
  }

  return url.toString()
}

/**
 * Parse a session URL to extract transport config.
 */
export function parseSessionUrl(url: string): { code: string; localServerUrl?: string } {
  try {
    const parsed = new URL(url)
    const pathMatch = parsed.pathname.match(/\/live\/([A-Z0-9-]+)/i)
    const code = pathMatch?.[1] ?? ''
    const ws = parsed.searchParams.get('ws') ?? undefined
    return { code, localServerUrl: ws }
  } catch {
    return { code: '' }
  }
}
