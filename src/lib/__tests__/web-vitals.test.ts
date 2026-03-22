import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockTrackPerformance = vi.hoisted(() => vi.fn())
const mockReportEvent = vi.hoisted(() => vi.fn())
const mockOnCLS = vi.hoisted(() => vi.fn())
const mockOnINP = vi.hoisted(() => vi.fn())
const mockOnLCP = vi.hoisted(() => vi.fn())
const mockOnFCP = vi.hoisted(() => vi.fn())
const mockOnTTFB = vi.hoisted(() => vi.fn())

vi.mock('../analytics', () => ({
  trackPerformance: mockTrackPerformance,
}))

vi.mock('../admin-reporter', () => ({
  reportEvent: mockReportEvent,
}))

vi.mock('web-vitals', () => ({
  onCLS: mockOnCLS,
  onINP: mockOnINP,
  onLCP: mockOnLCP,
  onFCP: mockOnFCP,
  onTTFB: mockOnTTFB,
}))

import { initWebVitals } from '../web-vitals'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('initWebVitals', () => {
  it('registers callbacks for all five web vital metrics', () => {
    initWebVitals()

    expect(mockOnCLS).toHaveBeenCalledTimes(1)
    expect(mockOnINP).toHaveBeenCalledTimes(1)
    expect(mockOnLCP).toHaveBeenCalledTimes(1)
    expect(mockOnFCP).toHaveBeenCalledTimes(1)
    expect(mockOnTTFB).toHaveBeenCalledTimes(1)
  })

  it('passes a handler function to each metric', () => {
    initWebVitals()

    expect(typeof mockOnCLS.mock.calls[0][0]).toBe('function')
    expect(typeof mockOnINP.mock.calls[0][0]).toBe('function')
    expect(typeof mockOnLCP.mock.calls[0][0]).toBe('function')
    expect(typeof mockOnFCP.mock.calls[0][0]).toBe('function')
    expect(typeof mockOnTTFB.mock.calls[0][0]).toBe('function')
  })

  it('handler calls trackPerformance with correct arguments', () => {
    initWebVitals()

    const handler = mockOnCLS.mock.calls[0][0]
    const fakeMetric = {
      name: 'CLS',
      value: 0.123,
      rating: 'good',
      delta: 0.05,
      id: 'v1-123',
      navigationType: 'navigate',
    }
    handler(fakeMetric)

    expect(mockTrackPerformance).toHaveBeenCalledWith('CLS', 0.123, 'good')
  })

  it('handler reports detailed event to admin reporter', () => {
    initWebVitals()

    const handler = mockOnLCP.mock.calls[0][0]
    const fakeMetric = {
      name: 'LCP',
      value: 2500.456,
      rating: 'needs-improvement',
      delta: 100.789,
      id: 'v1-456',
      navigationType: 'reload',
    }
    handler(fakeMetric)

    expect(mockReportEvent).toHaveBeenCalledWith('web_vital_detail', {
      name: 'LCP',
      value: 2500.46, // rounded to 2 decimals
      rating: 'needs-improvement',
      delta: 100.79, // rounded to 2 decimals
      id: 'v1-456',
      navigationType: 'reload',
    })
  })

  it('handler uses "unknown" rating when metric.rating is undefined', () => {
    initWebVitals()

    const handler = mockOnFCP.mock.calls[0][0]
    const fakeMetric = {
      name: 'FCP',
      value: 1000,
      rating: undefined,
      delta: 50,
      id: 'v1-789',
      navigationType: 'navigate',
    }
    handler(fakeMetric)

    expect(mockTrackPerformance).toHaveBeenCalledWith('FCP', 1000, 'unknown')
    expect(mockReportEvent).toHaveBeenCalledWith('web_vital_detail', expect.objectContaining({
      rating: 'unknown',
    }))
  })
})
