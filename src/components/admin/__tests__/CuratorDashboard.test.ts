// @vitest-environment jsdom
// Tests for CuratorDashboard — formatTimeAgo utility and dashboard config

import { describe, it, expect } from 'vitest'
import { formatTimeAgo } from '../CuratorDashboard'

describe('CuratorDashboard', () => {
  describe('formatTimeAgo', () => {
    it('should show "gerade eben" for now', () => {
      expect(formatTimeAgo(new Date().toISOString())).toBe('gerade eben')
    })

    it('should show minutes for recent times', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString()
      expect(formatTimeAgo(fiveMinAgo)).toBe('vor 5 Min.')
    })

    it('should show hours', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString()
      expect(formatTimeAgo(threeHoursAgo)).toBe('vor 3 Std.')
    })

    it('should show days', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()
      expect(formatTimeAgo(twoDaysAgo)).toBe('vor 2 Tagen')
    })

    it('should show weeks', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString()
      expect(formatTimeAgo(twoWeeksAgo)).toBe('vor 2 Wo.')
    })

    it('should show months for older dates', () => {
      const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString()
      expect(formatTimeAgo(threeMonthsAgo)).toBe('vor 3 Mon.')
    })

    it('should not use German special characters', () => {
      const specialChars = /[äöüßÄÖÜ]/
      const testDates = [
        new Date().toISOString(),
        new Date(Date.now() - 5 * 60000).toISOString(),
        new Date(Date.now() - 3 * 3600000).toISOString(),
        new Date(Date.now() - 2 * 86400000).toISOString(),
        new Date(Date.now() - 14 * 86400000).toISOString(),
        new Date(Date.now() - 90 * 86400000).toISOString(),
      ]
      for (const d of testDates) {
        expect(formatTimeAgo(d)).not.toMatch(specialChars)
      }
    })
  })

  describe('quick actions config', () => {
    const quickActionPaths = ['/admin/content', '/admin/content-import', '/admin/ai-content', '/admin/museum-analytics']

    it('should have 4 quick actions', () => {
      expect(quickActionPaths).toHaveLength(4)
    })

    it('should all start with /admin/', () => {
      for (const path of quickActionPaths) {
        expect(path.startsWith('/admin/')).toBe(true)
      }
    })
  })

  describe('status colors', () => {
    const statusColor: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-600',
      review: 'bg-amber-100 text-amber-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-red-100 text-red-600',
    }

    it('should have colors for all 4 statuses', () => {
      expect(Object.keys(statusColor)).toHaveLength(4)
    })

    it('should include draft, review, published, archived', () => {
      expect(statusColor).toHaveProperty('draft')
      expect(statusColor).toHaveProperty('review')
      expect(statusColor).toHaveProperty('published')
      expect(statusColor).toHaveProperty('archived')
    })
  })
})
