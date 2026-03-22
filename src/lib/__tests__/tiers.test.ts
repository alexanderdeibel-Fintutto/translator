// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import {
  TIERS,
  TIER_ORDER,
  INTERNAL_TIERS,
  SEGMENTS,
  isInternalTier,
  getTiersBySegment,
  hasFeature,
  isWithinListenerLimit,
  isWithinLanguageLimit,
  getUpgradeTier,
  getTtsQuality,
  formatPrice,
} from '../tiers'

describe('tiers', () => {
  describe('TIERS', () => {
    it('should have a free tier', () => {
      expect(TIERS.free).toBeDefined()
      expect(TIERS.free.id).toBe('free')
      expect(TIERS.free.segment).toBe('personal')
    })

    it('free tier should have zero pricing', () => {
      expect(TIERS.free.pricing.monthlyEur).toBe(0)
      expect(TIERS.free.pricing.yearlyEur).toBe(0)
    })

    it('all tiers should have required properties', () => {
      for (const [id, tier] of Object.entries(TIERS)) {
        expect(tier.id).toBe(id)
        expect(tier.segment).toBeTruthy()
        expect(tier.name).toBeTruthy()
        expect(tier.displayName).toBeTruthy()
        expect(tier.limits).toBeDefined()
        expect(tier.features).toBeDefined()
        expect(tier.pricing).toBeDefined()
        expect(tier.supportLevel).toBeTruthy()
      }
    })

    it('should have internal tiers defined', () => {
      expect(TIERS.internal_admin).toBeDefined()
      expect(TIERS.internal_tester).toBeDefined()
      expect(TIERS.internal_sales).toBeDefined()
    })
  })

  describe('TIER_ORDER', () => {
    it('should be a non-empty array', () => {
      expect(TIER_ORDER.length).toBeGreaterThan(0)
    })

    it('should start with free', () => {
      expect(TIER_ORDER[0]).toBe('free')
    })

    it('all entries should exist in TIERS', () => {
      for (const id of TIER_ORDER) {
        expect(TIERS[id]).toBeDefined()
      }
    })

    it('should not contain internal tiers', () => {
      for (const id of INTERNAL_TIERS) {
        expect(TIER_ORDER).not.toContain(id)
      }
    })
  })

  describe('INTERNAL_TIERS', () => {
    it('should contain 3 internal tiers', () => {
      expect(INTERNAL_TIERS).toHaveLength(3)
    })

    it('should contain internal_admin, internal_tester, internal_sales', () => {
      expect(INTERNAL_TIERS).toContain('internal_admin')
      expect(INTERNAL_TIERS).toContain('internal_tester')
      expect(INTERNAL_TIERS).toContain('internal_sales')
    })
  })

  describe('SEGMENTS', () => {
    it('should be a non-empty array', () => {
      expect(SEGMENTS.length).toBeGreaterThan(0)
    })

    it('each segment should have id, label, icon', () => {
      for (const seg of SEGMENTS) {
        expect(seg.id).toBeTruthy()
        expect(seg.label).toBeTruthy()
        expect(seg.icon).toBeTruthy()
      }
    })

    it('should contain personal and guide segments', () => {
      const ids = SEGMENTS.map(s => s.id)
      expect(ids).toContain('personal')
      expect(ids).toContain('guide')
      expect(ids).toContain('event')
      expect(ids).toContain('cruise')
    })
  })

  describe('isInternalTier', () => {
    it('should return true for internal_admin', () => {
      expect(isInternalTier('internal_admin')).toBe(true)
    })

    it('should return true for internal_tester', () => {
      expect(isInternalTier('internal_tester')).toBe(true)
    })

    it('should return true for internal_sales', () => {
      expect(isInternalTier('internal_sales')).toBe(true)
    })

    it('should return false for free tier', () => {
      expect(isInternalTier('free')).toBe(false)
    })

    it('should return false for guide_basic', () => {
      expect(isInternalTier('guide_basic')).toBe(false)
    })
  })

  describe('getTiersBySegment', () => {
    it('should return personal tiers for personal segment', () => {
      const tiers = getTiersBySegment('personal')
      expect(tiers.length).toBeGreaterThan(0)
      for (const t of tiers) {
        expect(t.segment).toBe('personal')
      }
    })

    it('should return guide tiers for guide segment', () => {
      const tiers = getTiersBySegment('guide')
      expect(tiers.length).toBeGreaterThan(0)
      for (const t of tiers) {
        expect(t.segment).toBe('guide')
      }
    })

    it('should return empty array for internal segment (not in TIER_ORDER)', () => {
      const tiers = getTiersBySegment('internal')
      expect(tiers).toHaveLength(0)
    })
  })

  describe('hasFeature', () => {
    it('should return true for free tier conversationMode', () => {
      expect(hasFeature('free', 'conversationMode')).toBe(true)
    })

    it('should return false for free tier liveSession', () => {
      expect(hasFeature('free', 'liveSession')).toBe(false)
    })

    it('should return false for free tier whiteLabel', () => {
      expect(hasFeature('free', 'whiteLabel')).toBe(false)
    })

    it('should handle string-valued features (analytics/apiAccess)', () => {
      // free tier has analytics: "none"
      expect(hasFeature('free', 'analytics')).toBe(false)
      expect(hasFeature('free', 'apiAccess')).toBe(false)
    })

    it('should return false for unknown tier', () => {
      expect(hasFeature('nonexistent_tier' as any, 'liveSession')).toBe(false)
    })
  })

  describe('isWithinListenerLimit', () => {
    it('should return true when under the limit', () => {
      // free tier has maxListeners: 1
      expect(isWithinListenerLimit('free', 1)).toBe(true)
    })

    it('should return false when over the limit', () => {
      expect(isWithinListenerLimit('free', 5)).toBe(false)
    })

    it('should return true for 0 listeners', () => {
      expect(isWithinListenerLimit('free', 0)).toBe(true)
    })

    it('should handle unlimited listeners (maxListeners=0)', () => {
      // internal_admin likely has 0 = unlimited
      // Find a tier with maxListeners=0
      const unlimitedTier = Object.values(TIERS).find(t => t.limits.maxListeners === 0)
      if (unlimitedTier) {
        expect(isWithinListenerLimit(unlimitedTier.id, 9999)).toBe(true)
      }
    })

    it('should return false for unknown tier', () => {
      expect(isWithinListenerLimit('nonexistent' as any, 1)).toBe(false)
    })
  })

  describe('isWithinLanguageLimit', () => {
    it('should return true when under the limit', () => {
      // free tier has maxLanguages: 22
      expect(isWithinLanguageLimit('free', 10)).toBe(true)
    })

    it('should return false when over the limit', () => {
      expect(isWithinLanguageLimit('free', 50)).toBe(false)
    })

    it('should return true at exact limit', () => {
      expect(isWithinLanguageLimit('free', 22)).toBe(true)
    })

    it('should handle unlimited languages (maxLanguages=0)', () => {
      const unlimitedTier = Object.values(TIERS).find(t => t.limits.maxLanguages === 0)
      if (unlimitedTier) {
        expect(isWithinLanguageLimit(unlimitedTier.id, 9999)).toBe(true)
      }
    })

    it('should return false for unknown tier', () => {
      expect(isWithinLanguageLimit('nonexistent' as any, 1)).toBe(false)
    })
  })

  describe('getUpgradeTier', () => {
    it('should return personal_pro for free tier', () => {
      const upgrade = getUpgradeTier('free')
      expect(upgrade).toBeDefined()
      expect(upgrade!.id).toBe('personal_pro')
    })

    it('should return null for the last tier in TIER_ORDER', () => {
      const lastTier = TIER_ORDER[TIER_ORDER.length - 1]
      expect(getUpgradeTier(lastTier)).toBeNull()
    })

    it('should return null for unknown tier', () => {
      expect(getUpgradeTier('nonexistent' as any)).toBeNull()
    })

    it('should return null for internal tiers (not in TIER_ORDER)', () => {
      expect(getUpgradeTier('internal_admin')).toBeNull()
    })
  })

  describe('getTtsQuality', () => {
    it('should return neural2 for free tier', () => {
      expect(getTtsQuality('free')).toBe('neural2')
    })

    it('should return neural2 for unknown tier', () => {
      expect(getTtsQuality('nonexistent' as any)).toBe('neural2')
    })

    it('should return chirp3hd for a tier with chirp3hd ttsQuality', () => {
      const chirpTier = Object.values(TIERS).find(t => t.features.ttsQuality === 'chirp3hd')
      if (chirpTier) {
        expect(getTtsQuality(chirpTier.id)).toBe('chirp3hd')
      }
    })
  })

  describe('formatPrice', () => {
    it('should return "Kostenlos" for 0', () => {
      expect(formatPrice(0)).toBe('Kostenlos')
    })

    it('should format a whole number price in EUR', () => {
      const result = formatPrice(10)
      expect(result).toContain('10')
      expect(result).toContain('\u20AC') // Euro sign
    })

    it('should format a decimal price in EUR', () => {
      const result = formatPrice(4.99)
      expect(result).toContain('4,99') // German locale uses comma
      expect(result).toContain('\u20AC')
    })

    it('should format large prices', () => {
      const result = formatPrice(1499)
      expect(result).toContain('1.499') // German uses dot as thousands separator
    })
  })
})
