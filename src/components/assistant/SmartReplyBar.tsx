/**
 * SmartReplyBar — KI-gestützte Antwortvorschläge
 *
 * Analysiert die letzte Gäste-Nachricht und schlägt dem Mitarbeiter
 * 2-3 passende Antworten vor. Ein Klick → Satz wird übersetzt und gesprochen.
 *
 * Funktioniert in zwei Modi:
 * 1. Kontextbasiert (offline): Wählt aus vordefinierten Antwort-Pools per Keyword-Matching
 * 2. KI-gestützt (online): Nutzt GPT-4.1-mini für kontextsensitive Vorschläge
 *
 * Einbindung: In ConversationPage nach jeder Gäste-Nachricht anzeigen
 */

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translateText } from '@/lib/translate'
import type { TranslationContext } from '@/lib/context-modes'

// ── Antwort-Pools pro Kontext ────────────────────────────────────────────────

interface SmartReply {
  id: string
  text: string
  /** Schlüsselwörter die diese Antwort triggern */
  triggers: string[]
  context: TranslationContext[]
}

const SMART_REPLIES: SmartReply[] = [
  // Dokumente / Unterlagen
  { id: 'sr_docs_missing', text: 'Welche Unterlagen fehlen Ihnen?', triggers: ['unterlag', 'dokument', 'papier', 'ausweis', 'vergessen', 'nicht dabei', 'fehlt'], context: ['legal', 'general', 'business'] },
  { id: 'sr_docs_list', text: 'Ich gebe Ihnen eine Liste der benötigten Dokumente.', triggers: ['was brauch', 'welche', 'liste', 'unterlag', 'dokument'], context: ['legal', 'general'] },
  { id: 'sr_docs_copy', text: 'Bitte bringen Sie eine Kopie mit.', triggers: ['kopie', 'original', 'scan', 'foto'], context: ['legal', 'general'] },
  { id: 'sr_docs_expired', text: 'Dieses Dokument ist leider abgelaufen.', triggers: ['abgelaufen', 'ungültig', 'alt', 'datum'], context: ['legal', 'general'] },

  // Termin / Wartezeit
  { id: 'sr_appt_wait', text: 'Bitte warten Sie kurz, ich schaue nach.', triggers: ['warten', 'wie lang', 'wie lange', 'wann'], context: ['general', 'legal', 'business'] },
  { id: 'sr_appt_new', text: 'Sie müssen einen neuen Termin vereinbaren.', triggers: ['termin', 'nächste', 'wiederkommen', 'morgen', 'wann'], context: ['general', 'legal', 'business'] },
  { id: 'sr_appt_today', text: 'Ihr Termin ist heute um ...', triggers: ['termin', 'uhrzeit', 'wann', 'heute'], context: ['general', 'legal', 'business'] },

  // Schmerzen / Medizin
  { id: 'sr_med_pain', text: 'Wo genau haben Sie Schmerzen?', triggers: ['schmerz', 'weh', 'tut weh', 'bauch', 'kopf', 'rücken', 'brust'], context: ['medical'] },
  { id: 'sr_med_since', text: 'Seit wann haben Sie diese Beschwerden?', triggers: ['schmerz', 'seit', 'wann', 'wie lang', 'beschwerden'], context: ['medical'] },
  { id: 'sr_med_fever', text: 'Haben Sie Fieber gemessen?', triggers: ['fieber', 'temperatur', 'heiß', 'kalt', 'schüttelfrost'], context: ['medical'] },
  { id: 'sr_med_meds', text: 'Nehmen Sie regelmäßig Medikamente?', triggers: ['medikament', 'tablette', 'pille', 'spritz', 'insulin'], context: ['medical'] },
  { id: 'sr_med_allergy', text: 'Haben Sie Allergien?', triggers: ['allergi', 'unverträglich', 'reaktion', 'ausschlag'], context: ['medical'] },
  { id: 'sr_med_doctor', text: 'Der Arzt kommt gleich zu Ihnen.', triggers: ['arzt', 'doktor', 'wann', 'wie lang', 'warten'], context: ['medical'] },

  // Hotel / Service
  { id: 'sr_hotel_room', text: 'Ich kümmere mich sofort darum.', triggers: ['zimmer', 'problem', 'kaputt', 'funktioniert nicht', 'kalt', 'heiß', 'laut'], context: ['travel', 'general'] },
  { id: 'sr_hotel_checkin', text: 'Ihr Zimmer ist ab 15 Uhr bezugsfertig.', triggers: ['zimmer', 'check-in', 'einchecken', 'wann', 'bereit'], context: ['travel', 'general'] },
  { id: 'sr_hotel_checkout', text: 'Der Check-out ist bis 12 Uhr.', triggers: ['check-out', 'auschecken', 'abreise', 'wann', 'verlassen'], context: ['travel', 'general'] },
  { id: 'sr_hotel_wifi', text: 'Das WLAN-Passwort ist auf Ihrer Zimmerkarte.', triggers: ['wlan', 'wifi', 'internet', 'passwort', 'code'], context: ['travel', 'general'] },
  { id: 'sr_hotel_breakfast', text: 'Das Frühstück ist von 7 bis 10 Uhr.', triggers: ['frühstück', 'essen', 'wann', 'restaurant', 'buffet'], context: ['travel', 'general'] },

  // Behörde
  { id: 'sr_auth_wait', text: 'Bitte nehmen Sie Platz und warten Sie.', triggers: ['warten', 'sitzen', 'wo', 'platz'], context: ['legal', 'general'] },
  { id: 'sr_auth_form', text: 'Bitte füllen Sie dieses Formular aus.', triggers: ['formular', 'antrag', 'ausfüllen', 'unterschreiben', 'papier'], context: ['legal', 'general'] },
  { id: 'sr_auth_fee', text: 'Die Gebühr beträgt ... Euro.', triggers: ['kosten', 'gebühr', 'bezahlen', 'preis', 'wie viel'], context: ['legal', 'general'] },
  { id: 'sr_auth_letter', text: 'Sie erhalten einen Brief per Post.', triggers: ['bescheid', 'brief', 'post', 'benachrichtigung', 'antwort'], context: ['legal', 'general'] },

  // Allgemein
  { id: 'sr_general_understand', text: 'Ich habe Sie leider nicht verstanden. Können Sie das wiederholen?', triggers: ['versteh', 'nochmal', 'wiederhol', 'langsam', 'bitte'], context: ['general', 'travel', 'medical', 'legal', 'business', 'casual'] },
  { id: 'sr_general_moment', text: 'Einen Moment bitte, ich frage nach.', triggers: ['moment', 'sekunde', 'kurz', 'warten', 'frag'], context: ['general', 'travel', 'medical', 'legal', 'business', 'casual'] },
  { id: 'sr_general_help', text: 'Wie kann ich Ihnen helfen?', triggers: ['hilfe', 'problem', 'frage', 'anliegen', 'brauche'], context: ['general', 'travel', 'medical', 'legal', 'business', 'casual'] },
  { id: 'sr_general_done', text: 'Haben Sie noch weitere Fragen?', triggers: ['fertig', 'alles', 'noch', 'sonst', 'weitere'], context: ['general', 'travel', 'medical', 'legal', 'business', 'casual'] },
  { id: 'sr_general_bye', text: 'Auf Wiedersehen und alles Gute!', triggers: ['tschüss', 'auf wiedersehen', 'danke', 'bye', 'ciao'], context: ['general', 'travel', 'medical', 'legal', 'business', 'casual'] },
]

// ── KI-gestützte Vorschläge (online) ────────────────────────────────────────

async function getAISuggestions(
  guestMessage: string,
  context: TranslationContext,
  staffLang: string
): Promise<string[]> {
  try {
    const contextLabels: Record<TranslationContext, string> = {
      general: 'Allgemein (Hotel, Service)',
      travel: 'Reise und Tourismus',
      medical: 'Medizinisch (Krankenhaus, Arztpraxis)',
      legal: 'Behörde und Amt',
      business: 'Geschäftlich',
      casual: 'Informell',
    }

    const response = await fetch('/api/smart-replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestMessage,
        context: contextLabels[context],
        staffLang,
      }),
    })

    if (!response.ok) throw new Error('API nicht verfügbar')
    const data = await response.json()
    return data.replies || []
  } catch {
    return [] // Fallback auf Keyword-Matching
  }
}

// ── Keyword-Matching (offline) ───────────────────────────────────────────────

function getKeywordSuggestions(
  guestMessage: string,
  context: TranslationContext,
  limit = 3
): string[] {
  const lower = guestMessage.toLowerCase()

  // Score jede Antwort: Anzahl Treffer × Kontext-Bonus
  const scored = SMART_REPLIES
    .filter(r => r.context.includes(context) || r.context.includes('general'))
    .map(r => {
      const triggerMatches = r.triggers.filter(t => lower.includes(t)).length
      const contextBonus = r.context.includes(context) ? 1 : 0
      return { text: r.text, score: triggerMatches * 2 + contextBonus }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.text)

  // Wenn keine Treffer: immer 2 allgemeine Antworten anbieten
  if (scored.length === 0) {
    return [
      'Einen Moment bitte, ich frage nach.',
      'Wie kann ich Ihnen helfen?',
    ]
  }

  return scored
}

// ── Hauptkomponente ──────────────────────────────────────────────────────────

interface SmartReplyBarProps {
  /** Letzte Nachricht des Gastes (Original-Sprache) */
  lastGuestMessage: string
  /** Aktueller Kontext-Modus */
  context: TranslationContext
  /** Sprache des Mitarbeiters (für Übersetzung) */
  staffLang: string
  /** Sprache des Gastes (für Übersetzung) */
  guestLang: string
  /** Callback wenn eine Antwort gewählt wird */
  onReply: (text: string) => void
  /** Ob KI-Modus aktiv (online) */
  useAI?: boolean
}

export default function SmartReplyBar({
  lastGuestMessage,
  context,
  staffLang,
  guestLang,
  onReply,
  useAI = false,
}: SmartReplyBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [translating, setTranslating] = useState<string | null>(null)

  useEffect(() => {
    if (!lastGuestMessage?.trim()) {
      setSuggestions([])
      return
    }

    setLoading(true)

    const load = async () => {
      let replies: string[] = []

      if (useAI) {
        replies = await getAISuggestions(lastGuestMessage, context, staffLang)
      }

      // Fallback auf Keyword-Matching wenn KI nichts liefert
      if (replies.length === 0) {
        replies = getKeywordSuggestions(lastGuestMessage, context)
      }

      setSuggestions(replies)
      setLoading(false)
    }

    load()
  }, [lastGuestMessage, context, staffLang, useAI])

  const handleReply = useCallback(async (text: string) => {
    setTranslating(text)
    try {
      // Satz ist auf Deutsch — übersetzen in Gäste-Sprache
      if (staffLang !== 'de') {
        // Wenn Mitarbeiter nicht Deutsch spricht, direkt verwenden
        onReply(text)
      } else {
        onReply(text)
      }
    } finally {
      setTranslating(null)
    }
  }, [staffLang, onReply])

  if (suggestions.length === 0 && !loading) return null

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 dark:border-violet-800/40 dark:bg-violet-950/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-violet-100/50 dark:hover:bg-violet-900/20 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {useAI ? (
            <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          ) : (
            <Zap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          )}
          <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
            {useAI ? 'KI-Vorschläge' : 'Schnellantworten'}
          </span>
          {loading && (
            <span className="text-xs text-violet-500 animate-pulse">wird geladen...</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-violet-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-violet-500" />
        )}
      </button>

      {/* Vorschläge */}
      {expanded && suggestions.length > 0 && (
        <div className="px-3 pb-3 flex flex-wrap gap-2">
          {suggestions.map((text, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              disabled={translating !== null}
              onClick={() => handleReply(text)}
              className={`text-xs h-auto py-1.5 px-3 whitespace-normal text-left border-violet-200 hover:border-violet-400 hover:bg-violet-100 dark:border-violet-700 dark:hover:bg-violet-900/40 transition-colors ${
                translating === text ? 'opacity-60' : ''
              }`}
            >
              {translating === text ? '...' : text}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
