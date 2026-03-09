import { describe, it, expect } from 'vitest'
import { canRomanize, romanize } from '../romanize'

describe('canRomanize', () => {
  it('returns true for Arabic script languages', () => {
    expect(canRomanize('ar')).toBe(true)
    expect(canRomanize('fa')).toBe(true)
    expect(canRomanize('ur')).toBe(true)
  })

  it('returns true for Cyrillic languages', () => {
    expect(canRomanize('ru')).toBe(true)
    expect(canRomanize('uk')).toBe(true)
    expect(canRomanize('bg')).toBe(true)
  })

  it('returns true for Greek, Hindi, CJK', () => {
    expect(canRomanize('el')).toBe(true)
    expect(canRomanize('hi')).toBe(true)
    expect(canRomanize('zh')).toBe(true)
    expect(canRomanize('ja')).toBe(true)
    expect(canRomanize('ko')).toBe(true)
  })

  it('returns false for Latin-script languages', () => {
    expect(canRomanize('de')).toBe(false)
    expect(canRomanize('en')).toBe(false)
    expect(canRomanize('fr')).toBe(false)
  })
})

describe('romanize', () => {
  it('returns null for empty text', () => {
    expect(romanize('')).toBeNull()
    expect(romanize('   ')).toBeNull()
  })

  it('returns null for Latin text', () => {
    expect(romanize('Hello World')).toBeNull()
  })

  it('romanizes Cyrillic text', () => {
    const result = romanize('Привет мир', 'ru')
    expect(result).toBeTruthy()
    expect(result!.toLowerCase()).toContain('priv')
  })

  it('romanizes Arabic text', () => {
    const result = romanize('مرحبا', 'ar')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('uses Persian map for Farsi', () => {
    // Persian-specific letter: پ → p
    const result = romanize('پاک', 'fa')
    expect(result).toContain('p')
  })

  it('romanizes Greek text', () => {
    const result = romanize('ελληνικά', 'el')
    expect(result).toBeTruthy()
    expect(result!.toLowerCase()).toContain('ellinik')
  })

  it('romanizes Devanagari text', () => {
    const result = romanize('नमस्ते', 'hi')
    expect(result).toBeTruthy()
  })

  it('returns null for CJK (complex romanization not supported)', () => {
    expect(romanize('你好世界', 'zh')).toBeNull()
    expect(romanize('こんにちは', 'ja')).toBeNull()
  })

  it('returns null for Korean', () => {
    expect(romanize('안녕하세요', 'ko')).toBeNull()
  })

  it('returns null for Thai', () => {
    expect(romanize('สวัสดี', 'th')).toBeNull()
  })
})
