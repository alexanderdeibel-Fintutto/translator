// Tests for Stripe usage calculation (buildUsageRecord logic)
// Tests the pure function logic extracted from the Edge Function
import { describe, it, expect } from 'vitest'

// Replicate the buildUsageRecord function from artguide-stripe Edge Function
// (We test the logic, not the Deno-specific runtime)
function buildUsageRecord(museumId: string, metric: string, used: number, limit: number) {
  return {
    museumId,
    metric,
    used,
    limit,
    percentage: limit === 0 ? 0 : Math.round((used / limit) * 100),
    isExceeded: limit > 0 && used > limit,
  }
}

// Tier limits as defined in the Edge Function
const TIER_LIMITS = {
  artguide_starter: { maxArtworks: 50, maxStaffUsers: 3, maxMonthlyAiGenerations: 100, maxMonthlyTtsMinutes: 500, maxMediaStorageGb: 5 },
  artguide_professional: { maxArtworks: 500, maxStaffUsers: 10, maxMonthlyAiGenerations: 2000, maxMonthlyTtsMinutes: 5000, maxMediaStorageGb: 50 },
  artguide_enterprise: { maxArtworks: 0, maxStaffUsers: 0, maxMonthlyAiGenerations: 0, maxMonthlyTtsMinutes: 0, maxMediaStorageGb: 500 },
}

describe('buildUsageRecord', () => {
  it('calculates correct percentage for normal usage', () => {
    const record = buildUsageRecord('m1', 'artworks', 25, 50)
    expect(record.percentage).toBe(50)
    expect(record.isExceeded).toBe(false)
  })

  it('handles zero usage', () => {
    const record = buildUsageRecord('m1', 'staff_users', 0, 10)
    expect(record.percentage).toBe(0)
    expect(record.isExceeded).toBe(false)
  })

  it('handles usage at exact limit', () => {
    const record = buildUsageRecord('m1', 'artworks', 50, 50)
    expect(record.percentage).toBe(100)
    expect(record.isExceeded).toBe(false)
  })

  it('marks exceeded when over limit', () => {
    const record = buildUsageRecord('m1', 'artworks', 55, 50)
    expect(record.percentage).toBe(110)
    expect(record.isExceeded).toBe(true)
  })

  it('handles unlimited (enterprise) tier — limit=0 means unlimited', () => {
    const record = buildUsageRecord('m1', 'artworks', 1000, 0)
    expect(record.percentage).toBe(0)
    expect(record.isExceeded).toBe(false)
  })

  it('returns correct structure', () => {
    const record = buildUsageRecord('museum-abc', 'ai_generations', 75, 100)
    expect(record).toEqual({
      museumId: 'museum-abc',
      metric: 'ai_generations',
      used: 75,
      limit: 100,
      percentage: 75,
      isExceeded: false,
    })
  })

  it('rounds percentages correctly', () => {
    const record = buildUsageRecord('m1', 'tts_minutes', 333, 1000)
    expect(record.percentage).toBe(33) // 33.3 rounds to 33
  })
})

describe('tier limits configuration', () => {
  it('starter tier has expected limits', () => {
    const starter = TIER_LIMITS.artguide_starter
    expect(starter.maxArtworks).toBe(50)
    expect(starter.maxStaffUsers).toBe(3)
    expect(starter.maxMonthlyAiGenerations).toBe(100)
    expect(starter.maxMonthlyTtsMinutes).toBe(500)
    expect(starter.maxMediaStorageGb).toBe(5)
  })

  it('professional tier has higher limits than starter', () => {
    const pro = TIER_LIMITS.artguide_professional
    const starter = TIER_LIMITS.artguide_starter
    expect(pro.maxArtworks).toBeGreaterThan(starter.maxArtworks)
    expect(pro.maxStaffUsers).toBeGreaterThan(starter.maxStaffUsers)
    expect(pro.maxMonthlyAiGenerations).toBeGreaterThan(starter.maxMonthlyAiGenerations)
    expect(pro.maxMonthlyTtsMinutes).toBeGreaterThan(starter.maxMonthlyTtsMinutes)
    expect(pro.maxMediaStorageGb).toBeGreaterThan(starter.maxMediaStorageGb)
  })

  it('enterprise tier uses 0 for unlimited fields (except storage)', () => {
    const ent = TIER_LIMITS.artguide_enterprise
    expect(ent.maxArtworks).toBe(0) // unlimited
    expect(ent.maxStaffUsers).toBe(0) // unlimited
    expect(ent.maxMonthlyAiGenerations).toBe(0) // unlimited
    expect(ent.maxMonthlyTtsMinutes).toBe(0) // unlimited
    expect(ent.maxMediaStorageGb).toBe(500) // 500GB hard cap
  })

  it('generates correct usage records for all 5 metrics per museum', () => {
    const limits = TIER_LIMITS.artguide_starter
    const museumId = 'test-museum'

    const metrics = [
      buildUsageRecord(museumId, 'artworks', 30, limits.maxArtworks),
      buildUsageRecord(museumId, 'staff_users', 2, limits.maxStaffUsers),
      buildUsageRecord(museumId, 'ai_generations', 50, limits.maxMonthlyAiGenerations),
      buildUsageRecord(museumId, 'tts_minutes', 400, limits.maxMonthlyTtsMinutes),
      buildUsageRecord(museumId, 'storage_gb', 3.5, limits.maxMediaStorageGb),
    ]

    expect(metrics).toHaveLength(5)
    expect(metrics.every(m => m.museumId === museumId)).toBe(true)
    expect(metrics.every(m => !m.isExceeded)).toBe(true)

    expect(metrics[0].percentage).toBe(60)  // 30/50
    expect(metrics[1].percentage).toBe(67)  // 2/3
    expect(metrics[2].percentage).toBe(50)  // 50/100
    expect(metrics[3].percentage).toBe(80)  // 400/500
    expect(metrics[4].percentage).toBe(70)  // 3.5/5
  })
})
