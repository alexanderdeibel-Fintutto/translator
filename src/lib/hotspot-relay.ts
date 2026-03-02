// TypeScript wrapper for the native HotspotRelay Capacitor plugin.
// Provides hotspot creation (Android) and embedded WebSocket relay (both platforms).

import { registerPlugin, Capacitor } from '@capacitor/core'

// --- Plugin interface ---

export interface HotspotStartResult {
  ssid: string
  password: string
  serverUrl: string
  gatewayIp: string
  port: number
  /** iOS only: true when user must manually enable Personal Hotspot */
  manualHotspotRequired?: boolean
}

export interface RelayStartResult {
  serverUrl: string
  localIp: string
  port: number
}

export interface HotspotStatus {
  isRunning: boolean
  hasRelay: boolean
  stats?: {
    status: string
    server: string
    version: string
    sessions: number
    totalClients?: number
  }
}

export interface HotspotRelayPlugin {
  /**
   * Start the hotspot and embedded relay server.
   * Android: Creates a LocalOnlyHotspot programmatically + starts WS relay.
   * iOS: Starts WS relay only; user must enable Personal Hotspot manually.
   */
  startHotspot(options?: { port?: number }): Promise<HotspotStartResult>

  /**
   * Start only the relay server (without hotspot).
   * Useful when user has already enabled a hotspot or is on a local network.
   */
  startRelayOnly(options?: { port?: number }): Promise<RelayStartResult>

  /**
   * Stop the hotspot and relay server.
   */
  stopHotspot(): Promise<{ stopped: boolean }>

  /**
   * Get current status.
   */
  getStatus(): Promise<HotspotStatus>

  /**
   * Listen for events (e.g., hotspotStopped).
   */
  addListener(
    eventName: 'hotspotStopped',
    listenerFunc: () => void,
  ): Promise<{ remove: () => void }>
}

// Register the native plugin
const HotspotRelay = registerPlugin<HotspotRelayPlugin>('HotspotRelay')

export default HotspotRelay

// --- Utility functions ---

/**
 * Check if the native HotspotRelay plugin is available (i.e., running on a device).
 */
export function isHotspotSupported(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Check if the current platform supports programmatic hotspot creation.
 * Only Android can do this; iOS requires manual activation.
 */
export function canCreateHotspotProgrammatically(): boolean {
  return Capacitor.getPlatform() === 'android'
}

/**
 * Generate a WiFi QR code string in the standard format.
 * When scanned by iOS (11+) or Android (10+), the device auto-joins the network.
 *
 * Format: WIFI:T:<security>;S:<SSID>;P:<password>;H:<hidden>;;
 *
 * @see https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11
 */
export function generateWifiQRString(ssid: string, password: string): string {
  // Escape special characters in SSID and password
  const escapeWifi = (s: string) =>
    s.replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/:/g, '\\:')
      .replace(/"/g, '\\"')
      .replace(/,/g, '\\,')

  return `WIFI:T:WPA;S:${escapeWifi(ssid)};P:${escapeWifi(password)};;`
}
