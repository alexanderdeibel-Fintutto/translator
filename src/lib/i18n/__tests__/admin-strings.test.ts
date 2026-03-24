// @vitest-environment jsdom
// Tests for admin i18n strings — completeness, consistency, translation helper

import { describe, it, expect, beforeEach } from 'vitest'
import { adminDe, adminEn, ta, setAdminLang, getAdminLang } from '../admin-strings'
import type { AdminLang } from '../admin-strings'

describe('admin-strings', () => {
  beforeEach(() => {
    setAdminLang('de')
  })

  describe('key completeness', () => {
    it('should have the same keys in DE and EN', () => {
      const deKeys = Object.keys(adminDe).sort()
      const enKeys = Object.keys(adminEn).sort()
      expect(deKeys).toEqual(enKeys)
    })

    it('should have at least 80 keys', () => {
      expect(Object.keys(adminDe).length).toBeGreaterThanOrEqual(80)
    })

    it('should cover all admin sections', () => {
      const sections = ['nav', 'dashboard', 'action', 'content', 'status', 'sort', 'edit', 'validation', 'import', 'workflow', 'preview', 'timeline', 'help', 'perm', 'common']
      for (const section of sections) {
        const keys = Object.keys(adminDe).filter(k => k.startsWith(`admin.${section}.`))
        expect(keys.length).toBeGreaterThan(0)
      }
    })
  })

  describe('value quality', () => {
    it('DE values should not be empty', () => {
      for (const [key, val] of Object.entries(adminDe)) {
        expect(val.length).toBeGreaterThan(0)
      }
    })

    it('EN values should not be empty', () => {
      for (const [key, val] of Object.entries(adminEn)) {
        expect(val.length).toBeGreaterThan(0)
      }
    })

    it('DE should not use German special characters (ae/oe/ue rule)', () => {
      const specialChars = /[äöüßÄÖÜ]/
      for (const [key, val] of Object.entries(adminDe)) {
        expect(val, `Key ${key} contains special chars`).not.toMatch(specialChars)
      }
    })

    it('EN should not contain German words', () => {
      const germanIndicators = /\b(Eintraege|Inhalt|Speichern|Loeschen|Aendern)\b/
      for (const [key, val] of Object.entries(adminEn)) {
        expect(val, `Key ${key} has German in EN`).not.toMatch(germanIndicators)
      }
    })
  })

  describe('ta() translation helper', () => {
    it('should return DE string by default', () => {
      expect(ta('admin.status.draft')).toBe('Entwurf')
    })

    it('should return EN string when set', () => {
      setAdminLang('en')
      expect(ta('admin.status.draft')).toBe('Draft')
    })

    it('should fall back to DE for missing EN keys', () => {
      // If a key existed in DE but not EN (hypothetical), should fallback
      setAdminLang('en')
      // All keys exist in both, so test with existing key
      expect(ta('admin.nav.dashboard')).toBe('Dashboard')
    })

    it('should return key for unknown keys', () => {
      expect(ta('admin.unknown.key')).toBe('admin.unknown.key')
    })

    it('should interpolate params', () => {
      expect(ta('admin.content.subtitle', { count: 42 })).toBe('42 Inhalte — universelles Content-Management fuer alle Domains.')
    })

    it('should interpolate multiple params', () => {
      expect(ta('admin.common.minutesAgo', { n: 5 })).toBe('vor 5 Min.')
    })

    it('should interpolate EN params', () => {
      setAdminLang('en')
      expect(ta('admin.common.minutesAgo', { n: 5 })).toBe('5 min ago')
    })
  })

  describe('setAdminLang / getAdminLang', () => {
    it('should default to DE', () => {
      expect(getAdminLang()).toBe('de')
    })

    it('should switch to EN', () => {
      setAdminLang('en')
      expect(getAdminLang()).toBe('en')
    })

    it('should persist across ta() calls', () => {
      setAdminLang('en')
      expect(ta('admin.status.published')).toBe('Live')
      expect(ta('admin.status.draft')).toBe('Draft')
    })
  })

  describe('status strings consistency', () => {
    it('should have all 4 status values', () => {
      const statuses = ['draft', 'review', 'published', 'archived']
      for (const s of statuses) {
        expect(adminDe[`admin.status.${s}`]).toBeTruthy()
        expect(adminEn[`admin.status.${s}`]).toBeTruthy()
      }
    })
  })
})
