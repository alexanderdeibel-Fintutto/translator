// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { canRomanize, romanize } from '../romanize'

describe('romanize', () => {
  describe('canRomanize', () => {
    it('should return true for Arabic (ar)', () => {
      expect(canRomanize('ar')).toBe(true)
    })

    it('should return true for Persian (fa)', () => {
      expect(canRomanize('fa')).toBe(true)
    })

    it('should return true for Russian (ru)', () => {
      expect(canRomanize('ru')).toBe(true)
    })

    it('should return true for Ukrainian (uk)', () => {
      expect(canRomanize('uk')).toBe(true)
    })

    it('should return true for Greek (el)', () => {
      expect(canRomanize('el')).toBe(true)
    })

    it('should return true for Hindi (hi)', () => {
      expect(canRomanize('hi')).toBe(true)
    })

    it('should return true for Bengali (bn)', () => {
      expect(canRomanize('bn')).toBe(true)
    })

    it('should return true for Bulgarian (bg)', () => {
      expect(canRomanize('bg')).toBe(true)
    })

    it('should return true for Serbian (sr)', () => {
      expect(canRomanize('sr')).toBe(true)
    })

    it('should return true for Chinese (zh)', () => {
      expect(canRomanize('zh')).toBe(true)
    })

    it('should return true for Japanese (ja)', () => {
      expect(canRomanize('ja')).toBe(true)
    })

    it('should return true for Korean (ko)', () => {
      expect(canRomanize('ko')).toBe(true)
    })

    it('should return true for Hebrew (he)', () => {
      expect(canRomanize('he')).toBe(true)
    })

    it('should return false for English (en)', () => {
      expect(canRomanize('en')).toBe(false)
    })

    it('should return false for German (de)', () => {
      expect(canRomanize('de')).toBe(false)
    })

    it('should return false for French (fr)', () => {
      expect(canRomanize('fr')).toBe(false)
    })

    it('should return false for Spanish (es)', () => {
      expect(canRomanize('es')).toBe(false)
    })

    it('should return false for unknown language code', () => {
      expect(canRomanize('xx')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(canRomanize('')).toBe(false)
    })
  })

  describe('romanize', () => {
    it('should return a string for Arabic text', () => {
      // Arabic: "marhaba" (hello)
      const result = romanize('\u0645\u0631\u062d\u0628\u0627', 'ar')
      expect(result).not.toBeNull()
      expect(typeof result).toBe('string')
      expect(result!.length).toBeGreaterThan(0)
    })

    it('should use Persian map for fa language code', () => {
      // Persian letter "p" (not in standard Arabic)
      const result = romanize('\u067e', 'fa')
      expect(result).not.toBeNull()
      expect(result).toContain('p')
    })

    it('should romanize Cyrillic text (Russian)', () => {
      // Russian: "privet" (hello) = \u043f\u0440\u0438\u0432\u0435\u0442
      const result = romanize('\u043f\u0440\u0438\u0432\u0435\u0442', 'ru')
      expect(result).not.toBeNull()
      expect(typeof result).toBe('string')
      expect(result!.length).toBeGreaterThan(0)
    })

    it('should romanize Greek text', () => {
      // Greek: "alpha" = \u03b1\u03bb\u03c6\u03b1
      const result = romanize('\u03b1\u03bb\u03c6\u03b1', 'el')
      expect(result).not.toBeNull()
      expect(typeof result).toBe('string')
    })

    it('should romanize Hindi (Devanagari) text', () => {
      // Hindi: "namaste" = \u0928\u092e\u0938\u094d\u0924\u0947
      const result = romanize('\u0928\u092e\u0938\u094d\u0924\u0947', 'hi')
      expect(result).not.toBeNull()
      expect(typeof result).toBe('string')
    })

    it('should return null for Latin script text', () => {
      const result = romanize('Hello world', 'en')
      expect(result).toBeNull()
    })

    it('should return null for German text', () => {
      const result = romanize('Guten Morgen', 'de')
      expect(result).toBeNull()
    })

    it('should return null for empty text', () => {
      expect(romanize('', 'ar')).toBeNull()
    })

    it('should return null for whitespace-only text', () => {
      expect(romanize('   ', 'ar')).toBeNull()
    })

    it('should return null for CJK text (complex romanization not supported)', () => {
      // Chinese characters
      const result = romanize('\u4f60\u597d', 'zh')
      expect(result).toBeNull()
    })

    it('should return null for Korean text (complex romanization not supported)', () => {
      // Korean: "annyeong"
      const result = romanize('\uc548\ub155', 'ko')
      expect(result).toBeNull()
    })

    it('should return null for Thai text (complex romanization not supported)', () => {
      // Thai: "sawasdee"
      const result = romanize('\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E35', 'th')
      expect(result).toBeNull()
    })

    it('should handle mixed text with non-Latin dominant script', () => {
      // Cyrillic dominant with some numbers
      const result = romanize('\u043f\u0440\u0438\u0432\u0435\u0442 123', 'ru')
      expect(result).not.toBeNull()
    })

    it('should work without langCode parameter', () => {
      // Arabic text without specifying langCode
      const result = romanize('\u0645\u0631\u062d\u0628\u0627')
      expect(result).not.toBeNull()
    })
  })
})
