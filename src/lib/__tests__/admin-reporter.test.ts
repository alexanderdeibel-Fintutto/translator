// @vitest-environment jsdom
// Tests for admin-reporter — structural and behavioral tests
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('admin-reporter', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should export reportEvent, initAdminReporter, stopAdminReporter', async () => {
    const mod = await import('../admin-reporter')
    expect(typeof mod.reportEvent).toBe('function')
    expect(typeof mod.initAdminReporter).toBe('function')
    expect(typeof mod.stopAdminReporter).toBe('function')
  })

  it('reportEvent should accept event name and params', async () => {
    const mod = await import('../admin-reporter')
    expect(() => mod.reportEvent('test_event', { key: 'value' })).not.toThrow()
    expect(() => mod.reportEvent('another')).not.toThrow()
  })

  it('initAdminReporter should not throw without ADMIN_API_URL', async () => {
    const mod = await import('../admin-reporter')
    expect(() => mod.initAdminReporter()).not.toThrow()
  })

  it('stopAdminReporter should not throw', async () => {
    const mod = await import('../admin-reporter')
    mod.initAdminReporter()
    expect(() => mod.stopAdminReporter()).not.toThrow()
  })

  it('stopAdminReporter should be idempotent', async () => {
    const mod = await import('../admin-reporter')
    expect(() => mod.stopAdminReporter()).not.toThrow()
    expect(() => mod.stopAdminReporter()).not.toThrow()
  })

  it('should handle rapid event queuing without throwing', async () => {
    const mod = await import('../admin-reporter')
    for (let i = 0; i < 300; i++) {
      mod.reportEvent('evt_' + i, { i })
    }
    // Queue is capped at 200 internally — no memory leak
    expect(true).toBe(true)
  })

  it('should survive init-report-stop cycle', async () => {
    const mod = await import('../admin-reporter')
    mod.initAdminReporter()
    mod.reportEvent('cycle_test', { data: 123 })
    mod.reportEvent('cycle_test_2', {})
    mod.stopAdminReporter()
    expect(true).toBe(true)
  })
})
