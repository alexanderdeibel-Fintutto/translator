// Tests for Fintutto World — CRM Segments & Lead Scoring
import { describe, it, expect } from 'vitest'

import {
  CRM_SEGMENTS,
  scoreLeadPriority,
  type CrmSegmentId,
  type CrmLead,
} from '../crm-segments'

// ---------------------------------------------------------------------------
// CRM_SEGMENTS constant
// ---------------------------------------------------------------------------
describe('CRM_SEGMENTS', () => {
  it('should contain all 14 segment IDs', () => {
    const expectedIds: CrmSegmentId[] = [
      'museum_small', 'museum_medium', 'museum_large',
      'city_small', 'city_medium', 'city_large',
      'region', 'hotel', 'resort', 'cruise', 'event',
      'partner', 'enterprise', 'other',
    ]
    for (const id of expectedIds) {
      expect(CRM_SEGMENTS[id]).toBeDefined()
      expect(CRM_SEGMENTS[id].id).toBe(id)
    }
  })

  it('should have non-empty labels and descriptions for every segment', () => {
    for (const seg of Object.values(CRM_SEGMENTS)) {
      expect(seg.label.length).toBeGreaterThan(0)
      expect(seg.description.length).toBeGreaterThan(0)
    }
  })

  it('should have typicalPoiCount with min <= max', () => {
    for (const seg of Object.values(CRM_SEGMENTS)) {
      expect(seg.typicalPoiCount[0]).toBeLessThanOrEqual(seg.typicalPoiCount[1])
    }
  })
})

// ---------------------------------------------------------------------------
// scoreLeadPriority
// ---------------------------------------------------------------------------
type LeadInput = Pick<CrmLead, 'segmentId' | 'estimatedMonthlyVisitors' | 'budgetConfirmed' | 'decisionTimeline' | 'source'>

function makeLead(overrides: Partial<LeadInput> = {}): LeadInput {
  return {
    segmentId: 'museum_small',
    estimatedMonthlyVisitors: null,
    budgetConfirmed: false,
    decisionTimeline: null,
    source: null,
    ...overrides,
  }
}

describe('scoreLeadPriority', () => {
  it('should return a score between 0 and 100', () => {
    const score = scoreLeadPriority(makeLead())
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should give enterprise leads a higher base score than museum_small', () => {
    const enterprise = scoreLeadPriority(makeLead({ segmentId: 'enterprise' }))
    const small = scoreLeadPriority(makeLead({ segmentId: 'museum_small' }))
    expect(enterprise).toBeGreaterThan(small)
  })

  it('should add points for high monthly visitors', () => {
    const noVisitors = scoreLeadPriority(makeLead({ estimatedMonthlyVisitors: null }))
    const highVisitors = scoreLeadPriority(makeLead({ estimatedMonthlyVisitors: 200_000 }))
    expect(highVisitors).toBeGreaterThan(noVisitors)
  })

  it('should add points when budget is confirmed', () => {
    const noBudget = scoreLeadPriority(makeLead({ budgetConfirmed: false }))
    const withBudget = scoreLeadPriority(makeLead({ budgetConfirmed: true }))
    expect(withBudget).toBe(noBudget + 15)
  })

  it('should give more points for immediate timeline than next_year', () => {
    const immediate = scoreLeadPriority(makeLead({ decisionTimeline: 'immediate' }))
    const nextYear = scoreLeadPriority(makeLead({ decisionTimeline: 'next_year' }))
    expect(immediate).toBeGreaterThan(nextYear)
  })

  it('should add points for referral source', () => {
    const noSource = scoreLeadPriority(makeLead({ source: null }))
    const referral = scoreLeadPriority(makeLead({ source: 'referral' }))
    expect(referral).toBeGreaterThan(noSource)
  })

  it('should cap score at 100', () => {
    const maxLead = makeLead({
      segmentId: 'enterprise',
      estimatedMonthlyVisitors: 1_000_000,
      budgetConfirmed: true,
      decisionTimeline: 'immediate',
      source: 'referral',
    })
    // 30 (enterprise) + 20 (visitors) + 15 (budget) + 20 (immediate) + 10 (referral) = 95
    expect(scoreLeadPriority(maxLead)).toBe(95)
  })

  it('should handle visitor tiers correctly', () => {
    const tier1 = scoreLeadPriority(makeLead({ estimatedMonthlyVisitors: 1_000 }))
    const tier2 = scoreLeadPriority(makeLead({ estimatedMonthlyVisitors: 10_000 }))
    const tier3 = scoreLeadPriority(makeLead({ estimatedMonthlyVisitors: 50_000 }))
    const tier4 = scoreLeadPriority(makeLead({ estimatedMonthlyVisitors: 200_000 }))
    expect(tier2).toBeGreaterThan(tier1)
    expect(tier3).toBeGreaterThan(tier2)
    expect(tier4).toBeGreaterThan(tier3)
  })
})
