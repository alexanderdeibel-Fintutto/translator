/**
 * ConversationSummary — Automatische Gesprächszusammenfassung
 *
 * Nach einem Gespräch generiert die KI eine kompakte Zusammenfassung:
 * - Was wurde besprochen?
 * - Welche Aufgaben entstanden?
 * - Welche Informationen wurden gegeben?
 *
 * Anwendungsfälle:
 * - Übergabe an Kollegen
 * - Protokoll für Behörde / Krankenhaus
 * - CRM-Notiz für Hotel-Software
 *
 * Einbindung: Als Modal/Panel nach Gesprächsende
 */

import { useState, useCallback } from 'react'
import { FileText, Copy, Check, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Message {
  speaker: 'top' | 'bottom'
  original: string
  translated: string
  timestamp: number
}

interface SummaryResult {
  summary: string
  followUps: string[]
  keyInfo: string[]
}

async function generateSummary(
  messages: Message[],
  contextLabel: string,
  staffLang: string
): Promise<SummaryResult> {
  if (messages.length === 0) {
    return { summary: '', followUps: [], keyInfo: [] }
  }

  // Transkript aufbauen
  const transcript = messages
    .map(m => `${m.speaker === 'bottom' ? 'Mitarbeiter' : 'Gast'}: ${m.original}`)
    .join('\n')

  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, context: contextLabel, lang: staffLang }),
    })

    if (!response.ok) throw new Error('API nicht verfügbar')
    return await response.json()
  } catch {
    // Fallback: einfache lokale Zusammenfassung
    return buildLocalSummary(messages)
  }
}

function buildLocalSummary(messages: Message[]): SummaryResult {
  const guestMessages = messages.filter(m => m.speaker === 'top').map(m => m.original)
  const staffMessages = messages.filter(m => m.speaker === 'bottom').map(m => m.original)

  const summary = `Gespräch mit ${messages.length} Nachrichten. Gast: ${guestMessages.length} Nachrichten. Mitarbeiter: ${staffMessages.length} Nachrichten.`

  // Einfache Aufgaben-Erkennung
  const followUpKeywords = ['termin', 'morgen', 'nächste', 'schicken', 'bringen', 'rufen', 'kommen']
  const followUps = staffMessages
    .filter(m => followUpKeywords.some(k => m.toLowerCase().includes(k)))
    .slice(0, 3)

  return { summary, followUps, keyInfo: [] }
}

interface ConversationSummaryProps {
  messages: Message[]
  context: string
  staffLang: string
  /** Ob das Panel standardmäßig ausgeklappt ist */
  defaultExpanded?: boolean
}

export default function ConversationSummary({
  messages,
  context,
  staffLang,
  defaultExpanded = false,
}: ConversationSummaryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (messages.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const summary = await generateSummary(messages, context, staffLang)
      setResult(summary)
    } catch (err) {
      setError('Zusammenfassung konnte nicht erstellt werden.')
    } finally {
      setLoading(false)
    }
  }, [messages, context, staffLang])

  const handleCopy = useCallback(async () => {
    if (!result) return
    const text = [
      result.summary,
      result.followUps.length > 0 ? '\nFolgeaufgaben:\n' + result.followUps.map(f => `• ${f}`).join('\n') : '',
      result.keyInfo.length > 0 ? '\nWichtige Informationen:\n' + result.keyInfo.map(k => `• ${k}`).join('\n') : '',
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }, [result])

  if (messages.length < 2) return null

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Gesprächsnotiz</span>
          <span className="text-xs text-muted-foreground">
            {messages.length} Nachrichten
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {!result && !loading && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={handleGenerate}
            >
              <FileText className="h-3.5 w-3.5" />
              Zusammenfassung erstellen
            </Button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Wird erstellt...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              {/* Zusammenfassung */}
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                {result.summary}
              </div>

              {/* Folgeaufgaben */}
              {result.followUps.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Folgeaufgaben
                  </p>
                  <ul className="space-y-1">
                    {result.followUps.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-violet-600 mt-0.5">→</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Wichtige Infos */}
              {result.keyInfo.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Wichtige Informationen
                  </p>
                  <ul className="space-y-1">
                    {result.keyInfo.map((info, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 mt-0.5">•</span>
                        {info}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aktionen */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-green-600" />Kopiert</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" />Kopieren</>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  Neu erstellen
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
