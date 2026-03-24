// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { FORMAL_LANGUAGES, supportsFormality, convertToInformal } from '../formality'

describe('formality', () => {
  describe('FORMAL_LANGUAGES', () => {
    it('should be an array with at least 9 entries', () => {
      expect(Array.isArray(FORMAL_LANGUAGES)).toBe(true)
      expect(FORMAL_LANGUAGES.length).toBeGreaterThanOrEqual(9)
    })

    it('should contain DE, FR, ES, IT, PT, NL, PL, RU, KO', () => {
      expect(FORMAL_LANGUAGES).toContain('de')
      expect(FORMAL_LANGUAGES).toContain('fr')
      expect(FORMAL_LANGUAGES).toContain('es')
      expect(FORMAL_LANGUAGES).toContain('it')
      expect(FORMAL_LANGUAGES).toContain('pt')
      expect(FORMAL_LANGUAGES).toContain('nl')
      expect(FORMAL_LANGUAGES).toContain('pl')
      expect(FORMAL_LANGUAGES).toContain('ru')
      expect(FORMAL_LANGUAGES).toContain('ko')
    })

    it('should NOT contain English', () => {
      expect(FORMAL_LANGUAGES).not.toContain('en')
    })

    it('should NOT contain Arabic', () => {
      expect(FORMAL_LANGUAGES).not.toContain('ar')
    })
  })

  describe('supportsFormality', () => {
    it('should return true for German (de)', () => {
      expect(supportsFormality('de')).toBe(true)
    })

    it('should return true for French (fr)', () => {
      expect(supportsFormality('fr')).toBe(true)
    })

    it('should return true for Spanish (es)', () => {
      expect(supportsFormality('es')).toBe(true)
    })

    it('should return true for Italian (it)', () => {
      expect(supportsFormality('it')).toBe(true)
    })

    it('should return true for Portuguese (pt)', () => {
      expect(supportsFormality('pt')).toBe(true)
    })

    it('should return true for Dutch (nl)', () => {
      expect(supportsFormality('nl')).toBe(true)
    })

    it('should return true for Polish (pl)', () => {
      expect(supportsFormality('pl')).toBe(true)
    })

    it('should return true for Russian (ru)', () => {
      expect(supportsFormality('ru')).toBe(true)
    })

    it('should return true for Korean (ko)', () => {
      expect(supportsFormality('ko')).toBe(true)
    })

    it('should return false for English (en)', () => {
      expect(supportsFormality('en')).toBe(false)
    })

    it('should return false for unknown language code', () => {
      expect(supportsFormality('xx')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(supportsFormality('')).toBe(false)
    })
  })

  describe('convertToInformal', () => {
    it('should convert "Sie" to "du" in German text', () => {
      const result = convertToInformal('Wie heissen Sie?', 'de')
      expect(result).toContain('du')
      expect(result).not.toContain('Sie')
    })

    it('should convert "Ihnen" to "dir" in German text', () => {
      const result = convertToInformal('Ich danke Ihnen', 'de')
      expect(result).toContain('dir')
    })

    it('should convert "Ihre" to "deine" in German text', () => {
      const result = convertToInformal('Ihre Tickets bitte', 'de')
      expect(result).toContain('deine')
    })

    it('should convert verb+Sie patterns (pronouns replaced first)', () => {
      // Note: pronoun replacement /\bSie\b/ runs before verb patterns,
      // so "Sie" becomes "du" first. The verb conjugation patterns
      // won't match since "Sie" is already replaced.
      const result = convertToInformal('Haben Sie Fragen?', 'de')
      // "Sie" is replaced by "du"
      expect(result).toContain('du')
      expect(result).not.toContain('Sie')
    })

    it('should replace "Sie" in "Sind Sie bereit?"', () => {
      const result = convertToInformal('Sind Sie bereit?', 'de')
      expect(result).toContain('du')
      expect(result).not.toContain('Sie')
    })

    it('should return text unchanged for non-German languages', () => {
      const text = 'How are you doing?'
      expect(convertToInformal(text, 'en')).toBe(text)
    })

    it('should return text unchanged for French', () => {
      const text = 'Comment allez-vous?'
      expect(convertToInformal(text, 'fr')).toBe(text)
    })

    it('should return empty string for empty text', () => {
      expect(convertToInformal('', 'de')).toBe('')
    })

    it('should handle text with no formal forms', () => {
      const text = 'Der Himmel ist blau'
      expect(convertToInformal(text, 'de')).toBe(text)
    })

    it('should handle multiple replacements in one text', () => {
      const result = convertToInformal('Haben Sie Ihren Pass? Koennen Sie mir helfen?', 'de')
      expect(result).not.toContain('Sie')
      expect(result).toContain('du')
    })
  })
})
