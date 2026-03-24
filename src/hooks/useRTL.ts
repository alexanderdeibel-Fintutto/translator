/**
 * RTL Layout Hook
 *
 * Detects right-to-left languages and sets the document dir attribute.
 * Automatically updates when the language changes.
 */

import { useEffect } from 'react'

/** Languages that use right-to-left script */
const RTL_LANGUAGES = new Set([
  'ar',  // Arabic
  'fa',  // Farsi/Persian
  'he',  // Hebrew
  'ur',  // Urdu
  'ps',  // Pashto
  'ku',  // Kurdish (Sorani script)
  'sd',  // Sindhi
  'yi',  // Yiddish
  'dv',  // Divehi/Maldivian
])

/** Check if a language code is RTL */
export function isRTL(langCode: string): boolean {
  return RTL_LANGUAGES.has(langCode.toLowerCase().split('-')[0])
}

/**
 * Sets document dir="rtl" when the given language is RTL.
 * Restores to "ltr" on cleanup or language change.
 */
export function useRTL(langCode: string) {
  useEffect(() => {
    const rtl = isRTL(langCode)
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'

    return () => {
      document.documentElement.dir = 'ltr'
    }
  }, [langCode])
}
