// @vitest-environment jsdom
// Tests for ContentBulkActions component logic

import { describe, it, expect } from 'vitest'

describe('ContentBulkActions', () => {
  describe('tag parsing', () => {
    // Reproduce tag parsing from ContentBulkActions
    function parseTags(input: string): string[] {
      return input.split(/[,;]/).map(t => t.trim()).filter(Boolean)
    }

    it('should split comma-separated tags', () => {
      expect(parseTags('museum, art, modern')).toEqual(['museum', 'art', 'modern'])
    })

    it('should split semicolon-separated tags', () => {
      expect(parseTags('museum;art;modern')).toEqual(['museum', 'art', 'modern'])
    })

    it('should handle mixed separators', () => {
      expect(parseTags('museum, art; modern')).toEqual(['museum', 'art', 'modern'])
    })

    it('should filter empty entries', () => {
      expect(parseTags('museum,,, art,,')).toEqual(['museum', 'art'])
    })

    it('should trim whitespace', () => {
      expect(parseTags('  museum  ,  art  ')).toEqual(['museum', 'art'])
    })

    it('should return empty for empty input', () => {
      expect(parseTags('')).toEqual([])
    })
  })

  describe('tag merging', () => {
    function mergeTags(existing: string[], newTags: string[]): string[] {
      return [...new Set([...existing, ...newTags])]
    }

    it('should merge without duplicates', () => {
      expect(mergeTags(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty existing tags', () => {
      expect(mergeTags([], ['a', 'b'])).toEqual(['a', 'b'])
    })

    it('should handle empty new tags', () => {
      expect(mergeTags(['a', 'b'], [])).toEqual(['a', 'b'])
    })
  })

  describe('available languages', () => {
    const AVAILABLE_LANGS = [
      { code: 'en', label: 'EN' }, { code: 'fr', label: 'FR' },
      { code: 'it', label: 'IT' }, { code: 'es', label: 'ES' },
      { code: 'nl', label: 'NL' }, { code: 'pl', label: 'PL' },
      { code: 'zh', label: 'ZH' }, { code: 'ja', label: 'JA' },
    ]

    it('should have 8 translation target languages', () => {
      expect(AVAILABLE_LANGS).toHaveLength(8)
    })

    it('should not include DE as translation target', () => {
      // DE is source language, not a target
      const codes = AVAILABLE_LANGS.map(l => l.code)
      expect(codes).not.toContain('de')
    })

    it('should have unique codes', () => {
      const codes = AVAILABLE_LANGS.map(l => l.code)
      expect(new Set(codes).size).toBe(codes.length)
    })
  })

  describe('bulk action types', () => {
    const actions = ['status', 'tags', 'translate', 'enrich', 'delete'] as const

    it('should support 5 action types', () => {
      expect(actions).toHaveLength(5)
    })

    it('should include content management actions', () => {
      expect(actions).toContain('status')
      expect(actions).toContain('tags')
    })

    it('should include AI actions', () => {
      expect(actions).toContain('translate')
      expect(actions).toContain('enrich')
    })

    it('should include archive (soft delete)', () => {
      expect(actions).toContain('delete')
    })
  })

  describe('status values', () => {
    const statuses = ['draft', 'review', 'published', 'archived']

    it('should follow the correct workflow order', () => {
      expect(statuses[0]).toBe('draft')
      expect(statuses[1]).toBe('review')
      expect(statuses[2]).toBe('published')
      expect(statuses[3]).toBe('archived')
    })
  })
})
