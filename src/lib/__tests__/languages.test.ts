import { describe, it, expect } from 'vitest'
import { LANGUAGES, isRTL, getLanguageByCode } from '../languages'

describe('LANGUAGES', () => {
  it('has at least 40 languages', () => {
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(40)
  })

  it('every language has required properties', () => {
    for (const lang of LANGUAGES) {
      expect(lang.code).toBeTruthy()
      expect(lang.name).toBeTruthy()
      expect(lang.nativeName).toBeTruthy()
      expect(lang.flag).toBeTruthy()
    }
  })

  it('has no duplicate codes', () => {
    const codes = LANGUAGES.map(l => l.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('includes German and English', () => {
    expect(LANGUAGES.find(l => l.code === 'de')).toBeDefined()
    expect(LANGUAGES.find(l => l.code === 'en')).toBeDefined()
  })

  it('includes migration languages', () => {
    const codes = LANGUAGES.map(l => l.code)
    expect(codes).toContain('fa') // Farsi
    expect(codes).toContain('ar') // Arabic
    expect(codes).toContain('ur') // Urdu
    expect(codes).toContain('ti') // Tigrinya
  })

  it('RTL languages have rtl: true', () => {
    const arabic = LANGUAGES.find(l => l.code === 'ar')
    expect(arabic?.rtl).toBe(true)
    const farsi = LANGUAGES.find(l => l.code === 'fa')
    expect(farsi?.rtl).toBe(true)
    const hebrew = LANGUAGES.find(l => l.code === 'he')
    expect(hebrew?.rtl).toBe(true)
  })

  it('LTR languages do not have rtl: true', () => {
    const german = LANGUAGES.find(l => l.code === 'de')
    expect(german?.rtl).toBeUndefined()
    const english = LANGUAGES.find(l => l.code === 'en')
    expect(english?.rtl).toBeUndefined()
  })
})

describe('isRTL', () => {
  it('returns true for RTL languages', () => {
    expect(isRTL('ar')).toBe(true)
    expect(isRTL('fa')).toBe(true)
    expect(isRTL('he')).toBe(true)
    expect(isRTL('ur')).toBe(true)
    expect(isRTL('ps')).toBe(true)
    expect(isRTL('ku')).toBe(true)
  })

  it('returns false for LTR languages', () => {
    expect(isRTL('de')).toBe(false)
    expect(isRTL('en')).toBe(false)
    expect(isRTL('fr')).toBe(false)
    expect(isRTL('zh')).toBe(false)
  })
})

describe('getLanguageByCode', () => {
  it('returns language for valid code', () => {
    const lang = getLanguageByCode('de')
    expect(lang).toBeDefined()
    expect(lang!.name).toBe('Deutsch')
  })

  it('returns undefined for unknown code', () => {
    expect(getLanguageByCode('xx')).toBeUndefined()
  })
})
