// Session transcript generation for live sessions
// Generates downloadable text transcripts after a live session

import { getLanguageByCode } from './languages'
import type { TranslationChunk } from './session'

export interface TranscriptOptions {
  sessionCode: string
  sourceLanguage: string
  chunks: TranslationChunk[]
  listenerCount?: number
  languageCount?: number
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Generate a plain text transcript from a live session.
 */
export function generateTranscript(opts: TranscriptOptions): string {
  const { sessionCode, sourceLanguage, chunks, listenerCount, languageCount } = opts
  const sourceLang = getLanguageByCode(sourceLanguage)
  const now = Date.now()
  const firstChunk = chunks[0]
  const lastChunk = chunks[chunks.length - 1]
  const startTime = firstChunk?.timestamp || now
  const endTime = lastChunk?.timestamp || now
  const durationMin = Math.round((endTime - startTime) / 60000)

  // Collect all unique target languages
  const targetLangs = new Set(chunks.map(c => c.targetLanguage))

  let text = ''
  text += '═══════════════════════════════════════════════════\n'
  text += '  GUIDETRANSLATOR — Session-Protokoll\n'
  text += '═══════════════════════════════════════════════════\n\n'

  text += `Session:       ${sessionCode}\n`
  text += `Datum:         ${formatDate(startTime)}\n`
  text += `Uhrzeit:       ${formatTime(startTime)} – ${formatTime(endTime)}\n`
  text += `Dauer:         ${durationMin > 0 ? durationMin : '<1'} Minuten\n`
  text += `Ausgangssprache: ${sourceLang?.flag || ''} ${sourceLang?.name || sourceLanguage}\n`
  if (listenerCount !== undefined) {
    text += `Zuhörer:       ${listenerCount}\n`
  }
  if (languageCount !== undefined || targetLangs.size > 0) {
    text += `Sprachen:      ${languageCount || targetLangs.size}\n`
  }

  text += '\n───────────────────────────────────────────────────\n'
  text += '  Transkript\n'
  text += '───────────────────────────────────────────────────\n\n'

  // Group chunks by source text (multiple translations of same source)
  const grouped = new Map<string, TranslationChunk[]>()
  for (const chunk of chunks) {
    const key = `${chunk.timestamp}-${chunk.sourceText}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(chunk)
  }

  for (const [, group] of grouped) {
    const first = group[0]
    const time = formatTime(first.timestamp)
    const srcLang = getLanguageByCode(first.sourceLang)

    text += `[${time}] ${srcLang?.flag || ''} ${first.sourceText}\n`

    for (const chunk of group) {
      const tgtLang = getLanguageByCode(chunk.targetLanguage)
      text += `         ${tgtLang?.flag || ''} [${chunk.targetLanguage.toUpperCase()}] ${chunk.translatedText}\n`
    }
    text += '\n'
  }

  text += '───────────────────────────────────────────────────\n'
  text += `Generiert am ${formatDate(now)} um ${formatTime(now)}\n`
  text += 'guidetranslator.com | Ein Produkt von fintutto.cloud\n'
  text += '═══════════════════════════════════════════════════\n'

  return text
}

/**
 * Trigger a download of the transcript as a text file.
 */
export function downloadTranscript(opts: TranscriptOptions): void {
  const text = generateTranscript(opts)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `GuideTranslator-Protokoll-${opts.sessionCode}-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
