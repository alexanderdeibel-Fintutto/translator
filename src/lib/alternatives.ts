// Word alternatives / synonym suggestions using MyMemory TM matches
// Fetches translation memory matches and extracts alternative translations

const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

export interface Alternative {
  text: string
  match: number  // 0-1 quality score
  source: string // where it came from
}

/**
 * Fetch alternative translations from MyMemory translation memory
 * Returns different translation suggestions beyond the primary result
 */
export async function fetchAlternatives(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<Alternative[]> {
  if (!text.trim()) return []

  try {
    const langPair = `${sourceLang}|${targetLang}`
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}&mt=1`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) return []

    const data = await response.json()

    const alternatives: Alternative[] = []
    const seen = new Set<string>()

    // Primary translation
    if (data.responseData?.translatedText) {
      seen.add(data.responseData.translatedText.toLowerCase())
    }

    // TM matches — these contain alternative translations from other users
    if (data.matches && Array.isArray(data.matches)) {
      for (const match of data.matches) {
        const text = match.translation?.trim()
        if (!text) continue
        const lower = text.toLowerCase()
        if (seen.has(lower)) continue
        seen.add(lower)

        alternatives.push({
          text,
          match: typeof match.match === 'number' ? match.match : parseFloat(match.match) || 0,
          source: match['created-by'] || 'TM',
        })
      }
    }

    // Sort by match quality, take top 5
    return alternatives
      .sort((a, b) => b.match - a.match)
      .slice(0, 5)
  } catch {
    return []
  }
}
