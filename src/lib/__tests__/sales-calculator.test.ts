import { describe, it, expect } from 'vitest'
import {
  COMPETITOR_PRICES,
  calculateGuideSavings,
  calculateEventSavings,
  calculateAgencySavings,
  calculateCruiseSavings,
  formatSavings,
} from '../sales-calculator'

describe('COMPETITOR_PRICES', () => {
  it('has positive values for all prices', () => {
    expect(COMPETITOR_PRICES.interpreterPerDay).toBeGreaterThan(0)
    expect(COMPETITOR_PRICES.voxPerDeviceDay).toBeGreaterThan(0)
    expect(COMPETITOR_PRICES.wordlyPerHourEur).toBeGreaterThan(0)
  })
})

describe('calculateGuideSavings', () => {
  it('calculates savings vs Vox hardware', () => {
    const result = calculateGuideSavings({
      tierId: 'guide_basic',
      listenersPerTour: 10,
      toursPerMonth: 10,
    })
    expect(result.competitorName).toBe('Vox Hardware')
    expect(result.ourMonthlyCost).toBeGreaterThan(0)
    expect(result.competitorMonthlyCost).toBeGreaterThan(0)
    expect(result.savingsPercent).toBeGreaterThan(0)
    expect(result.savingsEurYear).toBe(result.savingsEurMonth * 12)
  })

  it('includes overage costs when exceeding session limit', () => {
    const result = calculateGuideSavings({
      tierId: 'guide_basic', // 300 min/month
      listenersPerTour: 10,
      toursPerMonth: 20, // 20 * 90 = 1800 min → 1500 overage
    })
    // Our cost should be more than just the monthly fee
    expect(result.ourMonthlyCost).toBeGreaterThan(19.90)
  })
})

describe('calculateEventSavings', () => {
  it('calculates savings vs Wordly.ai', () => {
    const result = calculateEventSavings({
      tierId: 'event_basic',
      hoursPerMonth: 30,
    })
    expect(result.competitorName).toBe('Wordly.ai')
    expect(result.competitorMonthlyCost).toBe(30 * COMPETITOR_PRICES.wordlyPerHourEur)
    expect(result.savingsPercent).toBeGreaterThan(0)
  })
})

describe('calculateAgencySavings', () => {
  it('calculates savings vs KUDO / Vox', () => {
    const result = calculateAgencySavings({
      tierId: 'agency_standard',
      guidesCount: 5,
      toursPerMonth: 20,
      minutesPerTour: 90,
    })
    expect(result.competitorName).toBe('KUDO / Vox Hardware')
    expect(result.ourMonthlyCost).toBeGreaterThan(0)
  })
})

describe('calculateCruiseSavings', () => {
  it('calculates savings vs interpreters', () => {
    const result = calculateCruiseSavings({
      tierId: 'cruise_starter',
      shipsCount: 1,
      excursionsPerMonth: 20,
      minutesPerExcursion: 90,
      languages: 5,
    })
    expect(result.competitorName).toBe('Dolmetscher')
    expect(result.competitorMonthlyCost).toBeGreaterThan(0)
    expect(result.savingsPercent).toBeGreaterThan(0)
  })

  it('accepts custom costPerGuideDay', () => {
    const result = calculateCruiseSavings({
      tierId: 'cruise_starter',
      shipsCount: 1,
      excursionsPerMonth: 10,
      minutesPerExcursion: 60,
      languages: 3,
      costPerGuideDay: 500,
    })
    expect(result.competitorMonthlyCost).toBe(3 * 500 * 10)
  })
})

describe('formatSavings', () => {
  it('formats savings message', () => {
    const result = calculateGuideSavings({
      tierId: 'guide_basic',
      listenersPerTour: 10,
      toursPerMonth: 10,
    })
    const formatted = formatSavings(result)
    expect(formatted).toContain('Vox Hardware')
    expect(formatted).toContain('%')
    expect(formatted).toContain('€')
  })
})
