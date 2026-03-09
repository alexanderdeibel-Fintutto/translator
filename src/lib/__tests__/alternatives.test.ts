import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { fetchAlternatives } from '../alternatives'

beforeEach(() => {
  mockFetch.mockReset()
})

describe('fetchAlternatives', () => {
  it('returns empty array for empty text', async () => {
    const result = await fetchAlternatives('', 'de', 'en')
    expect(result).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('uses AbortController with timeout', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        responseData: { translatedText: 'Hello' },
        matches: [
          { translation: 'Hi', match: 0.9, 'created-by': 'TM' },
          { translation: 'Hey', match: 0.7, 'created-by': 'User' },
        ],
      }),
    })

    const result = await fetchAlternatives('Hallo', 'de', 'en')

    // Verify fetch was called with an AbortSignal
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const fetchCall = mockFetch.mock.calls[0]
    expect(fetchCall[1]).toHaveProperty('signal')
    expect(fetchCall[1].signal).toBeInstanceOf(AbortSignal)

    // Should return alternatives excluding the primary translation
    expect(result).toEqual([
      { text: 'Hi', match: 0.9, source: 'TM' },
      { text: 'Hey', match: 0.7, source: 'User' },
    ])
  })

  it('returns empty array on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await fetchAlternatives('Hallo', 'de', 'en')
    expect(result).toEqual([])
  })

  it('returns empty array on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const result = await fetchAlternatives('Hallo', 'de', 'en')
    expect(result).toEqual([])
  })

  it('deduplicates alternatives case-insensitively', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        responseData: { translatedText: 'Hello' },
        matches: [
          { translation: 'hello', match: 0.95, 'created-by': 'a' },  // same as primary
          { translation: 'HELLO', match: 0.90, 'created-by': 'b' },  // same as primary
          { translation: 'Hi', match: 0.80, 'created-by': 'c' },
        ],
      }),
    })

    const result = await fetchAlternatives('Hallo', 'de', 'en')
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Hi')
  })

  it('limits results to 5', async () => {
    const matches = Array.from({ length: 10 }, (_, i) => ({
      translation: `Alt ${i}`,
      match: 0.5 + i * 0.01,
      'created-by': 'TM',
    }))

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        responseData: { translatedText: 'Primary' },
        matches,
      }),
    })

    const result = await fetchAlternatives('Test', 'de', 'en')
    expect(result).toHaveLength(5)
  })

  it('returns empty array on abort/timeout', async () => {
    mockFetch.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
    const result = await fetchAlternatives('Hallo', 'de', 'en')
    expect(result).toEqual([])
  })
})
