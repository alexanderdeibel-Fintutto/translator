// Fintutto Art Guide — Indoor Positioning Service
// Combines BLE Beacons, WiFi Fingerprinting, and GPS for location detection
// Automatically selects the best available method per venue

import type { Beacon, PositioningConfig, GpsZone } from './types'

// ============================================================================
// Position Result
// ============================================================================

export interface PositionResult {
  method: 'ble' | 'wifi' | 'gps' | 'manual'
  confidence: number             // 0-1
  roomId: string | null
  venueId: string | null
  floorId: string | null
  // For GPS/outdoor
  lat?: number
  lng?: number
  accuracy?: number              // meters
  // For indoor floorplan
  floorplanX?: number            // percentage 0-100
  floorplanY?: number
  // Nearest artwork
  nearestArtworkId?: string | null
  nearestArtworkDistance?: number // meters (estimated)
  // Triggered zone
  triggeredZone?: GpsZone | null
  timestamp: number
}

export type PositionListener = (position: PositionResult) => void

// ============================================================================
// BLE Beacon Scanner
// ============================================================================

interface BeaconReading {
  uuid: string
  major: number
  minor: number
  rssi: number
  timestamp: number
}

/**
 * BLE Beacon positioning using iBeacon protocol.
 * Uses the existing @capacitor-community/bluetooth-le dependency.
 * Matches detected beacons against registered beacons in the database.
 */
export class BlePositionProvider {
  private beaconRegistry: Map<string, Beacon> = new Map()
  private readings: BeaconReading[] = []
  private smoothingWindow: number
  private scanIntervalMs: number
  private scanTimer: ReturnType<typeof setInterval> | null = null
  private listener: PositionListener | null = null

  constructor(config: PositioningConfig) {
    this.smoothingWindow = config.ble_smoothing_window
    this.scanIntervalMs = config.ble_scan_interval_ms
  }

  /** Register beacons from database */
  setBeacons(beacons: Beacon[]): void {
    this.beaconRegistry.clear()
    for (const beacon of beacons) {
      const key = `${beacon.beacon_uuid}|${beacon.major}|${beacon.minor}`
      this.beaconRegistry.set(key, beacon)
    }
  }

  /** Start scanning for beacons */
  async start(listener: PositionListener): Promise<void> {
    this.listener = listener

    // Check if BLE is available (Capacitor native only)
    if (typeof window === 'undefined') return

    try {
      const { BleClient } = await import('@capacitor-community/bluetooth-le')
      await BleClient.initialize()

      this.scanTimer = setInterval(async () => {
        try {
          // Scan for iBeacon advertisements
          await BleClient.requestLEScan(
            { allowDuplicates: true },
            (result) => {
              // Parse iBeacon data from manufacturer specific data
              const beaconData = parseIBeaconData(result.manufacturerData)
              if (beaconData) {
                this.onBeaconDetected({
                  uuid: beaconData.uuid,
                  major: beaconData.major,
                  minor: beaconData.minor,
                  rssi: result.rssi ?? -100,
                  timestamp: Date.now(),
                })
              }
            }
          )

          // Stop scan after a short window
          setTimeout(() => BleClient.stopLEScan().catch(() => {}), 1000)
        } catch (err) {
          console.warn('[BLE] Scan error:', err)
        }
      }, this.scanIntervalMs)
    } catch (err) {
      console.warn('[BLE] BLE not available:', err)
    }
  }

  stop(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer)
      this.scanTimer = null
    }
    this.listener = null
  }

  private onBeaconDetected(reading: BeaconReading): void {
    // Add to readings buffer
    this.readings.push(reading)

    // Keep only recent readings (within smoothing window)
    const cutoff = Date.now() - (this.smoothingWindow * this.scanIntervalMs)
    this.readings = this.readings.filter(r => r.timestamp > cutoff)

    // Find the strongest beacon signal (smoothed RSSI)
    const averaged = this.getSmoothedReadings()
    if (averaged.length === 0) return

    // Sort by signal strength (highest = closest)
    averaged.sort((a, b) => b.rssi - a.rssi)
    const strongest = averaged[0]

    // Look up beacon in registry
    const key = `${strongest.uuid}|${strongest.major}|${strongest.minor}`
    const beacon = this.beaconRegistry.get(key)

    if (beacon && this.listener) {
      this.listener({
        method: 'ble',
        confidence: rssiToConfidence(strongest.rssi, beacon.signal_threshold),
        roomId: beacon.room_id,
        venueId: beacon.venue_id,
        floorId: beacon.floor_id ?? null,
        floorplanX: beacon.position_x ?? undefined,
        floorplanY: beacon.position_y ?? undefined,
        nearestArtworkId: null, // resolved by caller
        timestamp: Date.now(),
      })
    }
  }

  private getSmoothedReadings(): BeaconReading[] {
    // Group by beacon identity and average RSSI
    const groups = new Map<string, number[]>()
    for (const r of this.readings) {
      const key = `${r.uuid}|${r.major}|${r.minor}`
      const arr = groups.get(key) || []
      arr.push(r.rssi)
      groups.set(key, arr)
    }

    return Array.from(groups.entries()).map(([key, rssis]) => {
      const [uuid, major, minor] = key.split('|')
      const avgRssi = rssis.reduce((a, b) => a + b, 0) / rssis.length
      return {
        uuid,
        major: parseInt(major),
        minor: parseInt(minor),
        rssi: avgRssi,
        timestamp: Date.now(),
      }
    })
  }
}

// ============================================================================
// GPS Position Provider (for outdoor venues)
// ============================================================================

export class GpsPositionProvider {
  private zones: GpsZone[] = []
  private watchId: number | null = null
  private listener: PositionListener | null = null
  private config: PositioningConfig

  constructor(config: PositioningConfig) {
    this.config = config
  }

  setZones(zones: GpsZone[]): void {
    this.zones = zones
  }

  start(listener: PositionListener): void {
    this.listener = listener

    if (!navigator.geolocation) {
      console.warn('[GPS] Geolocation not available')
      return
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords

        // Check accuracy threshold
        if (accuracy > this.config.gps_accuracy_threshold_meters) return

        // Find triggered zone
        const triggeredZone = this.findTriggeredZone(latitude, longitude)

        if (this.listener) {
          this.listener({
            method: 'gps',
            confidence: Math.min(1, this.config.gps_accuracy_threshold_meters / (accuracy || 50)),
            roomId: triggeredZone?.room_id ?? null,
            venueId: triggeredZone?.venue_id ?? null,
            floorId: null,
            lat: latitude,
            lng: longitude,
            accuracy,
            triggeredZone,
            nearestArtworkId: triggeredZone?.trigger_artwork_id ?? null,
            timestamp: Date.now(),
          })
        }
      },
      (err) => console.warn('[GPS] Error:', err.message),
      {
        enableHighAccuracy: true,
        maximumAge: this.config.gps_update_interval_ms,
        timeout: 10000,
      }
    )
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.listener = null
  }

  private findTriggeredZone(lat: number, lng: number): GpsZone | null {
    for (const zone of this.zones) {
      if (!zone.is_active) continue
      const distance = haversineDistance(lat, lng, zone.center_lat, zone.center_lng)
      if (distance <= zone.trigger_radius_meters) {
        return zone
      }
    }
    return null
  }
}

// ============================================================================
// WiFi Fingerprint Provider
// ============================================================================

export interface WiFiFingerprintSample {
  room_id: string
  fingerprint: Array<{ bssid: string; rssi: number }>
}

/**
 * WiFi fingerprinting for indoor positioning without beacons.
 * Compares current WiFi signals against pre-calibrated room fingerprints.
 * Note: WiFi scanning requires native API (Capacitor plugin or WebRTC hacks).
 */
export class WiFiPositionProvider {
  private samples: WiFiFingerprintSample[] = []
  private venueId: string | null = null

  setSamples(samples: WiFiFingerprintSample[], venueId: string): void {
    this.samples = samples
    this.venueId = venueId
  }

  /**
   * Match current WiFi scan against fingerprints.
   * Returns the best matching room ID.
   */
  matchRoom(currentScan: Array<{ bssid: string; rssi: number }>): PositionResult | null {
    if (this.samples.length === 0 || currentScan.length === 0) return null

    let bestMatch: { roomId: string; score: number } | null = null

    for (const sample of this.samples) {
      const score = calculateFingerprintSimilarity(currentScan, sample.fingerprint)
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { roomId: sample.room_id, score }
      }
    }

    if (!bestMatch || bestMatch.score < 0.4) return null

    return {
      method: 'wifi',
      confidence: bestMatch.score,
      roomId: bestMatch.roomId,
      venueId: this.venueId,
      floorId: null,
      timestamp: Date.now(),
    }
  }
}

// ============================================================================
// Unified Position Manager
// ============================================================================

/**
 * Manages all positioning providers and selects the best result.
 * Automatically enables/disables providers based on venue config.
 */
export class PositionManager {
  private bleProvider: BlePositionProvider | null = null
  private gpsProvider: GpsPositionProvider | null = null
  private wifiProvider: WiFiPositionProvider | null = null
  private currentPosition: PositionResult | null = null
  private listeners: Set<PositionListener> = new Set()

  subscribe(listener: PositionListener): () => void {
    this.listeners.add(listener)
    if (this.currentPosition) listener(this.currentPosition)
    return () => this.listeners.delete(listener)
  }

  async initialize(
    config: PositioningConfig,
    beacons: Beacon[],
    zones: GpsZone[],
    wifiSamples: WiFiFingerprintSample[],
  ): Promise<void> {
    this.stop()

    const onPosition = (pos: PositionResult) => {
      // Only update if confidence is better than current
      if (!this.currentPosition || pos.confidence > this.currentPosition.confidence || pos.timestamp - this.currentPosition.timestamp > 5000) {
        this.currentPosition = pos
        this.listeners.forEach(fn => fn(pos))
      }
    }

    // Initialize enabled providers
    if (config.methods_enabled.includes('ble') && beacons.length > 0) {
      this.bleProvider = new BlePositionProvider(config)
      this.bleProvider.setBeacons(beacons)
      await this.bleProvider.start(onPosition)
    }

    if (config.methods_enabled.includes('gps') && zones.length > 0) {
      this.gpsProvider = new GpsPositionProvider(config)
      this.gpsProvider.setZones(zones)
      this.gpsProvider.start(onPosition)
    }

    if (config.methods_enabled.includes('wifi') && wifiSamples.length > 0) {
      this.wifiProvider = new WiFiPositionProvider()
      this.wifiProvider.setSamples(wifiSamples, config.venue_id)
    }
  }

  stop(): void {
    this.bleProvider?.stop()
    this.gpsProvider?.stop()
    this.bleProvider = null
    this.gpsProvider = null
    this.wifiProvider = null
    this.currentPosition = null
  }

  getPosition(): PositionResult | null {
    return this.currentPosition
  }
}

/** Singleton position manager */
export const positionManager = new PositionManager()

// ============================================================================
// Utility Functions
// ============================================================================

function rssiToConfidence(rssi: number, threshold: number): number {
  // Map RSSI to 0-1 confidence. Closer to 0 = stronger signal
  if (rssi >= -50) return 1.0     // Very close
  if (rssi >= -60) return 0.9
  if (rssi >= -70) return 0.7
  if (rssi >= threshold) return 0.5
  return 0.2
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Earth radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function calculateFingerprintSimilarity(
  scan: Array<{ bssid: string; rssi: number }>,
  reference: Array<{ bssid: string; rssi: number }>,
): number {
  const scanMap = new Map(scan.map(s => [s.bssid, s.rssi]))
  const refMap = new Map(reference.map(r => [r.bssid, r.rssi]))

  // Find common BSSIDs
  const commonBssids = [...scanMap.keys()].filter(b => refMap.has(b))
  if (commonBssids.length === 0) return 0

  // Calculate Euclidean distance of RSSI values
  let sumSquared = 0
  for (const bssid of commonBssids) {
    const diff = (scanMap.get(bssid)! - refMap.get(bssid)!)
    sumSquared += diff * diff
  }

  const distance = Math.sqrt(sumSquared / commonBssids.length)
  // Normalize: 0 distance = 1.0 similarity, 30+ distance = 0
  return Math.max(0, 1 - distance / 30)
}

function parseIBeaconData(
  manufacturerData?: Record<string, DataView>,
): { uuid: string; major: number; minor: number } | null {
  if (!manufacturerData) return null

  // Apple company ID = 0x004C
  const appleData = manufacturerData['76'] || manufacturerData['0x004C']
  if (!appleData || appleData.byteLength < 23) return null

  // iBeacon prefix: 02 15
  if (appleData.getUint8(0) !== 0x02 || appleData.getUint8(1) !== 0x15) return null

  // Parse UUID (bytes 2-17)
  const uuidBytes = []
  for (let i = 2; i < 18; i++) {
    uuidBytes.push(appleData.getUint8(i).toString(16).padStart(2, '0'))
  }
  const uuid = [
    uuidBytes.slice(0, 4).join(''),
    uuidBytes.slice(4, 6).join(''),
    uuidBytes.slice(6, 8).join(''),
    uuidBytes.slice(8, 10).join(''),
    uuidBytes.slice(10, 16).join(''),
  ].join('-')

  const major = appleData.getUint16(18, false)
  const minor = appleData.getUint16(20, false)

  return { uuid, major, minor }
}
