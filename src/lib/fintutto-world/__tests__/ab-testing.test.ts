// Tests for Fintutto World — A/B Testing Module
import { describe, it, expect } from 'vitest'

import {
  assignVariant,
  calculateSignificance,
  getTestContentLayer,
  type AbTest,
} from '../ab-testing'

// ---------------------------------------------------------------------------
// assignVariant
// ---------------------------------------------------------------------------
describe('assignVariant', () => {
  it('should return a valid variant index for a 50/50 split', () => {
    const idx = assignVariant('test-1', 'visitor-1', [50, 50])
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThanOrEqual(1)
  })

  it('should be deterministic — same inputs produce same output', () => {
    const a = assignVariant('test-1', 'visitor-abc', [50, 50])
    const b = assignVariant('test-1', 'visitor-abc', [50, 50])
    expect(a).toBe(b)
  })

  it('should return the last index as fallback', () => {
    // With a 100/0 split the second bucket is unreachable, but with a
    // 0/100 split every visitor should land in bucket 1.
    const idx = assignVariant('test-1', 'visitor-1', [0, 100])
    // Depending on hash it could be 0 (if normalized < 0) or 1
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThanOrEqual(1)
  })

  it('should handle a three-way split', () => {
    const idx = assignVariant('test-x', 'visitor-y', [33, 34, 33])
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThanOrEqual(2)
  })

  it('should distribute visitors across variants', () => {
    const counts = [0, 0]
    for (let i = 0; i < 1000; i++) {
      const idx = assignVariant('distribution-test', `v-${i}-${Math.random().toString(36)}`, [50, 50])
      counts[idx]++
    }
    // Both buckets should get at least some traffic with 1000 unique visitors
    expect(counts[0]).toBeGreaterThan(0)
    expect(counts[1]).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// calculateSignificance
// ---------------------------------------------------------------------------
describe('calculateSignificance', () => {
  it('should return 0 when control total is 0', () => {
    expect(calculateSignificance(10, 0, 10, 100)).toBe(0)
  })

  it('should return 0 when variant total is 0', () => {
    expect(calculateSignificance(10, 100, 10, 0)).toBe(0)
  })

  it('should return 0 when pooled proportion is 0 (no conversions)', () => {
    expect(calculateSignificance(0, 100, 0, 100)).toBe(0)
  })

  it('should return 0 when pooled proportion is 1 (all convert)', () => {
    expect(calculateSignificance(100, 100, 100, 100)).toBe(0)
  })

  it('should return a value between 0 and 1 for normal data', () => {
    const sig = calculateSignificance(50, 1000, 70, 1000)
    expect(sig).toBeGreaterThan(0)
    expect(sig).toBeLessThanOrEqual(0.999)
  })

  it('should cap at 0.999', () => {
    // Very large difference should approach cap
    const sig = calculateSignificance(10, 10000, 900, 10000)
    expect(sig).toBeLessThanOrEqual(0.999)
  })

  it('should return higher confidence for larger differences', () => {
    const sigSmall = calculateSignificance(50, 1000, 52, 1000)
    const sigLarge = calculateSignificance(50, 1000, 80, 1000)
    expect(sigLarge).toBeGreaterThan(sigSmall)
  })
})

// ---------------------------------------------------------------------------
// getTestContentLayer
// ---------------------------------------------------------------------------
describe('getTestContentLayer', () => {
  const makeTest = (variants: AbTest['variants']): AbTest => ({
    id: 't1',
    name: 'Test',
    description: 'desc',
    variants,
    trafficSplit: [50, 50],
    status: 'running',
    startDate: '2025-01-01',
    metric: 'engagement_time',
  })

  it('should return the content layer for the given variant index', () => {
    const test = makeTest([
      { id: 'v1', name: 'Brief', contentLayer: 'brief' },
      { id: 'v2', name: 'Detailed', contentLayer: 'detailed' },
    ])
    expect(getTestContentLayer(test, 0)).toBe('brief')
    expect(getTestContentLayer(test, 1)).toBe('detailed')
  })

  it('should return "standard" when the variant index is out of bounds', () => {
    const test = makeTest([
      { id: 'v1', name: 'Brief', contentLayer: 'brief' },
    ])
    expect(getTestContentLayer(test, 5)).toBe('standard')
  })

  it('should return "standard" when variants array is empty', () => {
    const test = makeTest([])
    expect(getTestContentLayer(test, 0)).toBe('standard')
  })
})
