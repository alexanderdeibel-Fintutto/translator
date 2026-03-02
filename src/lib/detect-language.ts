// Lightweight client-side language detection using Unicode script analysis + common word matching
// No API call needed — works fully offline

const SCRIPT_PATTERNS: [RegExp, string[]][] = [
  [/[\u0600-\u06FF\u0750-\u077F]/, ['ar', 'fa', 'ur']],       // Arabic script
  [/[\u0400-\u04FF]/, ['ru', 'uk', 'bg', 'sr']],               // Cyrillic
  [/[\u4E00-\u9FFF]/, ['zh']],                                   // CJK
  [/[\u3040-\u309F\u30A0-\u30FF]/, ['ja']],                      // Japanese
  [/[\uAC00-\uD7AF]/, ['ko']],                                   // Korean
  [/[\u0900-\u097F]/, ['hi']],                                    // Devanagari
  [/[\u0980-\u09FF]/, ['bn']],                                    // Bengali
  [/[\u0E00-\u0E7F]/, ['th']],                                    // Thai
  [/[\u10A0-\u10FF]/, ['ka']],                                    // Georgian
  [/[\u0590-\u05FF]/, ['he']],                                    // Hebrew
  [/[\u1200-\u137F]/, ['am', 'ti']],                              // Ethiopic
]

// Top frequent words per language (Latin script languages)
const WORD_SIGNATURES: Record<string, string[]> = {
  de: ['und', 'der', 'die', 'das', 'ist', 'ich', 'nicht', 'ein', 'es', 'mit', 'den', 'auf', 'sich', 'von', 'für', 'werden', 'auch', 'haben', 'dass', 'wir'],
  en: ['the', 'and', 'is', 'are', 'was', 'for', 'that', 'this', 'with', 'not', 'have', 'from', 'they', 'been', 'would', 'which', 'their', 'will', 'but', 'your'],
  fr: ['les', 'des', 'est', 'une', 'que', 'dans', 'pas', 'pour', 'qui', 'sur', 'avec', 'sont', 'nous', 'mais', 'ont', 'cette', 'tout', 'elle', 'comme', 'plus'],
  es: ['los', 'las', 'del', 'una', 'por', 'que', 'con', 'para', 'está', 'son', 'pero', 'como', 'más', 'todo', 'tiene', 'entre', 'desde', 'también', 'este', 'sus'],
  it: ['che', 'non', 'per', 'una', 'con', 'sono', 'del', 'della', 'questo', 'anche', 'più', 'come', 'dal', 'alla', 'delle', 'nel', 'suo', 'hanno', 'tra', 'tutto'],
  pt: ['que', 'não', 'com', 'uma', 'para', 'por', 'dos', 'das', 'mais', 'como', 'tem', 'seu', 'sua', 'são', 'nos', 'também', 'foi', 'pode', 'esta', 'muito'],
  nl: ['het', 'een', 'van', 'dat', 'zijn', 'voor', 'met', 'niet', 'ook', 'maar', 'nog', 'wordt', 'aan', 'door', 'bij', 'naar', 'wel', 'kan', 'hun', 'heeft'],
  pl: ['nie', 'się', 'jest', 'że', 'jak', 'ale', 'tak', 'już', 'był', 'przez', 'jego', 'ich', 'tylko', 'może', 'jeszcze', 'bardzo', 'tego', 'będzie', 'tym', 'tutaj'],
  tr: ['bir', 've', 'bu', 'için', 'ile', 'olan', 'çok', 'var', 'daha', 'gibi', 'olarak', 'kadar', 'ama', 'ancak', 'sonra', 'benim', 'onun', 'nasıl', 'neden', 'şey'],
  sv: ['och', 'att', 'det', 'som', 'för', 'inte', 'med', 'den', 'har', 'var', 'till', 'kan', 'från', 'alla', 'men', 'ett', 'hon', 'hade', 'ska', 'vid'],
  da: ['og', 'det', 'som', 'har', 'til', 'med', 'ikke', 'den', 'var', 'kan', 'fra', 'men', 'eller', 'efter', 'ved', 'også', 'hun', 'skal', 'alle', 'blev'],
  no: ['og', 'det', 'som', 'har', 'til', 'med', 'ikke', 'den', 'var', 'kan', 'fra', 'men', 'eller', 'etter', 'ved', 'også', 'hun', 'skal', 'alle', 'ble'],
  cs: ['že', 'jako', 'byl', 'ale', 'jen', 'tak', 'nebo', 'pro', 'jeho', 'jsou', 'také', 'bylo', 'jsem', 'velmi', 'může', 'všech', 'jejich', 'ještě', 'když', 'než'],
  ro: ['și', 'este', 'care', 'din', 'pentru', 'sunt', 'mai', 'sau', 'fost', 'acest', 'avea', 'poate', 'prin', 'între', 'asupra', 'toate', 'doar', 'timp', 'unor', 'dacă'],
  hu: ['egy', 'nem', 'hogy', 'van', 'meg', 'már', 'mint', 'csak', 'volt', 'még', 'igen', 'lesz', 'vagy', 'kell', 'után', 'ami', 'mert', 'sem', 'ezek', 'minden'],
  hr: ['nije', 'sam', 'ali', 'kao', 'što', 'ima', 'samo', 'može', 'sve', 'još', 'bilo', 'bio', 'koji', 'koja', 'koje', 'biti', 'prije', 'između', 'nakon', 'prema'],
  fi: ['oli', 'että', 'hän', 'mutta', 'niin', 'myös', 'kuin', 'ole', 'ovat', 'kun', 'vain', 'tämä', 'nyt', 'enää', 'sitten', 'olla', 'sekä', 'yli', 'mukaan', 'joka'],
  id: ['yang', 'dan', 'ini', 'itu', 'dengan', 'untuk', 'dari', 'tidak', 'ada', 'dalam', 'akan', 'telah', 'oleh', 'juga', 'mereka', 'kami', 'dapat', 'lebih', 'sudah', 'bisa'],
  vi: ['của', 'và', 'các', 'trong', 'cho', 'được', 'một', 'có', 'này', 'với', 'không', 'đã', 'những', 'người', 'như', 'tại', 'theo', 'cũng', 'rất', 'đến'],
}

export interface DetectionResult {
  language: string
  confidence: number
}

export function detectLanguage(text: string): DetectionResult | null {
  if (!text || text.trim().length < 3) return null

  const trimmed = text.trim()

  // 1. Script-based detection (non-Latin scripts)
  for (const [pattern, langs] of SCRIPT_PATTERNS) {
    const matches = trimmed.match(new RegExp(pattern.source, 'g'))
    if (matches && matches.length >= 2) {
      return { language: langs[0], confidence: 0.9 }
    }
  }

  // 2. Word-frequency-based detection (Latin scripts)
  const words = trimmed.toLowerCase().split(/\s+/)
  if (words.length < 2) return null

  const scores: Record<string, number> = {}
  const wordSet = new Set(words)

  for (const [lang, signatures] of Object.entries(WORD_SIGNATURES)) {
    let hits = 0
    for (const sig of signatures) {
      if (wordSet.has(sig)) hits++
    }
    if (hits > 0) {
      scores[lang] = hits / Math.min(words.length, 10)
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return null

  const [bestLang, bestScore] = sorted[0]
  if (bestScore < 0.1) return null

  // Require some margin over second-best to be confident
  const secondScore = sorted.length > 1 ? sorted[1][1] : 0
  const confidence = Math.min(bestScore, 1) * (secondScore > 0 ? Math.min((bestScore - secondScore) / bestScore + 0.5, 1) : 1)

  return { language: bestLang, confidence: Math.min(confidence, 0.95) }
}
