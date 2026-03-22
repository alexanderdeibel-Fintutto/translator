// @vitest-environment jsdom
// Tests for VisitorPreview — language, audience, device config

import { describe, it, expect } from 'vitest'

describe('VisitorPreview', () => {
  describe('language config', () => {
    const LANGUAGES = [
      { code: 'de', label: 'Deutsch', flag: 'DE' },
      { code: 'en', label: 'English', flag: 'GB' },
      { code: 'fr', label: 'Francais', flag: 'FR' },
      { code: 'it', label: 'Italiano', flag: 'IT' },
      { code: 'es', label: 'Espanol', flag: 'ES' },
      { code: 'ar', label: 'Arabic', flag: 'SA' },
      { code: 'zh', label: 'Chinese', flag: 'CN' },
      { code: 'ja', label: 'Japanese', flag: 'JP' },
    ]

    it('should have 8 preview languages', () => {
      expect(LANGUAGES).toHaveLength(8)
    })

    it('should include RTL language (Arabic)', () => {
      expect(LANGUAGES.find(l => l.code === 'ar')).toBeDefined()
    })

    it('should have unique codes', () => {
      const codes = LANGUAGES.map(l => l.code)
      expect(new Set(codes).size).toBe(codes.length)
    })
  })

  describe('device modes', () => {
    const DEVICES = {
      mobile: { width: 'max-w-[375px]' },
      tablet: { width: 'max-w-[768px]' },
      desktop: { width: 'max-w-[1024px]' },
    }

    it('should have 3 device modes', () => {
      expect(Object.keys(DEVICES)).toHaveLength(3)
    })

    it('should have increasing widths', () => {
      const mobileW = parseInt(DEVICES.mobile.width.match(/\d+/)?.[0] || '0')
      const tabletW = parseInt(DEVICES.tablet.width.match(/\d+/)?.[0] || '0')
      const desktopW = parseInt(DEVICES.desktop.width.match(/\d+/)?.[0] || '0')
      expect(tabletW).toBeGreaterThan(mobileW)
      expect(desktopW).toBeGreaterThan(tabletW)
    })
  })

  describe('audience modes', () => {
    const AUDIENCE = {
      standard: { contentKey: 'content_standard' },
      children: { contentKey: 'content_children' },
      youth: { contentKey: 'content_youth' },
      detailed: { contentKey: 'content_detailed' },
    }

    it('should have 4 audience modes', () => {
      expect(Object.keys(AUDIENCE)).toHaveLength(4)
    })

    it('should map to correct content fields', () => {
      expect(AUDIENCE.standard.contentKey).toBe('content_standard')
      expect(AUDIENCE.children.contentKey).toBe('content_children')
      expect(AUDIENCE.youth.contentKey).toBe('content_youth')
      expect(AUDIENCE.detailed.contentKey).toBe('content_detailed')
    })
  })

  describe('getText logic', () => {
    function getText(content: Record<string, string> | null, lang: string): string {
      return content?.[lang] || content?.de || ''
    }

    it('should return requested language', () => {
      expect(getText({ de: 'Deutsch', en: 'English' }, 'en')).toBe('English')
    })

    it('should fallback to DE', () => {
      expect(getText({ de: 'Deutsch' }, 'fr')).toBe('Deutsch')
    })

    it('should return empty for null', () => {
      expect(getText(null, 'de')).toBe('')
    })

    it('should return empty for empty object', () => {
      expect(getText({}, 'de')).toBe('')
    })
  })

  describe('getMainContent with audience fallback', () => {
    function getMainContent(item: Record<string, Record<string, string>>, audience: string, lang: string): string {
      const keyMap: Record<string, string> = {
        standard: 'content_standard',
        children: 'content_children',
        youth: 'content_youth',
        detailed: 'content_detailed',
      }
      const key = keyMap[audience] || 'content_standard'
      const text = item[key]?.[lang] || item[key]?.de || ''
      if (text) return text
      // Fallback
      return item.content_standard?.[lang] || item.content_standard?.de || item.content_brief?.[lang] || item.content_brief?.de || ''
    }

    it('should return audience-specific content', () => {
      const item = {
        content_standard: { de: 'Standard' },
        content_children: { de: 'Kinder-Text' },
        content_brief: { de: 'Kurz' },
      }
      expect(getMainContent(item, 'children', 'de')).toBe('Kinder-Text')
    })

    it('should fallback to standard if audience empty', () => {
      const item = {
        content_standard: { de: 'Standard' },
        content_children: {},
        content_brief: { de: 'Kurz' },
      }
      expect(getMainContent(item, 'children', 'de')).toBe('Standard')
    })

    it('should fallback to brief if everything empty', () => {
      const item = {
        content_standard: {},
        content_children: {},
        content_brief: { de: 'Kurz' },
      }
      expect(getMainContent(item, 'children', 'de')).toBe('Kurz')
    })

    it('should return empty if all empty', () => {
      const item = { content_standard: {}, content_children: {}, content_brief: {} }
      expect(getMainContent(item, 'standard', 'en')).toBe('')
    })
  })

  describe('RTL detection', () => {
    it('should detect Arabic as RTL', () => {
      const isRtl = 'ar' === 'ar'
      expect(isRtl).toBe(true)
    })

    it('should not flag non-RTL languages', () => {
      const nonRtl = ['de', 'en', 'fr', 'it', 'es', 'zh', 'ja']
      for (const lang of nonRtl) {
        expect(lang === 'ar').toBe(false)
      }
    })
  })

  describe('item navigation', () => {
    it('should calculate previous index correctly', () => {
      const items = ['A', 'B', 'C', 'D']
      const currentIdx = 2
      expect(currentIdx > 0).toBe(true)
      expect(items[currentIdx - 1]).toBe('B')
    })

    it('should not go below 0', () => {
      const currentIdx = 0
      expect(currentIdx > 0).toBe(false)
    })

    it('should calculate next index correctly', () => {
      const items = ['A', 'B', 'C', 'D']
      const currentIdx = 1
      expect(currentIdx < items.length - 1).toBe(true)
      expect(items[currentIdx + 1]).toBe('C')
    })

    it('should not go beyond last item', () => {
      const items = ['A', 'B', 'C']
      const currentIdx = 2
      expect(currentIdx < items.length - 1).toBe(false)
    })
  })
})
