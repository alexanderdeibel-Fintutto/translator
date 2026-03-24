/**
 * Vocabulary Export — School Market
 *
 * Extracts unique words from live session translations and exports
 * them as a vocabulary list. Teachers can download as CSV for students.
 */

import { useState, useMemo } from 'react'
import { BookOpen, Download, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { TranslationChunk } from '@/lib/session'

interface VocabExportProps {
  /** Translation chunks from the session */
  chunks: TranslationChunk[]
  /** Source language (teacher's) */
  sourceLang: string
  /** Target language (student's) */
  targetLang: string
}

interface VocabEntry {
  source: string
  translated: string
}

export default function VocabExport({
  chunks,
  sourceLang,
  targetLang,
}: VocabExportProps) {
  const [copied, setCopied] = useState(false)

  // Extract unique word pairs from chunks
  const vocabList = useMemo((): VocabEntry[] => {
    const seen = new Set<string>()
    const entries: VocabEntry[] = []

    for (const chunk of chunks) {
      if (!chunk.isFinal) continue
      const sourceWords = chunk.sourceText.split(/\s+/).filter(Boolean)
      const translatedWords = chunk.translatedText.split(/\s+/).filter(Boolean)

      // Pair up words (simple alignment — one-to-one)
      const len = Math.min(sourceWords.length, translatedWords.length)
      for (let i = 0; i < len; i++) {
        const src = sourceWords[i]
          .replace(/[.,!?;:'"()\[\]{}]/g, '')
          .toLowerCase()
          .trim()
        const tgt = translatedWords[i]
          .replace(/[.,!?;:'"()\[\]{}\u060C\u061B\u061F]/g, '')
          .trim()
        if (src && tgt && src.length > 2 && !seen.has(src)) {
          seen.add(src)
          entries.push({ source: src, translated: tgt })
        }
      }
    }

    return entries
  }, [chunks])

  const handleDownloadCSV = () => {
    const header = `${sourceLang.toUpperCase()},${targetLang.toUpperCase()}\n`
    const rows = vocabList
      .map((v) => `"${v.source}","${v.translated}"`)
      .join('\n')
    const csv = header + rows
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `vokabeln-${sourceLang}-${targetLang}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleCopy = async () => {
    const text = vocabList
      .map((v) => `${v.source} — ${v.translated}`)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (vocabList.length === 0) return null

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">
            Vokabeln ({vocabList.length})
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="gap-1 h-7 text-xs"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Kopiert' : 'Kopieren'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            className="gap-1 h-7 text-xs"
          >
            <Download className="h-3 w-3" />
            CSV
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="max-h-40 overflow-y-auto space-y-1">
        {vocabList.slice(0, 20).map((v, i) => (
          <div key={i} className="flex items-center text-xs">
            <span className="w-1/2 text-muted-foreground">{v.source}</span>
            <span className="w-1/2 font-medium">{v.translated}</span>
          </div>
        ))}
        {vocabList.length > 20 && (
          <p className="text-xs text-muted-foreground">
            ... und {vocabList.length - 20} weitere
          </p>
        )}
      </div>
    </Card>
  )
}
