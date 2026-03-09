import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, val: string) => { store[key] = val }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k] }),
  length: 0,
  key: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('usage-tracker', () => {
  beforeEach(async () => {
    vi.resetModules()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  async function loadModule() {
    return await import('../usage-tracker')
  }

  it('creates empty usage on first load', async () => {
    const mod = await loadModule()
    const usage = mod.getUsage()
    expect(usage.tierId).toBe('free')
    expect(usage.sessionMinutesUsed).toBe(0)
    expect(usage.translationsCount).toBe(0)
    expect(usage.peakListeners).toBe(0)
    expect(usage.languagesUsed).toEqual([])
  })

  it('setUsageTier updates the tier', async () => {
    const mod = await loadModule()
    mod.setUsageTier('guide_pro')
    expect(mod.getUsage().tierId).toBe('guide_pro')
  })

  it('recordSessionMinute increments minutes', async () => {
    const mod = await loadModule()
    mod.recordSessionMinute()
    mod.recordSessionMinute(5)
    expect(mod.getUsage().sessionMinutesUsed).toBe(6)
  })

  it('recordTranslation tracks chars, count, and languages', async () => {
    const mod = await loadModule()
    mod.recordTranslation(100, 'de')
    mod.recordTranslation(200, 'fr')
    mod.recordTranslation(50, 'de') // duplicate lang
    const usage = mod.getUsage()
    expect(usage.translationCharsUsed).toBe(350)
    expect(usage.translationsCount).toBe(3)
    expect(usage.languagesUsed).toEqual(['de', 'fr'])
    expect(usage.dailyTranslationsCount).toBe(3)
  })

  it('recordPeakListeners only increases', async () => {
    const mod = await loadModule()
    mod.recordPeakListeners(5)
    expect(mod.getUsage().peakListeners).toBe(5)
    mod.recordPeakListeners(3) // lower — should not decrease
    expect(mod.getUsage().peakListeners).toBe(5)
    mod.recordPeakListeners(10)
    expect(mod.getUsage().peakListeners).toBe(10)
  })

  it('isWithinSessionLimit returns false for free tier (sessions not available)', async () => {
    const mod = await loadModule()
    // Free tier has sessionMinutesPerMonth = -1 (not available)
    expect(mod.isWithinSessionLimit('free')).toBe(false)
  })

  it('isWithinSessionLimit returns true for unlimited tiers', async () => {
    const mod = await loadModule()
    // personal_pro has sessionMinutesPerMonth = 0 (unlimited)
    expect(mod.isWithinSessionLimit('personal_pro')).toBe(true)
  })

  it('isWithinSessionLimit checks against limit', async () => {
    const mod = await loadModule()
    mod.setUsageTier('guide_basic') // 300 minutes
    expect(mod.isWithinSessionLimit()).toBe(true)
    // Use 300 minutes
    mod.recordSessionMinute(300)
    expect(mod.isWithinSessionLimit()).toBe(false)
  })

  it('isWithinDailyTranslationLimit enforces free tier limit', async () => {
    const mod = await loadModule()
    // Free tier: 500 daily translations
    expect(mod.isWithinDailyTranslationLimit('free')).toBe(true)
    for (let i = 0; i < 500; i++) {
      mod.recordTranslation(10, 'en')
    }
    expect(mod.isWithinDailyTranslationLimit('free')).toBe(false)
  })

  it('isWithinDailyTranslationLimit returns true for unlimited tiers', async () => {
    const mod = await loadModule()
    expect(mod.isWithinDailyTranslationLimit('guide_basic')).toBe(true)
  })

  it('getDailyTranslationsUsed returns count', async () => {
    const mod = await loadModule()
    expect(mod.getDailyTranslationsUsed()).toBe(0)
    mod.recordTranslation(100, 'en')
    expect(mod.getDailyTranslationsUsed()).toBe(1)
  })

  it('getRemainingSessionMinutes returns Infinity for unlimited', async () => {
    const mod = await loadModule()
    expect(mod.getRemainingSessionMinutes('personal_pro')).toBe(Infinity)
  })

  it('getRemainingSessionMinutes returns -1 for not available', async () => {
    const mod = await loadModule()
    expect(mod.getRemainingSessionMinutes('free')).toBe(-1)
  })

  it('getRemainingSessionMinutes calculates remaining', async () => {
    const mod = await loadModule()
    mod.setUsageTier('guide_basic')
    mod.recordSessionMinute(100)
    expect(mod.getRemainingSessionMinutes()).toBe(200) // 300 - 100
  })

  it('getOverageMinutes returns overage', async () => {
    const mod = await loadModule()
    mod.setUsageTier('guide_basic') // 300 min limit
    mod.recordSessionMinute(350)
    expect(mod.getOverageMinutes()).toBe(50)
  })

  it('getOverageMinutes returns 0 for unlimited tiers', async () => {
    const mod = await loadModule()
    mod.setUsageTier('personal_pro')
    mod.recordSessionMinute(9999)
    expect(mod.getOverageMinutes()).toBe(0)
  })

  it('getOverageCost calculates EUR cost', async () => {
    const mod = await loadModule()
    mod.setUsageTier('guide_basic') // 0.15 EUR/min overage
    mod.recordSessionMinute(310)
    expect(mod.getOverageCost()).toBeCloseTo(10 * 0.15)
  })

  it('resetUsage clears all counters', async () => {
    const mod = await loadModule()
    mod.recordSessionMinute(100)
    mod.recordTranslation(500, 'de')
    mod.recordPeakListeners(20)
    mod.resetUsage()
    const usage = mod.getUsage()
    expect(usage.sessionMinutesUsed).toBe(0)
    expect(usage.translationsCount).toBe(0)
    expect(usage.peakListeners).toBe(0)
  })

  it('returns false for unknown tier', async () => {
    const mod = await loadModule()
    expect(mod.isWithinSessionLimit('nonexistent' as any)).toBe(false)
    expect(mod.isWithinDailyTranslationLimit('nonexistent' as any)).toBe(false)
  })
})
