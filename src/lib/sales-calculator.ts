// Sales Calculator — Computes savings and ROI for each segment.
// Used by the pricing page, sales site calculators, and proposal generators.
// All calculations reference the central tier config from tiers.ts.

import { TIERS, type TierId, formatPrice } from './tiers'

// ---------------------------------------------------------------------------
// Competitor pricing (used in savings calculations)
// ---------------------------------------------------------------------------

export const COMPETITOR_PRICES = {
  /** Cost per interpreter per day (8h) in EUR */
  interpreterPerDay: 350,
  /** Average number of interpreters needed per event/excursion (8 languages) */
  interpretersNeeded: 8,

  /** Vox hardware rental per device per day in EUR */
  voxPerDeviceDay: 3.50,

  /** Wordly.ai per hour in USD (converted to EUR at ~0.92) */
  wordlyPerHourEur: 69,

  /** KUDO per event (minimum) in EUR */
  kudoPerEventMin: 500,

  /** iTranslate Pro monthly in EUR */
  iTranslateMonthly: 5.99,

  /** DeepL Pro monthly in EUR */
  deeplMonthly: 8.74,
}

// ---------------------------------------------------------------------------
// Savings calculators per segment
// ---------------------------------------------------------------------------

export interface SavingsResult {
  ourMonthlyCost: number
  competitorMonthlyCost: number
  savingsPercent: number
  savingsEurMonth: number
  savingsEurYear: number
  competitorName: string
}

/** Guide: Compare vs Vox hardware rental */
export function calculateGuideSavings(params: {
  tierId: TierId
  listenersPerTour: number
  toursPerMonth: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const overageMinutes = Math.max(0,
    (params.toursPerMonth * 90) - (tier?.limits.sessionMinutesPerMonth || 0)
  )

  const ourCost = (tier?.pricing.monthlyEur || 0) +
    overageMinutes * (tier?.pricing.overagePerMinuteEur || 0)

  const voxCost = params.listenersPerTour *
    COMPETITOR_PRICES.voxPerDeviceDay *
    params.toursPerMonth

  const savings = voxCost - ourCost

  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: voxCost,
    savingsPercent: voxCost > 0 ? Math.round((savings / voxCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Vox Hardware',
  }
}

/** Event: Compare vs Wordly.ai */
export function calculateEventSavings(params: {
  tierId: TierId
  hoursPerMonth: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const overageMinutes = Math.max(0,
    (params.hoursPerMonth * 60) - (tier?.limits.sessionMinutesPerMonth || 0)
  )

  const ourCost = (tier?.pricing.monthlyEur || 0) +
    overageMinutes * (tier?.pricing.overagePerMinuteEur || 0)

  const wordlyCost = params.hoursPerMonth * COMPETITOR_PRICES.wordlyPerHourEur

  const savings = wordlyCost - ourCost

  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: wordlyCost,
    savingsPercent: wordlyCost > 0 ? Math.round((savings / wordlyCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Wordly.ai',
  }
}

/** Agency: Compare vs KUDO/interpreter combo */
export function calculateAgencySavings(params: {
  tierId: TierId
  guidesCount: number
  toursPerMonth: number
  minutesPerTour: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const totalMinutes = params.toursPerMonth * params.minutesPerTour
  const overageMinutes = Math.max(0,
    totalMinutes - (tier?.limits.sessionMinutesPerMonth || 0)
  )

  const ourCost = (tier?.pricing.monthlyEur || 0) +
    overageMinutes * (tier?.pricing.overagePerMinuteEur || 0)

  // Competitor: KUDO per-event minimum × tours + Vox hardware for guides
  const kudoCost = params.toursPerMonth * COMPETITOR_PRICES.kudoPerEventMin
  const voxCost = params.guidesCount * COMPETITOR_PRICES.voxPerDeviceDay * params.toursPerMonth * 10 // ~10 devices per guide

  const competitorCost = Math.min(kudoCost, voxCost) // conservative: pick cheaper alternative

  const savings = competitorCost - ourCost

  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: competitorCost,
    savingsPercent: competitorCost > 0 ? Math.round((savings / competitorCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'KUDO / Vox Hardware',
  }
}

/** Cruise: Compare vs human interpreters */
export function calculateCruiseSavings(params: {
  tierId: TierId
  shipsCount: number
  excursionsPerMonth: number
  minutesPerExcursion: number
  languages: number
  costPerGuideDay?: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const totalMinutes = params.excursionsPerMonth * params.minutesPerExcursion
  const overageMinutes = Math.max(0,
    totalMinutes - (tier?.limits.sessionMinutesPerMonth || 0)
  )

  const ourCost = (tier?.pricing.monthlyEur || 0) +
    overageMinutes * (tier?.pricing.overagePerMinuteEur || 0)

  // Human interpreters: X languages × cost/day × excursions
  const dailyCost = params.costPerGuideDay ?? COMPETITOR_PRICES.interpreterPerDay
  const interpreterCost = params.languages * dailyCost * params.excursionsPerMonth

  const savings = interpreterCost - ourCost

  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: interpreterCost,
    savingsPercent: interpreterCost > 0 ? Math.round((savings / interpreterCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Dolmetscher',
  }
}

/** Format a savings result for display */
export function formatSavings(result: SavingsResult): string {
  return `${result.savingsPercent}% günstiger als ${result.competitorName} — Sie sparen ${formatPrice(result.savingsEurMonth)}/Monat`
}
