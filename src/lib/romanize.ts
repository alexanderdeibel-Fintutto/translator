// Client-side romanization / transliteration for non-Latin scripts
// Provides approximate phonetic pronunciation guides

// Arabic letter → rough Latin phonetic
const ARABIC_MAP: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'ḥ', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ع': 'ʿ',
  'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ئ': 'y', 'ؤ': 'w',
  'ء': "'",
  // Diacritics
  'َ': 'a', 'ِ': 'i', 'ُ': 'u', 'ً': 'an', 'ٍ': 'in', 'ٌ': 'un',
  'ّ': '', 'ْ': '', 'ـ': '',
}

// Persian additions
const PERSIAN_MAP: Record<string, string> = {
  ...ARABIC_MAP,
  'پ': 'p', 'چ': 'ch', 'ژ': 'zh', 'گ': 'g', 'ک': 'k', 'ی': 'i',
}

// Cyrillic → Latin (Russian-based)
const CYRILLIC_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'ye', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  // Ukrainian extras
  'є': 'ye', 'і': 'i', 'ї': 'yi', 'ґ': 'g',
}

// Greek → Latin
const GREEK_MAP: Record<string, string> = {
  'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i',
  'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x',
  'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y',
  'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
}

// Hindi Devanagari → Latin (simplified)
const DEVANAGARI_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah',
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'na',
  'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
  'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
  'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
  'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha',
  'ष': 'sha', 'स': 'sa', 'ह': 'ha',
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  '्': '', 'ं': 'n', 'ः': 'h', '़': '',
}

// CJK and other complex scripts — we show a "no romanization available" message
// rather than attempting incorrect transliteration

function applyMap(text: string, map: Record<string, string>): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    // Check for 2-char combos first (e.g. Devanagari vowels)
    const twoChar = text.slice(i, i + 2)
    if (map[twoChar]) {
      result += map[twoChar]
      i++ // Skip next char
      continue
    }
    const lower = text[i].toLowerCase()
    const upper = text[i]
    if (map[lower]) {
      // Preserve capitalization
      const mapped = map[lower]
      result += upper !== lower ? mapped.charAt(0).toUpperCase() + mapped.slice(1) : mapped
    } else {
      result += text[i]
    }
  }
  return result
}

/** Detect the dominant script in text */
function detectScript(text: string): 'arabic' | 'persian' | 'cyrillic' | 'greek' | 'devanagari' | 'cjk' | 'thai' | 'korean' | 'latin' | 'unknown' {
  let arabic = 0, cyrillic = 0, greek = 0, devanagari = 0, cjk = 0, thai = 0, korean = 0, latin = 0
  for (const char of text) {
    const code = char.codePointAt(0)!
    if (code >= 0x0600 && code <= 0x06FF) arabic++
    else if (code >= 0xFB50 && code <= 0xFDFF) arabic++ // Arabic Presentation Forms
    else if (code >= 0x0400 && code <= 0x04FF) cyrillic++
    else if (code >= 0x0370 && code <= 0x03FF) greek++
    else if (code >= 0x0900 && code <= 0x097F) devanagari++
    else if ((code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3040 && code <= 0x30FF)) cjk++
    else if (code >= 0x0E00 && code <= 0x0E7F) thai++
    else if (code >= 0xAC00 && code <= 0xD7AF) korean++
    else if (code >= 0x0041 && code <= 0x024F) latin++
  }
  const max = Math.max(arabic, cyrillic, greek, devanagari, cjk, thai, korean, latin)
  if (max === 0) return 'unknown'
  if (latin === max) return 'latin'
  if (arabic === max) return 'arabic'
  if (cyrillic === max) return 'cyrillic'
  if (greek === max) return 'greek'
  if (devanagari === max) return 'devanagari'
  if (cjk === max) return 'cjk'
  if (thai === max) return 'thai'
  if (korean === max) return 'korean'
  return 'unknown'
}

/**
 * Languages whose scripts are non-Latin and support romanization
 */
const ROMANIZABLE_LANGS = new Set([
  'ar', 'fa', 'ps', 'ur',  // Arabic script
  'ru', 'uk', 'bg', 'sr',  // Cyrillic
  'el',                      // Greek
  'hi', 'bn',               // Devanagari
  'zh', 'ja', 'ko', 'th',  // CJK/Thai (limited)
  'he', 'ka', 'ti', 'am',  // Other non-Latin
])

/** Check if a language benefits from romanization */
export function canRomanize(langCode: string): boolean {
  return ROMANIZABLE_LANGS.has(langCode)
}

/** Romanize text based on detected or specified script */
export function romanize(text: string, langCode?: string): string | null {
  if (!text.trim()) return null

  const script = detectScript(text)

  // Already Latin script — no romanization needed
  if (script === 'latin') return null

  switch (script) {
    case 'arabic':
      return applyMap(text, langCode === 'fa' || langCode === 'ps' ? PERSIAN_MAP : ARABIC_MAP)
    case 'cyrillic':
      return applyMap(text, CYRILLIC_MAP)
    case 'greek':
      return applyMap(text, GREEK_MAP)
    case 'devanagari':
      return applyMap(text, DEVANAGARI_MAP)
    case 'cjk':
    case 'thai':
    case 'korean':
      // These require more complex romanization (pinyin, romaji, etc.)
      // Return null — the UI can show a hint that romanization isn't available
      return null
    default:
      return null
  }
}
