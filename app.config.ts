/**
 * Multi-App Configuration
 *
 * Defines all app variants built from the shared source in src/.
 * Each variant specifies its own branding, features, and Capacitor config.
 *
 * App Variants (Core):
 * - consumer:   Full translator for end users (Free/Pro tiers)
 * - listener:   Minimal receiver app (QR join + live stream)
 * - enterprise: Session management console for speakers/technicians
 * - landing:    Product landing page
 *
 * Market Flavors (specialized variants):
 * - school-teacher:  Classroom speaker app for teachers
 * - school-student:  Classroom listener app for students
 * - authority-clerk: Government office speaker app
 * - authority-visitor: Government office visitor listener
 * - ngo-helper:     NGO/refugee aid speaker app
 * - ngo-client:     NGO/refugee aid listener app
 */

export type AppVariant =
  | 'consumer'
  | 'listener'
  | 'enterprise'
  | 'landing'
  | 'school-teacher'
  | 'school-student'
  | 'authority-clerk'
  | 'authority-visitor'
  | 'ngo-helper'
  | 'ngo-client'

/** Which core app this flavor is based on */
export type AppBase = 'consumer' | 'listener' | 'enterprise' | 'landing'

/** Target market for market-specific flavors */
export type MarketSegment = 'general' | 'schools' | 'authorities' | 'ngo'

export interface AppConfig {
  /** Internal variant identifier */
  variant: AppVariant
  /** Which core app type this is based on (for routing/feature decisions) */
  base: AppBase
  /** Target market segment */
  market: MarketSegment
  /** Display name */
  appName: string
  /** Short name for PWA */
  shortName: string
  /** App description */
  description: string
  /** Capacitor app ID (reverse domain) */
  appId: string
  /** Primary brand color */
  themeColor: string
  /** Secondary/accent color for UI elements */
  accentColor: string
  /** Dev server port */
  devPort: number
  /** PWA start URL */
  startUrl: string
  /** iOS URL scheme */
  iosScheme: string
  /** Subdomain for deployment (e.g. schools.translator.fintutto.cloud) */
  subdomain: string
}

export const appConfigs: Record<AppVariant, AppConfig> = {
  // ─── Core Apps ──────────────────────────────────────────────
  consumer: {
    variant: 'consumer',
    base: 'consumer',
    market: 'general',
    appName: 'Fintutto Translator',
    shortName: 'Fintutto',
    description: 'Kostenloser Uebersetzer mit Spracheingabe, HD-Sprachausgabe, Live-Sessions, Kamera-OCR und Offline-Modus.',
    appId: 'com.fintutto.translator',
    themeColor: '#0369a1',
    accentColor: '#0ea5e9',
    devPort: 5180,
    startUrl: '/',
    iosScheme: 'fintuttotranslator',
    subdomain: 'app',
  },
  listener: {
    variant: 'listener',
    base: 'listener',
    market: 'general',
    appName: 'Fintutto Live',
    shortName: 'FT Live',
    description: 'Empfange Live-Uebersetzungen in deiner Sprache. QR-Code scannen, Sprache waehlen, fertig.',
    appId: 'com.fintutto.live',
    themeColor: '#059669',
    accentColor: '#34d399',
    devPort: 5181,
    startUrl: '/',
    iosScheme: 'fintuttolive',
    subdomain: 'live',
  },
  enterprise: {
    variant: 'enterprise',
    base: 'enterprise',
    market: 'general',
    appName: 'Fintutto Enterprise',
    shortName: 'FT Enterprise',
    description: 'Session-Management fuer Guides, Speaker und Event-Techniker. Sessions erstellen, aktivieren und verwalten.',
    appId: 'com.fintutto.enterprise',
    themeColor: '#7c3aed',
    accentColor: '#a78bfa',
    devPort: 5182,
    startUrl: '/',
    iosScheme: 'fintuttoenterprise',
    subdomain: 'enterprise',
  },
  landing: {
    variant: 'landing',
    base: 'landing',
    market: 'general',
    appName: 'Fintutto Translator',
    shortName: 'Fintutto',
    description: 'Die Uebersetzungsplattform fuer Tourismus, Events, Migration und Alltag. 45 Sprachen, Offline-faehig, Live-Sessions.',
    appId: 'de.fintutto.translator',
    themeColor: '#0369a1',
    accentColor: '#0ea5e9',
    devPort: 5183,
    startUrl: '/',
    iosScheme: 'fintuttolanding',
    subdomain: 'www',
  },

  // ─── Schools Market ─────────────────────────────────────────
  'school-teacher': {
    variant: 'school-teacher',
    base: 'enterprise',
    market: 'schools',
    appName: 'School Translator - Lehrer',
    shortName: 'SchoolTranslator',
    description: 'Live-Uebersetzung im Klassenzimmer. Sprechen Sie, Ihre Schueler lesen mit - in ihrer Muttersprache.',
    appId: 'cloud.fintutto.school.teacher',
    themeColor: '#2563eb',
    accentColor: '#60a5fa',
    devPort: 5190,
    startUrl: '/',
    iosScheme: 'schooltranslatorteacher',
    subdomain: 'schools',
  },
  'school-student': {
    variant: 'school-student',
    base: 'listener',
    market: 'schools',
    appName: 'School Translator',
    shortName: 'SchoolTranslator',
    description: 'Folge dem Unterricht in deiner Sprache. Code eingeben, Sprache waehlen, mitlesen.',
    appId: 'cloud.fintutto.school.student',
    themeColor: '#2563eb',
    accentColor: '#60a5fa',
    devPort: 5191,
    startUrl: '/',
    iosScheme: 'schooltranslatorstudent',
    subdomain: 'schools-join',
  },

  // ─── Authorities Market ─────────────────────────────────────
  'authority-clerk': {
    variant: 'authority-clerk',
    base: 'enterprise',
    market: 'authorities',
    appName: 'Amt Translator - Sachbearbeiter',
    shortName: 'AmtTranslator',
    description: 'Verstaendigung am Schalter und im Buergerkontakt. Live-Uebersetzung fuer Behoerden.',
    appId: 'cloud.fintutto.authority.clerk',
    themeColor: '#0f766e',
    accentColor: '#2dd4bf',
    devPort: 5192,
    startUrl: '/',
    iosScheme: 'amttranslatorclerk',
    subdomain: 'authorities',
  },
  'authority-visitor': {
    variant: 'authority-visitor',
    base: 'listener',
    market: 'authorities',
    appName: 'Amt Translator',
    shortName: 'AmtTranslator',
    description: 'Verstehen Sie Ihren Termin bei der Behoerde - in Ihrer Sprache.',
    appId: 'cloud.fintutto.authority.visitor',
    themeColor: '#0f766e',
    accentColor: '#2dd4bf',
    devPort: 5193,
    startUrl: '/',
    iosScheme: 'amttranslatorvisitor',
    subdomain: 'authorities-join',
  },

  // ─── NGO / Refugee Market ───────────────────────────────────
  'ngo-helper': {
    variant: 'ngo-helper',
    base: 'enterprise',
    market: 'ngo',
    appName: 'Refugee Translator - Helfer',
    shortName: 'RefugeeTranslator',
    description: 'Kommunikation mit Gefluechteten ohne Sprachbarriere. Live-Uebersetzung fuer Sozialarbeit und Beratung.',
    appId: 'cloud.fintutto.ngo.helper',
    themeColor: '#ea580c',
    accentColor: '#fb923c',
    devPort: 5194,
    startUrl: '/',
    iosScheme: 'refugeetranslatorhelper',
    subdomain: 'ngo',
  },
  'ngo-client': {
    variant: 'ngo-client',
    base: 'listener',
    market: 'ngo',
    appName: 'Refugee Translator',
    shortName: 'RefugeeTranslator',
    description: 'Verstehe Beratung und Hilfsangebote - in deiner Sprache.',
    appId: 'cloud.fintutto.ngo.client',
    themeColor: '#ea580c',
    accentColor: '#fb923c',
    devPort: 5195,
    startUrl: '/',
    iosScheme: 'refugeetranslatorclient',
    subdomain: 'ngo-join',
  },
}

export function getAppConfig(variant: AppVariant): AppConfig {
  return appConfigs[variant]
}

/** Get all variants for a specific market */
export function getMarketApps(market: MarketSegment): AppConfig[] {
  return Object.values(appConfigs).filter((c) => c.market === market)
}

/** Get all variants based on a specific core app type */
export function getFlavorsByBase(base: AppBase): AppConfig[] {
  return Object.values(appConfigs).filter((c) => c.base === base)
}
