// Fintutto World — Personalized Landing Pages for Sales Invite Codes
// Generates customized landing experiences per segment and invite code

import type {
  CrmSegmentId,
  CrmInviteCode,
  CrmLead,
  SegmentConfig,
} from './crm-segments'
import { CRM_SEGMENTS } from './crm-segments'

// ============================================================================
// Landing Page Configuration Types
// ============================================================================

export interface LandingPageTheme {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundStyle: 'light' | 'dark' | 'gradient' | 'image'
  backgroundImageUrl: string | null
  logoUrl: string | null
  fontFamily: string
}

export interface LandingPageHeroSection {
  headline: string
  subheadline: string
  ctaText: string
  ctaUrl: string
  heroImageUrl: string | null
  heroVideoUrl: string | null
  showDemoButton: boolean
}

export interface LandingPageFeature {
  icon: string
  title: string
  description: string
  highlighted: boolean
}

export interface LandingPageTestimonial {
  quote: string
  author: string
  role: string
  company: string
  avatarUrl: string | null
}

export interface LandingPagePricing {
  showPricing: boolean
  highlightedTier: string | null
  customDiscount: number | null
  customMessage: string | null
}

export interface LandingPageConfig {
  // Meta
  slug: string
  title: string
  metaDescription: string
  language: string

  // Theme
  theme: LandingPageTheme

  // Sections
  hero: LandingPageHeroSection
  features: LandingPageFeature[]
  testimonials: LandingPageTestimonial[]
  pricing: LandingPagePricing

  // Personalization
  segmentId: CrmSegmentId
  companyName: string | null
  contactName: string | null
  customOffer: Record<string, unknown> | null

  // Tracking
  inviteCode: string
  campaignId: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
}

// ============================================================================
// Segment-specific feature sets
// ============================================================================

const SEGMENT_FEATURES: Partial<Record<CrmSegmentId, LandingPageFeature[]>> = {
  museum_small: [
    { icon: 'headphones', title: 'KI-Audioguide', description: 'Persoenliche Fuehrungen in ueber 30 Sprachen, automatisch generiert aus Ihren Inhalten.', highlighted: true },
    { icon: 'message-circle', title: 'KI-Chat', description: 'Besucher stellen Fragen und erhalten sofort fundierte Antworten zu jedem Exponat.', highlighted: false },
    { icon: 'globe', title: 'Mehrsprachig', description: 'Erreichen Sie internationale Gaeste ohne teure Uebersetzungen.', highlighted: false },
    { icon: 'bar-chart', title: 'Besucheranalysen', description: 'Verstehen Sie, welche Exponate am beliebtesten sind und wie Besucher sich bewegen.', highlighted: false },
  ],
  museum_large: [
    { icon: 'headphones', title: 'Enterprise Audioguide', description: 'Skalierbar fuer Tausende gleichzeitige Besucher mit personalisierten Touren.', highlighted: true },
    { icon: 'message-circle', title: 'KI-Wissensdialog', description: 'Tiefgehende Konversationen zu Kunstwerken, Epochen und Techniken.', highlighted: true },
    { icon: 'globe', title: '30+ Sprachen', description: 'Automatische Uebersetzungen mit kultureller Anpassung fuer jede Zielgruppe.', highlighted: false },
    { icon: 'plug', title: 'API & Integration', description: 'Nahtlose Anbindung an bestehende Sammlungsmanagementsysteme.', highlighted: false },
    { icon: 'palette', title: 'Custom Branding', description: 'Vollstaendig anpassbar an Ihre Corporate Identity.', highlighted: false },
    { icon: 'shield', title: 'Enterprise Security', description: 'DSGVO-konform, On-Premise-Option, SSO-Integration.', highlighted: false },
  ],
  city_large: [
    { icon: 'map', title: 'Digitaler Stadtfuehrer', description: 'Alle Sehenswuerdigkeiten, Restaurants und Geheimtipps in einer personalisierten App.', highlighted: true },
    { icon: 'route', title: 'Smarte Touren', description: 'KI-generierte Rundgaenge basierend auf Interessen, Zeit und Wetter.', highlighted: true },
    { icon: 'globe', title: 'Internationale Gaeste', description: 'Automatische Spracherkennung und kulturell angepasste Inhalte.', highlighted: false },
    { icon: 'calendar', title: 'Event-Integration', description: 'Aktuelle Veranstaltungen und saisonale Empfehlungen automatisch integriert.', highlighted: false },
    { icon: 'bar-chart', title: 'Tourismus-Analytics', description: 'Besucherstroeme, beliebte Routen und Aufenthaltszeiten im Dashboard.', highlighted: false },
    { icon: 'handshake', title: 'Partner-Netzwerk', description: 'Lokale Anbieter einbinden und Umsaetze teilen.', highlighted: false },
  ],
  region: [
    { icon: 'map', title: 'Regionales Portal', description: 'Eine Plattform fuer alle Gemeinden, Museen und Attraktionen Ihrer Region.', highlighted: true },
    { icon: 'users', title: 'Partner-Management', description: 'Jede Sub-Entitaet verwaltet eigene Inhalte ueber ein zentrales Portal.', highlighted: true },
    { icon: 'route', title: 'Uebergreifende Touren', description: 'Themenrouten quer durch die Region mit intelligenter Navigation.', highlighted: false },
    { icon: 'globe', title: 'Mehrsprachigkeit', description: 'Einheitliche Qualitaet in allen Sprachen fuer die gesamte Region.', highlighted: false },
    { icon: 'bar-chart', title: 'Regionale Analysen', description: 'Besucherverteilung und Tourismustrends auf regionaler Ebene.', highlighted: false },
  ],
  hotel: [
    { icon: 'book-open', title: 'Digitale Gaestemappe', description: 'Alle Infos zu Ihrem Hotel und der Umgebung — immer aktuell, immer mehrsprachig.', highlighted: true },
    { icon: 'map-pin', title: 'Lokale Tipps', description: 'Persoenliche Empfehlungen fuer Restaurants, Ausflugsziele und Aktivitaeten.', highlighted: false },
    { icon: 'globe', title: 'Gaeste-Sprachen', description: 'Automatisch in der Sprache Ihrer Gaeste — ohne Aufwand fuer Sie.', highlighted: false },
    { icon: 'star', title: 'Gaestezufriedenheit', description: 'Bessere Bewertungen durch optimalen Informationsservice.', highlighted: false },
  ],
  cruise: [
    { icon: 'ship', title: 'Schiffs-Guide', description: 'Interaktiver Bordbegleiter fuer alle Bereiche, Restaurants und Aktivitaeten.', highlighted: true },
    { icon: 'anchor', title: 'Landausfluege', description: 'KI-personalisierte Ausflugsempfehlungen fuer jeden Hafen.', highlighted: true },
    { icon: 'wifi-off', title: 'Offline-Modus', description: 'Volle Funktionalitaet auch ohne Internetverbindung auf See.', highlighted: false },
    { icon: 'globe', title: 'International', description: 'Mehrsprachige Inhalte fuer Ihre internationale Gaestemischung.', highlighted: false },
  ],
  event: [
    { icon: 'calendar', title: 'Event-Navigator', description: 'Programm, Aussteller und Aktivitaeten personalisiert auf einen Blick.', highlighted: true },
    { icon: 'map', title: 'Hallenplan', description: 'Interaktive Navigation zum naechsten Vortrag oder Stand.', highlighted: false },
    { icon: 'bell', title: 'Smart Notifications', description: 'Erinnerungen an favorisierte Programmpunkte und Networking-Matches.', highlighted: false },
    { icon: 'globe', title: 'Mehrsprachig', description: 'Internationale Teilnehmer fuehlen sich sofort willkommen.', highlighted: false },
  ],
}

const SEGMENT_TESTIMONIALS: Partial<Record<CrmSegmentId, LandingPageTestimonial[]>> = {
  museum_small: [
    { quote: 'Unsere Besucherzahlen sind um 40% gestiegen, seit wir den KI-Audioguide anbieten.', author: 'Maria S.', role: 'Museumsleiterin', company: 'Heimatmuseum Allgaeu', avatarUrl: null },
    { quote: 'Endlich koennen wir auch internationale Gaeste ansprechen — ohne extra Personal.', author: 'Thomas K.', role: 'Kurator', company: 'Stadtgalerie Freiburg', avatarUrl: null },
  ],
  city_large: [
    { quote: 'Die App hat unsere Tourismus-Strategie komplett veraendert. Gaeste bleiben laenger und entdecken mehr.', author: 'Dr. Andrea M.', role: 'Tourismusdirektorin', company: 'Stadtverwaltung', avatarUrl: null },
  ],
  hotel: [
    { quote: 'Unsere Gaeste lieben die digitale Gaestemappe. Die Bewertungen haben sich deutlich verbessert.', author: 'Stefan R.', role: 'Hotelmanager', company: 'Alpenhotel', avatarUrl: null },
  ],
}

// ============================================================================
// Default theme per segment
// ============================================================================

const SEGMENT_THEMES: Partial<Record<CrmSegmentId, Partial<LandingPageTheme>>> = {
  museum_small: { primaryColor: '#1a365d', secondaryColor: '#c8a951', backgroundStyle: 'light' },
  museum_medium: { primaryColor: '#1a365d', secondaryColor: '#c8a951', backgroundStyle: 'light' },
  museum_large: { primaryColor: '#0f172a', secondaryColor: '#d4af37', backgroundStyle: 'dark' },
  city_small: { primaryColor: '#065f46', secondaryColor: '#f59e0b', backgroundStyle: 'light' },
  city_medium: { primaryColor: '#065f46', secondaryColor: '#f59e0b', backgroundStyle: 'gradient' },
  city_large: { primaryColor: '#0c4a6e', secondaryColor: '#10b981', backgroundStyle: 'gradient' },
  region: { primaryColor: '#166534', secondaryColor: '#eab308', backgroundStyle: 'image' },
  hotel: { primaryColor: '#78350f', secondaryColor: '#d97706', backgroundStyle: 'light' },
  resort: { primaryColor: '#0e7490', secondaryColor: '#06b6d4', backgroundStyle: 'gradient' },
  cruise: { primaryColor: '#1e3a5f', secondaryColor: '#38bdf8', backgroundStyle: 'dark' },
  event: { primaryColor: '#7c2d12', secondaryColor: '#fb923c', backgroundStyle: 'gradient' },
}

// ============================================================================
// Headline templates per segment
// ============================================================================

const SEGMENT_HEADLINES: Partial<Record<CrmSegmentId, { headline: string; subheadline: string }>> = {
  museum_small: {
    headline: 'Ihr Museum, neu erlebt — mit KI',
    subheadline: 'Persoenliche Audioguides und KI-Gespraeche fuer jeden Besucher. In ueber 30 Sprachen.',
  },
  museum_medium: {
    headline: 'Digitale Besuchererlebnisse fuer Ihr Museum',
    subheadline: 'KI-Audioguides, interaktive Touren und Besucheranalysen — alles aus einer Plattform.',
  },
  museum_large: {
    headline: 'Die Enterprise-Plattform fuer Museen',
    subheadline: 'Skalierbare KI-Erlebnisse fuer Hunderttausende Besucher. DSGVO-konform und vollstaendig anpassbar.',
  },
  city_small: {
    headline: 'Ihre Stadt. Digital erlebbar.',
    subheadline: 'Ein persoenlicher Stadtfuehrer fuer jeden Gast — automatisch, mehrsprachig, intelligent.',
  },
  city_large: {
    headline: 'Smart Tourism fuer Ihre Stadt',
    subheadline: 'KI-personalisierte Stadterlebnisse fuer Millionen von Besuchern. Von der Sehenswuerdigkeit bis zum Geheimtipp.',
  },
  region: {
    headline: 'Eine Plattform fuer Ihre gesamte Region',
    subheadline: 'Verbinden Sie alle Gemeinden, Museen und Attraktionen in einem intelligenten Tourismusportal.',
  },
  hotel: {
    headline: 'Die digitale Gaestemappe — neu gedacht',
    subheadline: 'Persoenliche Empfehlungen, lokale Tipps und Mehrsprachigkeit. Automatisch, ohne Aufwand.',
  },
  cruise: {
    headline: 'Das digitale Borderlebnis',
    subheadline: 'Personalisierte Schiffsfuehrung, Landausflug-Empfehlungen und Offline-Modus fuer Ihre Gaeste.',
  },
  event: {
    headline: 'Ihr Event. Persoenlich erlebt.',
    subheadline: 'Intelligente Navigation, personalisierte Programm-Empfehlungen und mehrsprachige Gaestefuehrung.',
  },
}

// ============================================================================
// Builder: Generate a landing page config from an invite code
// ============================================================================

const DEFAULT_THEME: LandingPageTheme = {
  primaryColor: '#1a365d',
  secondaryColor: '#c8a951',
  accentColor: '#3b82f6',
  backgroundStyle: 'light',
  backgroundImageUrl: null,
  logoUrl: null,
  fontFamily: 'Inter, system-ui, sans-serif',
}

export function buildLandingPageConfig(
  invite: CrmInviteCode,
  lead: Pick<CrmLead, 'segmentId' | 'companyName' | 'contactFirstName' | 'contactLastName' | 'discountPercent'> | null,
  options?: {
    baseUrl?: string
    language?: string
  },
): LandingPageConfig {
  const segmentId = (lead?.segmentId ?? invite.segmentId) as CrmSegmentId
  const segment: SegmentConfig = CRM_SEGMENTS[segmentId] ?? CRM_SEGMENTS.other
  const companyName = lead?.companyName ?? (invite.landingConfig as Record<string, string>)?.company ?? null
  const contactName = lead
    ? [lead.contactFirstName, lead.contactLastName].filter(Boolean).join(' ') || null
    : (invite.landingConfig as Record<string, string>)?.contact_name ?? null
  const language = options?.language ?? 'de'
  const baseUrl = options?.baseUrl ?? 'https://fintutto.world'

  // Merge theme
  const segmentTheme = SEGMENT_THEMES[segmentId] ?? {}
  const theme: LandingPageTheme = { ...DEFAULT_THEME, ...segmentTheme }

  // Build personalized headline
  const headlineTemplate = SEGMENT_HEADLINES[segmentId] ?? {
    headline: 'Willkommen bei Fintutto World',
    subheadline: 'Die KI-Plattform fuer personalisierte Besuchererlebnisse.',
  }

  let headline = headlineTemplate.headline
  if (companyName) {
    headline = headline.replace(/Ihr(e)?\s+(Museum|Stadt|Region|Hotel|Event|Schiff)/i, `${companyName} —`)
  }

  // Hero section
  const hero: LandingPageHeroSection = {
    headline,
    subheadline: headlineTemplate.subheadline,
    ctaText: 'Kostenlos testen',
    ctaUrl: `${baseUrl}/register?code=${invite.code}`,
    heroImageUrl: null,
    heroVideoUrl: null,
    showDemoButton: true,
  }

  // Features for this segment
  const features = SEGMENT_FEATURES[segmentId] ?? SEGMENT_FEATURES.museum_small ?? []

  // Testimonials
  const testimonials = SEGMENT_TESTIMONIALS[segmentId] ?? []

  // Pricing
  const discount = lead?.discountPercent ?? (invite.customOffer as Record<string, number>)?.discount ?? null
  const pricing: LandingPagePricing = {
    showPricing: true,
    highlightedTier: segment.recommendedTier,
    customDiscount: discount,
    customMessage: discount && discount > 0
      ? `Exklusiv fuer Sie: ${discount}% Rabatt auf den ${segment.recommendedTier}-Tarif.`
      : null,
  }

  // UTM from campaign config
  const campaignConfig = invite.landingConfig as Record<string, string>

  return {
    slug: `invite/${invite.code}`,
    title: companyName
      ? `${companyName} — Fintutto World`
      : `${segment.label} — Fintutto World`,
    metaDescription: headlineTemplate.subheadline,
    language,
    theme,
    hero,
    features,
    testimonials,
    pricing,
    segmentId,
    companyName,
    contactName,
    customOffer: invite.customOffer && Object.keys(invite.customOffer).length > 0
      ? invite.customOffer
      : null,
    inviteCode: invite.code,
    campaignId: invite.campaignId,
    utmSource: campaignConfig?.utm_source ?? 'crm',
    utmMedium: campaignConfig?.utm_medium ?? 'invite',
    utmCampaign: campaignConfig?.utm_campaign ?? null,
  }
}

// ============================================================================
// Helper: Validate an invite code (check active + not expired + uses left)
// ============================================================================

export interface InviteValidationResult {
  valid: boolean
  reason: 'ok' | 'not_found' | 'inactive' | 'expired' | 'max_uses_reached'
  invite: CrmInviteCode | null
}

export function validateInviteCode(invite: CrmInviteCode | null, now?: Date): InviteValidationResult {
  if (!invite) {
    return { valid: false, reason: 'not_found', invite: null }
  }

  if (!invite.isActive) {
    return { valid: false, reason: 'inactive', invite }
  }

  const currentTime = now ?? new Date()

  if (invite.validUntil && new Date(invite.validUntil) < currentTime) {
    return { valid: false, reason: 'expired', invite }
  }

  if (invite.maxUses > 0 && invite.registrations >= invite.maxUses) {
    return { valid: false, reason: 'max_uses_reached', invite }
  }

  return { valid: true, reason: 'ok', invite }
}

// ============================================================================
// Helper: Track invite visit (returns updated fields)
// ============================================================================

export function buildInviteVisitUpdate(invite: CrmInviteCode): Partial<CrmInviteCode> {
  const now = new Date().toISOString()
  return {
    visits: invite.visits + 1,
    lastVisitedAt: now,
    ...(invite.firstVisitedAt ? {} : { firstVisitedAt: now }),
  }
}
