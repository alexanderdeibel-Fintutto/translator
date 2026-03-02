// Sie/Du conversion for German translations
// Converts formal (Sie) to informal (du) addressing

// Languages that support formal/informal distinction
export const FORMAL_LANGUAGES = ['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ko']

export function supportsFormality(langCode: string): boolean {
  return FORMAL_LANGUAGES.includes(langCode)
}

// German Sie → du conversion rules
const DE_REPLACEMENTS: [RegExp, string][] = [
  // Pronouns (case-sensitive patterns)
  [/\bSie\b/g, 'du'],
  [/\bIhnen\b/g, 'dir'],
  [/\bIhre\b/g, 'deine'],
  [/\bIhrem\b/g, 'deinem'],
  [/\bIhren\b/g, 'deinen'],
  [/\bIhrer\b/g, 'deiner'],
  [/\bIhr\b/g, 'dein'],

  // Common verb conjugations (Sie form → du form)
  [/\bhaben Sie\b/gi, 'hast du'],
  [/\bsind Sie\b/gi, 'bist du'],
  [/\bwerden Sie\b/gi, 'wirst du'],
  [/\bkoennen Sie\b/gi, 'kannst du'],
  [/\bk\u00f6nnen Sie\b/gi, 'kannst du'],
  [/\bmoechten Sie\b/gi, 'm\u00f6chtest du'],
  [/\bm\u00f6chten Sie\b/gi, 'm\u00f6chtest du'],
  [/\bmuessen Sie\b/gi, 'musst du'],
  [/\bm\u00fcssen Sie\b/gi, 'musst du'],
  [/\bwollen Sie\b/gi, 'willst du'],
  [/\bsollen Sie\b/gi, 'sollst du'],
  [/\bduerfen Sie\b/gi, 'darfst du'],
  [/\bd\u00fcrfen Sie\b/gi, 'darfst du'],
  [/\bwissen Sie\b/gi, 'wei\u00dft du'],
  [/\bsprechen Sie\b/gi, 'sprichst du'],
  [/\bbrauchen Sie\b/gi, 'brauchst du'],
  [/\bgehen Sie\b/gi, 'gehst du'],
  [/\bkommen Sie\b/gi, 'kommst du'],
  [/\bnehmen Sie\b/gi, 'nimmst du'],
  [/\bgeben Sie\b/gi, 'gibst du'],
  [/\bsehen Sie\b/gi, 'siehst du'],
  [/\bfinden Sie\b/gi, 'findest du'],
  [/\bverstehen Sie\b/gi, 'verstehst du'],
]

export function convertToInformal(text: string, targetLang: string): string {
  if (targetLang !== 'de') return text

  let result = text
  for (const [pattern, replacement] of DE_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }
  return result
}
