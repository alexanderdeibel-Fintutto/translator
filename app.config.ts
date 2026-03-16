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
 * - school-teacher:      Classroom speaker app for teachers
 * - school-student:      Classroom listener app for students
 * - authority-clerk:     Government office speaker app
 * - authority-visitor:   Government office visitor listener
 * - ngo-helper:          NGO/refugee aid speaker app
 * - ngo-client:          NGO/refugee aid listener app
 * - counter-staff:       Hotel/retail/trade fair staff (bidirectional)
 * - counter-guest:       Hotel/retail/trade fair guest listener
 * - medical-staff:       Doctor/nurse/pharmacist speaker app
 * - medical-patient:     Patient listener app
 * - conference-speaker:  Conference/event/church speaker app
 * - conference-listener: Conference/event attendee listener
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
  | 'counter-staff'
  | 'counter-guest'
  | 'medical-staff'
  | 'medical-patient'
  | 'conference-speaker'
  | 'conference-listener'

/** Which core app this flavor is based on */
export type AppBase = 'consumer' | 'listener' | 'enterprise' | 'landing'

/** Target market for market-specific flavors */
export type MarketSegment = 'general' | 'schools' | 'authorities' | 'ngo' | 'hospitality' | 'medical' | 'events'

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
  /** Subdomain for deployment (e.g. tl-school-teacher.fintutto.cloud) */
  subdomain: string
  /** Icon directory under public/icons/ (shared between speaker/listener pairs) */
  iconDir: string
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
    iconDir: 'core',
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
    iconDir: 'core',
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
    iconDir: 'core',
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
    iconDir: 'core',
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
    subdomain: 'tl-school-teacher',
    iconDir: 'school',
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
    subdomain: 'tl-school-student',
    iconDir: 'school',
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
    subdomain: 'tl-authority-clerk',
    iconDir: 'authority',
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
    subdomain: 'tl-authority-visitor',
    iconDir: 'authority',
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
    subdomain: 'tl-helper',
    iconDir: 'ngo',
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
    subdomain: 'tl-client',
    iconDir: 'ngo',
  },

  // ─── Counter / Hospitality Market ─────────────────────────────
  'counter-staff': {
    variant: 'counter-staff',
    base: 'enterprise',
    market: 'hospitality',
    appName: 'Counter Translator - Mitarbeiter',
    shortName: 'CounterTranslator',
    description: 'Bidirektionale Gespraechsuebersetzung am Schalter, Empfang, Counter und auf Messen.',
    appId: 'cloud.fintutto.counter.staff',
    themeColor: '#7c3aed',
    accentColor: '#a78bfa',
    devPort: 5196,
    startUrl: '/',
    iosScheme: 'countertranslatorstaff',
    subdomain: 'tl-counter-staff',
    iconDir: 'counter',
  },
  'counter-guest': {
    variant: 'counter-guest',
    base: 'listener',
    market: 'hospitality',
    appName: 'Counter Translator',
    shortName: 'CounterTranslator',
    description: 'Verstehen Sie Ihren Gastgeber - in Ihrer Sprache. Am Schalter, Empfang oder Counter.',
    appId: 'cloud.fintutto.counter.guest',
    themeColor: '#7c3aed',
    accentColor: '#a78bfa',
    devPort: 5197,
    startUrl: '/',
    iosScheme: 'countertranslatorguest',
    subdomain: 'tl-counter-guest',
    iconDir: 'counter',
  },

  // ─── Medical Market ───────────────────────────────────────────
  'medical-staff': {
    variant: 'medical-staff',
    base: 'enterprise',
    market: 'medical',
    appName: 'Medical Translator - Personal',
    shortName: 'MedTranslator',
    description: 'Arzt-Patient-Kommunikation ohne Sprachbarriere. Med. Phrasen, Schmerzskala, Datenschutz.',
    appId: 'cloud.fintutto.medical.staff',
    themeColor: '#dc2626',
    accentColor: '#f87171',
    devPort: 5198,
    startUrl: '/',
    iosScheme: 'medicaltranslatorstaff',
    subdomain: 'tl-medical-staff',
    iconDir: 'medical',
  },
  'medical-patient': {
    variant: 'medical-patient',
    base: 'listener',
    market: 'medical',
    appName: 'Medical Translator',
    shortName: 'MedTranslator',
    description: 'Verstehen Sie Ihren Arzt - in Ihrer Sprache. Mit visueller Schmerzskala.',
    appId: 'cloud.fintutto.medical.patient',
    themeColor: '#dc2626',
    accentColor: '#f87171',
    devPort: 5199,
    startUrl: '/',
    iosScheme: 'medicaltranslatorpatient',
    subdomain: 'tl-medical-patient',
    iconDir: 'medical',
  },

  // ─── Conference / Events Market ───────────────────────────────
  'conference-speaker': {
    variant: 'conference-speaker',
    base: 'enterprise',
    market: 'events',
    appName: 'Conference Translator - Speaker',
    shortName: 'ConfTranslator',
    description: 'Live-Uebersetzung fuer Konferenzen, Events, Gottesdienste und Messen. Multi-Kanal, grosses Publikum.',
    appId: 'cloud.fintutto.conference.speaker',
    themeColor: '#1d4ed8',
    accentColor: '#60a5fa',
    devPort: 5200,
    startUrl: '/',
    iosScheme: 'conferencetranslatorspeaker',
    subdomain: 'tl-conference-speaker',
    iconDir: 'conference',
  },
  'conference-listener': {
    variant: 'conference-listener',
    base: 'listener',
    market: 'events',
    appName: 'Conference Translator',
    shortName: 'ConfTranslator',
    description: 'Empfangen Sie Live-Uebersetzungen bei Konferenzen und Events in Ihrer Sprache.',
    appId: 'cloud.fintutto.conference.listener',
    themeColor: '#1d4ed8',
    accentColor: '#60a5fa',
    devPort: 5201,
    startUrl: '/',
    iosScheme: 'conferencetranslatorlistener',
    subdomain: 'tl-conference-listener',
    iconDir: 'conference',
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
