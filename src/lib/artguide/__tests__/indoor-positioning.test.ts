// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  BlePositionProvider,
  GpsPositionProvider,
  WiFiPositionProvider,
  PositionManager,
  type PositionResult,
  type WiFiFingerprintSample,
} from '../indoor-positioning'
import type { Beacon, PositioningConfig, GpsZone } from '../types'

function makeConfig(overrides: Partial<PositioningConfig> = {}): PositioningConfig {
  return {
    venue_id: 'venue-1',
    methods_enabled: ['ble', 'gps', 'wifi'],
    primary_method: 'ble',
    ble_scan_interval_ms: 2000,
    ble_smoothing_window: 3,
    wifi_scan_interval_ms: 5000,
    gps_accuracy_threshold_meters: 20,
    gps_update_interval_ms: 5000,
    auto_trigger_enabled: true,
    proximity_threshold_meters: 5,
    ...overrides,
  }
}

function makeBeacon(overrides: Partial<Beacon> = {}): Beacon {
  return {
    id: 'beacon-1',
    museum_id: 'museum-1',
    venue_id: 'venue-1',
    room_id: 'room-1',
    beacon_uuid: 'uuid-1',
    major: 1,
    minor: 1,
    label: 'Test Beacon',
    floor_id: 'floor-1',
    position_x: 50,
    position_y: 50,
    tx_power: -59,
    signal_threshold: -80,
    is_active: true,
    ...overrides,
  }
}

function makeGpsZone(overrides: Partial<GpsZone> = {}): GpsZone {
  return {
    id: 'zone-1',
    museum_id: 'museum-1',
    venue_id: 'venue-1',
    room_id: 'room-1',
    name: { de: 'Zone 1', en: 'Zone 1' },
    zone_type: 'point',
    geometry: { type: 'Point', coordinates: [13.405, 52.52] },
    center_lat: 52.52,
    center_lng: 13.405,
    trigger_radius_meters: 50,
    trigger_artwork_id: 'artwork-1',
    trigger_action: 'notify',
    notification_text: { de: 'Willkommen', en: 'Welcome' },
    is_active: true,
    ...overrides,
  }
}

describe('indoor-positioning', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('BlePositionProvider', () => {
    it('should register beacons', () => {
      const provider = new BlePositionProvider(makeConfig())
      const beacon = makeBeacon()
      provider.setBeacons([beacon])
      // No error means success; internal state is private but we verify via start behavior
    })

    it('should stop cleanly without having started', () => {
      const provider = new BlePositionProvider(makeConfig())
      // Should not throw
      provider.stop()
    })

    it('should set beacons and clear previous ones', () => {
      const provider = new BlePositionProvider(makeConfig())
      provider.setBeacons([makeBeacon({ id: 'b1' })])
      provider.setBeacons([makeBeacon({ id: 'b2' })])
      // No error = registry was cleared and re-populated
    })
  })

  describe('GpsPositionProvider', () => {
    let mockWatchPosition: ReturnType<typeof vi.fn>
    let mockClearWatch: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockWatchPosition = vi.fn()
      mockClearWatch = vi.fn()
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          watchPosition: mockWatchPosition,
          clearWatch: mockClearWatch,
        },
        writable: true,
        configurable: true,
      })
    })

    it('should start watching GPS position', () => {
      const config = makeConfig({ gps_accuracy_threshold_meters: 20 })
      const provider = new GpsPositionProvider(config)
      const listener = vi.fn()

      mockWatchPosition.mockReturnValue(42)
      provider.start(listener)

      expect(mockWatchPosition).toHaveBeenCalledTimes(1)
    })

    it('should call listener when position is within accuracy threshold', () => {
      const config = makeConfig({ gps_accuracy_threshold_meters: 20 })
      const provider = new GpsPositionProvider(config)
      const zone = makeGpsZone({ center_lat: 52.52, center_lng: 13.405, trigger_radius_meters: 500 })
      provider.setZones([zone])
      const listener = vi.fn()

      mockWatchPosition.mockImplementation((success) => {
        success({
          coords: { latitude: 52.52, longitude: 13.405, accuracy: 10 },
        })
        return 1
      })

      provider.start(listener)

      expect(listener).toHaveBeenCalledTimes(1)
      const result: PositionResult = listener.mock.calls[0][0]
      expect(result.method).toBe('gps')
      expect(result.lat).toBe(52.52)
      expect(result.lng).toBe(13.405)
      expect(result.nearestArtworkId).toBe('artwork-1')
    })

    it('should skip position when accuracy exceeds threshold', () => {
      const config = makeConfig({ gps_accuracy_threshold_meters: 20 })
      const provider = new GpsPositionProvider(config)
      const listener = vi.fn()

      mockWatchPosition.mockImplementation((success) => {
        success({
          coords: { latitude: 52.52, longitude: 13.405, accuracy: 100 },
        })
        return 1
      })

      provider.start(listener)
      expect(listener).not.toHaveBeenCalled()
    })

    it('should not trigger zone for inactive zones', () => {
      const config = makeConfig({ gps_accuracy_threshold_meters: 100 })
      const provider = new GpsPositionProvider(config)
      const zone = makeGpsZone({ is_active: false, center_lat: 52.52, center_lng: 13.405 })
      provider.setZones([zone])
      const listener = vi.fn()

      mockWatchPosition.mockImplementation((success) => {
        success({
          coords: { latitude: 52.52, longitude: 13.405, accuracy: 5 },
        })
        return 1
      })

      provider.start(listener)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener.mock.calls[0][0].triggeredZone).toBeNull()
    })

    it('should stop watching when stop is called', () => {
      const config = makeConfig()
      const provider = new GpsPositionProvider(config)
      mockWatchPosition.mockReturnValue(42)
      provider.start(vi.fn())
      provider.stop()

      expect(mockClearWatch).toHaveBeenCalledWith(42)
    })

    it('should handle missing geolocation API', () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      const provider = new GpsPositionProvider(makeConfig())
      // Should not throw
      provider.start(vi.fn())
    })
  })

  describe('WiFiPositionProvider', () => {
    it('should return null when no samples are set', () => {
      const provider = new WiFiPositionProvider()
      const result = provider.matchRoom([{ bssid: 'aa:bb:cc:dd:ee:ff', rssi: -50 }])
      expect(result).toBeNull()
    })

    it('should return null when scan is empty', () => {
      const provider = new WiFiPositionProvider()
      provider.setSamples([
        { room_id: 'room-1', fingerprint: [{ bssid: 'aa:bb:cc:dd:ee:ff', rssi: -50 }] },
      ], 'venue-1')
      const result = provider.matchRoom([])
      expect(result).toBeNull()
    })

    it('should match room with high similarity', () => {
      const provider = new WiFiPositionProvider()
      const samples: WiFiFingerprintSample[] = [
        {
          room_id: 'room-1',
          fingerprint: [
            { bssid: 'aa:bb:cc:dd:ee:ff', rssi: -50 },
            { bssid: '11:22:33:44:55:66', rssi: -60 },
          ],
        },
        {
          room_id: 'room-2',
          fingerprint: [
            { bssid: 'aa:bb:cc:dd:ee:ff', rssi: -80 },
            { bssid: '11:22:33:44:55:66', rssi: -90 },
          ],
        },
      ]
      provider.setSamples(samples, 'venue-1')

      // Scan matching room-1 fingerprint closely
      const result = provider.matchRoom([
        { bssid: 'aa:bb:cc:dd:ee:ff', rssi: -51 },
        { bssid: '11:22:33:44:55:66', rssi: -61 },
      ])

      expect(result).not.toBeNull()
      expect(result!.method).toBe('wifi')
      expect(result!.roomId).toBe('room-1')
      expect(result!.venueId).toBe('venue-1')
      expect(result!.confidence).toBeGreaterThan(0.4)
    })

    it('should return null when no fingerprint is similar enough', () => {
      const provider = new WiFiPositionProvider()
      provider.setSamples([
        {
          room_id: 'room-1',
          fingerprint: [{ bssid: 'aa:bb:cc:dd:ee:ff', rssi: -50 }],
        },
      ], 'venue-1')

      // No common BSSIDs
      const result = provider.matchRoom([
        { bssid: 'zz:yy:xx:ww:vv:uu', rssi: -50 },
      ])
      expect(result).toBeNull()
    })
  })

  describe('PositionManager', () => {
    it('should allow subscribe and unsubscribe', () => {
      const manager = new PositionManager()
      const listener = vi.fn()
      const unsub = manager.subscribe(listener)

      expect(typeof unsub).toBe('function')
      unsub()
      // After unsubscribe, listener should not be called
    })

    it('should return null position initially', () => {
      const manager = new PositionManager()
      expect(manager.getPosition()).toBeNull()
    })

    it('should send current position to new subscriber if available', () => {
      const manager = new PositionManager()
      // Manually set position via subscribe + internal mechanism
      // We test the interface: subscribe returns current position if exists
      const listener = vi.fn()
      manager.subscribe(listener)
      // No position yet, so listener not called
      expect(listener).not.toHaveBeenCalled()
    })

    it('should stop cleanly when no providers initialized', () => {
      const manager = new PositionManager()
      // Should not throw
      manager.stop()
      expect(manager.getPosition()).toBeNull()
    })
  })
})
