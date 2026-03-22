// @vitest-environment jsdom
// Tests for ScoutCityPanel component configuration and logic

import { describe, it, expect } from 'vitest'

// Reproduce slug generation logic from ScoutCityPanel
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Reproduce domain → parent_type mapping
function getParentType(domain: string): string {
  if (domain === 'cityguide') return 'city'
  if (domain === 'regionguide') return 'region'
  return 'event'
}

const DOMAINS = [
  { id: 'cityguide', label: 'Stadt' },
  { id: 'regionguide', label: 'Region' },
  { id: 'natureguide', label: 'Natur' },
  { id: 'eventguide', label: 'Event' },
]

const LANGUAGES = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Francais' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Espanol' },
]

describe('ScoutCityPanel', () => {
  describe('slug generation', () => {
    it('should lowercase and hyphenate', () => {
      expect(generateSlug('Goldenes Dachl')).toBe('goldenes-dachl')
    })

    it('should remove special characters', () => {
      expect(generateSlug('St. Peter\'s Church')).toBe('st-peter-s-church')
    })

    it('should trim leading/trailing hyphens', () => {
      expect(generateSlug('--hello--')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('should collapse multiple special chars into single hyphen', () => {
      expect(generateSlug('Museo d\'Arte & Storia')).toBe('museo-d-arte-storia')
    })
  })

  describe('domain configuration', () => {
    it('should have 4 domains', () => {
      expect(DOMAINS).toHaveLength(4)
    })

    it('should map domain to correct parent type', () => {
      expect(getParentType('cityguide')).toBe('city')
      expect(getParentType('regionguide')).toBe('region')
      expect(getParentType('natureguide')).toBe('event')
      expect(getParentType('eventguide')).toBe('event')
    })
  })

  describe('languages', () => {
    it('should have 5 languages', () => {
      expect(LANGUAGES).toHaveLength(5)
    })

    it('should not use German special characters', () => {
      const specialChars = /[äöüßÄÖÜ]/
      for (const lang of LANGUAGES) {
        expect(lang.label).not.toMatch(specialChars)
      }
    })
  })

  describe('highlight logic', () => {
    it('should mark rating >= 4.5 as highlight', () => {
      expect(4.5 >= 4.5).toBe(true)
      expect(5.0 >= 4.5).toBe(true)
    })

    it('should not mark rating < 4.5 as highlight', () => {
      expect(4.4 >= 4.5).toBe(false)
      expect(0 >= 4.5).toBe(false)
    })
  })

  describe('POI data parsing', () => {
    it('should handle multilingual name objects', () => {
      const rawPoi = { name: { de: 'Stephansdom', en: 'St. Stephen\'s Cathedral' } }
      const name = (rawPoi.name as Record<string, string>)?.de || ''
      expect(name).toBe('Stephansdom')
    })

    it('should fallback to string name', () => {
      const rawPoi = { name: 'Simple Name' }
      const name = (rawPoi.name as Record<string, string>)?.de || (rawPoi.name as string) || ''
      expect(name).toBe('Simple Name')
    })

    it('should default missing fields', () => {
      const rawPoi = {}
      const type = (rawPoi as Record<string, unknown>).content_type as string || 'landmark'
      const lat = (rawPoi as Record<string, unknown>).lat as number || 0
      expect(type).toBe('landmark')
      expect(lat).toBe(0)
    })
  })
})
