// Fintutto Art Guide — Tier Definitions for Museums
// Separate from translator tiers, these define museum subscription plans

import type { ArtGuideTierId } from './types'

export interface ArtGuideTierLimits {
  maxArtworks: number              // 0 = unlimited
  maxVenues: number
  maxLanguages: number
  maxTours: number                 // 0 = unlimited
  maxStaffUsers: number
  maxMediaStorageGb: number
  maxMonthlyAiGenerations: number  // AI text generations per month
  maxMonthlyTtsMinutes: number     // TTS audio minutes per month
  maxMonthlyVisitors: number       // 0 = unlimited (tracked for analytics)
}

export interface ArtGuideTierFeatures {
  audioGuide: boolean
  ttsQuality: 'neural2' | 'chirp3hd'
  voiceSelection: boolean          // visitor can choose voice gender/age
  customVoicePresets: boolean      // museum can create custom presets
  aiExplanations: boolean          // AI-powered personalized explanations
  aiChat: boolean                  // visitor can ask questions about artwork
  aiTourSuggestions: boolean       // AI suggests tours for CMS
  aiContentGeneration: boolean     // AI generates descriptions in CMS
  indoorPositioning: 'none' | 'qr' | 'ble' | 'wifi' | 'all'
  gpsOutdoor: boolean
  offlineMode: boolean             // visitors can download for offline
  analytics: 'basic' | 'extended' | 'enterprise'
  analyticsHeatmaps: boolean
  analyticsExport: boolean
  whiteLabel: boolean              // custom branded app
  apiAccess: boolean
  customBranding: boolean          // custom colors, logo
  workflowManagement: boolean      // editorial workflow with roles
  bulkImport: boolean              // CSV/Excel import
  multiVenue: boolean              // multiple locations
  qrCodes: boolean
  nfcSupport: boolean
}

export interface ArtGuideTierPricing {
  monthlyEur: number
  yearlyEur: number               // typically 10 months (2 free)
  setupFeeEur: number             // one-time setup fee
  extraArtworkPackEur: number     // price per 100 extra artworks
  whiteLabelSetupEur: number      // one-time white label setup
  stripePriceIdMonthly?: string
  stripePriceIdYearly?: string
}

export interface ArtGuideTierDefinition {
  id: ArtGuideTierId
  name: string
  displayName: Record<string, string>
  description: Record<string, string>
  limits: ArtGuideTierLimits
  features: ArtGuideTierFeatures
  pricing: ArtGuideTierPricing
  badge?: string
  supportLevel: 'email_48h' | 'email_24h' | 'priority_4h' | 'dedicated'
}

// ============================================================================
// Tier Definitions
// ============================================================================

export const ARTGUIDE_TIERS: Record<ArtGuideTierId, ArtGuideTierDefinition> = {
  artguide_starter: {
    id: 'artguide_starter',
    name: 'Starter',
    displayName: { de: 'Starter', en: 'Starter' },
    description: {
      de: 'Perfekt fuer kleine Museen und Galerien — digitaler Einstieg leicht gemacht.',
      en: 'Perfect for small museums and galleries — easy digital start.',
    },
    limits: {
      maxArtworks: 50,
      maxVenues: 1,
      maxLanguages: 2,
      maxTours: 3,
      maxStaffUsers: 3,
      maxMediaStorageGb: 5,
      maxMonthlyAiGenerations: 100,
      maxMonthlyTtsMinutes: 500,
      maxMonthlyVisitors: 0, // tracked but not limited
    },
    features: {
      audioGuide: true,
      ttsQuality: 'neural2',
      voiceSelection: false,
      customVoicePresets: false,
      aiExplanations: false,
      aiChat: false,
      aiTourSuggestions: false,
      aiContentGeneration: true,
      indoorPositioning: 'qr',
      gpsOutdoor: false,
      offlineMode: false,
      analytics: 'basic',
      analyticsHeatmaps: false,
      analyticsExport: false,
      whiteLabel: false,
      apiAccess: false,
      customBranding: false,
      workflowManagement: false,
      bulkImport: false,
      multiVenue: false,
      qrCodes: true,
      nfcSupport: false,
    },
    pricing: {
      monthlyEur: 49,
      yearlyEur: 490,
      setupFeeEur: 0,
      extraArtworkPackEur: 29,
      whiteLabelSetupEur: 0,
    },
    supportLevel: 'email_48h',
    badge: 'Einstieg',
  },

  artguide_professional: {
    id: 'artguide_professional',
    name: 'Professional',
    displayName: { de: 'Professional', en: 'Professional' },
    description: {
      de: 'Fuer mittelgrosse Museen — KI-gestuetzte Audio-Guides mit voller Personalisierung.',
      en: 'For mid-size museums — AI-powered audio guides with full personalization.',
    },
    limits: {
      maxArtworks: 500,
      maxVenues: 3,
      maxLanguages: 10,
      maxTours: 0, // unlimited
      maxStaffUsers: 10,
      maxMediaStorageGb: 50,
      maxMonthlyAiGenerations: 2000,
      maxMonthlyTtsMinutes: 5000,
      maxMonthlyVisitors: 0,
    },
    features: {
      audioGuide: true,
      ttsQuality: 'chirp3hd',
      voiceSelection: true,
      customVoicePresets: true,
      aiExplanations: true,
      aiChat: true,
      aiTourSuggestions: true,
      aiContentGeneration: true,
      indoorPositioning: 'ble',
      gpsOutdoor: true,
      offlineMode: true,
      analytics: 'extended',
      analyticsHeatmaps: true,
      analyticsExport: true,
      whiteLabel: false,
      apiAccess: false,
      customBranding: true,
      workflowManagement: true,
      bulkImport: true,
      multiVenue: true,
      qrCodes: true,
      nfcSupport: true,
    },
    pricing: {
      monthlyEur: 199,
      yearlyEur: 1990,
      setupFeeEur: 499,
      extraArtworkPackEur: 19,
      whiteLabelSetupEur: 0,
    },
    supportLevel: 'email_24h',
    badge: 'Beliebt',
  },

  artguide_enterprise: {
    id: 'artguide_enterprise',
    name: 'Enterprise',
    displayName: { de: 'Enterprise', en: 'Enterprise' },
    description: {
      de: 'Fuer grosse Haeuser — White-Label-App, unbegrenzte Werke, API-Zugang, dedizierter Support.',
      en: 'For large institutions — white-label app, unlimited works, API access, dedicated support.',
    },
    limits: {
      maxArtworks: 0, // unlimited
      maxVenues: 0,   // unlimited
      maxLanguages: 0, // unlimited (all 22+)
      maxTours: 0,
      maxStaffUsers: 0,
      maxMediaStorageGb: 500,
      maxMonthlyAiGenerations: 0, // unlimited
      maxMonthlyTtsMinutes: 0,    // unlimited
      maxMonthlyVisitors: 0,
    },
    features: {
      audioGuide: true,
      ttsQuality: 'chirp3hd',
      voiceSelection: true,
      customVoicePresets: true,
      aiExplanations: true,
      aiChat: true,
      aiTourSuggestions: true,
      aiContentGeneration: true,
      indoorPositioning: 'all',
      gpsOutdoor: true,
      offlineMode: true,
      analytics: 'enterprise',
      analyticsHeatmaps: true,
      analyticsExport: true,
      whiteLabel: true,
      apiAccess: true,
      customBranding: true,
      workflowManagement: true,
      bulkImport: true,
      multiVenue: true,
      qrCodes: true,
      nfcSupport: true,
    },
    pricing: {
      monthlyEur: 599,
      yearlyEur: 5990,
      setupFeeEur: 1999,
      extraArtworkPackEur: 0,
      whiteLabelSetupEur: 4999,
    },
    supportLevel: 'dedicated',
    badge: 'Enterprise',
  },
}

// ============================================================================
// Helpers
// ============================================================================

export function getArtGuideTier(tierId: ArtGuideTierId): ArtGuideTierDefinition {
  return ARTGUIDE_TIERS[tierId]
}

export function isWithinArtworkLimit(tierId: ArtGuideTierId, count: number): boolean {
  const tier = ARTGUIDE_TIERS[tierId]
  if (!tier) return false
  return tier.limits.maxArtworks === 0 || count <= tier.limits.maxArtworks
}

export function hasFeature(
  tierId: ArtGuideTierId,
  feature: keyof ArtGuideTierFeatures,
): boolean {
  const tier = ARTGUIDE_TIERS[tierId]
  if (!tier) return false
  const value = tier.features[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value !== 'none'
  return false
}

export function canUsePositioning(
  tierId: ArtGuideTierId,
  method: 'qr' | 'ble' | 'wifi' | 'gps',
): boolean {
  const tier = ARTGUIDE_TIERS[tierId]
  if (!tier) return false
  const allowed = tier.features.indoorPositioning
  if (allowed === 'all') return true
  if (allowed === 'none') return false
  return allowed === method
}
