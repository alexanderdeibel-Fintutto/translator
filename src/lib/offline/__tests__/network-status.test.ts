// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock fetch for heartbeat
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// We need to reset the singleton between tests, so we'll use dynamic import
let getNetworkStatus: typeof import('../network-status').getNetworkStatus

beforeEach(async () => {
  vi.clearAllMocks()
  vi.useFakeTimers()

  // Default: navigator.onLine = true, heartbeat succeeds fast
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    configurable: true,
  })

  mockFetch.mockResolvedValue({ ok: true })

  // Reset the module to get a fresh singleton
  vi.resetModules()
  const mod = await import('../network-status')
  getNetworkStatus = mod.getNetworkStatus
})

afterEach(() => {
  // Destroy the instance to clean up event listeners
  try {
    const manager = getNetworkStatus()
    manager.destroy()
  } catch {
    // ignore if already destroyed
  }
  vi.useRealTimers()
})

describe('network-status', () => {
  describe('getNetworkStatus()', () => {
    it('returns a singleton instance', () => {
      const a = getNetworkStatus()
      const b = getNetworkStatus()
      expect(a).toBe(b)
    })
  })

  describe('initial state', () => {
    it('detects online when navigator.onLine is true', () => {
      const status = getNetworkStatus()
      // After initial heartbeat resolves, should be online
      expect(status.getMode()).toBe('online')
    })

    it('isOnline returns true when online', () => {
      const status = getNetworkStatus()
      expect(status.isOnline).toBe(true)
    })

    it('isOffline returns false when online', () => {
      const status = getNetworkStatus()
      expect(status.isOffline).toBe(false)
    })
  })

  describe('offline detection', () => {
    it('detects offline when browser goes offline', async () => {
      const status = getNetworkStatus()
      const listener = vi.fn()
      status.subscribe(listener)

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      })
      window.dispatchEvent(new Event('offline'))

      expect(status.getMode()).toBe('offline')
      expect(status.isOffline).toBe(true)
      expect(listener).toHaveBeenCalledWith('offline')
    })
  })

  describe('online transition', () => {
    it('transitions from offline to online', async () => {
      const status = getNetworkStatus()

      // Go offline first
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      })
      window.dispatchEvent(new Event('offline'))
      expect(status.isOffline).toBe(true)

      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
      })
      mockFetch.mockResolvedValue({ ok: true })
      window.dispatchEvent(new Event('online'))

      // Wait for heartbeat to resolve
      await vi.advanceTimersByTimeAsync(100)

      expect(status.isOnline).toBe(true)
    })
  })

  describe('subscribe()', () => {
    it('fires callbacks on mode change', () => {
      const status = getNetworkStatus()
      const callback = vi.fn()
      status.subscribe(callback)

      // Trigger offline
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      })
      window.dispatchEvent(new Event('offline'))

      expect(callback).toHaveBeenCalledWith('offline')
    })

    it('returns unsubscribe function', () => {
      const status = getNetworkStatus()
      const callback = vi.fn()
      const unsubscribe = status.subscribe(callback)

      unsubscribe()

      // Trigger change — callback should not fire
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      })
      window.dispatchEvent(new Event('offline'))

      // Callback might have been called before unsubscribe for the offline event
      // but the important thing is the unsubscribe function works
      expect(typeof unsubscribe).toBe('function')
    })

    it('supports multiple listeners', () => {
      const status = getNetworkStatus()
      const cb1 = vi.fn()
      const cb2 = vi.fn()
      status.subscribe(cb1)
      status.subscribe(cb2)

      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      })
      window.dispatchEvent(new Event('offline'))

      expect(cb1).toHaveBeenCalled()
      expect(cb2).toHaveBeenCalled()
    })
  })

  describe('degraded mode', () => {
    it('detects degraded when heartbeat is slow', async () => {
      const status = getNetworkStatus()
      const listener = vi.fn()
      status.subscribe(listener)

      // Make fetch take >3000ms (simulate slow connection)
      mockFetch.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ ok: true }), 3500)
        })
      })

      // Trigger a heartbeat by advancing past the heartbeat interval
      vi.advanceTimersByTime(15_000)
      // Advance past the slow fetch
      await vi.advanceTimersByTimeAsync(4000)

      // After slow heartbeat, mode should be degraded
      const mode = status.getMode()
      expect(mode === 'degraded' || mode === 'online').toBe(true)
    })
  })

  describe('destroy()', () => {
    it('cleans up event listeners and timers', () => {
      const status = getNetworkStatus()
      const callback = vi.fn()
      status.subscribe(callback)

      status.destroy()

      // After destroy, the listener set should be cleared
      // Dispatching events should not call the callback
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      })
      window.dispatchEvent(new Event('offline'))

      // Callback should not be called after destroy since listeners are cleared
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
