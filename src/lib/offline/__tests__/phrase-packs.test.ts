import { describe, it, expect } from 'vitest'
import {
  PHRASE_PACKS,
  getPhrasePacks,
  getMigrantPhrases,
  getPhrasePack,
  getAllCategories,
  type PhrasePack,
} from '../phrase-packs'

describe('phrase-packs', () => {
  describe('PHRASE_PACKS constant', () => {
    it('should contain at least 3 packs', () => {
      expect(PHRASE_PACKS.length).toBeGreaterThanOrEqual(3)
    })

    it('should have unique IDs', () => {
      const ids = PHRASE_PACKS.map(p => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should have required fields on each pack', () => {
      for (const pack of PHRASE_PACKS) {
        expect(pack.id).toBeTruthy()
        expect(pack.name).toBeTruthy()
        expect(pack.description).toBeTruthy()
        expect(pack.icon).toBeTruthy()
        expect(pack.phrases.length).toBeGreaterThan(0)
      }
    })

    it('should have category and text on every phrase', () => {
      for (const pack of PHRASE_PACKS) {
        for (const phrase of pack.phrases) {
          expect(phrase.text).toBeTruthy()
          expect(phrase.category).toBeTruthy()
        }
      }
    })
  })

  describe('getPhrasePacks', () => {
    it('should return all phrase packs', () => {
      const packs = getPhrasePacks()
      expect(packs).toBe(PHRASE_PACKS)
      expect(packs.length).toBe(PHRASE_PACKS.length)
    })
  })

  describe('getMigrantPhrases', () => {
    it('should return the migrant phrase pack', () => {
      const migrant = getMigrantPhrases()
      expect(migrant).toBeDefined()
      expect(migrant!.id).toBe('migrant')
    })

    it('should contain authority and doctor categories', () => {
      const migrant = getMigrantPhrases()!
      const categories = migrant.phrases.map(p => p.category)
      expect(categories).toContain('phrases.cat.authority')
      expect(categories).toContain('phrases.cat.doctor')
      expect(categories).toContain('phrases.cat.housing')
      expect(categories).toContain('phrases.cat.work')
      expect(categories).toContain('phrases.cat.school')
      expect(categories).toContain('phrases.cat.police')
      expect(categories).toContain('phrases.cat.daily')
    })
  })

  describe('getPhrasePack', () => {
    it('should return a pack by ID', () => {
      const common = getPhrasePack('common')
      expect(common).toBeDefined()
      expect(common!.id).toBe('common')
    })

    it('should return the nordic pack', () => {
      const nordic = getPhrasePack('nordic')
      expect(nordic).toBeDefined()
      expect(nordic!.id).toBe('nordic')
    })

    it('should return undefined for non-existent ID', () => {
      const result = getPhrasePack('nonexistent')
      expect(result).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      const result = getPhrasePack('')
      expect(result).toBeUndefined()
    })
  })

  describe('getAllCategories', () => {
    it('should return unique categories across all packs', () => {
      const categories = getAllCategories()
      expect(categories.length).toBeGreaterThan(0)
      // Check uniqueness
      expect(new Set(categories).size).toBe(categories.length)
    })

    it('should include common categories', () => {
      const categories = getAllCategories()
      expect(categories).toContain('phrases.cat.greeting')
      expect(categories).toContain('phrases.cat.navigation')
      expect(categories).toContain('phrases.cat.food')
      expect(categories).toContain('phrases.cat.emergency')
    })

    it('should include migrant-specific categories', () => {
      const categories = getAllCategories()
      expect(categories).toContain('phrases.cat.authority')
      expect(categories).toContain('phrases.cat.doctor')
    })

    it('should include cruise-specific categories', () => {
      const categories = getAllCategories()
      expect(categories).toContain('phrases.cat.port')
      expect(categories).toContain('phrases.cat.sightseeing')
      expect(categories).toContain('phrases.cat.beach')
    })
  })
})
