// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import {
  calculateGuideSavings,
  calculateEventSavings,
  calculateAgencySavings,
  calculateCruiseSavings,
  formatSavings,
  COMPETITOR_PRICES,
  type SavingsResult,
} from '../sales-calculator'

function assertSavingsResultShape(result: SavingsResult) {
  expect(typeof result.ourMonthlyCost).toBe('number')
  expect(typeof result.competitorMonthlyCost).toBe('number')
  expect(typeof result.savingsPercent).toBe('number')
  expect(typeof result.savingsEurMonth).toBe('number')
  expect(typeof result.savingsEurYear).toBe('number')
  expect(typeof result.competitorName).toBe('string')
}

describe('sales-calculator', () => {
  describe('COMPETITOR_PRICES', () => {
    it('should have all pricing fields', () => {
      expect(COMPETITOR_PRICES.interpreterPerDay).toBeGreaterThan(0)
      expect(COMPETITOR_PRICES.interpretersNeeded).toBeGreaterThan(0)
      expect(COMPETITOR_PRICES.voxPerDeviceDay).toBeGreaterThan(0)
      expect(COMPETITOR_PRICES.wordlyPerHourEur).toBeGreaterThan(0)
      expect(COMPETITOR_PRICES.kudoPerEventMin).toBeGreaterThan(0)
      expect(COMPETITOR_PRICES.iTranslateMonthly).toBeGreaterThan(0)
      expect(COMPETITOR_PRICES.deeplMonthly).toBeGreaterThan(0)
    })
  })

  describe('calculateGuideSavings', () => {
    it('should return a valid SavingsResult shape', () => {
      const result = calculateGuideSavings({
        tierId: 'guide_basic',
        listenersPerTour: 10,
        toursPerMonth: 8,
      })
      assertSavingsResultShape(result)
    })

    it('should have positive savings for guide_basic with typical usage', () => {
      const result = calculateGuideSavings({
        tierId: 'guide_basic',
        listenersPerTour: 15,
        toursPerMonth: 10,
      })
      expect(result.savingsEurMonth).toBeGreaterThan(0)
      expect(result.savingsPercent).toBeGreaterThan(0)
    })

    it('should compute yearly savings as 12x monthly', () => {
      const result = calculateGuideSavings({
        tierId: 'guide_basic',
        listenersPerTour: 10,
        toursPerMonth: 5,
      })
      expect(result.savingsEurYear).toBe(result.savingsEurMonth * 12)
    })

    it('should handle 0 tours per month', () => {
      const result = calculateGuideSavings({
        tierId: 'guide_basic',
        listenersPerTour: 10,
        toursPerMonth: 0,
      })
      assertSavingsResultShape(result)
      expect(result.competitorMonthlyCost).toBe(0)
    })

    it('should handle 0 listeners per tour', () => {
      const result = calculateGuideSavings({
        tierId: 'guide_basic',
        listenersPerTour: 0,
        toursPerMonth: 10,
      })
      assertSavingsResultShape(result)
      expect(result.competitorMonthlyCost).toBe(0)
    })

    it('should set competitorName to Vox Hardware', () => {
      const result = calculateGuideSavings({
        tierId: 'guide_basic',
        listenersPerTour: 10,
        toursPerMonth: 5,
      })
      expect(result.competitorName).toBe('Vox Hardware')
    })

    it('should work with free tier', () => {
      const result = calculateGuideSavings({
        tierId: 'free',
        listenersPerTour: 5,
        toursPerMonth: 3,
      })
      assertSavingsResultShape(result)
    })
  })

  describe('calculateEventSavings', () => {
    it('should return a valid SavingsResult shape', () => {
      const result = calculateEventSavings({
        tierId: 'event_basic',
        hoursPerMonth: 20,
      })
      assertSavingsResultShape(result)
    })

    it('should have positive savings for event_basic with typical usage', () => {
      const result = calculateEventSavings({
        tierId: 'event_basic',
        hoursPerMonth: 20,
      })
      expect(result.savingsEurMonth).toBeGreaterThan(0)
    })

    it('should handle 0 hours', () => {
      const result = calculateEventSavings({
        tierId: 'event_basic',
        hoursPerMonth: 0,
      })
      assertSavingsResultShape(result)
      expect(result.competitorMonthlyCost).toBe(0)
    })

    it('should compare against Wordly.ai', () => {
      const result = calculateEventSavings({
        tierId: 'event_basic',
        hoursPerMonth: 10,
      })
      expect(result.competitorName).toBe('Wordly.ai')
    })

    it('should compute yearly as 12x monthly', () => {
      const result = calculateEventSavings({
        tierId: 'event_basic',
        hoursPerMonth: 15,
      })
      expect(result.savingsEurYear).toBe(result.savingsEurMonth * 12)
    })
  })

  describe('calculateAgencySavings', () => {
    it('should return a valid SavingsResult shape', () => {
      const result = calculateAgencySavings({
        tierId: 'agency_standard',
        guidesCount: 5,
        toursPerMonth: 20,
        minutesPerTour: 90,
      })
      assertSavingsResultShape(result)
    })

    it('should handle 0 tours', () => {
      const result = calculateAgencySavings({
        tierId: 'agency_standard',
        guidesCount: 5,
        toursPerMonth: 0,
        minutesPerTour: 90,
      })
      assertSavingsResultShape(result)
      expect(result.competitorMonthlyCost).toBe(0)
    })

    it('should compare against KUDO / Vox Hardware', () => {
      const result = calculateAgencySavings({
        tierId: 'agency_standard',
        guidesCount: 3,
        toursPerMonth: 10,
        minutesPerTour: 60,
      })
      expect(result.competitorName).toBe('KUDO / Vox Hardware')
    })
  })

  describe('calculateCruiseSavings', () => {
    it('should return a valid SavingsResult shape', () => {
      const result = calculateCruiseSavings({
        tierId: 'cruise_starter',
        shipsCount: 1,
        excursionsPerMonth: 10,
        minutesPerExcursion: 120,
        languages: 5,
      })
      assertSavingsResultShape(result)
    })

    it('should handle 0 excursions', () => {
      const result = calculateCruiseSavings({
        tierId: 'cruise_starter',
        shipsCount: 2,
        excursionsPerMonth: 0,
        minutesPerExcursion: 90,
        languages: 8,
      })
      assertSavingsResultShape(result)
      expect(result.competitorMonthlyCost).toBe(0)
    })

    it('should use custom costPerGuideDay when provided', () => {
      const result = calculateCruiseSavings({
        tierId: 'cruise_starter',
        shipsCount: 1,
        excursionsPerMonth: 10,
        minutesPerExcursion: 120,
        languages: 5,
        costPerGuideDay: 500,
      })
      assertSavingsResultShape(result)
      // With higher cost per guide day, competitor cost should be higher
      const defaultResult = calculateCruiseSavings({
        tierId: 'cruise_starter',
        shipsCount: 1,
        excursionsPerMonth: 10,
        minutesPerExcursion: 120,
        languages: 5,
      })
      expect(result.competitorMonthlyCost).toBeGreaterThan(defaultResult.competitorMonthlyCost)
    })

    it('should compare against Dolmetscher', () => {
      const result = calculateCruiseSavings({
        tierId: 'cruise_starter',
        shipsCount: 1,
        excursionsPerMonth: 5,
        minutesPerExcursion: 60,
        languages: 3,
      })
      expect(result.competitorName).toBe('Dolmetscher')
    })
  })

  describe('formatSavings', () => {
    it('should format a positive savings result', () => {
      const result: SavingsResult = {
        ourMonthlyCost: 50,
        competitorMonthlyCost: 500,
        savingsPercent: 90,
        savingsEurMonth: 450,
        savingsEurYear: 5400,
        competitorName: 'Vox Hardware',
      }
      const formatted = formatSavings(result)
      expect(formatted).toContain('90%')
      expect(formatted).toContain('Vox Hardware')
      expect(formatted).toContain('/Monat')
    })

    it('should include competitor name in output', () => {
      const result: SavingsResult = {
        ourMonthlyCost: 100,
        competitorMonthlyCost: 200,
        savingsPercent: 50,
        savingsEurMonth: 100,
        savingsEurYear: 1200,
        competitorName: 'Wordly.ai',
      }
      const formatted = formatSavings(result)
      expect(formatted).toContain('Wordly.ai')
    })
  })
})
