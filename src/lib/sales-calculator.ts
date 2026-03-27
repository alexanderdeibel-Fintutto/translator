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

// ---------------------------------------------------------------------------
// Market-segment calculators (authority, medical, hospitality, education, conference)
// ---------------------------------------------------------------------------

/** Authority / Behörde: Compare vs. Dolmetscher-Kosten */
export function calculateAuthoritySavings(params: {
  tierId: TierId
  /** Anzahl Schalter / Arbeitsplätze */
  countersCount: number
  /** Gespräche pro Schalter pro Monat */
  sessionsPerCounter: number
  /** Durchschnittliche Dolmetscher-Kosten pro Termin in EUR */
  interpreterCostPerSession?: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const ourCost = (tier?.pricing.monthlyEur || 0) * params.countersCount
  // Dolmetscher: Mindesthonorar 60 EUR/Termin (Telefon-/Videodolmetschen) oder 120 EUR Präsenz
  const costPerSession = params.interpreterCostPerSession ?? 60
  const interpreterCost = params.sessionsPerCounter * params.countersCount * costPerSession
  const savings = interpreterCost - ourCost
  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: interpreterCost,
    savingsPercent: interpreterCost > 0 ? Math.round((savings / interpreterCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Telefon-Dolmetscher',
  }
}

/** Medical: Compare vs. Dolmetscher-/Sprachmittlerkosten */
export function calculateMedicalSavings(params: {
  tierId: TierId
  /** Anzahl Ärzte / Behandlungsräume */
  practitionersCount: number
  /** Patienten mit Sprachbedarf pro Monat */
  patientsPerMonth: number
  /** Dolmetscher-Kosten pro Termin in EUR */
  interpreterCostPerSession?: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const ourCost = (tier?.pricing.monthlyEur || 0) * params.practitionersCount
  // Sprachmittler: 80–150 EUR/Stunde, Mindestabrechnung 1h
  const costPerSession = params.interpreterCostPerSession ?? 90
  const interpreterCost = params.patientsPerMonth * costPerSession
  const savings = interpreterCost - ourCost
  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: interpreterCost,
    savingsPercent: interpreterCost > 0 ? Math.round((savings / interpreterCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Sprachmittler',
  }
}

/** Hospitality / Hotel-Counter: Compare vs. mehrsprachiges Personal */
export function calculateHospitalitySavings(params: {
  tierId: TierId
  /** Anzahl Counter / Rezeptionen */
  countersCount: number
  /** Gäste-Interaktionen mit Sprachbedarf pro Monat */
  interactionsPerMonth: number
  /** Kosten für mehrsprachige Aushilfe pro Stunde */
  staffCostPerHour?: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const ourCost = (tier?.pricing.monthlyEur || 0) * params.countersCount
  // Mehrsprachige Aushilfe: ~25 EUR/h, ca. 10 Min pro Interaktion
  const costPerHour = params.staffCostPerHour ?? 25
  const staffCost = params.interactionsPerMonth * (costPerHour / 6) // 10 Min = 1/6 Stunde
  const savings = staffCost - ourCost
  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: staffCost,
    savingsPercent: staffCost > 0 ? Math.round((savings / staffCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Mehrsprachiges Personal',
  }
}

/** Education / Schule: Compare vs. Schulbegleiter / Sprachmittler */
export function calculateEducationSavings(params: {
  tierId: TierId
  /** Anzahl Lehrkräfte */
  teachersCount: number
  /** Elterngespräche / Beratungen mit Sprachbedarf pro Monat */
  sessionsPerMonth: number
  /** Kosten für Schulbegleiter / Dolmetscher pro Termin */
  interpreterCostPerSession?: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const ourCost = (tier?.pricing.monthlyEur || 0) * params.teachersCount
  // Schulbegleiter / kommunaler Dolmetscher: ~50 EUR/Termin
  const costPerSession = params.interpreterCostPerSession ?? 50
  const interpreterCost = params.sessionsPerMonth * costPerSession
  const savings = interpreterCost - ourCost
  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: interpreterCost,
    savingsPercent: interpreterCost > 0 ? Math.round((savings / interpreterCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Schulbegleiter / Dolmetscher',
  }
}

/** Conference: Compare vs. Simultandolmetscher */
export function calculateConferenceSavings(params: {
  tierId: TierId
  /** Anzahl Konferenzen / Veranstaltungen pro Monat */
  eventsPerMonth: number
  /** Anzahl Sprachen pro Veranstaltung */
  languagesPerEvent: number
  /** Kosten pro Dolmetscher pro Tag */
  interpreterDayCost?: number
}): SavingsResult {
  const tier = TIERS[params.tierId]
  const ourCost = tier?.pricing.monthlyEur || 0
  // Simultandolmetscher: 1.500–3.000 EUR/Tag/Sprache (2 Dolmetscher im Team)
  const dayCost = params.interpreterDayCost ?? 2000
  const interpreterCost = params.eventsPerMonth * params.languagesPerEvent * dayCost
  const savings = interpreterCost - ourCost
  return {
    ourMonthlyCost: ourCost,
    competitorMonthlyCost: interpreterCost,
    savingsPercent: interpreterCost > 0 ? Math.round((savings / interpreterCost) * 100) : 0,
    savingsEurMonth: savings,
    savingsEurYear: savings * 12,
    competitorName: 'Simultandolmetscher',
  }
}
