// Sie/Du formality conversion for German translations
// When target language is German and user selects "Du" mode,
// convert formal "Sie" forms to informal "du" forms.

export type Formality = 'formal' | 'informal'

// Languages that distinguish formal/informal address
export const FORMALITY_LANGUAGES = new Set(['de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ru', 'ko'])

export function supportsFormality(langCode: string): boolean {
  return FORMALITY_LANGUAGES.has(langCode)
}

/**
 * Convert formal German "Sie" to informal "du" in translated text.
 * Uses pattern-based replacement (handles most common cases).
 */
export function applyInformalGerman(text: string): string {
  let result = text

  // Pronoun replacements (case-sensitive, word-boundary aware)
  const replacements: [RegExp, string][] = [
    // "Sie" as subject → "du" (only mid-sentence, not at start of sentence)
    [/(?<=\s)Sie(?=\s)/g, 'du'],
    // "Sie" at start of sentence after punctuation
    [/(?<=[.!?]\s)Sie(?=\s)/g, 'Du'],
    // "Ihnen" → "dir"
    [/\bIhnen\b/g, 'dir'],
    // "Ihrem" → "deinem"
    [/\bIhrem\b/g, 'deinem'],
    // "Ihrer" → "deiner"
    [/\bIhrer\b/g, 'deiner'],
    // "Ihren" → "deinen"
    [/\bIhren\b/g, 'deinen'],
    // "Ihre" → "deine" (before noun)
    [/\bIhre\b/g, 'deine'],
    // "Ihr" → "dein" (possessive)
    [/\bIhr\b(?!\s+Guide)/g, 'dein'],
    // Verb conjugations: common patterns
    // "haben Sie" → "hast du"
    [/\bhaben\s+(?:Sie|du)\b/gi, 'hast du'],
    // "sind Sie" → "bist du"
    [/\bsind\s+(?:Sie|du)\b/gi, 'bist du'],
    // "können Sie" → "kannst du"
    [/\bkönnen\s+(?:Sie|du)\b/gi, 'kannst du'],
    // "möchten Sie" → "möchtest du"
    [/\bmöchten\s+(?:Sie|du)\b/gi, 'möchtest du'],
    // "wollen Sie" → "willst du"
    [/\bwollen\s+(?:Sie|du)\b/gi, 'willst du'],
    // "müssen Sie" → "musst du"
    [/\bmüssen\s+(?:Sie|du)\b/gi, 'musst du'],
    // "sprechen Sie" → "sprichst du"
    [/\bsprechen\s+(?:Sie|du)\b/gi, 'sprichst du'],
    // "brauchen Sie" → "brauchst du"
    [/\bbrauchen\s+(?:Sie|du)\b/gi, 'brauchst du'],
  ]

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }

  // Handle "Sie" at the very start of the text
  if (result.startsWith('Sie ')) {
    result = 'Du ' + result.slice(4)
  }

  return result
}

/**
 * Apply informality to the translation if applicable.
 * Currently supports German; can be extended for other languages.
 */
export function applyFormality(
  text: string,
  targetLang: string,
  formality: Formality,
): string {
  if (formality === 'formal') return text
  if (targetLang === 'de') return applyInformalGerman(text)
  // For other languages: return unchanged (can be extended)
  return text
}
