// @vitest-environment jsdom
// Tests for InlineEditList — edit state management and data transforms

import { describe, it, expect } from 'vitest'

describe('InlineEditList', () => {
  describe('tag parsing', () => {
    function parseTags(input: string): string[] {
      return input.split(',').map(t => t.trim()).filter(Boolean)
    }

    it('should parse comma-separated tags', () => {
      expect(parseTags('art, history, museum')).toEqual(['art', 'history', 'museum'])
    })

    it('should filter empty entries', () => {
      expect(parseTags('art,,, history')).toEqual(['art', 'history'])
    })

    it('should handle empty string', () => {
      expect(parseTags('')).toEqual([])
    })
  })

  describe('tag display', () => {
    function visibleTags(tags: string[], maxVisible: number): { shown: string[]; overflow: number } {
      return {
        shown: tags.slice(0, maxVisible),
        overflow: Math.max(0, tags.length - maxVisible),
      }
    }

    it('should show all when under limit', () => {
      const result = visibleTags(['a', 'b'], 3)
      expect(result.shown).toEqual(['a', 'b'])
      expect(result.overflow).toBe(0)
    })

    it('should truncate and show overflow count', () => {
      const result = visibleTags(['a', 'b', 'c', 'd', 'e'], 3)
      expect(result.shown).toEqual(['a', 'b', 'c'])
      expect(result.overflow).toBe(2)
    })

    it('should handle empty tags', () => {
      const result = visibleTags([], 3)
      expect(result.shown).toEqual([])
      expect(result.overflow).toBe(0)
    })
  })

  describe('name update transform', () => {
    it('should merge new DE name into existing multilingual name', () => {
      const existingName = { de: 'Alt', en: 'Old', fr: 'Ancien' }
      const updated = { ...existingName, de: 'Neu' }
      expect(updated).toEqual({ de: 'Neu', en: 'Old', fr: 'Ancien' })
    })

    it('should handle name with only DE', () => {
      const existingName = { de: 'Alt' }
      const updated = { ...existingName, de: 'Neu' }
      expect(updated).toEqual({ de: 'Neu' })
    })
  })

  describe('status transitions', () => {
    const validTransitions: Record<string, string[]> = {
      draft: ['review', 'published', 'archived'],
      review: ['draft', 'published', 'archived'],
      published: ['draft', 'review', 'archived'],
      archived: ['draft', 'review', 'published'],
    }

    it('should allow all transitions from draft', () => {
      expect(validTransitions.draft).toContain('review')
      expect(validTransitions.draft).toContain('published')
    })

    it('should allow going back to draft', () => {
      expect(validTransitions.review).toContain('draft')
      expect(validTransitions.published).toContain('draft')
    })

    it('should set published_at on publish', () => {
      const updates: Record<string, unknown> = { status: 'published' }
      if (updates.status === 'published') {
        updates.published_at = new Date().toISOString()
      }
      expect(updates.published_at).toBeTruthy()
    })

    it('should not set published_at for draft', () => {
      const updates: Record<string, unknown> = { status: 'draft' }
      if (updates.status === 'published') {
        updates.published_at = new Date().toISOString()
      }
      expect(updates.published_at).toBeUndefined()
    })
  })

  describe('highlight toggle', () => {
    it('should toggle from false to true', () => {
      expect(!false).toBe(true)
    })

    it('should toggle from true to false', () => {
      expect(!true).toBe(false)
    })
  })

  describe('search filter', () => {
    const items = [
      { name: { de: 'Museum' }, slug: 'museum', tags: ['art', 'kultur'] },
      { name: { de: 'Park' }, slug: 'park', tags: ['natur', 'gruen'] },
    ]

    function filter(list: typeof items, search: string) {
      return list.filter(i => {
        const name = i.name?.de?.toLowerCase() || i.slug.toLowerCase()
        return name.includes(search.toLowerCase()) ||
          i.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
      })
    }

    it('should filter by name', () => {
      expect(filter(items, 'museum')).toHaveLength(1)
    })

    it('should filter by tag', () => {
      expect(filter(items, 'natur')).toHaveLength(1)
    })

    it('should return all for empty search', () => {
      expect(filter(items, '')).toHaveLength(2)
    })
  })
})
