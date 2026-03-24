// @vitest-environment jsdom
// Tests for MultiLangEditor component

import { describe, it, expect } from 'vitest'
import { CONTENT_FIELDS, LANGUAGES } from '../MultiLangEditor'

describe('MultiLangEditor', () => {
  describe('CONTENT_FIELDS configuration', () => {
    it('should have exactly 8 content depth layers', () => {
      expect(CONTENT_FIELDS).toHaveLength(8)
    })

    it('should have unique keys', () => {
      const keys = CONTENT_FIELDS.map(f => f.key)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it('should include all expected content layers', () => {
      const keys = CONTENT_FIELDS.map(f => f.key)
      expect(keys).toContain('content_brief')
      expect(keys).toContain('content_standard')
      expect(keys).toContain('content_detailed')
      expect(keys).toContain('content_children')
      expect(keys).toContain('content_youth')
      expect(keys).toContain('content_fun_facts')
      expect(keys).toContain('content_historical')
      expect(keys).toContain('content_technique')
    })

    it('should have labels and hints for every field', () => {
      for (const field of CONTENT_FIELDS) {
        expect(field.label).toBeTruthy()
        expect(field.hint).toBeTruthy()
        expect(field.rows).toBeGreaterThan(0)
      }
    })

    it('should have audience info for key fields', () => {
      const childrenField = CONTENT_FIELDS.find(f => f.key === 'content_children')
      expect(childrenField?.audience).toContain('6-12')

      const youthField = CONTENT_FIELDS.find(f => f.key === 'content_youth')
      expect(youthField?.audience).toContain('13-17')
    })

    it('should not use German special characters in labels/hints', () => {
      const specialChars = /[äöüßÄÖÜ]/
      for (const field of CONTENT_FIELDS) {
        expect(field.label).not.toMatch(specialChars)
        expect(field.hint).not.toMatch(specialChars)
        if (field.audience) {
          expect(field.audience).not.toMatch(specialChars)
        }
      }
    })
  })

  describe('LANGUAGES configuration', () => {
    it('should have 12 languages', () => {
      expect(LANGUAGES).toHaveLength(12)
    })

    it('should include core languages (de, en, fr, it, es)', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(codes).toContain('de')
      expect(codes).toContain('en')
      expect(codes).toContain('fr')
      expect(codes).toContain('it')
      expect(codes).toContain('es')
    })

    it('should include Asian languages', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(codes).toContain('zh')
      expect(codes).toContain('ja')
      expect(codes).toContain('ko')
    })

    it('should include Arabic for RTL support', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(codes).toContain('ar')
    })

    it('should have unique codes', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(new Set(codes).size).toBe(codes.length)
    })

    it('should have label and flag for every language', () => {
      for (const lang of LANGUAGES) {
        expect(lang.code).toMatch(/^[a-z]{2}$/)
        expect(lang.label).toBeTruthy()
        expect(lang.flag).toBeTruthy()
      }
    })
  })
})
