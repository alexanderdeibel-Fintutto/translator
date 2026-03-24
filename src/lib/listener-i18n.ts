/**
 * Lightweight i18n for listener/guest/patient join pages.
 *
 * These apps are used by people who may not speak German or English,
 * so we provide UI strings in the most common languages.
 *
 * The browser's navigator.language is used to auto-detect.
 */

export type ListenerLocale = 'en' | 'de' | 'ar' | 'tr' | 'uk' | 'fr' | 'es' | 'ru' | 'fa' | 'zh'

export interface ListenerStrings {
  /** "Enter the code" */
  enterCode: string
  /** "Join" button */
  join: string
  /** "No account needed" */
  noAccount: string
  /** "Choose your language" */
  chooseLanguage: string
  /** "Understand ... in your language" (generic) */
  tagline: string
}

const STRINGS: Record<ListenerLocale, ListenerStrings> = {
  en: {
    enterCode: 'Enter the code shown on screen',
    join: 'Join',
    noAccount: 'No account needed. Free and private.',
    chooseLanguage: 'Choose your language',
    tagline: 'Understand — in your language',
  },
  de: {
    enterCode: 'Code eingeben, der auf dem Bildschirm angezeigt wird',
    join: 'Beitreten',
    noAccount: 'Kein Konto noetig. Kostenlos und privat.',
    chooseLanguage: 'Waehle deine Sprache',
    tagline: 'Verstehen — in deiner Sprache',
  },
  ar: {
    enterCode: '\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0639\u0631\u0648\u0636 \u0639\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629',
    join: '\u0627\u0646\u0636\u0645',
    noAccount: '\u0644\u0627 \u062d\u0627\u062c\u0629 \u0644\u062d\u0633\u0627\u0628. \u0645\u062c\u0627\u0646\u064a \u0648\u062e\u0627\u0635.',
    chooseLanguage: '\u0627\u062e\u062a\u0631 \u0644\u063a\u062a\u0643',
    tagline: '\u0627\u0641\u0647\u0645 — \u0628\u0644\u063a\u062a\u0643',
  },
  tr: {
    enterCode: 'Ekranda goesterilen kodu girin',
    join: 'Katil',
    noAccount: 'Hesap gerekmez. Uecretsiz ve gizli.',
    chooseLanguage: 'Dilini sec',
    tagline: 'Anla — kendi dilinde',
  },
  uk: {
    enterCode: '\u0412\u0432\u0435\u0434\u0456\u0442\u044c \u043a\u043e\u0434, \u043f\u043e\u043a\u0430\u0437\u0430\u043d\u0438\u0439 \u043d\u0430 \u0435\u043a\u0440\u0430\u043d\u0456',
    join: '\u041f\u0440\u0438\u0454\u0434\u043d\u0430\u0442\u0438\u0441\u044f',
    noAccount: '\u041e\u0431\u043b\u0456\u043a\u043e\u0432\u0438\u0439 \u0437\u0430\u043f\u0438\u0441 \u043d\u0435 \u043f\u043e\u0442\u0440\u0456\u0431\u0435\u043d. \u0411\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u043e.',
    chooseLanguage: '\u041e\u0431\u0435\u0440\u0456\u0442\u044c \u043c\u043e\u0432\u0443',
    tagline: '\u0420\u043e\u0437\u0443\u043c\u0456\u0439\u0442\u0435 — \u0432\u0430\u0448\u043e\u044e \u043c\u043e\u0432\u043e\u044e',
  },
  fr: {
    enterCode: 'Entrez le code affiche a l\'ecran',
    join: 'Rejoindre',
    noAccount: 'Pas de compte necessaire. Gratuit et prive.',
    chooseLanguage: 'Choisissez votre langue',
    tagline: 'Comprenez — dans votre langue',
  },
  es: {
    enterCode: 'Ingrese el codigo que aparece en pantalla',
    join: 'Unirse',
    noAccount: 'No necesita cuenta. Gratis y privado.',
    chooseLanguage: 'Elige tu idioma',
    tagline: 'Entiende — en tu idioma',
  },
  ru: {
    enterCode: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u0434, \u043f\u043e\u043a\u0430\u0437\u0430\u043d\u043d\u044b\u0439 \u043d\u0430 \u044d\u043a\u0440\u0430\u043d\u0435',
    join: '\u041f\u0440\u0438\u0441\u043e\u0435\u0434\u0438\u043d\u0438\u0442\u044c\u0441\u044f',
    noAccount: '\u0410\u043a\u043a\u0430\u0443\u043d\u0442 \u043d\u0435 \u043d\u0443\u0436\u0435\u043d. \u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e \u0438 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e.',
    chooseLanguage: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u044f\u0437\u044b\u043a',
    tagline: '\u041f\u043e\u043d\u0438\u043c\u0430\u0439\u0442\u0435 — \u043d\u0430 \u0432\u0430\u0448\u0435\u043c \u044f\u0437\u044b\u043a\u0435',
  },
  fa: {
    enterCode: '\u06a9\u062f \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0634\u062f\u0647 \u0631\u0648\u06cc \u0635\u0641\u062d\u0647 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f',
    join: '\u067e\u06cc\u0648\u0633\u062a\u0646',
    noAccount: '\u0646\u06cc\u0627\u0632\u06cc \u0628\u0647 \u062d\u0633\u0627\u0628 \u0646\u06cc\u0633\u062a. \u0631\u0627\u06cc\u06af\u0627\u0646 \u0648 \u062e\u0635\u0648\u0635\u06cc.',
    chooseLanguage: '\u0632\u0628\u0627\u0646 \u062e\u0648\u062f \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f',
    tagline: '\u0628\u0641\u0647\u0645\u06cc\u062f — \u0628\u0647 \u0632\u0628\u0627\u0646 \u062e\u0648\u062f',
  },
  zh: {
    enterCode: '\u8f93\u5165\u5c4f\u5e55\u4e0a\u663e\u793a\u7684\u4ee3\u7801',
    join: '\u52a0\u5165',
    noAccount: '\u65e0\u9700\u8d26\u6237\u3002\u514d\u8d39\u4e14\u79c1\u5bc6\u3002',
    chooseLanguage: '\u9009\u62e9\u4f60\u7684\u8bed\u8a00',
    tagline: '\u7406\u89e3 \u2014 \u7528\u4f60\u7684\u8bed\u8a00',
  },
}

const SUPPORTED_LOCALES = Object.keys(STRINGS) as ListenerLocale[]

/**
 * Detect the best matching locale from browser settings.
 */
export function detectListenerLocale(): ListenerLocale {
  if (typeof navigator === 'undefined') return 'en'

  const browserLang = navigator.language?.toLowerCase() || 'en'
  const langCode = browserLang.split('-')[0]

  if (SUPPORTED_LOCALES.includes(langCode as ListenerLocale)) {
    return langCode as ListenerLocale
  }

  return 'en'
}

/**
 * Get translated UI strings for a listener app.
 */
export function getListenerStrings(locale?: ListenerLocale): ListenerStrings {
  const l = locale || detectListenerLocale()
  return STRINGS[l] || STRINGS.en
}

/**
 * Check if a locale is RTL.
 */
export function isListenerRTL(locale: ListenerLocale): boolean {
  return locale === 'ar' || locale === 'fa'
}
