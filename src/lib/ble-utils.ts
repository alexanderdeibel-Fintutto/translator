// Lightweight utility functions for BLE feature detection.
// Separated from ble-transport.ts to avoid pulling in registerPlugin() on static import.

import { Capacitor } from '@capacitor/core'

/**
 * Check if BLE GATT transport is available (native platform only).
 */
export function isBleTransportAvailable(): boolean {
  return Capacitor.isNativePlatform()
}
