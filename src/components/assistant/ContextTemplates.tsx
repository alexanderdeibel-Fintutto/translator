/**
 * ContextTemplates — Gesprächs-Vorlagen
 *
 * Vor dem Gespräch wählt der Mitarbeiter den Kontext.
 * Die App lädt automatisch die passenden Smart Replies und Phrasen.
 *
 * Vorlagen:
 * - Hotel: Check-in, Check-out, Zimmer-Service, Beschwerde, Notfall
 * - Behörde: Antrag, Termin, Dokumente, Auskunft
 * - Medizin: Aufnahme, Anamnese, Untersuchung, Entlassung
 * - Allgemein: Begrüßung, Auskunft, Verabschiedung
 *
 * Jede Vorlage enthält:
 * - Titel & Icon
 * - Beschreibung (was erwartet den Mitarbeiter)
 * - Starter-Phrasen (erste Sätze die häufig gebraucht werden)
 * - Erwartete Gäste-Themen (für Smart Reply Engine)
 */

import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface ConversationTemplate {
  id: string
  title: string
  icon: string
  description: string
  color: string
  starterPhrases: string[]
  guestTopics: string[]
  category: 'hotel' | 'authority' | 'medical' | 'service' | 'general'
}

export const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  // ── Hotel ─────────────────────────────────────────────────────────────────
  {
    id: 'hotel-checkin',
    title: 'Check-in',
    icon: '🏨',
    description: 'Gast kommt an, Zimmer-Zuweisung, Schlüsselübergabe',
    color: 'blue',
    category: 'hotel',
    starterPhrases: [
      'Herzlich willkommen! Haben Sie eine Reservierung?',
      'Guten Tag! Auf welchen Namen ist die Buchung?',
      'Willkommen! Darf ich Ihren Reisepass oder Ausweis sehen?',
    ],
    guestTopics: ['Reservierung', 'Zimmer', 'Schlüssel', 'Frühstück', 'WLAN', 'Parkplatz', 'Gepäck'],
  },
  {
    id: 'hotel-checkout',
    title: 'Check-out',
    icon: '🧳',
    description: 'Abreise, Rechnung, Feedback',
    color: 'indigo',
    category: 'hotel',
    starterPhrases: [
      'Guten Morgen! Möchten Sie auschecken?',
      'Hier ist Ihre Rechnung. Haben Sie alles in Ordnung gefunden?',
      'Wir hoffen, Sie hatten einen angenehmen Aufenthalt!',
    ],
    guestTopics: ['Rechnung', 'Zahlung', 'Feedback', 'Taxi', 'Gepäck', 'Quittung'],
  },
  {
    id: 'hotel-service',
    title: 'Zimmer-Service',
    icon: '🛎️',
    description: 'Bestellungen, Wünsche, Zimmer-Probleme',
    color: 'violet',
    category: 'hotel',
    starterPhrases: [
      'Guten Tag! Wie kann ich Ihnen helfen?',
      'Was darf ich Ihnen bringen?',
      'Ich kümmere mich sofort darum.',
    ],
    guestTopics: ['Handtücher', 'Kissen', 'Essen', 'Klimaanlage', 'Fernseher', 'Heizung', 'Reinigung'],
  },
  {
    id: 'hotel-complaint',
    title: 'Beschwerde',
    icon: '😟',
    description: 'Unzufriedener Gast, Problem lösen, Entschuldigung',
    color: 'orange',
    category: 'hotel',
    starterPhrases: [
      'Es tut mir sehr leid. Was ist passiert?',
      'Ich verstehe Ihre Frustration. Wir lösen das sofort.',
      'Wir entschuldigen uns für die Unannehmlichkeiten.',
    ],
    guestTopics: ['Lärm', 'Sauberkeit', 'Geruch', 'Defekt', 'Fehler', 'Erstattung', 'Umbuchung'],
  },

  // ── Behörde ────────────────────────────────────────────────────────────────
  {
    id: 'authority-application',
    title: 'Antragstellung',
    icon: '📋',
    description: 'Bürger stellt Antrag, Unterlagen prüfen',
    color: 'slate',
    category: 'authority',
    starterPhrases: [
      'Guten Tag! Was kann ich für Sie tun?',
      'Welchen Antrag möchten Sie stellen?',
      'Haben Sie alle erforderlichen Unterlagen dabei?',
    ],
    guestTopics: ['Antrag', 'Formular', 'Dokumente', 'Ausweis', 'Termin', 'Gebühr', 'Frist'],
  },
  {
    id: 'authority-info',
    title: 'Auskunft',
    icon: '🏛️',
    description: 'Allgemeine Fragen, Zuständigkeiten, Weiterverweisung',
    color: 'slate',
    category: 'authority',
    starterPhrases: [
      'Wie kann ich Ihnen helfen?',
      'Dafür sind wir leider nicht zuständig. Ich verweise Sie an...',
      'Das können Sie online unter... erledigen.',
    ],
    guestTopics: ['Zuständigkeit', 'Öffnungszeiten', 'Adresse', 'Online', 'Wartezeit'],
  },

  // ── Medizin ────────────────────────────────────────────────────────────────
  {
    id: 'medical-intake',
    title: 'Aufnahme',
    icon: '🏥',
    description: 'Patient kommt an, Daten aufnehmen, Versicherung prüfen',
    color: 'green',
    category: 'medical',
    starterPhrases: [
      'Guten Tag! Haben Sie einen Termin?',
      'Haben Sie Ihre Versicherungskarte dabei?',
      'Bitte füllen Sie dieses Formular aus.',
    ],
    guestTopics: ['Termin', 'Versicherung', 'Schmerzen', 'Allergien', 'Medikamente', 'Arzt'],
  },
  {
    id: 'medical-consultation',
    title: 'Anamnese',
    icon: '🩺',
    description: 'Beschwerden erfragen, Symptome dokumentieren',
    color: 'green',
    category: 'medical',
    starterPhrases: [
      'Wo haben Sie Schmerzen?',
      'Seit wann haben Sie diese Beschwerden?',
      'Nehmen Sie regelmäßig Medikamente?',
    ],
    guestTopics: ['Schmerzen', 'Fieber', 'Übelkeit', 'Atemnot', 'Schwindel', 'Medikamente', 'Allergie'],
  },

  // ── Service/Counter ────────────────────────────────────────────────────────
  {
    id: 'service-general',
    title: 'Schalter-Service',
    icon: '🪟',
    description: 'Allgemeiner Schalter-Betrieb, Anfragen bearbeiten',
    color: 'teal',
    category: 'service',
    starterPhrases: [
      'Guten Tag! Wie kann ich helfen?',
      'Bitte nehmen Sie Platz.',
      'Einen Moment bitte, ich schaue das nach.',
    ],
    guestTopics: ['Anfrage', 'Formular', 'Auskunft', 'Termin', 'Dokument', 'Zahlung'],
  },

  // ── Allgemein ──────────────────────────────────────────────────────────────
  {
    id: 'general',
    title: 'Allgemein',
    icon: '💬',
    description: 'Freies Gespräch ohne spezifischen Kontext',
    color: 'gray',
    category: 'general',
    starterPhrases: [
      'Guten Tag! Wie kann ich Ihnen helfen?',
      'Was kann ich für Sie tun?',
      'Bitte sprechen Sie langsam — ich übersetze für Sie.',
    ],
    guestTopics: [],
  },
]

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  violet: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
  orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  slate: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
  green: 'bg-green-500/10 border-green-500/30 text-green-400',
  teal: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  gray: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
}

interface ContextTemplatesProps {
  /** Wird aufgerufen wenn eine Vorlage gewählt wird */
  onSelect: (template: ConversationTemplate) => void
  /** Aktuell gewählte Vorlage */
  selected?: string
  /** Kompakte Darstellung (z.B. im Panel) */
  compact?: boolean
}

export default function ContextTemplates({
  onSelect,
  selected,
  compact = false,
}: ContextTemplatesProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('hotel')

  const categories = [
    { id: 'hotel', label: 'Hotel', icon: '🏨' },
    { id: 'authority', label: 'Behörde', icon: '🏛️' },
    { id: 'medical', label: 'Medizin', icon: '🏥' },
    { id: 'service', label: 'Service', icon: '🪟' },
    { id: 'general', label: 'Allgemein', icon: '💬' },
  ]

  if (compact) {
    // Kompakte Darstellung: alle Vorlagen als kleine Chips
    return (
      <div className="flex flex-wrap gap-1.5">
        {CONVERSATION_TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              selected === t.id
                ? COLOR_MAP[t.color] + ' ring-1 ring-current'
                : 'bg-muted border-border text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <span>{t.icon}</span>
            {t.title}
          </button>
        ))}
      </div>
    )
  }

  // Vollständige Darstellung: nach Kategorien gruppiert
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Wählen Sie eine Vorlage für das Gespräch — die App lädt automatisch passende Phrasen und Vorschläge.
      </p>
      {categories.map(cat => {
        const catTemplates = CONVERSATION_TEMPLATES.filter(t => t.category === cat.id)
        const isExpanded = expandedCategory === cat.id
        return (
          <div key={cat.id} className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium text-sm">{cat.label}</span>
                <span className="text-xs text-muted-foreground">({catTemplates.length})</span>
              </div>
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isExpanded && (
              <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selected === t.id
                        ? COLOR_MAP[t.color] + ' ring-1 ring-current'
                        : 'border-border hover:bg-accent hover:border-accent-foreground/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{t.icon}</span>
                      <span className="font-medium text-sm">{t.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                    {t.starterPhrases.length > 0 && (
                      <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                        z.B. "{t.starterPhrases[0]}"
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * SelectedTemplateBar — zeigt die gewählte Vorlage als kompakte Leiste an
 * Wird oben in der ConversationPage angezeigt
 */
export function SelectedTemplateBar({
  template,
  onClear,
  onStarterPhrase,
}: {
  template: ConversationTemplate
  onClear: () => void
  onStarterPhrase?: (phrase: string) => void
}) {
  const [showPhrases, setShowPhrases] = useState(false)

  return (
    <div className={`rounded-xl border p-2 ${COLOR_MAP[template.color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{template.icon}</span>
          <span className="text-sm font-medium">{template.title}</span>
          <span className="text-xs opacity-70">{template.description}</span>
        </div>
        <div className="flex items-center gap-1">
          {template.starterPhrases.length > 0 && (
            <button
              onClick={() => setShowPhrases(v => !v)}
              className="text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Starter-Phrasen
            </button>
          )}
          <button
            onClick={onClear}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {showPhrases && template.starterPhrases.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {template.starterPhrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => onStarterPhrase?.(phrase)}
              className="text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-left"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
