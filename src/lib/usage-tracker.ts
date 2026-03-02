// Usage Tracker — Monitors session minutes, translations, and listeners per billing period.
// Stores usage locally (IndexedDB) and syncs to Supabase when online.
// The app reads from local state for instant enforcement; the server is the billing authority.

import type { TierId } from './tiers'
import { TIERS } from './tiers'

export interface UsageRecord {
  tierId: TierId
  periodStart: string        // ISO date — first day of billing month
  periodEnd: string          // ISO date — last day of billing month
  sessionMinutesUsed: number
  translationCharsUsed: number
  translationsCount: number
  peakListeners: number
  languagesUsed: string[]    // unique language codes used this period
  dailyTranslationsCount: number  // translations today
  dailyDate: string               // YYYY-MM-DD of last daily count
}

const STORAGE_KEY = 'gt_usage'

// ---------------------------------------------------------------------------
// Local storage (fast, works offline)
// ---------------------------------------------------------------------------

function getBillingPeriod(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function loadUsage(): UsageRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as UsageRecord
      const { start } = getBillingPeriod()
      // Reset if we're in a new billing period
      if (parsed.periodStart !== start) {
        return createEmptyUsage()
      }
      return parsed
    }
  } catch {
    // corrupted — reset
  }
  return createEmptyUsage()
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function createEmptyUsage(): UsageRecord {
  const { start, end } = getBillingPeriod()
  return {
    tierId: 'free',
    periodStart: start,
    periodEnd: end,
    sessionMinutesUsed: 0,
    translationCharsUsed: 0,
    translationsCount: 0,
    peakListeners: 0,
    languagesUsed: [],
    dailyTranslationsCount: 0,
    dailyDate: todayISO(),
  }
}

function saveUsage(usage: UsageRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  } catch {
    // localStorage full — silent fail
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let currentUsage: UsageRecord = loadUsage()

/** Get current usage for the billing period */
export function getUsage(): Readonly<UsageRecord> {
  return currentUsage
}

/** Update the tier ID (called when user logs in or subscription changes) */
export function setUsageTier(tierId: TierId): void {
  currentUsage.tierId = tierId
  saveUsage(currentUsage)
}

/** Record session minutes consumed (called every minute during an active session) */
export function recordSessionMinute(minutes: number = 1): void {
  currentUsage.sessionMinutesUsed += minutes
  saveUsage(currentUsage)
}

/** Record a translation request */
export function recordTranslation(charCount: number, targetLanguage: string): void {
  currentUsage.translationCharsUsed += charCount
  currentUsage.translationsCount += 1
  if (!currentUsage.languagesUsed.includes(targetLanguage)) {
    currentUsage.languagesUsed.push(targetLanguage)
  }
  // Daily counter — reset when day changes
  const today = todayISO()
  if (currentUsage.dailyDate !== today) {
    currentUsage.dailyDate = today
    currentUsage.dailyTranslationsCount = 0
  }
  currentUsage.dailyTranslationsCount += 1
  saveUsage(currentUsage)
}

/** Record peak listener count (called on presence changes) */
export function recordPeakListeners(count: number): void {
  if (count > currentUsage.peakListeners) {
    currentUsage.peakListeners = count
    saveUsage(currentUsage)
  }
}

// ---------------------------------------------------------------------------
// Limit checks
// ---------------------------------------------------------------------------

/** Check if session minutes are within the tier limit */
export function isWithinSessionLimit(tierId?: TierId): boolean {
  const tier = TIERS[tierId ?? currentUsage.tierId]
  if (!tier) return false
  const limit = tier.limits.sessionMinutesPerMonth
  if (limit <= 0) return limit === 0 // 0 = unlimited, -1 = not available
  return currentUsage.sessionMinutesUsed < limit
}

/** Check if daily translation limit is reached */
export function isWithinDailyTranslationLimit(tierId?: TierId): boolean {
  const tier = TIERS[tierId ?? currentUsage.tierId]
  if (!tier) return false
  const limit = tier.limits.dailyTranslationLimit
  if (limit === 0) return true // unlimited
  // Reset daily counter if day changed
  const today = todayISO()
  if (currentUsage.dailyDate !== today) return true // new day, 0 used
  return currentUsage.dailyTranslationsCount < limit
}

/** Get today's translation count */
export function getDailyTranslationsUsed(): number {
  const today = todayISO()
  if (currentUsage.dailyDate !== today) return 0
  return currentUsage.dailyTranslationsCount
}

/** Get remaining session minutes (0 = unlimited, -1 = not available) */
export function getRemainingSessionMinutes(tierId?: TierId): number {
  const tier = TIERS[tierId ?? currentUsage.tierId]
  if (!tier) return 0
  const limit = tier.limits.sessionMinutesPerMonth
  if (limit === 0) return Infinity   // unlimited
  if (limit === -1) return -1        // not available
  return Math.max(0, limit - currentUsage.sessionMinutesUsed)
}

/** Get overage minutes (how many minutes over the included limit) */
export function getOverageMinutes(tierId?: TierId): number {
  const tier = TIERS[tierId ?? currentUsage.tierId]
  if (!tier) return 0
  const limit = tier.limits.sessionMinutesPerMonth
  if (limit <= 0) return 0 // unlimited or not available — no overage
  return Math.max(0, currentUsage.sessionMinutesUsed - limit)
}

/** Calculate overage cost in EUR */
export function getOverageCost(tierId?: TierId): number {
  const tier = TIERS[tierId ?? currentUsage.tierId]
  if (!tier) return 0
  return getOverageMinutes(tierId) * tier.pricing.overagePerMinuteEur
}

/** Reset usage for a new billing period (called at month boundary or manually) */
export function resetUsage(): void {
  currentUsage = createEmptyUsage()
  saveUsage(currentUsage)
}
