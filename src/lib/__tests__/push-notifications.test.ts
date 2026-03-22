// @vitest-environment jsdom
// Tests for Web Push Notification Manager
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
const mockUpsert = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn()
const mockEqChain = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: () => ({
      upsert: mockUpsert,
      update: (...args: unknown[]) => {
        mockUpdate(...args)
        return { eq: mockEqChain }
      },
    }),
  },
}))

import { isPushSupported, getPushPermission, showLocalNotification } from '../push-notifications'

describe('push-notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── isPushSupported ───────────────────────────────────────────────

  describe('isPushSupported', () => {
    it('returns true when all required APIs are available', () => {
      // jsdom provides navigator.serviceWorker, window.Notification
      // We need to ensure PushManager exists
      const originalPM = (window as any).PushManager
      ;(window as any).PushManager = class {}

      const originalSW = navigator.serviceWorker
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { ready: Promise.resolve({}) },
        configurable: true,
      })

      // Ensure Notification exists
      if (typeof window.Notification === 'undefined') {
        Object.defineProperty(window, 'Notification', {
          value: { permission: 'default', requestPermission: vi.fn() },
          configurable: true,
        })
      }

      expect(isPushSupported()).toBe(true)

      // Restore
      ;(window as any).PushManager = originalPM
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalSW,
        configurable: true,
      })
    })

    it('returns false when PushManager is missing', () => {
      const original = (window as any).PushManager
      delete (window as any).PushManager

      expect(isPushSupported()).toBe(false)

      ;(window as any).PushManager = original
    })
  })

  // ── getPushPermission ─────────────────────────────────────────────

  describe('getPushPermission', () => {
    it('returns denied when push is not supported', () => {
      const original = (window as any).PushManager
      delete (window as any).PushManager

      expect(getPushPermission()).toBe('denied')

      ;(window as any).PushManager = original
    })

    it('returns current Notification.permission when supported', () => {
      ;(window as any).PushManager = class {}
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { ready: Promise.resolve({}) },
        configurable: true,
      })

      // Set Notification.permission
      const MockNotification = function () {} as any
      MockNotification.permission = 'granted'
      MockNotification.requestPermission = vi.fn()
      Object.defineProperty(window, 'Notification', {
        value: MockNotification,
        configurable: true,
        writable: true,
      })

      expect(getPushPermission()).toBe('granted')
    })
  })

  // ── showLocalNotification ─────────────────────────────────────────

  describe('showLocalNotification', () => {
    it('does nothing when permission is not granted', async () => {
      const MockNotification = function () {} as any
      MockNotification.permission = 'denied'
      MockNotification.requestPermission = vi.fn()
      Object.defineProperty(window, 'Notification', {
        value: MockNotification,
        configurable: true,
        writable: true,
      })

      // Should not throw
      await showLocalNotification('Test', 'Body')
    })

    it('calls service worker showNotification when permission granted', async () => {
      const mockShowNotification = vi.fn().mockResolvedValue(undefined)

      const MockNotification = function () {} as any
      MockNotification.permission = 'granted'
      MockNotification.requestPermission = vi.fn()
      Object.defineProperty(window, 'Notification', {
        value: MockNotification,
        configurable: true,
        writable: true,
      })

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({
            showNotification: mockShowNotification,
          }),
        },
        configurable: true,
      })

      await showLocalNotification('Neues Exponat', 'Du bist in der Naehe!', {
        tag: 'poi-1',
        data: { poiId: 'art-42' },
      })

      expect(mockShowNotification).toHaveBeenCalledWith('Neues Exponat', expect.objectContaining({
        body: 'Du bist in der Naehe!',
        tag: 'poi-1',
        data: { poiId: 'art-42' },
        icon: '/favicon.svg',
        vibrate: [200, 100, 200],
      }))
    })

    it('uses custom icon when provided', async () => {
      const mockShowNotification = vi.fn().mockResolvedValue(undefined)

      const MockNotification = function () {} as any
      MockNotification.permission = 'granted'
      Object.defineProperty(window, 'Notification', {
        value: MockNotification,
        configurable: true,
        writable: true,
      })

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve({ showNotification: mockShowNotification }),
        },
        configurable: true,
      })

      await showLocalNotification('Test', 'Body', { icon: '/custom-icon.png' })

      expect(mockShowNotification).toHaveBeenCalledWith('Test', expect.objectContaining({
        icon: '/custom-icon.png',
      }))
    })
  })
})
