// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the tiers module
vi.mock('../tiers', () => ({
  TIERS: {
    free: {
      id: 'free',
      limits: {
        sessionMinutesPerMonth: -1,
        dailyTranslationLimit: 500,
      },
      pricing: { overagePerMinuteEur: 0 },
    },
    guide_basic: {
      id: 'guide_basic',
      limits: {
        sessionMinutesPerMonth: 300,
        dailyTranslationLimit: 0, // unlimited
      },
      pricing: { overagePerMinuteEur: 0.15 },
    },
    personal_pro: {
      id: 'personal_pro',
      limits: {
        sessionMinutesPerMonth: 0, // unlimited
        dailyTranslationLimit: 0,
      },
      pricing: { overagePerMinuteEur: 0 },
    },
  },
}))

// Must import after mocks
import {
  getUsage,
  setUsageTier,
  recordSessionMinute,
  recordTranslation,
  recordPeakListeners,
  isWithinSessionLimit,
  isWithinDailyTranslationLimit,
  getDailyTranslationsUsed,
  getRemainingSessionMinutes,
  getOverageMinutes,
  getOverageCost,
  resetUsage,
} from '../usage-tracker'

beforeEach(() => {
  localStorage.clear()
  resetUsage()
})

describe('usage-tracker', () => {
  describe('getUsage()', () => {
    it('returns initial state with zero counters', () => {
      const usage = getUsage()
      expect(usage.tierId).toBe('free')
      expect(usage.sessionMinutesUsed).toBe(0)
      expect(usage.translationCharsUsed).toBe(0)
      expect(usage.translationsCount).toBe(0)
      expect(usage.peakListeners).toBe(0)
      expect(usage.languagesUsed).toEqual([])
      expect(usage.dailyTranslationsCount).toBe(0)
    })

    it('includes period start and end dates', () => {
      const usage = getUsage()
      expect(usage.periodStart).toBeTruthy()
      expect(usage.periodEnd).toBeTruthy()
    })

    it('has a dailyDate set to today', () => {
      const usage = getUsage()
      const today = new Date().toISOString().slice(0, 10)
      expect(usage.dailyDate).toBe(today)
    })
  })

  describe('setUsageTier()', () => {
    it('updates the tier ID', () => {
      setUsageTier('guide_basic')
      expect(getUsage().tierId).toBe('guide_basic')
    })

    it('persists to localStorage', () => {
      setUsageTier('personal_pro')
      const stored = JSON.parse(localStorage.getItem('gt_usage')!)
      expect(stored.tierId).toBe('personal_pro')
    })
  })

  describe('recordSessionMinute()', () => {
    it('increments session minutes by 1 by default', () => {
      recordSessionMinute()
      expect(getUsage().sessionMinutesUsed).toBe(1)
    })

    it('increments by given amount', () => {
      recordSessionMinute(5)
      expect(getUsage().sessionMinutesUsed).toBe(5)
    })

    it('accumulates across multiple calls', () => {
      recordSessionMinute()
      recordSessionMinute()
      recordSessionMinute(3)
      expect(getUsage().sessionMinutesUsed).toBe(5)
    })

    it('persists to localStorage after increment', () => {
      recordSessionMinute(7)
      const stored = JSON.parse(localStorage.getItem('gt_usage')!)
      expect(stored.sessionMinutesUsed).toBe(7)
    })
  })

  describe('recordTranslation()', () => {
    it('increments character count and translation count', () => {
      recordTranslation(100, 'en')
      expect(getUsage().translationCharsUsed).toBe(100)
      expect(getUsage().translationsCount).toBe(1)
    })

    it('accumulates characters across calls', () => {
      recordTranslation(100, 'en')
      recordTranslation(200, 'fr')
      expect(getUsage().translationCharsUsed).toBe(300)
      expect(getUsage().translationsCount).toBe(2)
    })

    it('tracks unique languages used', () => {
      recordTranslation(10, 'en')
      recordTranslation(20, 'en')
      recordTranslation(30, 'fr')
      expect(getUsage().languagesUsed).toEqual(['en', 'fr'])
    })

    it('increments daily translation count', () => {
      recordTranslation(50, 'de')
      recordTranslation(50, 'de')
      expect(getUsage().dailyTranslationsCount).toBe(2)
    })
  })

  describe('recordPeakListeners()', () => {
    it('records higher peak', () => {
      recordPeakListeners(5)
      expect(getUsage().peakListeners).toBe(5)
    })

    it('keeps maximum value (does not decrease)', () => {
      recordPeakListeners(10)
      recordPeakListeners(3)
      expect(getUsage().peakListeners).toBe(10)
    })

    it('updates when new peak exceeds old', () => {
      recordPeakListeners(5)
      recordPeakListeners(8)
      expect(getUsage().peakListeners).toBe(8)
    })

    it('does not update peak when count is lower', () => {
      recordPeakListeners(10)
      recordPeakListeners(3)
      // Peak should remain at the higher value
      expect(getUsage().peakListeners).toBe(10)
    })
  })

  describe('isWithinSessionLimit()', () => {
    it('returns false for free tier (sessionMinutesPerMonth = -1)', () => {
      expect(isWithinSessionLimit('free')).toBe(false)
    })

    it('returns true for guide_basic when under limit', () => {
      setUsageTier('guide_basic')
      expect(isWithinSessionLimit('guide_basic')).toBe(true)
    })

    it('returns false for guide_basic when at limit', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(300)
      expect(isWithinSessionLimit('guide_basic')).toBe(false)
    })

    it('returns true for unlimited tier (sessionMinutesPerMonth = 0)', () => {
      setUsageTier('personal_pro')
      expect(isWithinSessionLimit('personal_pro')).toBe(true)
    })

    it('returns false for unknown tier', () => {
      expect(isWithinSessionLimit('nonexistent' as any)).toBe(false)
    })
  })

  describe('isWithinDailyTranslationLimit()', () => {
    it('returns true for free tier when under 500 limit', () => {
      recordTranslation(10, 'en')
      expect(isWithinDailyTranslationLimit('free')).toBe(true)
    })

    it('returns false for free tier when at limit', () => {
      for (let i = 0; i < 500; i++) {
        recordTranslation(1, 'en')
      }
      expect(isWithinDailyTranslationLimit('free')).toBe(false)
    })

    it('returns true for unlimited daily (dailyTranslationLimit = 0)', () => {
      expect(isWithinDailyTranslationLimit('guide_basic')).toBe(true)
    })

    it('returns false for unknown tier', () => {
      expect(isWithinDailyTranslationLimit('nonexistent' as any)).toBe(false)
    })
  })

  describe('getDailyTranslationsUsed()', () => {
    it('returns 0 when no translations today', () => {
      expect(getDailyTranslationsUsed()).toBe(0)
    })

    it('returns count of today translations', () => {
      recordTranslation(10, 'en')
      recordTranslation(20, 'fr')
      expect(getDailyTranslationsUsed()).toBe(2)
    })
  })

  describe('getRemainingSessionMinutes()', () => {
    it('returns -1 for free tier (not available)', () => {
      expect(getRemainingSessionMinutes('free')).toBe(-1)
    })

    it('returns Infinity for unlimited tier', () => {
      expect(getRemainingSessionMinutes('personal_pro')).toBe(Infinity)
    })

    it('returns correct remaining for guide_basic', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(100)
      expect(getRemainingSessionMinutes('guide_basic')).toBe(200)
    })

    it('returns 0 when over limit', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(350)
      expect(getRemainingSessionMinutes('guide_basic')).toBe(0)
    })
  })

  describe('getOverageMinutes()', () => {
    it('returns 0 when under limit', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(100)
      expect(getOverageMinutes('guide_basic')).toBe(0)
    })

    it('returns correct overage when over limit', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(350)
      expect(getOverageMinutes('guide_basic')).toBe(50)
    })

    it('returns 0 for unlimited tier', () => {
      expect(getOverageMinutes('personal_pro')).toBe(0)
    })

    it('returns 0 for free tier (not available)', () => {
      expect(getOverageMinutes('free')).toBe(0)
    })
  })

  describe('getOverageCost()', () => {
    it('returns 0 when no overage', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(100)
      expect(getOverageCost('guide_basic')).toBe(0)
    })

    it('calculates correct cost for overage minutes', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(310)
      // 10 overage minutes * 0.15 EUR
      expect(getOverageCost('guide_basic')).toBeCloseTo(1.5)
    })

    it('returns 0 for unlimited tier', () => {
      expect(getOverageCost('personal_pro')).toBe(0)
    })
  })

  describe('resetUsage()', () => {
    it('clears all counters back to initial state', () => {
      setUsageTier('guide_basic')
      recordSessionMinute(100)
      recordTranslation(500, 'en')
      recordPeakListeners(20)

      resetUsage()

      const usage = getUsage()
      expect(usage.tierId).toBe('free')
      expect(usage.sessionMinutesUsed).toBe(0)
      expect(usage.translationCharsUsed).toBe(0)
      expect(usage.translationsCount).toBe(0)
      expect(usage.peakListeners).toBe(0)
      expect(usage.languagesUsed).toEqual([])
    })

    it('persists the reset to localStorage', () => {
      recordSessionMinute(50)
      resetUsage()
      const stored = JSON.parse(localStorage.getItem('gt_usage')!)
      expect(stored.sessionMinutesUsed).toBe(0)
    })

    it('resets daily translation count', () => {
      recordTranslation(10, 'en')
      recordTranslation(20, 'fr')
      resetUsage()
      expect(getDailyTranslationsUsed()).toBe(0)
    })
  })
})
