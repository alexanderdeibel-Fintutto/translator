// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { CONTEXT_MODES, getContextHints, getContextMode } from '../context-modes'
import type { TranslationContext } from '../context-modes'

describe('context-modes', () => {
  describe('CONTEXT_MODES', () => {
    it('should have exactly 6 context modes', () => {
      expect(CONTEXT_MODES).toHaveLength(6)
    })

    it('should contain general, travel, medical, legal, business, casual', () => {
      const ids = CONTEXT_MODES.map(m => m.id)
      expect(ids).toContain('general')
      expect(ids).toContain('travel')
      expect(ids).toContain('medical')
      expect(ids).toContain('legal')
      expect(ids).toContain('business')
      expect(ids).toContain('casual')
    })

    it('each mode should have id, icon, i18nKey', () => {
      for (const mode of CONTEXT_MODES) {
        expect(typeof mode.id).toBe('string')
        expect(mode.id.length).toBeGreaterThan(0)
        expect(typeof mode.icon).toBe('string')
        expect(mode.icon.length).toBeGreaterThan(0)
        expect(typeof mode.i18nKey).toBe('string')
        expect(mode.i18nKey.length).toBeGreaterThan(0)
      }
    })

    it('i18nKey should start with "context."', () => {
      for (const mode of CONTEXT_MODES) {
        expect(mode.i18nKey).toMatch(/^context\./)
      }
    })

    it('should have no duplicate ids', () => {
      const ids = CONTEXT_MODES.map(m => m.id)
      const unique = new Set(ids)
      expect(unique.size).toBe(ids.length)
    })
  })

  describe('getContextMode', () => {
    it('should return the general mode', () => {
      const mode = getContextMode('general')
      expect(mode).toBeDefined()
      expect(mode!.id).toBe('general')
    })

    it('should return the travel mode', () => {
      const mode = getContextMode('travel')
      expect(mode).toBeDefined()
      expect(mode!.id).toBe('travel')
    })

    it('should return the medical mode', () => {
      const mode = getContextMode('medical')
      expect(mode).toBeDefined()
      expect(mode!.id).toBe('medical')
    })

    it('should return the legal mode', () => {
      const mode = getContextMode('legal')
      expect(mode).toBeDefined()
      expect(mode!.id).toBe('legal')
    })

    it('should return the business mode', () => {
      const mode = getContextMode('business')
      expect(mode).toBeDefined()
      expect(mode!.id).toBe('business')
    })

    it('should return the casual mode', () => {
      const mode = getContextMode('casual')
      expect(mode).toBeDefined()
      expect(mode!.id).toBe('casual')
    })

    it('should return undefined for unknown mode id', () => {
      const mode = getContextMode('nonexistent' as TranslationContext)
      expect(mode).toBeUndefined()
    })

    it('should return the correct icon for each mode', () => {
      for (const expected of CONTEXT_MODES) {
        const mode = getContextMode(expected.id)
        expect(mode!.icon).toBe(expected.icon)
      }
    })
  })

  describe('getContextHints', () => {
    it('should return an array', () => {
      const hints = getContextHints('some text', 'de', 'travel')
      expect(Array.isArray(hints)).toBe(true)
    })

    it('should return empty array for general context', () => {
      const hints = getContextHints('Anschluss nach Berlin', 'de', 'general')
      expect(hints).toHaveLength(0)
    })

    it('should return hints for travel context with matching German terms', () => {
      const hints = getContextHints('Wo ist der Anschluss?', 'de', 'travel')
      expect(hints.length).toBeGreaterThan(0)
      expect(hints[0]).toContain('Anschluss')
    })

    it('should return hints for medical context with matching German terms', () => {
      const hints = getContextHints('Ich brauche ein Rezept', 'de', 'medical')
      expect(hints.length).toBeGreaterThan(0)
      expect(hints[0]).toContain('Rezept')
    })

    it('should return hints for legal context with matching German terms', () => {
      const hints = getContextHints('Ich lege Einspruch ein', 'de', 'legal')
      expect(hints.length).toBeGreaterThan(0)
      expect(hints[0]).toContain('Einspruch')
    })

    it('should return hints for business context with matching German terms', () => {
      const hints = getContextHints('Bitte senden Sie die Rechnung', 'de', 'business')
      expect(hints.length).toBeGreaterThan(0)
      expect(hints[0]).toContain('Rechnung')
    })

    it('should return hints for English travel terms', () => {
      const hints = getContextHints('Where is the terminal?', 'en', 'travel')
      expect(hints.length).toBeGreaterThan(0)
      expect(hints[0]).toContain('terminal')
    })

    it('should return empty array when no terms match', () => {
      const hints = getContextHints('Hello world', 'en', 'travel')
      expect(hints).toHaveLength(0)
    })

    it('should return empty array for unsupported language', () => {
      const hints = getContextHints('some text', 'ja', 'travel')
      expect(hints).toHaveLength(0)
    })

    it('should be case-insensitive for matching', () => {
      const hints = getContextHints('wo ist der anschluss', 'de', 'travel')
      expect(hints.length).toBeGreaterThan(0)
    })

    it('should find multiple hints in one text', () => {
      const hints = getContextHints('Die Rechnung und der Vertrag', 'de', 'business')
      expect(hints.length).toBeGreaterThanOrEqual(2)
    })
  })
})
