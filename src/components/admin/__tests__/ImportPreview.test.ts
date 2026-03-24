// @vitest-environment jsdom
// Tests for ImportPreview component logic

import { describe, it, expect } from 'vitest'

// Reproduce CSV parsing logic from ImportPreview
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n')
  if (lines.length === 0) return { headers: [], rows: [] }

  const sep = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ','
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line =>
    line.split(sep).map(cell => cell.trim().replace(/^"|"$/g, ''))
  )
  return { headers, rows }
}

// Reproduce field mapping suggestion logic
const fieldMap: Record<string, string[]> = {
  name: ['name', 'titel', 'title', 'bezeichnung'],
  description: ['description', 'beschreibung', 'desc', 'text'],
  content_type: ['type', 'typ', 'kategorie', 'category', 'content_type'],
  tags: ['tags', 'schlagwoerter', 'keywords'],
  lat: ['lat', 'latitude', 'breitengrad'],
  lng: ['lng', 'longitude', 'laengengrad', 'lon'],
  rating_avg: ['rating', 'bewertung', 'rating_avg', 'stars'],
  status: ['status'],
  slug: ['slug', 'url'],
}

function suggestMapping(header: string): string | null {
  const h = header.toLowerCase().trim()
  for (const [field, keywords] of Object.entries(fieldMap)) {
    if (keywords.some(kw => h.includes(kw))) return field
  }
  return null
}

describe('ImportPreview', () => {
  describe('CSV parsing', () => {
    it('should parse comma-separated CSV', () => {
      const csv = 'Name,Type,Rating\nMuseum,landmark,4.5\nPark,park,3.8'
      const { headers, rows } = parseCSV(csv)
      expect(headers).toEqual(['Name', 'Type', 'Rating'])
      expect(rows).toHaveLength(2)
      expect(rows[0]).toEqual(['Museum', 'landmark', '4.5'])
    })

    it('should parse semicolon-separated CSV', () => {
      const csv = 'Name;Beschreibung;Typ\nDom;Ein grosser Dom;landmark'
      const { headers, rows } = parseCSV(csv)
      expect(headers).toEqual(['Name', 'Beschreibung', 'Typ'])
      expect(rows[0][1]).toBe('Ein grosser Dom')
    })

    it('should parse tab-separated TSV', () => {
      const tsv = 'Name\tType\nMuseum\tlandmark'
      const { headers, rows } = parseCSV(tsv)
      expect(headers).toEqual(['Name', 'Type'])
      expect(rows[0]).toEqual(['Museum', 'landmark'])
    })

    it('should strip quotes', () => {
      const csv = '"Name","Type"\n"Museum","landmark"'
      const { headers, rows } = parseCSV(csv)
      expect(headers).toEqual(['Name', 'Type'])
      expect(rows[0]).toEqual(['Museum', 'landmark'])
    })

    it('should handle empty input', () => {
      const { headers, rows } = parseCSV('')
      expect(headers).toEqual([''])
      expect(rows).toHaveLength(0)
    })

    it('should handle header-only CSV', () => {
      const { headers, rows } = parseCSV('Col1,Col2,Col3')
      expect(headers).toHaveLength(3)
      expect(rows).toHaveLength(0)
    })
  })

  describe('field mapping suggestions', () => {
    it('should suggest name for "Titel"', () => {
      expect(suggestMapping('Titel')).toBe('name')
    })

    it('should suggest description for "Beschreibung"', () => {
      expect(suggestMapping('Beschreibung')).toBe('description')
    })

    it('should suggest content_type for "Kategorie"', () => {
      expect(suggestMapping('Kategorie')).toBe('content_type')
    })

    it('should suggest lat for "Breitengrad"', () => {
      expect(suggestMapping('Breitengrad')).toBe('lat')
    })

    it('should suggest lng for "Longitude"', () => {
      expect(suggestMapping('Longitude')).toBe('lng')
    })

    it('should suggest rating_avg for "Rating"', () => {
      expect(suggestMapping('Rating')).toBe('rating_avg')
    })

    it('should suggest tags for "Keywords"', () => {
      expect(suggestMapping('Keywords')).toBe('tags')
    })

    it('should return null for unknown headers', () => {
      expect(suggestMapping('foobar_xyz')).toBeNull()
    })

    it('should be case-insensitive', () => {
      expect(suggestMapping('NAME')).toBe('name')
      expect(suggestMapping('BESCHREIBUNG')).toBe('description')
    })
  })

  describe('duplicate detection', () => {
    it('should detect duplicates by matching name', () => {
      const existingNames = ['Stephansdom', 'Goldenes Dachl', 'Hofburg']
      const importName = 'Stephansdom'
      const isDuplicate = existingNames.some(
        n => n.toLowerCase() === importName.toLowerCase()
      )
      expect(isDuplicate).toBe(true)
    })

    it('should not flag non-duplicates', () => {
      const existingNames = ['Stephansdom', 'Goldenes Dachl']
      const importName = 'Schloss Belvedere'
      const isDuplicate = existingNames.some(
        n => n.toLowerCase() === importName.toLowerCase()
      )
      expect(isDuplicate).toBe(false)
    })
  })
})
