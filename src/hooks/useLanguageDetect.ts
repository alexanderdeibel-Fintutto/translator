/**
 * Language Auto-Detection Hook
 *
 * Uses the browser's language and navigator settings to
 * suggest the most likely target language for a listener.
 * Falls back to 'en' if detection fails.
 */

/** Try to detect the user's preferred language from browser settings */
export function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en'

  // navigator.languages gives ordered preference list
  const langs = navigator.languages || [navigator.language]

  for (const lang of langs) {
    const code = lang.split('-')[0].toLowerCase()
    // Skip German (the source language in most cases)
    if (code === 'de') continue
    if (code && code.length === 2) return code
  }

  return 'en'
}

/**
 * Map of common language codes to their script direction and
 * a friendly label for auto-detect UI confirmation.
 */
export const LANGUAGE_DETECT_LABELS: Record<string, string> = {
  en: 'English detected',
  tr: 'Tuerkce algilandi',
  ar: '\u062A\u0645 \u0627\u0644\u0643\u0634\u0641 \u0639\u0646 \u0627\u0644\u0639\u0631\u0628\u064A\u0629',
  fa: '\u0641\u0627\u0631\u0633\u06CC \u0634\u0646\u0627\u0633\u0627\u06CC\u06CC \u0634\u062F',
  uk: '\u0412\u0438\u044F\u0432\u043B\u0435\u043D\u043E \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0443',
  ru: '\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D \u0440\u0443\u0441\u0441\u043A\u0438\u0439',
  pl: 'Wykryto polski',
  ro: 'Romana detectata',
  sq: 'U zbulua shqipja',
  fr: 'Francais detecte',
  es: 'Espanol detectado',
  ku: 'Kurdi hat naskirin',
  so: 'Af-Soomaali la ogaaday',
  ps: '\u067E\u069A\u062A\u0648 \u0645\u0648\u0646\u062F\u0644 \u0634\u0648',
  ti: '\u1275\u130D\u122D\u129B \u1270\u1228\u12D2\u1261',
  am: '\u12A0\u121B\u122D\u129B \u1270\u1308\u129D\u1277\u120D',
  ur: '\u0627\u0631\u062F\u0648 \u06A9\u0627 \u067E\u062A\u0627 \u0644\u06AF\u0627\u06CC\u0627',
}
