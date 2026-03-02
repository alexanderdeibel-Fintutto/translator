import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type UILanguage, getTranslation, detectBrowserLanguage, isUILanguageRTL, loadLocale, isLocaleReady } from '@/lib/i18n'

interface I18nContextType {
  uiLang: UILanguage
  setUILang: (lang: UILanguage) => void
  t: (key: string) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [uiLang, setUILangState] = useState<UILanguage>(() => {
    const saved = localStorage.getItem('ui-language')
    if (saved) return saved as UILanguage
    return detectBrowserLanguage()
  })
  const [localeReady, setLocaleReady] = useState(() => isLocaleReady(uiLang))

  // Load locale on mount and when language changes
  useEffect(() => {
    if (isLocaleReady(uiLang)) {
      setLocaleReady(true)
      return
    }
    setLocaleReady(false)
    loadLocale(uiLang).then(() => setLocaleReady(true))
  }, [uiLang])

  const setUILang = useCallback((lang: UILanguage) => {
    localStorage.setItem('ui-language', lang)
    // Pre-load locale before switching to avoid flash
    loadLocale(lang).then(() => setUILangState(lang))
  }, [])

  const t = useCallback((key: string) => {
    return getTranslation(uiLang, key)
  }, [uiLang])

  const isRTL = isUILanguageRTL(uiLang)

  // Set dir attribute on html element for RTL languages
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [isRTL])

  // Show nothing until initial locale is loaded (prevents flash of German)
  if (!localeReady) return null

  return (
    <I18nContext.Provider value={{ uiLang, setUILang, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
