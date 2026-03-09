import { describe, it, expect } from 'vitest'
import {
  TIERS,
  TIER_ORDER,
  INTERNAL_TIERS,
  isInternalTier,
  getTiersBySegment,
  hasFeature,
  isWithinListenerLimit,
  isWithinLanguageLimit,
  getUpgradeTier,
  getTtsQuality,
  formatPrice,
  type TierId,
} from '../tiers'

describe('TIERS configuration', () => {
  it('has all tier IDs in TIER_ORDER or INTERNAL_TIERS', () => {
    const allTierIds = [...TIER_ORDER, ...INTERNAL_TIERS]
    const definedIds = Object.keys(TIERS)
    expect(definedIds.sort()).toEqual(allTierIds.sort())
  })

  it('every tier has required properties', () => {
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

  it('free tier costs nothing', () => {
    expect(TIERS.free.pricing.monthlyEur).toBe(0)
    expect(TIERS.free.pricing.yearlyEur).toBe(0)
    expect(TIERS.free.pricing.overagePerMinuteEur).toBe(0)
  })

  it('internal tiers cost nothing', () => {
    for (const id of INTERNAL_TIERS) {
      expect(TIERS[id].pricing.monthlyEur).toBe(0)
      expect(TIERS[id].pricing.yearlyEur).toBe(0)
    }
  })

  it('yearly price is roughly 10x monthly (2 months free)', () => {
    for (const id of TIER_ORDER) {
      const tier = TIERS[id]
      if (tier.pricing.monthlyEur > 0) {
        expect(tier.pricing.yearlyEur).toBeCloseTo(tier.pricing.monthlyEur * 10, 1)
      }
    }
  })

  it('internal_admin has all features enabled', () => {
    const admin = TIERS.internal_admin
    expect(admin.features.apiAccess).toBe('full')
    expect(admin.features.analytics).toBe('enterprise')
    expect(admin.features.whiteLabel).toBe(true)
    expect(admin.features.ttsChirpAvailable).toBe(true)
    expect(admin.features.cloudStt).toBe(true)
    expect(admin.limits.maxListeners).toBe(0) // unlimited
    expect(admin.limits.maxLanguages).toBe(0) // unlimited
  })
})

describe('isInternalTier', () => {
  it('returns true for internal tiers', () => {
    expect(isInternalTier('internal_admin')).toBe(true)
    expect(isInternalTier('internal_tester')).toBe(true)
    expect(isInternalTier('internal_sales')).toBe(true)
  })

  it('returns false for public tiers', () => {
    expect(isInternalTier('free')).toBe(false)
    expect(isInternalTier('guide_pro')).toBe(false)
    expect(isInternalTier('cruise_armada')).toBe(false)
  })
})

describe('getTiersBySegment', () => {
  it('returns personal tiers', () => {
    const personal = getTiersBySegment('personal')
    expect(personal.map(t => t.id)).toEqual(['free', 'personal_pro'])
  })

  it('returns guide tiers', () => {
    const guide = getTiersBySegment('guide')
    expect(guide.map(t => t.id)).toEqual(['guide_basic', 'guide_pro'])
  })

  it('returns cruise tiers', () => {
    const cruise = getTiersBySegment('cruise')
    expect(cruise.map(t => t.id)).toEqual(['cruise_starter', 'cruise_fleet', 'cruise_armada'])
  })

  it('returns no internal tiers (they are not in TIER_ORDER)', () => {
    const internal = getTiersBySegment('internal')
    expect(internal).toEqual([])
  })
})

describe('hasFeature', () => {
  it('free tier has no live session', () => {
    expect(hasFeature('free', 'liveSession')).toBe(false)
  })

  it('guide_basic has live session', () => {
    expect(hasFeature('guide_basic', 'liveSession')).toBe(true)
  })

  it('handles string feature values (none = false)', () => {
    expect(hasFeature('free', 'apiAccess')).toBe(false)
    expect(hasFeature('agency_premium', 'apiAccess')).toBe(true)
  })

  it('returns false for unknown tier', () => {
    expect(hasFeature('nonexistent' as TierId, 'liveSession')).toBe(false)
  })
})

describe('isWithinListenerLimit', () => {
  it('free tier allows 1 listener', () => {
    expect(isWithinListenerLimit('free', 1)).toBe(true)
    expect(isWithinListenerLimit('free', 2)).toBe(false)
  })

  it('unlimited (0) allows any count', () => {
    expect(isWithinListenerLimit('cruise_starter', 9999)).toBe(true)
  })

  it('returns false for unknown tier', () => {
    expect(isWithinListenerLimit('nonexistent' as TierId, 1)).toBe(false)
  })
})

describe('isWithinLanguageLimit', () => {
  it('free tier allows 22 languages', () => {
    expect(isWithinLanguageLimit('free', 22)).toBe(true)
    expect(isWithinLanguageLimit('free', 23)).toBe(false)
  })

  it('unlimited (0) allows any count', () => {
    expect(isWithinLanguageLimit('agency_premium', 999)).toBe(true)
  })
})

describe('getUpgradeTier', () => {
  it('free upgrades to personal_pro', () => {
    const next = getUpgradeTier('free')
    expect(next?.id).toBe('personal_pro')
  })

  it('top tier has no upgrade', () => {
    expect(getUpgradeTier('cruise_armada')).toBeNull()
  })

  it('internal tier has no upgrade', () => {
    expect(getUpgradeTier('internal_admin')).toBeNull()
  })
})

describe('getTtsQuality', () => {
  it('free tier gets neural2', () => {
    expect(getTtsQuality('free')).toBe('neural2')
  })

  it('event_pro gets chirp3hd', () => {
    expect(getTtsQuality('event_pro')).toBe('chirp3hd')
  })

  it('unknown tier defaults to neural2', () => {
    expect(getTtsQuality('nonexistent' as TierId)).toBe('neural2')
  })
})

describe('formatPrice', () => {
  it('formats 0 as Kostenlos', () => {
    expect(formatPrice(0)).toBe('Kostenlos')
  })

  it('formats whole numbers without decimals', () => {
    const result = formatPrice(99)
    expect(result).toContain('99')
    expect(result).toContain('€')
  })

  it('formats decimal prices', () => {
    const result = formatPrice(4.99)
    expect(result).toContain('4,99')
    expect(result).toContain('€')
  })
})
