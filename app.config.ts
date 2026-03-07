/**
 * Multi-App Configuration
 *
 * Defines all app variants built from the shared source in src/.
 * Each variant specifies its own branding, features, and Capacitor config.
 *
 * App Variants:
 * - consumer:   Full translator for end users (Free/Pro tiers)
 * - listener:   Minimal receiver app (QR join + live stream)
 * - enterprise: Session management console for speakers/technicians
 */

export type AppVariant = 'consumer' | 'listener' | 'enterprise'

export interface AppConfig {
  /** Internal variant identifier */
  variant: AppVariant
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
  /** Dev server port */
  devPort: number
  /** PWA start URL */
  startUrl: string
  /** iOS URL scheme */
  iosScheme: string
}

export const appConfigs: Record<AppVariant, AppConfig> = {
  consumer: {
    variant: 'consumer',
    appName: 'Fintutto Translator',
    shortName: 'Fintutto',
    description: 'Kostenloser Uebersetzer mit Spracheingabe, HD-Sprachausgabe, Live-Sessions, Kamera-OCR und Offline-Modus.',
    appId: 'com.fintutto.translator',
    themeColor: '#0369a1',
    devPort: 5180,
    startUrl: '/',
    iosScheme: 'fintuttotranslator',
  },
  listener: {
    variant: 'listener',
    appName: 'Fintutto Live',
    shortName: 'FT Live',
    description: 'Empfange Live-Uebersetzungen in deiner Sprache. QR-Code scannen, Sprache waehlen, fertig.',
    appId: 'com.fintutto.live',
    themeColor: '#059669',
    devPort: 5181,
    startUrl: '/',
    iosScheme: 'fintuttolive',
  },
  enterprise: {
    variant: 'enterprise',
    appName: 'Fintutto Enterprise',
    shortName: 'FT Enterprise',
    description: 'Session-Management fuer Guides, Speaker und Event-Techniker. Sessions erstellen, aktivieren und verwalten.',
    appId: 'com.fintutto.enterprise',
    themeColor: '#7c3aed',
    devPort: 5182,
    startUrl: '/',
    iosScheme: 'fintuttoenterprise',
  },
}

export function getAppConfig(variant: AppVariant): AppConfig {
  return appConfigs[variant]
}
