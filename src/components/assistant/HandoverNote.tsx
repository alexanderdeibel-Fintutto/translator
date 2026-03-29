/**
 * HandoverNote — Übergabe-Notiz
 *
 * Generiert nach dem Gespräch automatisch eine strukturierte Übergabe-Notiz
 * für Kollegen, CRM-Systeme oder Protokolle.
 *
 * Inhalt der Notiz:
 * - Datum, Uhrzeit, Dauer
 * - Sprache des Gastes
 * - Gesprächs-Zusammenfassung (3-5 Sätze)
 * - Erkannte Folgeaufgaben
 * - Wichtige Informationen (Name, Zimmer, Anliegen)
 *
 * Export: Kopieren, E-Mail, oder in CRM-Feld einfügen
 */

import { useState } from 'react'
import { FileText, Copy, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface ConversationMessage {
  role: 'staff' | 'guest'
  text: string
  translation?: string
  timestamp: number
}

interface HandoverNoteProps {
  messages: ConversationMessage[]
  guestLanguage?: string
  staffName?: string
  location?: string
  /** Wird aufgerufen wenn Notiz generiert wurde */
  onGenerated?: (note: string) => void
}

export default function HandoverNote({
  messages,
  guestLanguage = 'Unbekannt',
  staffName,
  location,
  onGenerated,
}: HandoverNoteProps) {
  const [note, setNote] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  // Nur anzeigen wenn genug Nachrichten vorhanden
  if (messages.length < 3) return null

  const generateNote = async () => {
    setLoading(true)
    try {
      const generated = await buildHandoverNote(messages, guestLanguage, staffName, location)
      setNote(generated)
      setExpanded(true)
      onGenerated?.(generated)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!note) return
    navigator.clipboard.writeText(note).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => note ? setExpanded(v => !v) : generateNote()}
        className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
        disabled={loading}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Übergabe-Notiz</span>
          {note && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Bereit</span>
          )}
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : note ? (
          expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <span className="text-xs text-muted-foreground">Generieren</span>
        )}
      </button>

      {expanded && note && (
        <div className="px-3 pb-3 space-y-2">
          <pre className="text-xs font-mono bg-muted/50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed border">
            {note}
          </pre>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Kopieren
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNote}
              disabled={loading}
              className="gap-1.5"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : '↻'}
              Neu
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Notiz-Generator ──────────────────────────────────────────────────────────

async function buildHandoverNote(
  messages: ConversationMessage[],
  guestLanguage: string,
  staffName?: string,
  location?: string
): Promise<string> {
  const now = new Date()
  const dateStr = now.toLocaleDateString('de-DE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  
  const durationMin = messages.length > 0
    ? Math.round((now.getTime() - messages[0].timestamp) / 60000)
    : 0

  // Gesprächsinhalt für KI aufbereiten
  const transcript = messages
    .map(m => `${m.role === 'staff' ? 'Mitarbeiter' : 'Gast'}: ${m.text}`)
    .join('\n')

  let summary = ''
  let tasks: string[] = []

  try {
    // KI-Zusammenfassung
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, lang: 'de' }),
    })
    if (response.ok) {
      const data = await response.json()
      summary = data.summary || ''
      tasks = data.tasks || []
    }
  } catch {}

  // Fallback: einfache lokale Zusammenfassung
  if (!summary) {
    const guestMessages = messages.filter(m => m.role === 'guest')
    summary = guestMessages.length > 0
      ? `Gast hatte ein Anliegen in ${guestLanguage}. ${guestMessages.length} Nachrichten ausgetauscht.`
      : 'Kurzes Gespräch ohne spezifisches Anliegen.'
  }

  // Notiz zusammenbauen
  const lines = [
    `═══════════════════════════════════`,
    `ÜBERGABE-NOTIZ`,
    `═══════════════════════════════════`,
    `Datum:      ${dateStr}`,
    `Uhrzeit:    ${timeStr} Uhr`,
    `Dauer:      ca. ${durationMin} Minuten`,
    `Sprache:    ${guestLanguage}`,
    staffName ? `Mitarbeiter: ${staffName}` : null,
    location ? `Ort/Station: ${location}` : null,
    `───────────────────────────────────`,
    `ZUSAMMENFASSUNG:`,
    summary,
    tasks.length > 0 ? `───────────────────────────────────` : null,
    tasks.length > 0 ? `FOLGEAUFGABEN:` : null,
    ...tasks.map(t => `  ☐ ${t}`),
    `═══════════════════════════════════`,
  ].filter(Boolean).join('\n')

  return lines
}
