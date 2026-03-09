import { describe, it, expect } from 'vitest'
import { generateSessionCode, getSessionUrl, getChannelName } from '../session'

describe('generateSessionCode', () => {
  it('returns TR-XXXX format', () => {
    const code = generateSessionCode()
    expect(code).toMatch(/^TR-[A-Z0-9]{4}$/)
  })

  it('excludes confusing characters (0, O, I, 1)', () => {
    // CODE_CHARS excludes 0, O, I, 1 to avoid ambiguity
    for (let i = 0; i < 100; i++) {
      const code = generateSessionCode().slice(3) // strip "TR-"
      expect(code).not.toMatch(/[0OI1]/)
    }
  })

  it('generates unique codes (no duplicates in 50 runs)', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 50; i++) {
      codes.add(generateSessionCode())
    }
    // With 28^4 = ~614k possibilities, 50 codes should be unique
    expect(codes.size).toBe(50)
  })
})

describe('getSessionUrl', () => {
  it('returns URL with /live/ path', () => {
    const url = getSessionUrl('TR-A3K9')
    expect(url).toContain('/live/TR-A3K9')
  })

  it('uses fallback domain when window is undefined', () => {
    const url = getSessionUrl('TR-A3K9')
    expect(url).toContain('translator.fintutto.cloud')
  })
})

describe('getChannelName', () => {
  it('returns live-{code} format', () => {
    expect(getChannelName('TR-A3K9')).toBe('live-TR-A3K9')
  })
})
