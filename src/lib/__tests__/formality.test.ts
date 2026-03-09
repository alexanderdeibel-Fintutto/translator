import { describe, it, expect } from 'vitest'
import { FORMAL_LANGUAGES, supportsFormality, convertToInformal } from '../formality'

describe('supportsFormality', () => {
  it('returns true for languages with formal/informal distinction', () => {
    expect(supportsFormality('de')).toBe(true)
    expect(supportsFormality('fr')).toBe(true)
    expect(supportsFormality('es')).toBe(true)
    expect(supportsFormality('ko')).toBe(true)
  })

  it('returns false for English and other languages', () => {
    expect(supportsFormality('en')).toBe(false)
    expect(supportsFormality('zh')).toBe(false)
    expect(supportsFormality('ja')).toBe(false)
  })

  it('FORMAL_LANGUAGES contains expected languages', () => {
    expect(FORMAL_LANGUAGES).toContain('de')
    expect(FORMAL_LANGUAGES).toContain('fr')
    expect(FORMAL_LANGUAGES.length).toBeGreaterThanOrEqual(5)
  })
})

describe('convertToInformal', () => {
  it('converts Sie to du', () => {
    expect(convertToInformal('Wie heißen Sie?', 'de')).toContain('du')
  })

  it('converts Ihnen to dir', () => {
    expect(convertToInformal('Ich gebe Ihnen das Buch.', 'de')).toContain('dir')
  })

  it('converts Ihre to deine', () => {
    expect(convertToInformal('Wo ist Ihre Tasche?', 'de')).toContain('deine')
  })

  it('converts verb + Sie patterns', () => {
    // The verb+Sie patterns are case-insensitive and applied alongside pronoun replacement
    const result = convertToInformal('Wie gehen Sie nach Hause?', 'de')
    // Either verb pattern matches or pronoun replacement happens
    expect(result).toContain('du')
    expect(result).not.toMatch(/\bSie\b/)
  })

  it('does nothing for non-German', () => {
    const text = 'How are you?'
    expect(convertToInformal(text, 'en')).toBe(text)
    expect(convertToInformal(text, 'fr')).toBe(text)
  })

  it('handles multiple conversions in one sentence', () => {
    const result = convertToInformal('Können Sie mir Ihren Namen sagen?', 'de')
    expect(result).toContain('du')
    expect(result).not.toContain('Sie')
  })
})
