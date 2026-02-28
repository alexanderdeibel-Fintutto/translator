// BLE Discovery Service
// Speaker: Advertises a BLE beacon with session code so nearby listeners can auto-discover
// Listener: Scans for BLE beacons to find active sessions without QR codes
//
// Uses @capgo/capacitor-bluetooth-low-energy for both peripheral (speaker) and central (listener) modes.
// BLE is used purely for DISCOVERY — actual data transport goes over WiFi/WebSocket.

import { Capacitor } from '@capacitor/core'
import { getTranslation, type UILanguage } from '@/lib/i18n'

// Our custom BLE service UUID for GuideTranslator session discovery
// Generated UUID, unique to our app
export const GT_SERVICE_UUID = 'd7e84cb1-ff5c-4f3d-a066-1f3f4d54e3a7'

// Device name prefix — session code is appended (e.g., "GT-TR-A3K9")
export const GT_BLE_PREFIX = 'GT-'

export interface DiscoveredSession {
  sessionCode: string
  deviceName: string
  deviceId: string
  rssi: number
  /** Timestamp when last seen */
  lastSeen: number
}

/**
 * Check if BLE is available on this platform.
 */
export function isBleAvailable(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Start BLE advertising as a peripheral (speaker side).
 * Advertises our service UUID with the session code in the device name.
 *
 * The device name is limited to ~8 chars in BLE advertising (to fit in 31 bytes),
 * so we use "GT-TR-A3K9" format (10 chars, borderline but works on most devices).
 */
export async function startBleAdvertising(sessionCode: string): Promise<void> {
  if (!isBleAvailable()) return

  const { BluetoothLowEnergy } = await import('@capgo/capacitor-bluetooth-low-energy')

  // Initialize in peripheral mode
  await BluetoothLowEnergy.initialize({ mode: 'peripheral' })

  // Request permissions
  const permissions = await BluetoothLowEnergy.checkPermissions()
  if (permissions.bluetooth !== 'granted') {
    await BluetoothLowEnergy.requestPermissions()
  }

  // Check availability
  const { enabled } = await BluetoothLowEnergy.isEnabled()
  if (!enabled) {
    console.warn('[BLE] Bluetooth is not enabled')
    throw new Error(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.bluetoothNotEnabled'))
  }

  // Start advertising with session code in the device name
  const deviceName = `${GT_BLE_PREFIX}${sessionCode}`
  await BluetoothLowEnergy.startAdvertising({
    name: deviceName,
    services: [GT_SERVICE_UUID],
    includeName: true,
  })

  console.log(`[BLE] Advertising started: ${deviceName}`)
}

/**
 * Stop BLE advertising.
 */
export async function stopBleAdvertising(): Promise<void> {
  if (!isBleAvailable()) return

  try {
    const { BluetoothLowEnergy } = await import('@capgo/capacitor-bluetooth-low-energy')
    await BluetoothLowEnergy.stopAdvertising()
    console.log('[BLE] Advertising stopped')
  } catch (err) {
    console.warn('[BLE] Error stopping advertising:', err)
  }
}

/**
 * Start scanning for nearby GuideTranslator sessions (listener side).
 * Calls onDiscovered whenever a new or updated session is found.
 *
 * Returns a cleanup function to stop scanning.
 */
export async function startBleScanning(
  onDiscovered: (session: DiscoveredSession) => void,
): Promise<() => void> {
  if (!isBleAvailable()) {
    return () => {}
  }

  const { BluetoothLowEnergy } = await import('@capgo/capacitor-bluetooth-low-energy')

  // Initialize in central mode
  await BluetoothLowEnergy.initialize({ mode: 'central' })

  // Request permissions
  const permissions = await BluetoothLowEnergy.checkPermissions()
  if (permissions.bluetooth !== 'granted') {
    await BluetoothLowEnergy.requestPermissions()
  }

  // Check availability
  const { enabled } = await BluetoothLowEnergy.isEnabled()
  if (!enabled) {
    console.warn('[BLE] Bluetooth is not enabled for scanning')
    return () => {}
  }

  // Listen for scanned devices
  const listener = await BluetoothLowEnergy.addListener('deviceScanned', (event) => {
    const device = event.device
    const name = device.name || ''

    // Only handle our devices (name starts with GT- prefix)
    if (!name.startsWith(GT_BLE_PREFIX)) return

    // Extract session code from device name: "GT-TR-A3K9" → "TR-A3K9"
    const sessionCode = name.slice(GT_BLE_PREFIX.length)
    if (!sessionCode || sessionCode.length < 4) return

    onDiscovered({
      sessionCode,
      deviceName: name,
      deviceId: device.deviceId,
      rssi: device.rssi ?? -100,
      lastSeen: Date.now(),
    })
  })

  // Start scanning for our service UUID
  await BluetoothLowEnergy.startScan({
    services: [GT_SERVICE_UUID],
    allowDuplicates: true, // We want RSSI updates
  })

  console.log('[BLE] Scanning started for GT sessions')

  // Return cleanup function
  return async () => {
    try {
      await BluetoothLowEnergy.stopScan()
      await listener.remove()
      console.log('[BLE] Scanning stopped')
    } catch (err) {
      console.warn('[BLE] Error stopping scan:', err)
    }
  }
}

/**
 * Parse a session code from a BLE device name.
 */
export function parseSessionFromDeviceName(name: string): string | null {
  if (!name.startsWith(GT_BLE_PREFIX)) return null
  const code = name.slice(GT_BLE_PREFIX.length)
  // Validate format: TR-XXXX
  if (/^TR-[A-Z0-9]{4}$/i.test(code)) return code
  return null
}
