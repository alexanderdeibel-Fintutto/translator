// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { LANGUAGES, isRTL, getLanguageByCode } from '../languages'

describe('languages', () => {
  describe('LANGUAGES array', () => {
    it('should contain exactly 45 languages', () => {
      expect(LANGUAGES).toHaveLength(45)
    })

    it('should have no duplicate language codes', () => {
      const codes = LANGUAGES.map(l => l.code)
      const unique = new Set(codes)
      expect(unique.size).toBe(codes.length)
    })

    it('all languages should have required fields: code, name, nativeName, flag', () => {
      for (const lang of LANGUAGES) {
        expect(lang.code).toBeTruthy()
        expect(typeof lang.code).toBe('string')
        expect(lang.name).toBeTruthy()
        expect(typeof lang.name).toBe('string')
        expect(lang.nativeName).toBeTruthy()
        expect(typeof lang.nativeName).toBe('string')
        expect(lang.flag).toBeTruthy()
        expect(typeof lang.flag).toBe('string')
      }
    })

    it('should contain well-known languages like de, en, fr, es', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(codes).toContain('de')
      expect(codes).toContain('en')
      expect(codes).toContain('fr')
      expect(codes).toContain('es')
      expect(codes).toContain('ar')
      expect(codes).toContain('zh')
      expect(codes).toContain('ja')
    })

    it('should include migration languages', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(codes).toContain('fa')
      expect(codes).toContain('ps')
      expect(codes).toContain('ku')
      expect(codes).toContain('ti')
      expect(codes).toContain('ur')
      expect(codes).toContain('so')
    })

    it('should include tourism languages', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(codes).toContain('hr')
      expect(codes).toContain('bg')
      expect(codes).toContain('th')
      expect(codes).toContain('vi')
      expect(codes).toContain('fil')
      expect(codes).toContain('he')
      expect(codes).toContain('ka')
    })

    it('speechCode should be a string when present', () => {
      for (const lang of LANGUAGES) {
        if (lang.speechCode !== undefined) {
          expect(typeof lang.speechCode).toBe('string')
          expect(lang.speechCode.length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('isRTL', () => {
    it('should return true for Arabic (ar)', () => {
      expect(isRTL('ar')).toBe(true)
    })

    it('should return true for Farsi (fa)', () => {
      expect(isRTL('fa')).toBe(true)
    })

    it('should return true for Hebrew (he)', () => {
      expect(isRTL('he')).toBe(true)
    })

    it('should return true for Urdu (ur)', () => {
      expect(isRTL('ur')).toBe(true)
    })

    it('should return true for Pashto (ps)', () => {
      expect(isRTL('ps')).toBe(true)
    })

    it('should return true for Kurdish (ku)', () => {
      expect(isRTL('ku')).toBe(true)
    })

    it('should return false for English (en)', () => {
      expect(isRTL('en')).toBe(false)
    })

    it('should return false for German (de)', () => {
      expect(isRTL('de')).toBe(false)
    })

    it('should return false for Chinese (zh)', () => {
      expect(isRTL('zh')).toBe(false)
    })

    it('should return false for unknown code', () => {
      expect(isRTL('xx')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isRTL('')).toBe(false)
    })
  })

  describe('getLanguageByCode', () => {
    it('should return the correct language object for de', () => {
      const lang = getLanguageByCode('de')
      expect(lang).toBeDefined()
      expect(lang!.code).toBe('de')
      expect(lang!.name).toBe('Deutsch')
      expect(lang!.nativeName).toBe('Deutsch')
    })

    it('should return the correct language object for en', () => {
      const lang = getLanguageByCode('en')
      expect(lang).toBeDefined()
      expect(lang!.code).toBe('en')
      expect(lang!.nativeName).toBe('English')
    })

    it('should return the correct language object for ar (RTL)', () => {
      const lang = getLanguageByCode('ar')
      expect(lang).toBeDefined()
      expect(lang!.rtl).toBe(true)
    })

    it('should return undefined for unknown language code', () => {
      expect(getLanguageByCode('xx')).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      expect(getLanguageByCode('')).toBeUndefined()
    })

    it('should find every language in the LANGUAGES array', () => {
      for (const lang of LANGUAGES) {
        const found = getLanguageByCode(lang.code)
        expect(found).toBeDefined()
        expect(found!.code).toBe(lang.code)
      }
    })
  })
})
