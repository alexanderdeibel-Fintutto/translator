/**
 * browser-compat.ts
 * Erkennt Browser, Betriebssystem und prüft welche Offline-Features verfügbar sind.
 *
 * Offline-Feature-Matrix (Stand 2025):
 *
 * ┌─────────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
 * │ Feature                 │ Chrome   │ Edge     │ Safari   │ Firefox  │ Samsung  │
 * │                         │ (Blink)  │ (Blink)  │ (WebKit) │ (Gecko)  │ (Blink)  │
 * ├─────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
 * │ Cache API               │ ✅       │ ✅       │ ✅ (iOS≥15)│ ✅      │ ✅       │
 * │ IndexedDB               │ ✅       │ ✅       │ ✅       │ ✅       │ ✅       │
 * │ Service Worker          │ ✅       │ ✅       │ ✅ (iOS≥15)│ ✅      │ ✅       │
 * │ WebAssembly             │ ✅       │ ✅       │ ✅       │ ✅       │ ✅       │
 * │ SharedArrayBuffer (SAB) │ ✅ HTTPS │ ✅ HTTPS │ ✅ iOS≥15│ ✅ HTTPS │ ✅ HTTPS │
 * │ Persistent Storage      │ ✅       │ ✅       │ ❌ (iOS) │ ✅       │ ✅       │
 * │ PWA installierbar       │ ✅       │ ✅       │ ✅ (Add) │ ❌       │ ✅       │
 * │ Offline-Modelle (WASM)  │ ✅       │ ✅       │ ⚠️ langsam│ ✅      │ ✅       │
 * └─────────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
 *
 * Kritische Einschränkungen:
 * - Firefox: Kein PWA-Install, aber alle Offline-APIs funktionieren
 * - iOS Safari (nicht installiert): Daten werden nach 7 Tagen Inaktivität gelöscht
 * - iOS Safari (installiert/PWA): Persistent Storage, voller Offline-Support
 * - Firefox Android: Kein PWA-Install, aber Offline-APIs OK
 * - Chrome/Edge/Samsung: Beste Unterstützung, empfohlen
 * - Private/Incognito-Modus: IndexedDB/Cache werden beim Schließen gelöscht → Offline unmöglich
 */

export type BrowserName = 'chrome' | 'edge' | 'safari' | 'firefox' | 'samsung' | 'opera' | 'brave' | 'other'
export type OSName = 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'other'

export interface BrowserInfo {
  browser: BrowserName
  os: OSName
  version: number
  isIOS: boolean
  isAndroid: boolean
  isMobile: boolean
  isStandalone: boolean   // Als PWA installiert
  isPrivateMode: boolean  // Kann nicht sicher erkannt werden, daher immer false
}

export interface OfflineCompatibility {
  /** Alle kritischen Features vorhanden → Offline-Setup möglich */
  canGoOffline: boolean
  /** PWA kann installiert werden */
  canInstallPWA: boolean
  /** Daten bleiben dauerhaft (kein 7-Tage-Limit) */
  hasPersistentStorage: boolean
  /** WebAssembly verfügbar → Transformers.js läuft */
  hasWebAssembly: boolean
  /** Cache API verfügbar → Modelle speicherbar */
  hasCacheAPI: boolean
  /** Service Worker verfügbar → App offline ladbar */
  hasServiceWorker: boolean
  /** Empfohlener Browser für dieses Gerät */
  recommendedBrowser: string | null
  /** Empfohlener Browser-Link */
  recommendedBrowserUrl: string | null
  /** Schweregrad der Einschränkung */
  severity: 'ok' | 'warning' | 'error'
  /** Kurze Erklärung für den Nutzer */
  message: string | null
}

/** Erkennt Browser und Betriebssystem aus dem User-Agent */
export function detectBrowser(): BrowserInfo {
  if (typeof navigator === 'undefined') {
    return {
      browser: 'other', os: 'other', version: 0,
      isIOS: false, isAndroid: false, isMobile: false,
      isStandalone: false, isPrivateMode: false,
    }
  }

  const ua = navigator.userAgent
  const platform = navigator.platform || ''

  // OS-Erkennung
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/.test(ua)
  const isWindows = /Windows/.test(ua)
  const isMacOS = /Macintosh|MacIntel/.test(ua) && !isIOS
  const isLinux = /Linux/.test(ua) && !isAndroid

  let os: OSName = 'other'
  if (isIOS) os = 'ios'
  else if (isAndroid) os = 'android'
  else if (isWindows) os = 'windows'
  else if (isMacOS) os = 'macos'
  else if (isLinux) os = 'linux'

  // Browser-Erkennung (Reihenfolge wichtig!)
  let browser: BrowserName = 'other'
  let version = 0

  if (/Edg\//.test(ua)) {
    browser = 'edge'
    version = parseFloat(ua.match(/Edg\/([\d.]+)/)?.[1] || '0')
  } else if (/SamsungBrowser/.test(ua)) {
    browser = 'samsung'
    version = parseFloat(ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || '0')
  } else if (/OPR\/|Opera\//.test(ua)) {
    browser = 'opera'
    version = parseFloat(ua.match(/OPR\/([\d.]+)/)?.[1] || '0')
  } else if (/Brave/.test(ua)) {
    browser = 'brave'
    version = parseFloat(ua.match(/Chrome\/([\d.]+)/)?.[1] || '0')
  } else if (/CriOS\//.test(ua)) {
    // Chrome auf iOS (nutzt WebKit, nicht Blink!)
    browser = 'chrome'
    version = parseFloat(ua.match(/CriOS\/([\d.]+)/)?.[1] || '0')
  } else if (/FxiOS\//.test(ua)) {
    // Firefox auf iOS (nutzt WebKit, nicht Gecko!)
    browser = 'firefox'
    version = parseFloat(ua.match(/FxiOS\/([\d.]+)/)?.[1] || '0')
  } else if (/Firefox\//.test(ua)) {
    browser = 'firefox'
    version = parseFloat(ua.match(/Firefox\/([\d.]+)/)?.[1] || '0')
  } else if (/Chrome\//.test(ua)) {
    browser = 'chrome'
    version = parseFloat(ua.match(/Chrome\/([\d.]+)/)?.[1] || '0')
  } else if (/Safari\//.test(ua)) {
    browser = 'safari'
    version = parseFloat(ua.match(/Version\/([\d.]+)/)?.[1] || '0')
  }

  // Standalone-Modus (als PWA installiert)
  // @ts-expect-error navigator.standalone ist iOS-only
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches

  return {
    browser,
    os,
    version,
    isIOS,
    isAndroid,
    isMobile: isIOS || isAndroid,
    isStandalone,
    isPrivateMode: false, // Kann nicht zuverlässig erkannt werden
  }
}

/** Prüft Offline-Kompatibilität basierend auf Browser und verfügbaren APIs */
export function checkOfflineCompatibility(): OfflineCompatibility {
  const info = detectBrowser()

  const hasCacheAPI = typeof caches !== 'undefined'
  const hasServiceWorker = 'serviceWorker' in navigator
  const hasWebAssembly = typeof WebAssembly !== 'undefined'
  const hasPersistentStorageAPI = !!navigator.storage?.persist

  // iOS Safari (nicht als PWA installiert): 7-Tage-Eviction-Problem
  const isIOSSafariNotInstalled = info.isIOS && info.browser === 'safari' && !info.isStandalone
  // iOS mit fremdem Browser (Chrome/Firefox auf iOS): nutzt WebKit-Engine, selbe Einschränkungen
  const isIOSThirdPartyBrowser = info.isIOS && info.browser !== 'safari'

  // Firefox Desktop: Kein PWA-Install, aber alle Offline-APIs OK
  const isFirefoxDesktop = info.browser === 'firefox' && !info.isMobile

  // Firefox Android: Kein PWA-Install
  const isFirefoxAndroid = info.browser === 'firefox' && info.isAndroid

  // Persistent Storage: iOS Safari ohne Installation hat kein persist()
  const hasPersistentStorage = hasPersistentStorageAPI && !isIOSSafariNotInstalled

  // PWA installierbar: Firefox (Desktop + Android) unterstützt kein PWA-Install
  const canInstallPWA = !isFirefoxDesktop && !isFirefoxAndroid

  // Kann offline gehen: alle kritischen APIs vorhanden
  const canGoOffline = hasCacheAPI && hasServiceWorker && hasWebAssembly

  // Empfehlung berechnen
  let recommendedBrowser: string | null = null
  let recommendedBrowserUrl: string | null = null
  let severity: 'ok' | 'warning' | 'error' = 'ok'
  let message: string | null = null

  if (!hasWebAssembly || !hasCacheAPI || !hasServiceWorker) {
    // Kritisch: Grundlegende APIs fehlen
    severity = 'error'
    message = 'Dieser Browser unterstützt keine Offline-Funktionen. Bitte wechseln Sie den Browser.'
    if (info.isIOS) {
      recommendedBrowser = 'Safari (iOS)'
      recommendedBrowserUrl = null // Vorinstalliert, kein Download nötig
    } else if (info.isAndroid) {
      recommendedBrowser = 'Google Chrome'
      recommendedBrowserUrl = 'https://play.google.com/store/apps/details?id=com.android.chrome'
    } else {
      recommendedBrowser = 'Google Chrome'
      recommendedBrowserUrl = 'https://www.google.com/chrome/'
    }
  } else if (isIOSSafariNotInstalled) {
    // Warnung: iOS Safari ohne Installation → Daten werden nach 7 Tagen gelöscht
    severity = 'warning'
    message = 'Auf dem iPhone/iPad werden heruntergeladene Sprachmodelle nach 7 Tagen Inaktivität automatisch gelöscht. Fügen Sie die App zum Home-Bildschirm hinzu, um das zu verhindern.'
    recommendedBrowser = null // Kein Browser-Wechsel nötig, nur Installation
    recommendedBrowserUrl = null
  } else if (isIOSThirdPartyBrowser) {
    // Warnung: Chrome/Firefox auf iOS nutzt WebKit-Engine (selbe Einschränkungen wie Safari)
    severity = 'warning'
    message = 'Chrome und Firefox auf dem iPhone/iPad nutzen intern die Safari-Engine. Für beste Offline-Unterstützung: App zum Home-Bildschirm hinzufügen.'
    recommendedBrowser = null
    recommendedBrowserUrl = null
  } else if (isFirefoxDesktop) {
    // Hinweis: Firefox Desktop kann keine PWA installieren
    severity = 'warning'
    message = 'Firefox unterstützt keine App-Installation (PWA). Offline-Funktionen sind trotzdem verfügbar, aber Sprachmodelle könnten beim Browser-Schließen gelöscht werden. Für dauerhaften Offline-Betrieb empfehlen wir Chrome oder Edge.'
    recommendedBrowser = 'Google Chrome'
    recommendedBrowserUrl = 'https://www.google.com/chrome/'
  } else if (isFirefoxAndroid) {
    // Hinweis: Firefox Android kann keine PWA installieren
    severity = 'warning'
    message = 'Firefox für Android unterstützt keine App-Installation. Für dauerhaften Offline-Betrieb empfehlen wir Chrome für Android.'
    recommendedBrowser = 'Chrome für Android'
    recommendedBrowserUrl = 'https://play.google.com/store/apps/details?id=com.android.chrome'
  } else if (info.isStandalone) {
    // Perfekt: Als PWA installiert
    severity = 'ok'
    message = null
  } else {
    // Online-Browser, aber noch nicht installiert
    severity = 'ok'
    message = null
  }

  return {
    canGoOffline,
    canInstallPWA,
    hasPersistentStorage,
    hasWebAssembly,
    hasCacheAPI,
    hasServiceWorker,
    recommendedBrowser,
    recommendedBrowserUrl,
    severity,
    message,
  }
}

/** Hook-freie Hilfsfunktion: Gibt den empfohlenen Browser-Namen zurück */
export function getRecommendedBrowserName(): string | null {
  return checkOfflineCompatibility().recommendedBrowser
}
