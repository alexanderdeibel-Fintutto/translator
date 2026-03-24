// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  detectListenerLocale,
  getListenerStrings,
  isListenerRTL,
} from '../listener-i18n'
import type { ListenerLocale, ListenerStrings } from '../listener-i18n'

const ALL_LOCALES: ListenerLocale[] = ['en', 'de', 'ar', 'tr', 'uk', 'fr', 'es', 'ru', 'fa', 'zh']
const REQUIRED_KEYS: (keyof ListenerStrings)[] = ['enterCode', 'join', 'noAccount', 'chooseLanguage', 'tagline']

describe('listener-i18n', () => {
  describe('getListenerStrings', () => {
    it('should return strings for all 10 locales', () => {
      for (const locale of ALL_LOCALES) {
        const strings = getListenerStrings(locale)
        expect(strings).toBeDefined()
        expect(typeof strings).toBe('object')
      }
    })

    it('each locale should have all 5 required keys', () => {
      for (const locale of ALL_LOCALES) {
        const strings = getListenerStrings(locale)
        for (const key of REQUIRED_KEYS) {
          expect(typeof strings[key]).toBe('string')
          expect(strings[key].length).toBeGreaterThan(0)
        }
      }
    })

    it('should return English strings for en locale', () => {
      const strings = getListenerStrings('en')
      expect(strings.join).toBe('Join')
    })

    it('should return German strings for de locale', () => {
      const strings = getListenerStrings('de')
      expect(strings.join).toBe('Beitreten')
    })

    it('should return strings even for unknown locale (fallback to en)', () => {
      // Cast to test fallback behavior
      const strings = getListenerStrings('xx' as ListenerLocale)
      expect(strings).toBeDefined()
      expect(strings.join).toBe('Join')
    })

    it('should return different strings for different locales', () => {
      const en = getListenerStrings('en')
      const de = getListenerStrings('de')
      expect(en.join).not.toBe(de.join)
    })
  })

  describe('isListenerRTL', () => {
    it('should return true for Arabic (ar)', () => {
      expect(isListenerRTL('ar')).toBe(true)
    })

    it('should return true for Persian (fa)', () => {
      expect(isListenerRTL('fa')).toBe(true)
    })

    it('should return false for English (en)', () => {
      expect(isListenerRTL('en')).toBe(false)
    })

    it('should return false for German (de)', () => {
      expect(isListenerRTL('de')).toBe(false)
    })

    it('should return false for Turkish (tr)', () => {
      expect(isListenerRTL('tr')).toBe(false)
    })

    it('should return false for Ukrainian (uk)', () => {
      expect(isListenerRTL('uk')).toBe(false)
    })

    it('should return false for French (fr)', () => {
      expect(isListenerRTL('fr')).toBe(false)
    })

    it('should return false for Spanish (es)', () => {
      expect(isListenerRTL('es')).toBe(false)
    })

    it('should return false for Russian (ru)', () => {
      expect(isListenerRTL('ru')).toBe(false)
    })

    it('should return false for Chinese (zh)', () => {
      expect(isListenerRTL('zh')).toBe(false)
    })
  })

  describe('detectListenerLocale', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should return a valid locale', () => {
      const locale = detectListenerLocale()
      expect(ALL_LOCALES).toContain(locale)
    })

    it('should return en when navigator.language is en-US', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
      expect(detectListenerLocale()).toBe('en')
    })

    it('should return de when navigator.language is de-DE', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE')
      expect(detectListenerLocale()).toBe('de')
    })

    it('should return ar when navigator.language is ar-SA', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('ar-SA')
      expect(detectListenerLocale()).toBe('ar')
    })

    it('should return fr when navigator.language is fr-FR', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR')
      expect(detectListenerLocale()).toBe('fr')
    })

    it('should return en for unsupported browser language', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('ja-JP')
      expect(detectListenerLocale()).toBe('en')
    })

    it('should return en when navigator.language is empty', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('')
      expect(detectListenerLocale()).toBe('en')
    })

    it('should handle locale without region (e.g. "de")', () => {
      vi.spyOn(navigator, 'language', 'get').mockReturnValue('de')
      expect(detectListenerLocale()).toBe('de')
    })
  })
})
