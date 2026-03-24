import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockRpc = vi.hoisted(() => vi.fn())
const mockGetUsage = vi.hoisted(() => vi.fn())

vi.mock('../supabase', () => ({
  supabase: {
    rpc: mockRpc,
  },
}))

vi.mock('../usage-tracker', () => ({
  getUsage: mockGetUsage,
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.resetModules()

  mockGetUsage.mockReturnValue({
    sessionMinutesUsed: 10,
    translationCharsUsed: 500,
    translationsCount: 5,
    peakListeners: 3,
    languagesUsed: ['de-DE', 'en-US'],
  })
  mockRpc.mockResolvedValue({ error: null })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('startUsageSync', () => {
  it('performs an immediate sync on start', async () => {
    const { startUsageSync, stopUsageSync } = await import('../usage-sync')

    startUsageSync('user-123')
    // Flush the immediate (non-timer) async call
    await vi.advanceTimersByTimeAsync(0)

    expect(mockRpc).toHaveBeenCalledWith('upsert_usage', expect.objectContaining({
      p_user_id: 'user-123',
      p_session_minutes: 10,
      p_translation_chars: 500,
      p_translations: 5,
      p_peak_listeners: 3,
      p_languages: ['de-DE', 'en-US'],
    }))

    stopUsageSync()
  })

  it('syncs periodically at 60-second intervals', async () => {
    const { startUsageSync, stopUsageSync } = await import('../usage-sync')

    startUsageSync('user-123')
    // Flush immediate sync
    await vi.advanceTimersByTimeAsync(0)
    expect(mockRpc).toHaveBeenCalledTimes(1)

    // Change usage so fingerprint differs
    mockGetUsage.mockReturnValue({
      sessionMinutesUsed: 20,
      translationCharsUsed: 1000,
      translationsCount: 10,
      peakListeners: 5,
      languagesUsed: ['de-DE', 'en-US', 'fr-FR'],
    })

    // Advance by 60 seconds to trigger interval
    await vi.advanceTimersByTimeAsync(60_000)

    expect(mockRpc).toHaveBeenCalledTimes(2)

    stopUsageSync()
  })

  it('does not start multiple intervals if called twice', async () => {
    const { startUsageSync, stopUsageSync } = await import('../usage-sync')

    startUsageSync('user-123')
    startUsageSync('user-123')
    await vi.advanceTimersByTimeAsync(0)

    // Only one immediate sync
    expect(mockRpc).toHaveBeenCalledTimes(1)

    stopUsageSync()
  })
})

describe('stopUsageSync', () => {
  it('stops periodic sync', async () => {
    const { startUsageSync, stopUsageSync } = await import('../usage-sync')

    startUsageSync('user-123')
    await vi.advanceTimersByTimeAsync(0)

    stopUsageSync()

    // Change usage
    mockGetUsage.mockReturnValue({
      sessionMinutesUsed: 99,
      translationCharsUsed: 9999,
      translationsCount: 99,
      peakListeners: 99,
      languagesUsed: ['de-DE'],
    })

    // Advance time — should NOT trigger another sync
    await vi.advanceTimersByTimeAsync(120_000)

    // Only the initial sync call
    expect(mockRpc).toHaveBeenCalledTimes(1)
  })

  it('does not throw when called without start', async () => {
    const { stopUsageSync } = await import('../usage-sync')
    expect(() => stopUsageSync()).not.toThrow()
  })
})

describe('syncUsageNow', () => {
  it('forces an immediate sync', async () => {
    const { syncUsageNow } = await import('../usage-sync')

    await syncUsageNow('user-456')

    expect(mockRpc).toHaveBeenCalledWith('upsert_usage', expect.objectContaining({
      p_user_id: 'user-456',
    }))
  })

  it('skips sync when fingerprint has not changed', async () => {
    const { syncUsageNow } = await import('../usage-sync')

    await syncUsageNow('user-456')
    await syncUsageNow('user-456')

    // Second call should be skipped (same fingerprint)
    expect(mockRpc).toHaveBeenCalledTimes(1)
  })

  it('handles Supabase RPC error gracefully', async () => {
    mockRpc.mockResolvedValue({ error: { message: 'DB error' } })

    const { syncUsageNow } = await import('../usage-sync')

    // Should not throw
    await expect(syncUsageNow('user-789')).resolves.toBeUndefined()
  })

  it('handles network error gracefully', async () => {
    mockRpc.mockRejectedValue(new Error('Network failure'))

    const { syncUsageNow } = await import('../usage-sync')

    // Should not throw
    await expect(syncUsageNow('user-789')).resolves.toBeUndefined()
  })
})
