// Tests for Fintutto World — Landing Pages
import { describe, it, expect } from 'vitest'

import {
  buildLandingPageConfig,
  validateInviteCode,
  buildInviteVisitUpdate,
  type LandingPageConfig,
} from '../landing-pages'
import type { CrmInviteCode, CrmLead } from '../crm-segments'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeInvite(overrides: Partial<CrmInviteCode> = {}): CrmInviteCode {
  return {
    id: 'inv-1',
    code: 'TESTCODE',
    leadId: 'lead-1',
    segmentId: 'museum_small',
    tierId: null,
    campaignId: null,
    landingConfig: {},
    customMessage: null,
    customOffer: {},
    visits: 0,
    registrations: 0,
    firstVisitedAt: null,
    lastVisitedAt: null,
    registeredUserId: null,
    validFrom: '2025-01-01T00:00:00Z',
    validUntil: null,
    maxUses: 0,
    isActive: true,
    createdBy: null,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

type LeadPick = Pick<CrmLead, 'segmentId' | 'companyName' | 'contactFirstName' | 'contactLastName' | 'discountPercent'>

function makeLead(overrides: Partial<LeadPick> = {}): LeadPick {
  return {
    segmentId: 'museum_small',
    companyName: 'Test Museum',
    contactFirstName: 'Max',
    contactLastName: 'Mustermann',
    discountPercent: 0,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// buildLandingPageConfig
// ---------------------------------------------------------------------------
describe('buildLandingPageConfig', () => {
  it('should build a config with correct slug and invite code', () => {
    const config = buildLandingPageConfig(makeInvite(), makeLead())
    expect(config.slug).toBe('invite/TESTCODE')
    expect(config.inviteCode).toBe('TESTCODE')
  })

  it('should use company name in title when available', () => {
    const config = buildLandingPageConfig(makeInvite(), makeLead({ companyName: 'Acme Museum' }))
    expect(config.title).toContain('Acme Museum')
  })

  it('should use segment label in title when no company name', () => {
    const config = buildLandingPageConfig(makeInvite(), makeLead({ companyName: null }))
    expect(config.title).toContain('Kleines Museum')
  })

  it('should use segment from lead over invite', () => {
    const config = buildLandingPageConfig(
      makeInvite({ segmentId: 'hotel' }),
      makeLead({ segmentId: 'museum_large' }),
    )
    expect(config.segmentId).toBe('museum_large')
  })

  it('should fall back to invite segmentId when no lead', () => {
    const config = buildLandingPageConfig(makeInvite({ segmentId: 'hotel' }), null)
    expect(config.segmentId).toBe('hotel')
  })

  it('should build contact name from first and last name', () => {
    const config = buildLandingPageConfig(makeInvite(), makeLead({ contactFirstName: 'Anna', contactLastName: 'Schmidt' }))
    expect(config.contactName).toBe('Anna Schmidt')
  })

  it('should return null contactName when lead has no name', () => {
    const config = buildLandingPageConfig(makeInvite(), makeLead({ contactFirstName: null, contactLastName: null }))
    expect(config.contactName).toBeNull()
  })

  it('should set customDiscount and message when discount > 0', () => {
    const config = buildLandingPageConfig(makeInvite(), makeLead({ discountPercent: 20 }))
    expect(config.pricing.customDiscount).toBe(20)
    expect(config.pricing.customMessage).toContain('20%')
  })

  it('should have no custom message when discount is 0', () => {
    const config = buildLandingPageConfig(makeInvite(), makeLead({ discountPercent: 0 }))
    expect(config.pricing.customMessage).toBeNull()
  })

  it('should use default language de', () => {
    const config = buildLandingPageConfig(makeInvite(), null)
    expect(config.language).toBe('de')
  })

  it('should respect language option', () => {
    const config = buildLandingPageConfig(makeInvite(), null, { language: 'en' })
    expect(config.language).toBe('en')
  })

  it('should use default baseUrl in CTA', () => {
    const config = buildLandingPageConfig(makeInvite(), null)
    expect(config.hero.ctaUrl).toContain('https://fintutto.world')
  })

  it('should respect custom baseUrl', () => {
    const config = buildLandingPageConfig(makeInvite(), null, { baseUrl: 'https://custom.com' })
    expect(config.hero.ctaUrl).toContain('https://custom.com')
  })

  it('should set customOffer to null when invite has empty customOffer', () => {
    const config = buildLandingPageConfig(makeInvite({ customOffer: {} }), null)
    expect(config.customOffer).toBeNull()
  })

  it('should include customOffer when invite has non-empty customOffer', () => {
    const config = buildLandingPageConfig(makeInvite({ customOffer: { bonus: true } }), null)
    expect(config.customOffer).toEqual({ bonus: true })
  })

  it('should use UTM defaults from CRM', () => {
    const config = buildLandingPageConfig(makeInvite(), null)
    expect(config.utmSource).toBe('crm')
    expect(config.utmMedium).toBe('invite')
  })

  it('should use UTM values from landing config', () => {
    const config = buildLandingPageConfig(
      makeInvite({ landingConfig: { utm_source: 'email', utm_medium: 'campaign', utm_campaign: 'spring2025' } }),
      null,
    )
    expect(config.utmSource).toBe('email')
    expect(config.utmMedium).toBe('campaign')
    expect(config.utmCampaign).toBe('spring2025')
  })

  it('should fall back to other segment when unknown segment', () => {
    const config = buildLandingPageConfig(makeInvite({ segmentId: 'nonexistent' as never }), null)
    // Should not crash — falls back to CRM_SEGMENTS.other
    expect(config.segmentId).toBe('nonexistent')
  })
})

// ---------------------------------------------------------------------------
// validateInviteCode
// ---------------------------------------------------------------------------
describe('validateInviteCode', () => {
  it('should return not_found when invite is null', () => {
    const result = validateInviteCode(null)
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('not_found')
    expect(result.invite).toBeNull()
  })

  it('should return inactive when invite is not active', () => {
    const result = validateInviteCode(makeInvite({ isActive: false }))
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('inactive')
  })

  it('should return expired when validUntil is in the past', () => {
    const result = validateInviteCode(
      makeInvite({ validUntil: '2020-01-01T00:00:00Z' }),
      new Date('2025-06-01'),
    )
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('expired')
  })

  it('should return max_uses_reached when registrations >= maxUses', () => {
    const result = validateInviteCode(makeInvite({ maxUses: 5, registrations: 5 }))
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('max_uses_reached')
  })

  it('should return ok for a valid active invite', () => {
    const invite = makeInvite()
    const result = validateInviteCode(invite)
    expect(result.valid).toBe(true)
    expect(result.reason).toBe('ok')
    expect(result.invite).toBe(invite)
  })

  it('should allow unlimited uses when maxUses is 0', () => {
    const result = validateInviteCode(makeInvite({ maxUses: 0, registrations: 999 }))
    expect(result.valid).toBe(true)
    expect(result.reason).toBe('ok')
  })

  it('should accept invite when validUntil is in the future', () => {
    const result = validateInviteCode(
      makeInvite({ validUntil: '2030-01-01T00:00:00Z' }),
      new Date('2025-06-01'),
    )
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// buildInviteVisitUpdate
// ---------------------------------------------------------------------------
describe('buildInviteVisitUpdate', () => {
  it('should increment visits by 1', () => {
    const update = buildInviteVisitUpdate(makeInvite({ visits: 3 }))
    expect(update.visits).toBe(4)
  })

  it('should set lastVisitedAt', () => {
    const update = buildInviteVisitUpdate(makeInvite())
    expect(update.lastVisitedAt).toBeDefined()
  })

  it('should set firstVisitedAt when it was null', () => {
    const update = buildInviteVisitUpdate(makeInvite({ firstVisitedAt: null }))
    expect(update.firstVisitedAt).toBeDefined()
  })

  it('should not overwrite existing firstVisitedAt', () => {
    const update = buildInviteVisitUpdate(makeInvite({ firstVisitedAt: '2024-01-01T00:00:00Z' }))
    expect(update.firstVisitedAt).toBeUndefined()
  })
})
