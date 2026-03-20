// Fintutto Art Guide — Stripe Subscription Management
// Handles museum subscription checkout, portal, webhooks, usage tracking

import type { ArtGuideTierId } from './types'
import { ARTGUIDE_TIERS } from './artguide-tiers'

// ============================================================================
// Types
// ============================================================================

export interface StripeCheckoutRequest {
  museumId: string
  tierId: ArtGuideTierId
  billingPeriod: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
}

export interface StripePortalRequest {
  museumId: string
  returnUrl: string
}

export interface SubscriptionStatus {
  museumId: string
  tierId: ArtGuideTierId
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  billingPeriod: 'monthly' | 'yearly'
}

export interface UsageRecord {
  museumId: string
  metric: 'ai_generations' | 'tts_minutes' | 'storage_gb' | 'artworks' | 'staff_users'
  used: number
  limit: number
  percentage: number
  isExceeded: boolean
}

// ============================================================================
// Checkout — Create Stripe Checkout Session
// ============================================================================

export async function createCheckoutSession(
  supabaseUrl: string,
  accessToken: string,
  request: StripeCheckoutRequest,
): Promise<{ url: string }> {
  const tier = ARTGUIDE_TIERS[request.tierId]
  if (!tier) throw new Error(`Unknown tier: ${request.tierId}`)

  const response = await fetch(`${supabaseUrl}/functions/v1/artguide-stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: 'create_checkout',
      museumId: request.museumId,
      tierId: request.tierId,
      billingPeriod: request.billingPeriod,
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Checkout failed: ${error}`)
  }

  return response.json()
}

// ============================================================================
// Customer Portal — Manage existing subscription
// ============================================================================

export async function createPortalSession(
  supabaseUrl: string,
  accessToken: string,
  request: StripePortalRequest,
): Promise<{ url: string }> {
  const response = await fetch(`${supabaseUrl}/functions/v1/artguide-stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: 'create_portal',
      museumId: request.museumId,
      returnUrl: request.returnUrl,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Portal session failed: ${error}`)
  }

  return response.json()
}

// ============================================================================
// Subscription Status
// ============================================================================

export async function getSubscriptionStatus(
  supabaseUrl: string,
  accessToken: string,
  museumId: string,
): Promise<SubscriptionStatus> {
  const response = await fetch(`${supabaseUrl}/functions/v1/artguide-stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: 'get_status',
      museumId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Status fetch failed: ${error}`)
  }

  return response.json()
}

// ============================================================================
// Usage Tracking
// ============================================================================

export async function getUsageMetrics(
  supabaseUrl: string,
  accessToken: string,
  museumId: string,
): Promise<UsageRecord[]> {
  const response = await fetch(`${supabaseUrl}/functions/v1/artguide-stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: 'get_usage',
      museumId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Usage fetch failed: ${error}`)
  }

  return response.json()
}

// ============================================================================
// Plan Comparison Helper
// ============================================================================

export interface PlanComparison {
  id: ArtGuideTierId
  name: string
  price: number
  yearlyPrice: number
  features: string[]
  limits: Record<string, string>
  badge?: string
  isCurrent: boolean
}

export function buildPlanComparison(currentTierId: ArtGuideTierId): PlanComparison[] {
  return Object.values(ARTGUIDE_TIERS).map(tier => ({
    id: tier.id,
    name: tier.name,
    price: tier.pricing.monthlyEur,
    yearlyPrice: tier.pricing.yearlyEur,
    badge: tier.badge,
    isCurrent: tier.id === currentTierId,
    features: buildFeatureList(tier.id),
    limits: {
      artworks: tier.limits.maxArtworks === 0 ? 'Unbegrenzt' : `${tier.limits.maxArtworks}`,
      languages: tier.limits.maxLanguages === 0 ? 'Alle' : `${tier.limits.maxLanguages}`,
      tours: tier.limits.maxTours === 0 ? 'Unbegrenzt' : `${tier.limits.maxTours}`,
      staff: tier.limits.maxStaffUsers === 0 ? 'Unbegrenzt' : `${tier.limits.maxStaffUsers}`,
      storage: `${tier.limits.maxMediaStorageGb} GB`,
      aiGenerations: tier.limits.maxMonthlyAiGenerations === 0 ? 'Unbegrenzt' : `${tier.limits.maxMonthlyAiGenerations}/Monat`,
      ttsMinutes: tier.limits.maxMonthlyTtsMinutes === 0 ? 'Unbegrenzt' : `${tier.limits.maxMonthlyTtsMinutes} Min/Monat`,
    },
  }))
}

function buildFeatureList(tierId: ArtGuideTierId): string[] {
  const tier = ARTGUIDE_TIERS[tierId]
  const features: string[] = []

  const limit = (n: number, unit: string) => n === 0 ? `Unbegrenzte ${unit}` : `${n} ${unit}`

  features.push(limit(tier.limits.maxArtworks, 'Kunstwerke'))
  features.push(limit(tier.limits.maxLanguages, 'Sprachen'))

  if (tier.features.audioGuide) {
    features.push(tier.features.ttsQuality === 'chirp3hd' ? 'Chirp 3 HD Stimmen' : 'Basis-Audio')
  }
  if (tier.features.voiceSelection) features.push('Stimmauswahl nach Alter/Geschlecht')
  if (tier.features.aiExplanations) features.push('KI-Erklaerungen')
  if (tier.features.aiChat) features.push('KI-Chat mit Besuchern')
  if (tier.features.aiTourSuggestions) features.push('KI-Tourenvorschlaege')

  if (tier.features.indoorPositioning !== 'none') {
    const posMap = { qr: 'QR-Codes', ble: 'BLE + GPS', wifi: 'WiFi', all: 'Alle Methoden' }
    features.push(`Positionierung: ${posMap[tier.features.indoorPositioning]}`)
  }
  if (tier.features.qrCodes) features.push('QR-Codes')
  if (tier.features.nfcSupport) features.push('NFC-Support')
  if (tier.features.offlineMode) features.push('Offline-Modus')

  if (tier.features.analytics !== 'basic') features.push('Erweiterte Analytics')
  if (tier.features.analyticsHeatmaps) features.push('Besucher-Heatmaps')
  if (tier.features.workflowManagement) features.push('Redaktions-Workflow')
  if (tier.features.bulkImport) features.push('CSV/Excel Import')
  if (tier.features.whiteLabel) features.push('White-Label App')
  if (tier.features.apiAccess) features.push('API-Zugang')
  if (tier.features.multiVenue) features.push('Mehrere Standorte')

  return features
}

// ============================================================================
// Upgrade Check
// ============================================================================

export function canUpgrade(from: ArtGuideTierId, to: ArtGuideTierId): boolean {
  const tierOrder: ArtGuideTierId[] = ['artguide_starter', 'artguide_professional', 'artguide_enterprise']
  return tierOrder.indexOf(to) > tierOrder.indexOf(from)
}

export function canDowngrade(from: ArtGuideTierId, to: ArtGuideTierId): boolean {
  const tierOrder: ArtGuideTierId[] = ['artguide_starter', 'artguide_professional', 'artguide_enterprise']
  return tierOrder.indexOf(to) < tierOrder.indexOf(from)
}

export function getUpgradePath(currentTier: ArtGuideTierId): ArtGuideTierId | null {
  const tierOrder: ArtGuideTierId[] = ['artguide_starter', 'artguide_professional', 'artguide_enterprise']
  const idx = tierOrder.indexOf(currentTier)
  return idx < tierOrder.length - 1 ? tierOrder[idx + 1] : null
}
