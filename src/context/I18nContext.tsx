import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type UILanguage, getTranslation, detectBrowserLanguage, isUILanguageRTL } from '@/lib/i18n'

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

  const setUILang = useCallback((lang: UILanguage) => {
    setUILangState(lang)
    localStorage.setItem('ui-language', lang)
  }, [])

  const t = useCallback((key: string) => {
    return getTranslation(uiLang, key)
  }, [uiLang])

  const isRTL = isUILanguageRTL(uiLang)

  // Set dir attribute on html element for RTL languages
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [isRTL])

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
