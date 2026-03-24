import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInitAdminReporter = vi.hoisted(() => vi.fn())
const mockInitAnalytics = vi.hoisted(() => vi.fn())
const mockInitSentry = vi.hoisted(() => vi.fn())
const mockInitWebVitals = vi.hoisted(() => vi.fn())

vi.mock('../admin-reporter', () => ({
  initAdminReporter: mockInitAdminReporter,
}))

vi.mock('../analytics', () => ({
  initAnalytics: mockInitAnalytics,
}))

vi.mock('../sentry', () => ({
  initSentry: mockInitSentry,
}))

vi.mock('../web-vitals', () => ({
  initWebVitals: mockInitWebVitals,
}))

// Must re-import for each test to reset the `initialized` flag
// We use dynamic import + vi.resetModules()

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

describe('initMonitoring', () => {
  it('initializes all monitoring services', async () => {
    const { initMonitoring } = await import('../monitoring')
    initMonitoring()

    expect(mockInitAdminReporter).toHaveBeenCalledTimes(1)
    expect(mockInitAnalytics).toHaveBeenCalledTimes(1)
    expect(mockInitSentry).toHaveBeenCalledTimes(1)
    expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
  })

  it('initializes services in correct order (admin reporter first)', async () => {
    const callOrder: string[] = []
    mockInitAdminReporter.mockImplementation(() => callOrder.push('admin'))
    mockInitAnalytics.mockImplementation(() => callOrder.push('analytics'))
    mockInitSentry.mockImplementation(() => callOrder.push('sentry'))
    mockInitWebVitals.mockImplementation(() => callOrder.push('webvitals'))

    const { initMonitoring } = await import('../monitoring')
    initMonitoring()

    expect(callOrder).toEqual(['admin', 'analytics', 'sentry', 'webvitals'])
  })

  it('only initializes once (idempotent)', async () => {
    const { initMonitoring } = await import('../monitoring')
    initMonitoring()
    initMonitoring()
    initMonitoring()

    expect(mockInitAdminReporter).toHaveBeenCalledTimes(1)
    expect(mockInitAnalytics).toHaveBeenCalledTimes(1)
    expect(mockInitSentry).toHaveBeenCalledTimes(1)
    expect(mockInitWebVitals).toHaveBeenCalledTimes(1)
  })
})
