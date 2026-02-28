export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  speechCode?: string
  rtl?: boolean
}

// RTL languages: ar, fa, ps, ku, ur, he
export const RTL_LANGUAGES = ['ar', 'fa', 'ps', 'ku', 'ur', 'he']

export function isRTL(code: string): boolean {
  return RTL_LANGUAGES.includes(code)
}

export const LANGUAGES: Language[] = [
  // --- Existing 22 ---
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '\uD83C\uDDE9\uD83C\uDDEA', speechCode: 'de-DE' },
  { code: 'en', name: 'Englisch', nativeName: 'English', flag: '\uD83C\uDDEC\uD83C\uDDE7', speechCode: 'en-US' },
  { code: 'fr', name: 'Franz\u00f6sisch', nativeName: 'Fran\u00e7ais', flag: '\uD83C\uDDEB\uD83C\uDDF7', speechCode: 'fr-FR' },
  { code: 'es', name: 'Spanisch', nativeName: 'Espa\u00f1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8', speechCode: 'es-ES' },
  { code: 'it', name: 'Italienisch', nativeName: 'Italiano', flag: '\uD83C\uDDEE\uD83C\uDDF9', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portugiesisch', nativeName: 'Portugu\u00eas', flag: '\uD83C\uDDF5\uD83C\uDDF9', speechCode: 'pt-PT' },
  { code: 'nl', name: 'Niederl\u00e4ndisch', nativeName: 'Nederlands', flag: '\uD83C\uDDF3\uD83C\uDDF1', speechCode: 'nl-NL' },
  { code: 'pl', name: 'Polnisch', nativeName: 'Polski', flag: '\uD83C\uDDF5\uD83C\uDDF1', speechCode: 'pl-PL' },
  { code: 'tr', name: 'T\u00fcrkisch', nativeName: 'T\u00fcrk\u00e7e', flag: '\uD83C\uDDF9\uD83C\uDDF7', speechCode: 'tr-TR' },
  { code: 'ru', name: 'Russisch', nativeName: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', flag: '\uD83C\uDDF7\uD83C\uDDFA', speechCode: 'ru-RU' },
  { code: 'uk', name: 'Ukrainisch', nativeName: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430', flag: '\uD83C\uDDFA\uD83C\uDDE6', speechCode: 'uk-UA' },
  { code: 'ar', name: 'Arabisch', nativeName: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', flag: '\uD83C\uDDF8\uD83C\uDDE6', speechCode: 'ar-SA', rtl: true },
  { code: 'zh', name: 'Chinesisch', nativeName: '\u4e2d\u6587', flag: '\uD83C\uDDE8\uD83C\uDDF3', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Japanisch', nativeName: '\u65e5\u672c\u8a9e', flag: '\uD83C\uDDEF\uD83C\uDDF5', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Koreanisch', nativeName: '\ud55c\uad6d\uc5b4', flag: '\uD83C\uDDF0\uD83C\uDDF7', speechCode: 'ko-KR' },
  { code: 'hi', name: 'Hindi', nativeName: '\u0939\u093f\u0928\u094d\u0926\u0940', flag: '\uD83C\uDDEE\uD83C\uDDF3', speechCode: 'hi-IN' },
  { code: 'sv', name: 'Schwedisch', nativeName: 'Svenska', flag: '\uD83C\uDDF8\uD83C\uDDEA', speechCode: 'sv-SE' },
  { code: 'da', name: 'D\u00e4nisch', nativeName: 'Dansk', flag: '\uD83C\uDDE9\uD83C\uDDF0', speechCode: 'da-DK' },
  { code: 'cs', name: 'Tschechisch', nativeName: '\u010ce\u0161tina', flag: '\uD83C\uDDE8\uD83C\uDDFF', speechCode: 'cs-CZ' },
  { code: 'ro', name: 'Rum\u00e4nisch', nativeName: 'Rom\u00e2n\u0103', flag: '\uD83C\uDDF7\uD83C\uDDF4', speechCode: 'ro-RO' },
  { code: 'el', name: 'Griechisch', nativeName: '\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac', flag: '\uD83C\uDDEC\uD83C\uDDF7', speechCode: 'el-GR' },
  { code: 'hu', name: 'Ungarisch', nativeName: 'Magyar', flag: '\uD83C\uDDED\uD83C\uDDFA', speechCode: 'hu-HU' },

  // --- NEW: Migration languages (10) ---
  { code: 'fa', name: 'Farsi/Dari', nativeName: '\u0641\u0627\u0631\u0633\u06cc', flag: '\uD83C\uDDEE\uD83C\uDDF7', speechCode: 'fa-IR', rtl: true },
  { code: 'ps', name: 'Paschtu', nativeName: '\u067e\u069a\u062a\u0648', flag: '\uD83C\uDDE6\uD83C\uDDEB', speechCode: 'ps-AF', rtl: true },
  { code: 'ku', name: 'Kurdisch', nativeName: 'Kurd\u00ee', flag: '\uD83C\uDDEE\uD83C\uDDF6', speechCode: 'ku-TR', rtl: true },
  { code: 'ti', name: 'Tigrinya', nativeName: '\u1275\u130D\u122D\u129B', flag: '\uD83C\uDDEA\uD83C\uDDF7', speechCode: 'ti-ER' },
  { code: 'am', name: 'Amharisch', nativeName: '\u12A0\u121B\u122D\u129B', flag: '\uD83C\uDDEA\uD83C\uDDF9', speechCode: 'am-ET' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '\uD83C\uDDF8\uD83C\uDDF4', speechCode: 'so-SO' },
  { code: 'ur', name: 'Urdu', nativeName: '\u0627\u0631\u062f\u0648', flag: '\uD83C\uDDF5\uD83C\uDDF0', speechCode: 'ur-PK', rtl: true },
  { code: 'bn', name: 'Bengali', nativeName: '\u09AC\u09BE\u0982\u09B2\u09BE', flag: '\uD83C\uDDE7\uD83C\uDDE9', speechCode: 'bn-BD' },
  { code: 'sw', name: 'Suaheli', nativeName: 'Kiswahili', flag: '\uD83C\uDDF0\uD83C\uDDEA', speechCode: 'sw-KE' },
  { code: 'sq', name: 'Albanisch', nativeName: 'Shqip', flag: '\uD83C\uDDE6\uD83C\uDDF1', speechCode: 'sq-AL' },

  // --- NEW: Tourism languages (13) ---
  { code: 'hr', name: 'Kroatisch', nativeName: 'Hrvatski', flag: '\uD83C\uDDED\uD83C\uDDF7', speechCode: 'hr-HR' },
  { code: 'bg', name: 'Bulgarisch', nativeName: '\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438', flag: '\uD83C\uDDE7\uD83C\uDDEC', speechCode: 'bg-BG' },
  { code: 'sr', name: 'Serbisch', nativeName: '\u0421\u0440\u043F\u0441\u043A\u0438', flag: '\uD83C\uDDF7\uD83C\uDDF8', speechCode: 'sr-RS' },
  { code: 'sk', name: 'Slowakisch', nativeName: 'Sloven\u010dina', flag: '\uD83C\uDDF8\uD83C\uDDF0', speechCode: 'sk-SK' },
  { code: 'no', name: 'Norwegisch', nativeName: 'Norsk', flag: '\uD83C\uDDF3\uD83C\uDDF4', speechCode: 'nb-NO' },
  { code: 'fi', name: 'Finnisch', nativeName: 'Suomi', flag: '\uD83C\uDDEB\uD83C\uDDEE', speechCode: 'fi-FI' },
  { code: 'th', name: 'Thail\u00e4ndisch', nativeName: '\u0E44\u0E17\u0E22', flag: '\uD83C\uDDF9\uD83C\uDDED', speechCode: 'th-TH' },
  { code: 'vi', name: 'Vietnamesisch', nativeName: 'Ti\u1EBFng Vi\u1EC7t', flag: '\uD83C\uDDFB\uD83C\uDDF3', speechCode: 'vi-VN' },
  { code: 'id', name: 'Indonesisch', nativeName: 'Bahasa Indonesia', flag: '\uD83C\uDDEE\uD83C\uDDE9', speechCode: 'id-ID' },
  { code: 'ms', name: 'Malaiisch', nativeName: 'Bahasa Melayu', flag: '\uD83C\uDDF2\uD83C\uDDFE', speechCode: 'ms-MY' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '\uD83C\uDDF5\uD83C\uDDED', speechCode: 'fil-PH' },
  { code: 'he', name: 'Hebr\u00e4isch', nativeName: '\u05E2\u05D1\u05E8\u05D9\u05EA', flag: '\uD83C\uDDEE\uD83C\uDDF1', speechCode: 'he-IL', rtl: true },
  { code: 'ka', name: 'Georgisch', nativeName: '\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8', flag: '\uD83C\uDDEC\uD83C\uDDEA', speechCode: 'ka-GE' },
]

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(l => l.code === code)
}
