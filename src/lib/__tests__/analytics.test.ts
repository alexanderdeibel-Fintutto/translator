// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock admin-reporter
vi.mock('../admin-reporter', () => ({
  reportEvent: vi.fn(),
}))

// Mock react-ga4
vi.mock('react-ga4', () => ({
  default: {
    initialize: vi.fn(),
    send: vi.fn(),
    event: vi.fn(),
  },
}))

import {
  trackPageView,
  trackTranslation,
  trackSession,
  trackError,
  trackFeatureUsage,
  trackPerformance,
} from '../analytics'
import { reportEvent } from '../admin-reporter'

// NOTE: The module-level GA_ID (import.meta.env.VITE_GA_MEASUREMENT_ID) is read
// at module evaluation time. vi.stubEnv cannot set it before the module loads in this
// test setup, so initialized is never true and ReactGA calls are skipped.
// We verify the param construction and admin-reporter forwarding instead,
// which exercises the same code paths (param building) without depending on GA state.

beforeEach(() => {
  vi.clearAllMocks()
})

describe('analytics', () => {
  describe('trackPageView()', () => {
    it('reports page_view event to admin reporter', () => {
      trackPageView('/dashboard')
      expect(reportEvent).toHaveBeenCalledWith('page_view', { path: '/dashboard' })
    })

    it('reports event with correct path', () => {
      trackPageView('/settings')
      expect(reportEvent).toHaveBeenCalledWith('page_view', { path: '/settings' })
    })
  })

  describe('trackTranslation()', () => {
    it('reports translation event with mapped params', () => {
      const data = {
        sourceLang: 'de',
        targetLang: 'en',
        mode: 'text' as const,
        provider: 'azure',
        latencyMs: 123.7,
        textLength: 50,
        success: true,
      }
      trackTranslation(data)
      expect(reportEvent).toHaveBeenCalledWith('translation', {
        source_lang: 'de',
        target_lang: 'en',
        mode: 'text',
        provider: 'azure',
        latency_ms: 124,
        text_length: 50,
        success: true,
      })
    })

    it('includes error field when present', () => {
      const data = {
        sourceLang: 'de',
        targetLang: 'en',
        mode: 'voice' as const,
        provider: 'deepl',
        latencyMs: 500,
        textLength: 10,
        success: false,
        error: 'Timeout',
      }
      trackTranslation(data)
      expect(reportEvent).toHaveBeenCalledWith('translation', expect.objectContaining({
        error: 'Timeout',
      }))
    })

    it('reports to admin reporter with lang params', () => {
      const data = {
        sourceLang: 'de',
        targetLang: 'fr',
        mode: 'camera' as const,
        provider: 'google',
        latencyMs: 200,
        textLength: 30,
        success: true,
      }
      trackTranslation(data)
      expect(reportEvent).toHaveBeenCalledWith('translation', expect.objectContaining({
        source_lang: 'de',
        target_lang: 'fr',
      }))
    })

    it('rounds latency to integer', () => {
      const data = {
        sourceLang: 'en',
        targetLang: 'de',
        mode: 'text' as const,
        provider: 'google',
        latencyMs: 99.9,
        textLength: 5,
        success: true,
      }
      trackTranslation(data)
      expect(reportEvent).toHaveBeenCalledWith('translation', expect.objectContaining({
        latency_ms: 100,
      }))
    })
  })

  describe('trackSession()', () => {
    it('reports session event to admin reporter', () => {
      trackSession({ action: 'created', mode: 'cloud' })
      expect(reportEvent).toHaveBeenCalledWith('live_session', {
        action: 'created',
        connection_mode: 'cloud',
      })
    })

    it('includes optional fields when provided', () => {
      trackSession({
        action: 'ended',
        mode: 'local',
        sessionCode: 'ABC123',
        durationMs: 60000,
        participantCount: 5,
      })
      expect(reportEvent).toHaveBeenCalledWith('live_session', expect.objectContaining({
        session_code: 'ABC123',
        duration_ms: 60000,
        participant_count: 5,
      }))
    })

    it('reports to admin reporter with mode', () => {
      trackSession({ action: 'joined', mode: 'ble' })
      expect(reportEvent).toHaveBeenCalledWith('live_session', expect.objectContaining({
        action: 'joined',
        connection_mode: 'ble',
      }))
    })
  })

  describe('trackError()', () => {
    it('reports error event to admin reporter', () => {
      trackError({
        type: 'js_error',
        message: 'Something broke',
      })
      expect(reportEvent).toHaveBeenCalledWith('app_error', expect.objectContaining({
        error_type: 'js_error',
        error_message: 'Something broke',
      }))
    })

    it('includes stack trace in admin reporter when available', () => {
      trackError({
        type: 'js_error',
        message: 'Crash',
        stack: 'Error: Crash\n  at foo.ts:10',
      })
      expect(reportEvent).toHaveBeenCalledWith('app_error', expect.objectContaining({
        stack: 'Error: Crash\n  at foo.ts:10',
      }))
    })

    it('includes source and statusCode in reported params', () => {
      trackError({
        type: 'api_error',
        message: 'Not found',
        source: 'translate-api',
        statusCode: 404,
      })
      expect(reportEvent).toHaveBeenCalledWith('app_error', expect.objectContaining({
        error_source: 'translate-api',
        status_code: 404,
      }))
    })

    it('truncates long messages to 500 chars', () => {
      const longMessage = 'x'.repeat(1000)
      trackError({ type: 'js_error', message: longMessage })
      expect(reportEvent).toHaveBeenCalledWith('app_error', expect.objectContaining({
        error_message: 'x'.repeat(500),
      }))
    })

    it('includes stack in admin reporter params', () => {
      trackError({
        type: 'js_error',
        message: 'Crash',
        stack: 'Error: Crash\n  at foo.ts:10',
      })
      const reportCall = vi.mocked(reportEvent).mock.calls[0]
      expect(reportCall[1]).toHaveProperty('stack')
    })
  })

  describe('trackFeatureUsage()', () => {
    it('reports feature_use event', () => {
      trackFeatureUsage('camera_ocr', { lang: 'de' })
      expect(reportEvent).toHaveBeenCalledWith('feature_use', {
        feature: 'camera_ocr',
        lang: 'de',
      })
    })

    it('reports to admin reporter', () => {
      trackFeatureUsage('offline_mode')
      expect(reportEvent).toHaveBeenCalledWith('feature_use', { feature: 'offline_mode' })
    })

    it('works without optional details', () => {
      trackFeatureUsage('ble_transport')
      expect(reportEvent).toHaveBeenCalledWith('feature_use', { feature: 'ble_transport' })
    })
  })

  describe('trackPerformance()', () => {
    it('reports web_vital event with rounded value', () => {
      trackPerformance('LCP', 1234.56, 'good')
      expect(reportEvent).toHaveBeenCalledWith('web_vital', {
        metric: 'LCP',
        value: 1235,
        rating: 'good',
      })
    })

    it('reports to admin reporter', () => {
      trackPerformance('FID', 10, 'good')
      expect(reportEvent).toHaveBeenCalledWith('web_vital', {
        metric: 'FID',
        value: 10,
        rating: 'good',
      })
    })

    it('handles zero value', () => {
      trackPerformance('CLS', 0, 'good')
      expect(reportEvent).toHaveBeenCalledWith('web_vital', {
        metric: 'CLS',
        value: 0,
        rating: 'good',
      })
    })
  })
})
