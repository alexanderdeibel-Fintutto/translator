/**
 * Counseling Protocol — NGO Market
 *
 * Generates a session protocol/summary for counseling sessions.
 * Social workers can add notes, categorize the session, and
 * export the protocol as text or PDF-ready format.
 */

import { useState } from 'react'
import { ClipboardList, Download, Copy, Check, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { TranslationChunk } from '@/lib/session'

const SESSION_CATEGORIES = [
  'Erstberatung',
  'Asylverfahren',
  'Aufenthalt',
  'Sozialleistungen',
  'Wohnung',
  'Gesundheit',
  'Bildung / Schule',
  'Arbeit / Ausbildung',
  'Familiennachzug',
  'Sonstiges',
]

interface CounselingProtocolProps {
  /** Translation chunks from the session */
  chunks: TranslationChunk[]
  /** Session code */
  sessionCode: string
  /** Source language */
  sourceLang: string
}

export default function CounselingProtocol({
  chunks,
  sessionCode,
  sourceLang,
}: CounselingProtocolProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [followUps, setFollowUps] = useState<string[]>([])
  const [newFollowUp, setNewFollowUp] = useState('')
  const [copied, setCopied] = useState(false)

  const addFollowUp = () => {
    if (!newFollowUp.trim()) return
    setFollowUps([...followUps, newFollowUp.trim()])
    setNewFollowUp('')
  }

  const removeFollowUp = (index: number) => {
    setFollowUps(followUps.filter((_, i) => i !== index))
  }

  const generateProtocol = (): string => {
    const date = new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const transcript = chunks
      .filter((c) => c.isFinal)
      .map((c) => `  ${c.sourceText}`)
      .join('\n')

    const lines = [
      '=== BERATUNGSPROTOKOLL ===',
      '',
      `Datum: ${date}`,
      `Session: ${sessionCode}`,
      `Sprache: ${sourceLang.toUpperCase()}`,
      category ? `Kategorie: ${category}` : '',
      '',
      '--- Gespraechsverlauf ---',
      transcript || '  (kein Transkript verfuegbar)',
      '',
    ]

    if (notes.trim()) {
      lines.push('--- Notizen ---', notes.trim(), '')
    }

    if (followUps.length > 0) {
      lines.push('--- Naechste Schritte ---')
      followUps.forEach((fu, i) => lines.push(`  ${i + 1}. ${fu}`))
      lines.push('')
    }

    lines.push('=========================')
    return lines.filter((l) => l !== undefined).join('\n')
  }

  const handleCopy = async () => {
    const text = generateProtocol()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = generateProtocol()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `protokoll-${sessionCode}-${new Date().toISOString().slice(0, 10)}.txt`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5"
      >
        <ClipboardList className="h-3.5 w-3.5" />
        Protokoll
      </Button>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium">Beratungsprotokoll</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
        <div className="flex flex-wrap gap-1.5">
          {SESSION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                category === cat
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-background border-border hover:bg-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Notizen</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Wichtige Informationen, Beobachtungen..."
          rows={3}
          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm resize-y"
        />
      </div>

      {/* Follow-ups */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Naechste Schritte</label>
        {followUps.map((fu, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{i + 1}.</span>
            <span className="flex-1">{fu}</span>
            <button onClick={() => removeFollowUp(i)} className="p-0.5 hover:bg-muted rounded">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFollowUp}
            onChange={(e) => setNewFollowUp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFollowUp()}
            placeholder="Schritt hinzufuegen..."
            className="flex-1 px-2 py-1 border rounded text-sm bg-background"
          />
          <Button variant="ghost" size="sm" onClick={addFollowUp} className="h-8 px-2">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Export */}
      <div className="flex gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 gap-1 text-xs">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Kopiert' : 'Kopieren'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 gap-1 text-xs">
          <Download className="h-3 w-3" />
          Herunterladen
        </Button>
      </div>
    </Card>
  )
}
