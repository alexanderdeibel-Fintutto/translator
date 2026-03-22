import { describe, it, expect } from 'vitest'
import {
  ARTGUIDE_TIERS,
  getArtGuideTier,
  isWithinArtworkLimit,
  hasFeature,
  canUsePositioning,
} from '../artguide-tiers'

describe('artguide-tiers', () => {
  describe('ARTGUIDE_TIERS', () => {
    it('should define all three tiers', () => {
      expect(ARTGUIDE_TIERS.artguide_starter).toBeDefined()
      expect(ARTGUIDE_TIERS.artguide_professional).toBeDefined()
      expect(ARTGUIDE_TIERS.artguide_enterprise).toBeDefined()
    })

    it('should have correct pricing hierarchy', () => {
      const starter = ARTGUIDE_TIERS.artguide_starter.pricing
      const pro = ARTGUIDE_TIERS.artguide_professional.pricing
      const enterprise = ARTGUIDE_TIERS.artguide_enterprise.pricing
      expect(starter.monthlyEur).toBeLessThan(pro.monthlyEur)
      expect(pro.monthlyEur).toBeLessThan(enterprise.monthlyEur)
    })

    it('should have yearly pricing less than 12x monthly', () => {
      for (const tier of Object.values(ARTGUIDE_TIERS)) {
        expect(tier.pricing.yearlyEur).toBeLessThan(tier.pricing.monthlyEur * 12)
      }
    })

    it('should have increasing artwork limits', () => {
      expect(ARTGUIDE_TIERS.artguide_starter.limits.maxArtworks).toBe(50)
      expect(ARTGUIDE_TIERS.artguide_professional.limits.maxArtworks).toBe(500)
      expect(ARTGUIDE_TIERS.artguide_enterprise.limits.maxArtworks).toBe(0) // unlimited
    })
  })

  describe('getArtGuideTier', () => {
    it('should return the starter tier', () => {
      const tier = getArtGuideTier('artguide_starter')
      expect(tier.id).toBe('artguide_starter')
      expect(tier.name).toBe('Starter')
    })

    it('should return the professional tier', () => {
      const tier = getArtGuideTier('artguide_professional')
      expect(tier.id).toBe('artguide_professional')
    })

    it('should return the enterprise tier', () => {
      const tier = getArtGuideTier('artguide_enterprise')
      expect(tier.id).toBe('artguide_enterprise')
    })
  })

  describe('isWithinArtworkLimit', () => {
    it('should return true when count is within starter limit', () => {
      expect(isWithinArtworkLimit('artguide_starter', 50)).toBe(true)
    })

    it('should return false when count exceeds starter limit', () => {
      expect(isWithinArtworkLimit('artguide_starter', 51)).toBe(false)
    })

    it('should return true for enterprise with any count (unlimited)', () => {
      expect(isWithinArtworkLimit('artguide_enterprise', 999999)).toBe(true)
    })

    it('should return true for zero artworks', () => {
      expect(isWithinArtworkLimit('artguide_starter', 0)).toBe(true)
    })

    it('should return false for invalid tier ID', () => {
      // @ts-expect-error testing invalid input
      expect(isWithinArtworkLimit('nonexistent', 10)).toBe(false)
    })
  })

  describe('hasFeature', () => {
    it('should return true for audio guide on all tiers', () => {
      expect(hasFeature('artguide_starter', 'audioGuide')).toBe(true)
      expect(hasFeature('artguide_professional', 'audioGuide')).toBe(true)
      expect(hasFeature('artguide_enterprise', 'audioGuide')).toBe(true)
    })

    it('should return false for white label on starter', () => {
      expect(hasFeature('artguide_starter', 'whiteLabel')).toBe(false)
    })

    it('should return true for white label on enterprise', () => {
      expect(hasFeature('artguide_enterprise', 'whiteLabel')).toBe(true)
    })

    it('should return false for offline mode on starter', () => {
      expect(hasFeature('artguide_starter', 'offlineMode')).toBe(false)
    })

    it('should return true for offline mode on professional', () => {
      expect(hasFeature('artguide_professional', 'offlineMode')).toBe(true)
    })

    it('should handle string features (indoorPositioning)', () => {
      // starter has 'qr' which is not 'none', so should return true
      expect(hasFeature('artguide_starter', 'indoorPositioning')).toBe(true)
    })

    it('should return false for invalid tier ID', () => {
      // @ts-expect-error testing invalid input
      expect(hasFeature('nonexistent', 'audioGuide')).toBe(false)
    })

    it('should return false for API access on starter', () => {
      expect(hasFeature('artguide_starter', 'apiAccess')).toBe(false)
    })

    it('should return true for API access on enterprise', () => {
      expect(hasFeature('artguide_enterprise', 'apiAccess')).toBe(true)
    })
  })

  describe('canUsePositioning', () => {
    it('should allow QR for starter', () => {
      expect(canUsePositioning('artguide_starter', 'qr')).toBe(true)
    })

    it('should not allow BLE for starter', () => {
      expect(canUsePositioning('artguide_starter', 'ble')).toBe(false)
    })

    it('should allow BLE for professional', () => {
      expect(canUsePositioning('artguide_professional', 'ble')).toBe(true)
    })

    it('should not allow WiFi for professional (only ble)', () => {
      expect(canUsePositioning('artguide_professional', 'wifi')).toBe(false)
    })

    it('should allow all methods for enterprise', () => {
      expect(canUsePositioning('artguide_enterprise', 'qr')).toBe(true)
      expect(canUsePositioning('artguide_enterprise', 'ble')).toBe(true)
      expect(canUsePositioning('artguide_enterprise', 'wifi')).toBe(true)
      expect(canUsePositioning('artguide_enterprise', 'gps')).toBe(true)
    })

    it('should return false for invalid tier ID', () => {
      // @ts-expect-error testing invalid input
      expect(canUsePositioning('nonexistent', 'qr')).toBe(false)
    })
  })
})
