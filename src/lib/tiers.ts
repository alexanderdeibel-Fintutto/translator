// GuideTranslator — Central Tier Configuration
// All plans defined in one place. Every limit, feature flag and price lives here.
// Both the app and the sales site import from this single source of truth.
//
// STRIPE SETUP:
// 1. Create products + prices in Stripe Dashboard (or via CLI)
// 2. Copy the Price IDs (price_xxx) into stripePriceIdMonthly / stripePriceIdYearly below
// 3. Set VITE_STRIPE_PUBLISHABLE_KEY in .env
// 4. Set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in Supabase secrets
// 5. Deploy edge functions: supabase functions deploy stripe-checkout stripe-portal stripe-webhook
// 6. Configure webhook endpoint in Stripe Dashboard → Developers → Webhooks

export type TierId =
  | 'free'
  | 'personal_pro'
  | 'guide_basic'
  | 'guide_pro'
  | 'agency_standard'
  | 'agency_premium'
  | 'event_basic'
  | 'event_pro'
  | 'cruise_starter'
  | 'cruise_fleet'
  | 'cruise_armada'
  // Market-specific tiers
  | 'education_single'
  | 'education_school'
  | 'authority_single'
  | 'authority_office'
  | 'hospitality_single'
  | 'hospitality_business'
  | 'medical_practice'
  | 'medical_clinic'
  // Fintutto World: City Guide, Region Guide, Partner
  | 'cityguide_starter'
  | 'cityguide_professional'
  | 'cityguide_enterprise'
  | 'regionguide_starter'
  | 'regionguide_professional'
  | 'partner_basic'
  | 'partner_premium'
  | 'partner_featured'
  // Internal tiers (not shown on pricing page, assigned by role)
  | 'internal_admin'
  | 'internal_tester'
  | 'internal_sales'

export type Segment = 'personal' | 'guide' | 'agency' | 'event' | 'cruise' | 'education' | 'authority' | 'hospitality' | 'medical' | 'cityguide' | 'regionguide' | 'partner' | 'internal'

export type TtsQuality = 'browser' | 'standard' | 'neural2' | 'chirp3hd'

export type TranslationProvider = 'free' | 'azure' | 'google'

export interface TierLimits {
  maxListeners: number         // 0 = unlimited
  maxLanguages: number         // 0 = unlimited (130+)
  sessionMinutesPerMonth: number // 0 = unlimited, -1 = not available
  maxConcurrentSessions: number
  maxGlossaries: number
  preTranslationScripts: number // 0 = unlimited, -1 = not available
  dailyTranslationLimit: number // 0 = unlimited
  maxCharsPerRequest: number
}

export interface TierFeatures {
  translationProvider: TranslationProvider
  ttsQuality: TtsQuality
  ttsChirpAvailable: boolean
  cloudStt: boolean             // Google Cloud STT vs Web Speech API only
  liveSession: boolean
  broadcasting: boolean         // 1→N broadcasting
  conversationMode: boolean
  cameraOcr: boolean
  offlineMode: boolean
  bleTransport: boolean
  wifiRelay: boolean
  qrCode: boolean
  customGlossaries: boolean
  preTranslation: boolean
  whiteLabel: boolean
  apiAccess: 'none' | 'read' | 'full'
  analytics: 'none' | 'basic' | 'extended' | 'dashboard' | 'enterprise'
  guideManagement: boolean
  exportTranscripts: boolean
  // Fintutto World features
  aiDialog: boolean              // conversational AI for POIs
  notifications: boolean         // geofence/proximity notifications
  contentCms: boolean            // CMS for managing POI content
  partnerManagement: boolean     // manage partner businesses
  visitorAnalytics: boolean      // visitor behavior analytics
  multiLanguageContent: boolean  // auto-translate content to all languages
  personalizedExperience: boolean // AI-personalized visitor experience
}

export interface TierPricing {
  monthlyEur: number
  yearlyEur: number              // 10 months (2 free)
  overagePerMinuteEur: number
  additionalLanguageEur: number  // per language per month
  stripePriceIdMonthly?: string  // Stripe Price ID (set after Stripe setup)
  stripePriceIdYearly?: string
}

export interface TierDefinition {
  id: TierId
  segment: Segment
  name: string
  displayName: string
  description: string
  limits: TierLimits
  features: TierFeatures
  pricing: TierPricing
  sla?: string
  supportLevel: 'community' | 'email_48h' | 'email_24h' | 'email_12h' | 'priority_4h' | 'dedicated'
  badge?: string  // e.g. "Beliebt", "Enterprise"
}

// ---------------------------------------------------------------------------
// Tier Definitions
// ---------------------------------------------------------------------------

export const TIERS: Record<TierId, TierDefinition> = {
  // ── SEGMENT: PERSONAL ────────────────────────────────────────────────
  free: {
    id: 'free',
    segment: 'personal',
    name: 'Free',
    displayName: 'Kostenlos',
    description: 'Für den Einstieg — Übersetzen, Sprechen, Offline.',
    limits: {
      maxListeners: 1,
      maxLanguages: 22,
      sessionMinutesPerMonth: -1,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: -1,
      dailyTranslationLimit: 500,
      maxCharsPerRequest: 5_000,
    },
    features: {
      translationProvider: 'free',
      ttsQuality: 'browser',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: false,
      broadcasting: false,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: false,
      customGlossaries: false,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'none',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 0,
      yearlyEur: 0,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    supportLevel: 'community',
  },

  personal_pro: {
    id: 'personal_pro',
    segment: 'personal',
    name: 'Personal Pro',
    displayName: 'Personal Pro',
    description: 'Professionelle Übersetzung für Arzt, Behörde, Reise.',
    limits: {
      maxListeners: 3,
      maxLanguages: 30,
      sessionMinutesPerMonth: 0, // unlimited
      maxConcurrentSessions: 1,
      maxGlossaries: 0,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0, // unlimited
      maxCharsPerRequest: 10_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'standard',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: true,
      broadcasting: false,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: false,
      customGlossaries: false,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'none',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 4.99,
      yearlyEur: 49.90,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_48h',
  },

  // ── SEGMENT: GUIDE ───────────────────────────────────────────────────
  guide_basic: {
    id: 'guide_basic',
    segment: 'guide',
    name: 'Guide Basic',
    displayName: 'Guide Basic',
    description: 'Für einzelne Stadtführer und Freelancer.',
    limits: {
      maxListeners: 10,
      maxLanguages: 5,
      sessionMinutesPerMonth: 300,
      maxConcurrentSessions: 1,
      maxGlossaries: 3,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 10_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'standard',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'basic',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 19.90,
      yearlyEur: 199,
      overagePerMinuteEur: 0.15,
      additionalLanguageEur: 2.99,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_24h',
  },

  guide_pro: {
    id: 'guide_pro',
    segment: 'guide',
    name: 'Guide Pro',
    displayName: 'Guide Pro',
    description: 'Professionelle Guides mit größeren Gruppen.',
    limits: {
      maxListeners: 25,
      maxLanguages: 10,
      sessionMinutesPerMonth: 600,
      maxConcurrentSessions: 1,
      maxGlossaries: 10,
      preTranslationScripts: 5,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 10_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'extended',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 39.90,
      yearlyEur: 399,
      overagePerMinuteEur: 0.12,
      additionalLanguageEur: 1.99,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_12h',
  },

  // ── SEGMENT: AGENCY ──────────────────────────────────────────────────
  agency_standard: {
    id: 'agency_standard',
    segment: 'agency',
    name: 'Agentur Standard',
    displayName: 'Agentur',
    description: 'Reiseagenturen mit mehreren Guides.',
    limits: {
      maxListeners: 30,
      maxLanguages: 15,
      sessionMinutesPerMonth: 1_500,
      maxConcurrentSessions: 3,
      maxGlossaries: 15,
      preTranslationScripts: 15,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: false,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 99,
      yearlyEur: 990,
      overagePerMinuteEur: 0.10,
      additionalLanguageEur: 1.49,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_12h',
  },

  agency_premium: {
    id: 'agency_premium',
    segment: 'agency',
    name: 'Agentur Premium',
    displayName: 'Agentur Premium',
    description: 'Große Agenturen und Tour-Operatoren.',
    badge: 'Beliebt',
    limits: {
      maxListeners: 50,
      maxLanguages: 0, // unlimited
      sessionMinutesPerMonth: 5_000,
      maxConcurrentSessions: 10,
      maxGlossaries: 0, // unlimited
      preTranslationScripts: 0, // unlimited
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 50_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'read',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 249,
      yearlyEur: 2_490,
      overagePerMinuteEur: 0.08,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'priority_4h',
  },

  // ── SEGMENT: EVENT ───────────────────────────────────────────────────
  event_basic: {
    id: 'event_basic',
    segment: 'event',
    name: 'Event Basic',
    displayName: 'Event',
    description: 'Konferenzen, Messen und Workshops.',
    limits: {
      maxListeners: 100,
      maxLanguages: 20,
      sessionMinutesPerMonth: 2_000,
      maxConcurrentSessions: 3,
      maxGlossaries: 10,
      preTranslationScripts: 20,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: false,
      cameraOcr: false,
      offlineMode: false,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: false,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 199,
      yearlyEur: 1_990,
      overagePerMinuteEur: 0.08,
      additionalLanguageEur: 0.99,
    },
    supportLevel: 'email_12h',
  },

  event_pro: {
    id: 'event_pro',
    segment: 'event',
    name: 'Event Pro',
    displayName: 'Event Pro',
    description: 'Große Konferenzen und Multi-Track-Events.',
    badge: 'Enterprise',
    limits: {
      maxListeners: 500,
      maxLanguages: 0, // unlimited
      sessionMinutesPerMonth: 8_000,
      maxConcurrentSessions: 10,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 50_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: false,
      cameraOcr: false,
      offlineMode: false,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'read',
      analytics: 'dashboard',
      guideManagement: false,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 499,
      yearlyEur: 4_990,
      overagePerMinuteEur: 0.06,
      additionalLanguageEur: 0,
    },
    supportLevel: 'priority_4h',
  },

  // ── SEGMENT: CRUISE ──────────────────────────────────────────────────
  cruise_starter: {
    id: 'cruise_starter',
    segment: 'cruise',
    name: 'Cruise Starter',
    displayName: 'Cruise Starter',
    description: '1 Schiff oder Standort mit unbegrenzten Hörern.',
    limits: {
      maxListeners: 0, // unlimited
      maxLanguages: 8,
      sessionMinutesPerMonth: 1_500,
      maxConcurrentSessions: 5,
      maxGlossaries: 20,
      preTranslationScripts: 10,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 50_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 1_990,
      yearlyEur: 19_900,
      overagePerMinuteEur: 0.80,
      additionalLanguageEur: 49,
    },
    sla: 'standard',
    supportLevel: 'email_12h',
  },

  cruise_fleet: {
    id: 'cruise_fleet',
    segment: 'cruise',
    name: 'Cruise Fleet',
    displayName: 'Cruise Fleet',
    description: '5-10 Schiffe mit Premium-Stimmen und API-Zugang.',
    badge: 'Enterprise',
    limits: {
      maxListeners: 0,
      maxLanguages: 12,
      sessionMinutesPerMonth: 8_000,
      maxConcurrentSessions: 50,
      maxGlossaries: 0,
      preTranslationScripts: 50,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 100_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'read',
      analytics: 'enterprise',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 6_990,
      yearlyEur: 69_900,
      overagePerMinuteEur: 0.60,
      additionalLanguageEur: 39,
    },
    sla: '99.5%',
    supportLevel: 'priority_4h',
  },

  cruise_armada: {
    id: 'cruise_armada',
    segment: 'cruise',
    name: 'Cruise Armada',
    displayName: 'Cruise Armada',
    description: '10+ Schiffe — alle Sprachen, voller API-Zugang, Dedicated Support.',
    badge: 'Enterprise',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 30_000,
      maxConcurrentSessions: 0, // unlimited
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 100_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'full',
      analytics: 'enterprise',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 19_990,
      yearlyEur: 199_900,
      overagePerMinuteEur: 0.40,
      additionalLanguageEur: 0,
    },
    sla: '99.9%',
    supportLevel: 'dedicated',
  },

  // ── SEGMENT: EDUCATION ──────────────────────────────────────────────
  education_single: {
    id: 'education_single',
    segment: 'education',
    name: 'Schule Einzel',
    displayName: 'Einzellizenz',
    description: 'Fuer eine Lehrkraft mit bis zu 30 Schuelern.',
    limits: {
      maxListeners: 30,
      maxLanguages: 15,
      sessionMinutesPerMonth: 600,
      maxConcurrentSessions: 1,
      maxGlossaries: 5,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 10_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'standard',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'basic',
      guideManagement: false,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 9.90,
      yearlyEur: 99,
      overagePerMinuteEur: 0.10,
      additionalLanguageEur: 1.99,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_24h',
  },

  education_school: {
    id: 'education_school',
    segment: 'education',
    name: 'Schullizenz',
    displayName: 'Schullizenz',
    description: 'Unbegrenzte Lehrkraefte fuer die gesamte Schule.',
    badge: 'Beliebt',
    limits: {
      maxListeners: 0, // unlimited
      maxLanguages: 0,
      sessionMinutesPerMonth: 0, // unlimited
      maxConcurrentSessions: 20,
      maxGlossaries: 0,
      preTranslationScripts: 10,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 49.90,
      yearlyEur: 499,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_12h',
  },

  // ── SEGMENT: AUTHORITY ─────────────────────────────────────────────
  authority_single: {
    id: 'authority_single',
    segment: 'authority',
    name: 'Behoerde Einzel',
    displayName: 'Einzelplatz',
    description: 'Fuer einen Schalter mit unbegrenzten Besuchern.',
    limits: {
      maxListeners: 5,
      maxLanguages: 20,
      sessionMinutesPerMonth: 0, // unlimited
      maxConcurrentSessions: 1,
      maxGlossaries: 10,
      preTranslationScripts: 5,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 15_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'standard',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: true,
      broadcasting: false,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'basic',
      guideManagement: false,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 14.90,
      yearlyEur: 149,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_24h',
  },

  authority_office: {
    id: 'authority_office',
    segment: 'authority',
    name: 'Behoerdenlizenz',
    displayName: 'Behoerdenlizenz',
    description: 'Unbegrenzte Schalter fuer die gesamte Behoerde.',
    badge: 'Beliebt',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 99,
      yearlyEur: 990,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_12h',
  },

  // ── SEGMENT: HOSPITALITY ──────────────────────────────────────────
  hospitality_single: {
    id: 'hospitality_single',
    segment: 'hospitality',
    name: 'Counter Einzel',
    displayName: 'Einzelplatz',
    description: 'Fuer einen Counter oder Empfang mit bidirektionalem Gespraechsmodus.',
    limits: {
      maxListeners: 5,
      maxLanguages: 20,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 1,
      maxGlossaries: 5,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 10_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'standard',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: true,
      broadcasting: false,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'basic',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 29.90,
      yearlyEur: 299,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_24h',
  },

  hospitality_business: {
    id: 'hospitality_business',
    segment: 'hospitality',
    name: 'Counter Business',
    displayName: 'Business',
    description: 'Mehrere Counter, Team-Verwaltung, Analytics.',
    badge: 'Beliebt',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 10,
      maxGlossaries: 0,
      preTranslationScripts: 10,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 99,
      yearlyEur: 990,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_12h',
  },

  // ── SEGMENT: MEDICAL ──────────────────────────────────────────────
  medical_practice: {
    id: 'medical_practice',
    segment: 'medical',
    name: 'Praxis',
    displayName: 'Praxis',
    description: 'Fuer eine Arztpraxis oder Apotheke. Med-Phrasen, Schmerzskala, Patientengespraech.',
    limits: {
      maxListeners: 3,
      maxLanguages: 25,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 1,
      maxGlossaries: 10,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 15_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: false,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'basic',
      guideManagement: false,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 29.90,
      yearlyEur: 299,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'email_24h',
  },

  medical_clinic: {
    id: 'medical_clinic',
    segment: 'medical',
    name: 'Klinik',
    displayName: 'Klinik / Krankenhaus',
    description: 'Unbegrenzte Nutzer fuer Kliniken und Krankenhaeuser.',
    badge: 'Enterprise',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'read',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: false,
      multiLanguageContent: false,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 199,
      yearlyEur: 1_990,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
      // TODO: Set after Stripe product creation
      // stripePriceIdMonthly: 'price_...',
      // stripePriceIdYearly: 'price_...',
    },
    supportLevel: 'priority_4h',
  },

  // ── SEGMENT: INTERNAL (not shown on pricing page) ──────────────────
  // These tiers are assigned automatically based on user role.
  // They bypass all limits and enable all features at zero cost.

  // ── SEGMENT: CITYGUIDE ─────────────────────────────────────────────
  cityguide_starter: {
    id: 'cityguide_starter',
    segment: 'cityguide',
    name: 'City Starter',
    displayName: 'City Guide Starter',
    description: 'Fuer kleine Staedte und Gemeinden. Bis zu 50 POIs, mehrsprachige Inhalte.',
    limits: {
      maxListeners: 0,
      maxLanguages: 10,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 10,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: false,
      broadcasting: false,
      conversationMode: false,
      cameraOcr: false,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 149,
      yearlyEur: 1_490,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 9.90,
    },
    supportLevel: 'email_24h',
  },

  cityguide_professional: {
    id: 'cityguide_professional',
    segment: 'cityguide',
    name: 'City Professional',
    displayName: 'City Guide Professional',
    description: 'Fuer mittlere Staedte. Unbegrenzte POIs, Partner-Management, White-Label.',
    badge: 'Beliebt',
    limits: {
      maxListeners: 0,
      maxLanguages: 30,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 50_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: false,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'read',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 499,
      yearlyEur: 4_990,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    sla: '99.5%',
    supportLevel: 'email_12h',
  },

  cityguide_enterprise: {
    id: 'cityguide_enterprise',
    segment: 'cityguide',
    name: 'City Enterprise',
    displayName: 'City Guide Enterprise',
    description: 'Fuer Grossstaedte und Metropolen. Alle Features, API, Dedicated Support.',
    badge: 'Enterprise',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 100_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'full',
      analytics: 'enterprise',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 1_990,
      yearlyEur: 19_900,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    sla: '99.9%',
    supportLevel: 'dedicated',
  },

  // ── SEGMENT: REGIONGUIDE ──────────────────────────────────────────
  regionguide_starter: {
    id: 'regionguide_starter',
    segment: 'regionguide',
    name: 'Region Starter',
    displayName: 'Region Guide Starter',
    description: 'Fuer Tourismusverbaende und Regionen. Bis zu 5 Staedte, 200 POIs.',
    limits: {
      maxListeners: 0,
      maxLanguages: 15,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 20,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 50_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: false,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'read',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 399,
      yearlyEur: 3_990,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 4.90,
    },
    supportLevel: 'email_12h',
  },

  regionguide_professional: {
    id: 'regionguide_professional',
    segment: 'regionguide',
    name: 'Region Professional',
    displayName: 'Region Guide Professional',
    description: 'Fuer grosse Tourismusregionen. Unbegrenzte Staedte, White-Label, API.',
    badge: 'Enterprise',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 100_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'full',
      analytics: 'enterprise',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 1_490,
      yearlyEur: 14_900,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    sla: '99.9%',
    supportLevel: 'dedicated',
  },

  // ── SEGMENT: PARTNER (Gewerbetreibende) ───────────────────────────
  partner_basic: {
    id: 'partner_basic',
    segment: 'partner',
    name: 'Partner Basic',
    displayName: 'Partner Basiseintrag',
    description: 'Kostenloser Basiseintrag im City/Region Guide. Sichtbarkeit fuer Besucher.',
    limits: {
      maxListeners: 0,
      maxLanguages: 5,
      sessionMinutesPerMonth: -1,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 5_000,
    },
    features: {
      translationProvider: 'free',
      ttsQuality: 'browser',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: false,
      broadcasting: false,
      conversationMode: false,
      cameraOcr: false,
      offlineMode: false,
      bleTransport: false,
      wifiRelay: false,
      qrCode: false,
      customGlossaries: false,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'basic',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: false,
      notifications: false,
      contentCms: false,
      partnerManagement: false,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: false,
    },
    pricing: {
      monthlyEur: 0,
      yearlyEur: 0,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    supportLevel: 'community',
  },

  partner_premium: {
    id: 'partner_premium',
    segment: 'partner',
    name: 'Partner Premium',
    displayName: 'Partner Premium',
    description: 'Erweiterte Sichtbarkeit, Angebote erstellen, Buchungen empfangen, Analytics.',
    badge: 'Beliebt',
    limits: {
      maxListeners: 0,
      maxLanguages: 15,
      sessionMinutesPerMonth: -1,
      maxConcurrentSessions: 0,
      maxGlossaries: 5,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 10_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'standard',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: false,
      broadcasting: false,
      conversationMode: true,
      cameraOcr: false,
      offlineMode: false,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: false,
      whiteLabel: false,
      apiAccess: 'none',
      analytics: 'dashboard',
      guideManagement: false,
      exportTranscripts: false,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: false,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 29.90,
      yearlyEur: 299,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    supportLevel: 'email_24h',
  },

  partner_featured: {
    id: 'partner_featured',
    segment: 'partner',
    name: 'Partner Featured',
    displayName: 'Partner Featured',
    description: 'Top-Platzierung, KI-Empfehlungen, Push-Notifications an Besucher, volle Analytics.',
    badge: 'Premium',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: -1,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: -1,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 20_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'neural2',
      ttsChirpAvailable: false,
      cloudStt: false,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: false,
      offlineMode: false,
      bleTransport: false,
      wifiRelay: false,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'read',
      analytics: 'dashboard',
      guideManagement: false,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: false,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 79.90,
      yearlyEur: 799,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    supportLevel: 'email_12h',
  },

  // ── SEGMENT: INTERNAL (not shown on pricing page) ──────────────────
  // These tiers are assigned automatically based on user role.
  // They bypass all limits and enable all features at zero cost.

  internal_admin: {
    id: 'internal_admin',
    segment: 'internal',
    name: 'Admin',
    displayName: 'Admin (Intern)',
    description: 'Voller Zugriff auf alle Dienste — für Administratoren.',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 100_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'full',
      analytics: 'enterprise',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 0,
      yearlyEur: 0,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    supportLevel: 'dedicated',
  },

  internal_tester: {
    id: 'internal_tester',
    segment: 'internal',
    name: 'Tester',
    displayName: 'Tester (Intern)',
    description: 'Test-Account mit vollen Features — für QA und Beta-Tester.',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 100_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: false,
      apiAccess: 'read',
      analytics: 'dashboard',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 0,
      yearlyEur: 0,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    supportLevel: 'email_24h',
  },

  internal_sales: {
    id: 'internal_sales',
    segment: 'internal',
    name: 'Sales',
    displayName: 'Vertrieb (Intern)',
    description: 'Vertriebskonto mit vollen Demo-Features — für Sales-Team.',
    limits: {
      maxListeners: 0,
      maxLanguages: 0,
      sessionMinutesPerMonth: 0,
      maxConcurrentSessions: 0,
      maxGlossaries: 0,
      preTranslationScripts: 0,
      dailyTranslationLimit: 0,
      maxCharsPerRequest: 100_000,
    },
    features: {
      translationProvider: 'azure',
      ttsQuality: 'chirp3hd',
      ttsChirpAvailable: true,
      cloudStt: true,
      liveSession: true,
      broadcasting: true,
      conversationMode: true,
      cameraOcr: true,
      offlineMode: true,
      bleTransport: true,
      wifiRelay: true,
      qrCode: true,
      customGlossaries: true,
      preTranslation: true,
      whiteLabel: true,
      apiAccess: 'full',
      analytics: 'enterprise',
      guideManagement: true,
      exportTranscripts: true,
      aiDialog: true,
      notifications: true,
      contentCms: true,
      partnerManagement: true,
      visitorAnalytics: true,
      multiLanguageContent: true,
      personalizedExperience: true,
    },
    pricing: {
      monthlyEur: 0,
      yearlyEur: 0,
      overagePerMinuteEur: 0,
      additionalLanguageEur: 0,
    },
    supportLevel: 'dedicated',
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All tier IDs, ordered from cheapest to most expensive (public tiers only) */
export const TIER_ORDER: TierId[] = [
  'free', 'personal_pro',
  'guide_basic', 'guide_pro',
  'education_single', 'education_school',
  'authority_single', 'authority_office',
  'hospitality_single', 'hospitality_business',
  'medical_practice', 'medical_clinic',
  'agency_standard', 'agency_premium',
  'event_basic', 'event_pro',
  'cruise_starter', 'cruise_fleet', 'cruise_armada',
  'cityguide_starter', 'cityguide_professional', 'cityguide_enterprise',
  'regionguide_starter', 'regionguide_professional',
  'partner_basic', 'partner_premium', 'partner_featured',
]

/** Internal tier IDs (not shown on pricing page, assigned by role) */
export const INTERNAL_TIERS: TierId[] = [
  'internal_admin', 'internal_tester', 'internal_sales',
]

/** Check if a tier is an internal (non-purchasable) tier */
export function isInternalTier(tierId: TierId): boolean {
  return tierId.startsWith('internal_')
}

/** Get tiers for a specific segment (for pricing page tabs) */
export function getTiersBySegment(segment: Segment): TierDefinition[] {
  return TIER_ORDER.map(id => TIERS[id]).filter(t => t.segment === segment)
}

/** Get all segments with their display info */
export const SEGMENTS: { id: Segment; label: string; icon: string }[] = [
  { id: 'personal', label: 'Privat', icon: 'user' },
  { id: 'guide', label: 'Guide', icon: 'map' },
  { id: 'education', label: 'Schulen', icon: 'graduation-cap' },
  { id: 'authority', label: 'Behoerden', icon: 'building-2' },
  { id: 'hospitality', label: 'Hospitality', icon: 'handshake' },
  { id: 'medical', label: 'Medizin', icon: 'heart' },
  { id: 'agency', label: 'Business', icon: 'building' },
  { id: 'event', label: 'Event', icon: 'calendar' },
  { id: 'cruise', label: 'Cruise', icon: 'ship' },
  { id: 'cityguide', label: 'City Guide', icon: 'landmark' },
  { id: 'regionguide', label: 'Region Guide', icon: 'mountain' },
  { id: 'partner', label: 'Partner', icon: 'store' },
]

/** Check if a feature is available for a tier */
export function hasFeature(tierId: TierId, feature: keyof TierFeatures): boolean {
  const tier = TIERS[tierId]
  if (!tier) return false
  const val = tier.features[feature]
  return typeof val === 'boolean' ? val : val !== 'none'
}

/** Check if listener count is within tier limit (0 = unlimited) */
export function isWithinListenerLimit(tierId: TierId, listenerCount: number): boolean {
  const tier = TIERS[tierId]
  if (!tier) return false
  return tier.limits.maxListeners === 0 || listenerCount <= tier.limits.maxListeners
}

/** Check if language count is within tier limit (0 = unlimited) */
export function isWithinLanguageLimit(tierId: TierId, languageCount: number): boolean {
  const tier = TIERS[tierId]
  if (!tier) return false
  return tier.limits.maxLanguages === 0 || languageCount <= tier.limits.maxLanguages
}

/** Get the next tier up for upgrade prompts */
export function getUpgradeTier(currentTierId: TierId): TierDefinition | null {
  const idx = TIER_ORDER.indexOf(currentTierId)
  if (idx === -1 || idx >= TIER_ORDER.length - 1) return null
  return TIERS[TIER_ORDER[idx + 1]]
}

/** Get the TTS quality for a tier (maps to tts.ts VoiceQuality) */
export function getTtsQuality(tierId: TierId): 'neural2' | 'chirp3hd' {
  const tier = TIERS[tierId]
  if (!tier) return 'neural2'
  if (tier.features.ttsQuality === 'chirp3hd') return 'chirp3hd'
  return 'neural2'
}

/** Format price for display (German locale) */
export function formatPrice(eurAmount: number): string {
  if (eurAmount === 0) return 'Kostenlos'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: eurAmount % 1 === 0 ? 0 : 2,
  }).format(eurAmount)
}
