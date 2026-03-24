// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { fetchAlternatives } from '../alternatives'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('alternatives', () => {
  describe('fetchAlternatives()', () => {
    it('returns array of Alternative objects', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Hello' },
          matches: [
            { translation: 'Hi', match: 0.85, 'created-by': 'UserA' },
            { translation: 'Hey', match: 0.70, 'created-by': 'UserB' },
          ],
        }),
      })

      const result = await fetchAlternatives('Hallo', 'de', 'en')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        text: 'Hi',
        match: 0.85,
        source: 'UserA',
      })
      expect(result[1]).toEqual({
        text: 'Hey',
        match: 0.70,
        source: 'UserB',
      })
    })

    it('empty text returns empty array', async () => {
      const result = await fetchAlternatives('', 'de', 'en')
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('whitespace-only text returns empty array', async () => {
      const result = await fetchAlternatives('   ', 'de', 'en')
      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('API error returns empty array', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      const result = await fetchAlternatives('Hallo', 'de', 'en')
      expect(result).toEqual([])
    })

    it('network error returns empty array', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await fetchAlternatives('Hallo', 'de', 'en')
      expect(result).toEqual([])
    })

    it('results have text, match, and source fields', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Hello' },
          matches: [
            { translation: 'Greetings', match: 0.6, 'created-by': 'TM' },
          ],
        }),
      })

      const result = await fetchAlternatives('Hallo', 'de', 'en')

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('text')
      expect(result[0]).toHaveProperty('match')
      expect(result[0]).toHaveProperty('source')
    })

    it('excludes the primary translation from alternatives', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Hello' },
          matches: [
            { translation: 'Hello', match: 1.0, 'created-by': 'MT' },
            { translation: 'Hi', match: 0.8, 'created-by': 'UserA' },
          ],
        }),
      })

      const result = await fetchAlternatives('Hallo', 'de', 'en')

      // 'Hello' is the primary translation and should be excluded
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Hi')
    })

    it('deduplicates alternatives (case-insensitive)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Hello' },
          matches: [
            { translation: 'Hi', match: 0.9, 'created-by': 'A' },
            { translation: 'hi', match: 0.8, 'created-by': 'B' },
            { translation: 'Hey', match: 0.7, 'created-by': 'C' },
          ],
        }),
      })

      const result = await fetchAlternatives('Hallo', 'de', 'en')

      expect(result).toHaveLength(2)
      expect(result.map(r => r.text)).toEqual(['Hi', 'Hey'])
    })

    it('sorts results by match quality descending', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Primary' },
          matches: [
            { translation: 'Low', match: 0.3, 'created-by': 'A' },
            { translation: 'High', match: 0.95, 'created-by': 'B' },
            { translation: 'Mid', match: 0.6, 'created-by': 'C' },
          ],
        }),
      })

      const result = await fetchAlternatives('Test', 'de', 'en')

      expect(result[0].match).toBeGreaterThanOrEqual(result[1].match)
      expect(result[1].match).toBeGreaterThanOrEqual(result[2].match)
    })

    it('limits results to top 5', async () => {
      const matches = Array.from({ length: 10 }, (_, i) => ({
        translation: `Alt ${i}`,
        match: 0.5 + i * 0.04,
        'created-by': `User${i}`,
      }))

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Primary' },
          matches,
        }),
      })

      const result = await fetchAlternatives('Test', 'de', 'en')

      expect(result.length).toBeLessThanOrEqual(5)
    })

    it('defaults source to TM when created-by is missing', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Hello' },
          matches: [
            { translation: 'Hi there', match: 0.7 },
          ],
        }),
      })

      const result = await fetchAlternatives('Hallo', 'de', 'en')

      expect(result[0].source).toBe('TM')
    })

    it('constructs correct API URL with language pair', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          responseData: { translatedText: 'Bonjour' },
          matches: [],
        }),
      })

      await fetchAlternatives('Hello', 'en', 'fr')

      const fetchUrl = mockFetch.mock.calls[0][0] as string
      expect(fetchUrl).toContain('langpair=en%7Cfr')
      expect(fetchUrl).toContain('q=Hello')
    })
  })
})
