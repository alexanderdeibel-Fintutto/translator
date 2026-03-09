import { describe, it, expect } from 'vitest'
import { CONTEXT_MODES, getContextHints, getContextMode, type TranslationContext } from '../context-modes'

describe('CONTEXT_MODES', () => {
  it('has all 6 modes', () => {
    expect(CONTEXT_MODES).toHaveLength(6)
    const ids = CONTEXT_MODES.map(m => m.id)
    expect(ids).toContain('general')
    expect(ids).toContain('travel')
    expect(ids).toContain('medical')
    expect(ids).toContain('legal')
    expect(ids).toContain('business')
    expect(ids).toContain('casual')
  })

  it('every mode has icon and i18nKey', () => {
    for (const mode of CONTEXT_MODES) {
      expect(mode.icon).toBeTruthy()
      expect(mode.i18nKey).toMatch(/^context\./)
    }
  })
})

describe('getContextHints', () => {
  it('returns empty for general context', () => {
    expect(getContextHints('some text', 'de', 'general')).toEqual([])
  })

  it('returns hints when text contains glossary terms (travel)', () => {
    const hints = getContextHints('Wo ist mein Gepäck?', 'de', 'travel')
    expect(hints.length).toBeGreaterThan(0)
    expect(hints[0]).toContain('Gepäck')
  })

  it('returns hints for medical context', () => {
    const hints = getContextHints('Ich brauche ein Rezept.', 'de', 'medical')
    expect(hints.length).toBeGreaterThan(0)
    expect(hints[0]).toContain('Rezept')
  })

  it('returns hints for legal context', () => {
    const hints = getContextHints('Ich stelle einen Antrag.', 'de', 'legal')
    expect(hints.length).toBeGreaterThan(0)
    expect(hints[0]).toContain('Antrag')
  })

  it('returns hints for English text in business context', () => {
    const hints = getContextHints('What is the turnover?', 'en', 'business')
    expect(hints.length).toBeGreaterThan(0)
    expect(hints[0]).toContain('turnover')
  })

  it('returns empty for unsupported language', () => {
    expect(getContextHints('some text', 'ja', 'travel')).toEqual([])
  })

  it('returns empty when no glossary terms match', () => {
    expect(getContextHints('Hallo Welt', 'de', 'travel')).toEqual([])
  })

  it('is case-insensitive', () => {
    const hints = getContextHints('rezept vom arzt', 'de', 'medical')
    expect(hints.length).toBeGreaterThan(0)
  })
})

describe('getContextMode', () => {
  it('returns mode for valid id', () => {
    const mode = getContextMode('travel')
    expect(mode).toBeDefined()
    expect(mode!.id).toBe('travel')
  })

  it('returns undefined for invalid id', () => {
    expect(getContextMode('nonexistent' as TranslationContext)).toBeUndefined()
  })
})
