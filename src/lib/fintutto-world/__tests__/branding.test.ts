// @vitest-environment jsdom
// Tests for Fintutto World — Multi-Tenant Branding
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('../../supabase', () => ({
  supabase: {
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args)
        return {
          eq: (...eArgs: unknown[]) => {
            mockEq(...eArgs)
            return { single: mockSingle }
          },
        }
      },
    }),
  },
}))

import { applyBranding, resetBranding, loadBranding, type BrandingConfig } from '../branding'

const BRANDING_CACHE_KEY = 'fw_branding_config'

function makeBranding(overrides: Partial<BrandingConfig> = {}): BrandingConfig {
  return {
    entityId: 'museum-1',
    entityType: 'museum',
    primaryColor: '350 80% 50%',
    primaryForeground: '0 0% 100%',
    backgroundColor: '0 0% 98%',
    foregroundColor: '0 0% 10%',
    mutedColor: '0 0% 95%',
    accentColor: '200 50% 50%',
    logoUrl: null,
    logoWidth: 120,
    faviconUrl: null,
    appName: 'Testmuseum',
    fontFamily: null,
    fontHeading: null,
    borderRadius: 12,
    themeColor: '#ff0000',
    ...overrides,
  }
}

describe('branding', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Reset any applied CSS custom properties
    resetBranding()
  })

  // ── applyBranding ─────────────────────────────────────────────────

  describe('applyBranding', () => {
    it('sets CSS custom properties on document root', () => {
      const config = makeBranding()
      applyBranding(config)

      const root = document.documentElement
      expect(root.style.getPropertyValue('--primary')).toBe('350 80% 50%')
      expect(root.style.getPropertyValue('--primary-foreground')).toBe('0 0% 100%')
      expect(root.style.getPropertyValue('--background')).toBe('0 0% 98%')
      expect(root.style.getPropertyValue('--foreground')).toBe('0 0% 10%')
      expect(root.style.getPropertyValue('--muted')).toBe('0 0% 95%')
      expect(root.style.getPropertyValue('--accent')).toBe('200 50% 50%')
      expect(root.style.getPropertyValue('--radius')).toBe('12px')
    })

    it('updates document title', () => {
      applyBranding(makeBranding({ appName: 'Kunsthalle Bern' }))
      expect(document.title).toBe('Kunsthalle Bern')
    })

    it('does not inject font link when fontFamily is null', () => {
      const before = document.querySelectorAll('link[data-font]').length
      applyBranding(makeBranding({ fontFamily: null }))
      const after = document.querySelectorAll('link[data-font]').length
      expect(after).toBe(before)
    })

    it('injects Google Font link when fontFamily is specified', () => {
      applyBranding(makeBranding({ fontFamily: 'Inter' }))

      const link = document.querySelector('link[data-font="Inter"]') as HTMLLinkElement
      expect(link).not.toBeNull()
      expect(link.href).toContain('fonts.googleapis.com')
      expect(link.href).toContain('Inter')

      const root = document.documentElement
      expect(root.style.getPropertyValue('--font-sans')).toContain('Inter')
    })

    it('does not inject duplicate font links', () => {
      applyBranding(makeBranding({ fontFamily: 'Roboto' }))
      applyBranding(makeBranding({ fontFamily: 'Roboto' }))

      const links = document.querySelectorAll('link[data-font="Roboto"]')
      expect(links.length).toBe(1)
    })

    it('injects heading font link when fontHeading is specified', () => {
      applyBranding(makeBranding({ fontHeading: 'Playfair Display' }))

      const link = document.querySelector('link[data-font="Playfair Display"]') as HTMLLinkElement
      expect(link).not.toBeNull()
    })
  })

  // ── resetBranding ─────────────────────────────────────────────────

  describe('resetBranding', () => {
    it('removes all CSS custom properties', () => {
      applyBranding(makeBranding())

      resetBranding()

      const root = document.documentElement
      expect(root.style.getPropertyValue('--primary')).toBe('')
      expect(root.style.getPropertyValue('--primary-foreground')).toBe('')
      expect(root.style.getPropertyValue('--background')).toBe('')
      expect(root.style.getPropertyValue('--foreground')).toBe('')
      expect(root.style.getPropertyValue('--muted')).toBe('')
      expect(root.style.getPropertyValue('--accent')).toBe('')
      expect(root.style.getPropertyValue('--radius')).toBe('')
      expect(root.style.getPropertyValue('--font-sans')).toBe('')
    })

    it('resets document title to default', () => {
      document.title = 'Custom Museum'
      resetBranding()
      expect(document.title).toBe('Fintutto Translator')
    })
  })

  // ── loadBranding ──────────────────────────────────────────────────

  describe('loadBranding', () => {
    it('returns cached branding without hitting Supabase', async () => {
      const config = makeBranding({ entityId: 'cached-1' })
      localStorage.setItem(`${BRANDING_CACHE_KEY}_cached-1`, JSON.stringify(config))

      const result = await loadBranding('museum', 'cached-1')
      expect(result.entityId).toBe('cached-1')
      expect(result.primaryColor).toBe('350 80% 50%')
      expect(mockSelect).not.toHaveBeenCalled() // did not hit DB
    })

    it('fetches from Supabase when no cache exists (museum type)', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          name: 'Altes Museum',
          custom_branding: {
            primary_color: '120 60% 40%',
            app_name: 'Altes Museum Berlin',
            border_radius: 16,
            theme_color: '#228b22',
          },
        },
      })

      const result = await loadBranding('museum', 'new-museum-1')
      expect(mockSelect).toHaveBeenCalledWith('name, custom_branding')
      expect(result.primaryColor).toBe('120 60% 40%')
      expect(result.appName).toBe('Altes Museum Berlin')
      expect(result.borderRadius).toBe(16)

      // Should be cached now
      const cached = localStorage.getItem(`${BRANDING_CACHE_KEY}_new-museum-1`)
      expect(cached).not.toBeNull()
    })

    it('returns default branding when museum has no custom_branding', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { name: 'Basic Museum', custom_branding: null },
      })

      const result = await loadBranding('museum', 'basic-1')
      expect(result.appName).toBe('Fintutto')
      expect(result.primaryColor).toBe('221 83% 53%')
    })

    it('returns default branding on network error (offline)', async () => {
      mockSingle.mockRejectedValueOnce(new Error('Network error'))

      const result = await loadBranding('museum', 'offline-1')
      expect(result.appName).toBe('Fintutto')
    })

    it('falls back to defaults for missing fields in custom_branding', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          name: 'Partial Museum',
          custom_branding: { primary_color: '0 100% 50%' }, // only primary set
        },
      })

      const result = await loadBranding('museum', 'partial-1')
      expect(result.primaryColor).toBe('0 100% 50%')
      // All others should be defaults
      expect(result.backgroundColor).toBe('0 0% 100%')
      expect(result.borderRadius).toBe(8)
      expect(result.fontFamily).toBeNull()
      expect(result.appName).toBe('Partial Museum') // falls back to entity name
    })
  })
})
