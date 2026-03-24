// Lightweight utility functions for hotspot feature detection.
// Separated from hotspot-relay.ts to avoid pulling in registerPlugin() on static import.

import { Capacitor } from '@capacitor/core'

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
 */
export function generateWifiQRString(ssid: string, password: string): string {
  const escapeWifi = (s: string) =>
    s.replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/:/g, '\\:')
      .replace(/"/g, '\\"')
      .replace(/,/g, '\\,')

  return `WIFI:T:WPA;S:${escapeWifi(ssid)};P:${escapeWifi(password)};;`
}
