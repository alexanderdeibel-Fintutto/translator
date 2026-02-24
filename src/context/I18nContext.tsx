import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { getTranslator, RTL_UI_LOCALES, type TranslationKey, type UILocale } from '@/lib/i18n'

interface I18nContextType {
  locale: UILocale
  setLocale: (locale: UILocale) => void
  t: (key: TranslationKey) => string
  isRtl: boolean
}

const I18nContext = createContext<I18nContextType>({
  locale: 'de',
  setLocale: () => {},
  t: (key) => key,
  isRtl: false,
})

function getInitialLocale(): UILocale {
  // Check localStorage
  const saved = localStorage.getItem('ui-locale')
  if (saved) return saved as UILocale

  // Check browser language
  const browserLang = navigator.language.split('-')[0]
  const supported = ['de', 'en', 'ar', 'tr', 'fa', 'uk', 'ru', 'fr', 'es']
  if (supported.includes(browserLang)) return browserLang as UILocale

  return 'de'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UILocale>(getInitialLocale)

  const setLocale = useCallback((newLocale: UILocale) => {
    setLocaleState(newLocale)
    localStorage.setItem('ui-locale', newLocale)
  }, [])

  const t = useCallback((key: TranslationKey) => {
    return getTranslator(locale)(key)
  }, [locale])

  const isRtl = RTL_UI_LOCALES.has(locale)

  // Apply RTL direction to document
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
  }, [isRtl, locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
