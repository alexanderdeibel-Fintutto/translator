export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  speechCode?: string
}

export type LanguageGroup = 'europe' | 'asia' | 'migrant' | 'cruise'

export const LANGUAGES: Language[] = [
  // ── Europäische Hauptsprachen ──
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'en', name: 'Englisch', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'fr', name: 'Französisch', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'es', name: 'Spanisch', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'it', name: 'Italienisch', nativeName: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portugiesisch', nativeName: 'Português', flag: '🇵🇹', speechCode: 'pt-PT' },
  { code: 'nl', name: 'Niederländisch', nativeName: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'pl', name: 'Polnisch', nativeName: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL' },
  { code: 'tr', name: 'Türkisch', nativeName: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'ru', name: 'Russisch', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'uk', name: 'Ukrainisch', nativeName: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA' },
  { code: 'el', name: 'Griechisch', nativeName: 'Ελληνικά', flag: '🇬🇷', speechCode: 'el-GR' },
  { code: 'ro', name: 'Rumänisch', nativeName: 'Română', flag: '🇷🇴', speechCode: 'ro-RO' },
  { code: 'hu', name: 'Ungarisch', nativeName: 'Magyar', flag: '🇭🇺', speechCode: 'hu-HU' },
  { code: 'cs', name: 'Tschechisch', nativeName: 'Čeština', flag: '🇨🇿', speechCode: 'cs-CZ' },
  { code: 'sv', name: 'Schwedisch', nativeName: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'da', name: 'Dänisch', nativeName: 'Dansk', flag: '🇩🇰', speechCode: 'da-DK' },
  { code: 'bg', name: 'Bulgarisch', nativeName: 'Български', flag: '🇧🇬', speechCode: 'bg-BG' },
  { code: 'hr', name: 'Kroatisch', nativeName: 'Hrvatski', flag: '🇭🇷', speechCode: 'hr-HR' },
  { code: 'sr', name: 'Serbisch', nativeName: 'Српски', flag: '🇷🇸', speechCode: 'sr-RS' },
  { code: 'sk', name: 'Slowakisch', nativeName: 'Slovenčina', flag: '🇸🇰', speechCode: 'sk-SK' },
  { code: 'nb', name: 'Norwegisch', nativeName: 'Norsk', flag: '🇳🇴', speechCode: 'nb-NO' },
  { code: 'fi', name: 'Finnisch', nativeName: 'Suomi', flag: '🇫🇮', speechCode: 'fi-FI' },
  { code: 'sq', name: 'Albanisch', nativeName: 'Shqip', flag: '🇦🇱', speechCode: 'sq-AL' },

  // ── Migrations-Sprachen (Priorität für DE) ──
  { code: 'ar', name: 'Arabisch', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'fa', name: 'Farsi / Dari', nativeName: 'فارسی', flag: '🇮🇷', speechCode: 'fa-IR' },
  { code: 'ps', name: 'Paschtu', nativeName: 'پښتو', flag: '🇦🇫', speechCode: 'ps-AF' },
  { code: 'ku', name: 'Kurdisch', nativeName: 'Kurdî', flag: '🇮🇶', speechCode: 'ku-TR' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷', speechCode: 'ti-ER' },
  { code: 'am', name: 'Amharisch', nativeName: 'አማርኛ', flag: '🇪🇹', speechCode: 'am-ET' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴', speechCode: 'so-SO' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', speechCode: 'ur-PK' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-BD' },
  { code: 'sw', name: 'Suaheli', nativeName: 'Kiswahili', flag: '🇹🇿', speechCode: 'sw-TZ' },

  // ── Asien & Pazifik ──
  { code: 'zh', name: 'Chinesisch', nativeName: '中文', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Japanisch', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Koreanisch', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'th', name: 'Thailändisch', nativeName: 'ไทย', flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'vi', name: 'Vietnamesisch', nativeName: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'id', name: 'Indonesisch', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', speechCode: 'id-ID' },
  { code: 'ms', name: 'Malaiisch', nativeName: 'Bahasa Melayu', flag: '🇲🇾', speechCode: 'ms-MY' },
  { code: 'tl', name: 'Filipino', nativeName: 'Tagalog', flag: '🇵🇭', speechCode: 'fil-PH' },
  { code: 'he', name: 'Hebräisch', nativeName: 'עברית', flag: '🇮🇱', speechCode: 'he-IL' },
  { code: 'ka', name: 'Georgisch', nativeName: 'ქართული', flag: '🇬🇪', speechCode: 'ka-GE' },
]

/** RTL language codes */
export const RTL_LANGUAGES = new Set(['ar', 'fa', 'ps', 'ku', 'ur', 'he'])

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(l => l.code === code)
}
