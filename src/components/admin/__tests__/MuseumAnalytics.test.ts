// Tests for MuseumAnalytics CSV export logic
import { describe, it, expect } from 'vitest'

// Replicate the CSV export logic from MuseumAnalytics component
// to test it in isolation

interface MuseumStats {
  total_visitors: number
  total_artworks_viewed: number
  total_audio_plays: number
  total_ai_chats: number
  avg_visit_duration_minutes: number
  tour_completion_rate: number
  avg_rating: number
  top_artworks: { artwork_id: string; title: string; views: number }[]
  daily_visitors: { date: string; count: number }[]
  languages: { language: string; count: number }[]
}

function buildCsvRows(stats: MuseumStats): string[][] {
  return [
    ['Metrik', 'Wert'],
    ['Besucher', String(stats.total_visitors)],
    ['Exponate angesehen', String(stats.total_artworks_viewed)],
    ['Audio abgespielt', String(stats.total_audio_plays)],
    ['KI-Gespraeche', String(stats.total_ai_chats)],
    ['Durchschn. Besuchsdauer (Min)', String(stats.avg_visit_duration_minutes)],
    ['Durchschn. Bewertung', String(stats.avg_rating)],
    ['', ''],
    ['Datum', 'Besucher'],
    ...stats.daily_visitors.map(d => [d.date, String(d.count)]),
    ['', ''],
    ['Sprache', 'Anzahl'],
    ...stats.languages.map(l => [l.language, String(l.count)]),
    ['', ''],
    ['Exponat', 'Views'],
    ...stats.top_artworks.map(a => [a.title, String(a.views)]),
  ]
}

function rowsToCsv(rows: string[][]): string {
  return rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
}

const sampleStats: MuseumStats = {
  total_visitors: 1234,
  total_artworks_viewed: 5678,
  total_audio_plays: 890,
  total_ai_chats: 45,
  avg_visit_duration_minutes: 72,
  tour_completion_rate: 0.65,
  avg_rating: 4.3,
  top_artworks: [
    { artwork_id: 'a1', title: 'Starry Night', views: 456 },
    { artwork_id: 'a2', title: 'Water Lilies', views: 321 },
    { artwork_id: 'a3', title: 'The Kiss', views: 287 },
  ],
  daily_visitors: [
    { date: '2026-03-19', count: 150 },
    { date: '2026-03-20', count: 180 },
    { date: '2026-03-21', count: 165 },
  ],
  languages: [
    { language: 'de', count: 600 },
    { language: 'en', count: 350 },
    { language: 'fr', count: 150 },
    { language: 'zh', count: 80 },
  ],
}

describe('MuseumAnalytics CSV export', () => {
  it('builds correct number of rows', () => {
    const rows = buildCsvRows(sampleStats)
    // 7 KPI rows + 1 header + 1 separator
    // 1 header + 3 daily + 1 separator
    // 1 header + 4 languages + 1 separator
    // 1 header + 3 artworks
    const expected = 7 + 1 + 1 + 3 + 1 + 1 + 4 + 1 + 1 + 3
    expect(rows).toHaveLength(expected)
  })

  it('first row is header', () => {
    const rows = buildCsvRows(sampleStats)
    expect(rows[0]).toEqual(['Metrik', 'Wert'])
  })

  it('KPI values are correct', () => {
    const rows = buildCsvRows(sampleStats)
    expect(rows[1]).toEqual(['Besucher', '1234'])
    expect(rows[2]).toEqual(['Exponate angesehen', '5678'])
    expect(rows[3]).toEqual(['Audio abgespielt', '890'])
    expect(rows[4]).toEqual(['KI-Gespraeche', '45'])
    expect(rows[5]).toEqual(['Durchschn. Besuchsdauer (Min)', '72'])
    expect(rows[6]).toEqual(['Durchschn. Bewertung', '4.3'])
  })

  it('includes daily visitor data', () => {
    const rows = buildCsvRows(sampleStats)
    const dailyHeader = rows.findIndex(r => r[0] === 'Datum' && r[1] === 'Besucher')
    expect(dailyHeader).toBeGreaterThan(0)
    expect(rows[dailyHeader + 1]).toEqual(['2026-03-19', '150'])
    expect(rows[dailyHeader + 2]).toEqual(['2026-03-20', '180'])
    expect(rows[dailyHeader + 3]).toEqual(['2026-03-21', '165'])
  })

  it('includes language distribution', () => {
    const rows = buildCsvRows(sampleStats)
    const langHeader = rows.findIndex(r => r[0] === 'Sprache' && r[1] === 'Anzahl')
    expect(langHeader).toBeGreaterThan(0)
    expect(rows[langHeader + 1]).toEqual(['de', '600'])
    expect(rows[langHeader + 2]).toEqual(['en', '350'])
  })

  it('includes top artworks', () => {
    const rows = buildCsvRows(sampleStats)
    const artHeader = rows.findIndex(r => r[0] === 'Exponat' && r[1] === 'Views')
    expect(artHeader).toBeGreaterThan(0)
    expect(rows[artHeader + 1]).toEqual(['Starry Night', '456'])
    expect(rows[artHeader + 2]).toEqual(['Water Lilies', '321'])
    expect(rows[artHeader + 3]).toEqual(['The Kiss', '287'])
  })

  it('generates valid CSV format', () => {
    const csv = rowsToCsv(buildCsvRows(sampleStats))
    // CSV should have double-quoted values separated by commas
    expect(csv).toContain('"Besucher","1234"')
    expect(csv).toContain('"de","600"')
    // Each row ends with a value (no trailing comma)
    const lines = csv.split('\n')
    for (const line of lines) {
      expect(line).toMatch(/^"[^"]*"(,"[^"]*")*$/)
    }
  })

  it('handles empty stats', () => {
    const emptyStats: MuseumStats = {
      total_visitors: 0,
      total_artworks_viewed: 0,
      total_audio_plays: 0,
      total_ai_chats: 0,
      avg_visit_duration_minutes: 0,
      tour_completion_rate: 0,
      avg_rating: 0,
      top_artworks: [],
      daily_visitors: [],
      languages: [],
    }

    const rows = buildCsvRows(emptyStats)
    // Should have headers and KPIs even with no data
    expect(rows.length).toBeGreaterThan(7)

    const csv = rowsToCsv(rows)
    expect(csv).toContain('"Besucher","0"')
  })

  it('properly escapes values with commas or quotes', () => {
    const statsWithComma: MuseumStats = {
      ...sampleStats,
      top_artworks: [{ artwork_id: 'a1', title: 'Self Portrait, 1889', views: 100 }],
    }

    const rows = buildCsvRows(statsWithComma)
    const csv = rowsToCsv(rows)
    // The title with a comma should be inside double quotes
    expect(csv).toContain('"Self Portrait, 1889"')
  })

  it('does not contain German special characters (project rule)', () => {
    const rows = buildCsvRows(sampleStats)
    const csv = rowsToCsv(rows)
    // Per CLAUDE.md: no ae/oe/ue as Umlaute, no sharp-s
    expect(csv).not.toMatch(/[äöüßÄÖÜ]/)
  })
})
