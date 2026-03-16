/**
 * Transcript Export — Authority Market
 *
 * Exports the full session transcript as a downloadable document.
 * Includes metadata (date, session code, languages) and
 * bilingual transcript with timestamps.
 */

import { useState } from 'react'
import { FileDown, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TranslationChunk } from '@/lib/session'

interface TranscriptExportProps {
  chunks: TranslationChunk[]
  sessionCode: string
  sourceLang: string
  targetLang: string
}

export default function TranscriptExport({
  chunks,
  sessionCode,
  sourceLang,
  targetLang,
}: TranscriptExportProps) {
  const [copied, setCopied] = useState(false)

  const finalChunks = chunks.filter((c) => c.isFinal)

  const generateTranscript = (): string => {
    const date = new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const lines = [
      '=== GESPRAECHSPROTOKOLL ===',
      '',
      `Datum: ${date}`,
      `Session: ${sessionCode}`,
      `Sprachen: ${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}`,
      `Anzahl Saetze: ${finalChunks.length}`,
      '',
      '--- Transkript ---',
      '',
    ]

    finalChunks.forEach((chunk, i) => {
      const time = new Date(chunk.timestamp).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      lines.push(`[${time}] ${sourceLang.toUpperCase()}: ${chunk.sourceText}`)
      lines.push(`         ${targetLang.toUpperCase()}: ${chunk.translatedText}`)
      lines.push('')
    })

    lines.push('=========================')
    lines.push('')
    lines.push('Dieses Protokoll wurde automatisch erstellt.')
    lines.push('Keine Daten werden dauerhaft gespeichert (DSGVO-konform).')

    return lines.join('\n')
  }

  const handleDownload = () => {
    const text = generateTranscript()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `protokoll-${sessionCode}-${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleCopy = async () => {
    const text = generateTranscript()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (finalChunks.length === 0) return null

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-1.5 text-xs"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Kopiert' : 'Protokoll kopieren'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-1.5 text-xs"
      >
        <FileDown className="h-3 w-3" />
        Herunterladen
      </Button>
    </div>
  )
}
