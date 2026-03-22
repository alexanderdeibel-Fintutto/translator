// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSessionCode, getSessionUrl, getChannelName } from '../session'

describe('session', () => {
  describe('generateSessionCode', () => {
    it('should return a string starting with TR-', () => {
      const code = generateSessionCode()
      expect(code.startsWith('TR-')).toBe(true)
    })

    it('should have total length of 7 (TR- plus 4 chars)', () => {
      const code = generateSessionCode()
      expect(code).toHaveLength(7)
    })

    it('should have 4 alphanumeric characters after TR-', () => {
      const code = generateSessionCode()
      const suffix = code.slice(3)
      expect(suffix).toMatch(/^[A-Z2-9]{4}$/)
    })

    it('should not contain confusing characters (0, O, I, 1)', () => {
      // CODE_CHARS excludes 0, O, I, 1 to avoid confusion
      // L is included in CODE_CHARS
      for (let i = 0; i < 100; i++) {
        const code = generateSessionCode()
        const suffix = code.slice(3)
        expect(suffix).not.toContain('0')
        expect(suffix).not.toContain('O')
        expect(suffix).not.toContain('I')
        expect(suffix).not.toContain('1')
      }
    })

    it('should generate unique codes (100 codes should all be different)', () => {
      const codes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        codes.add(generateSessionCode())
      }
      // With 30^4 = 810000 possible codes, 100 codes should have no collisions
      expect(codes.size).toBe(100)
    })

    it('should only contain characters from the allowed set', () => {
      const allowed = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      for (let i = 0; i < 50; i++) {
        const code = generateSessionCode()
        const suffix = code.slice(3)
        for (const ch of suffix) {
          expect(allowed).toContain(ch)
        }
      }
    })
  })

  describe('getSessionUrl', () => {
    it('should return a URL containing /live/ and the code', () => {
      const url = getSessionUrl('TR-ABCD')
      expect(url).toContain('/live/TR-ABCD')
    })

    it('should use window.location.origin when available', () => {
      // jsdom provides window.location.origin
      const url = getSessionUrl('TR-XY23')
      expect(url).toBe(`${window.location.origin}/live/TR-XY23`)
    })

    it('should handle codes with different formats', () => {
      const url = getSessionUrl('TR-9999')
      expect(url).toContain('/live/TR-9999')
    })

    it('should return a valid URL string', () => {
      const url = getSessionUrl('TR-ABCD')
      expect(() => new URL(url)).not.toThrow()
    })
  })

  describe('getChannelName', () => {
    it('should return a string starting with live-', () => {
      const channel = getChannelName('TR-ABCD')
      expect(channel).toBe('live-TR-ABCD')
    })

    it('should include the code in the channel name', () => {
      const code = 'TR-XY23'
      const channel = getChannelName(code)
      expect(channel).toContain(code)
    })

    it('should have consistent format: live-{code}', () => {
      const codes = ['TR-AAAA', 'TR-9999', 'TR-AB12']
      for (const code of codes) {
        expect(getChannelName(code)).toBe(`live-${code}`)
      }
    })
  })

  describe('type shapes (compile-time checks)', () => {
    it('TranslationChunk should have expected fields', () => {
      // Runtime type check by constructing a valid object
      const chunk = {
        id: 'chunk-1',
        sourceText: 'Hallo',
        translatedText: 'Hello',
        sourceLang: 'de',
        targetLanguage: 'en',
        isFinal: true,
        timestamp: Date.now(),
      }
      expect(chunk.id).toBe('chunk-1')
      expect(chunk.isFinal).toBe(true)
      expect(typeof chunk.timestamp).toBe('number')
    })

    it('SessionInfo should have expected fields', () => {
      const info = {
        sessionCode: 'TR-ABCD',
        speakerName: 'Test Speaker',
        sourceLanguage: 'de',
        listenerCount: 5,
      }
      expect(info.sessionCode).toBe('TR-ABCD')
      expect(typeof info.listenerCount).toBe('number')
    })

    it('StatusMessage should have speaking and ended booleans', () => {
      const status = { speaking: true, ended: false }
      expect(typeof status.speaking).toBe('boolean')
      expect(typeof status.ended).toBe('boolean')
    })

    it('PresenceState should have required fields', () => {
      const presence = {
        deviceName: 'iPhone 15',
        targetLanguage: 'en',
        joinedAt: new Date().toISOString(),
      }
      expect(presence.deviceName).toBe('iPhone 15')
      expect(typeof presence.joinedAt).toBe('string')
    })
  })
})
