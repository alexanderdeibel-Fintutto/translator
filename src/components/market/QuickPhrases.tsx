/**
 * Quick Phrases Panel
 *
 * Pre-translated phrase buttons for common situations.
 * Speaker taps a phrase → it gets translated and spoken aloud.
 *
 * Used by: authority-clerk, ngo-helper
 */

import { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface Phrase {
  id: string
  /** German original */
  text: string
  /** Category for grouping */
  category: string
  /** Optional icon hint */
  icon?: string
}

interface QuickPhrasesProps {
  phrases: Phrase[]
  onSpeak: (text: string) => void
  /** Title of the panel */
  title?: string
  /** Whether the panel starts expanded */
  defaultExpanded?: boolean
}

export default function QuickPhrases({
  phrases,
  onSpeak,
  title = 'Schnellzugriff',
  defaultExpanded = false,
}: QuickPhrasesProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  // Group phrases by category
  const grouped = phrases.reduce<Record<string, Phrase[]>>((acc, phrase) => {
    if (!acc[phrase.category]) acc[phrase.category] = []
    acc[phrase.category].push(phrase)
    return acc
  }, {})

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{title}</span>
          <span className="text-xs text-muted-foreground">({phrases.length} Saetze)</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {Object.entries(grouped).map(([category, categoryPhrases]) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {categoryPhrases.map(phrase => (
                  <Button
                    key={phrase.id}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                    onClick={() => onSpeak(phrase.text)}
                  >
                    <Volume2 className="h-3 w-3 mr-1.5 shrink-0" />
                    {phrase.text}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Pre-defined phrase sets ──────────────────────────────────

export const AUTHORITY_PHRASES: Phrase[] = [
  // Begruessung
  { id: 'a1', text: 'Bitte nehmen Sie Platz.', category: 'Begruessung' },
  { id: 'a2', text: 'Haben Sie einen Termin?', category: 'Begruessung' },
  { id: 'a3', text: 'Ihr Termin ist um ...', category: 'Begruessung' },
  { id: 'a4', text: 'Bitte warten Sie, bis Sie aufgerufen werden.', category: 'Begruessung' },

  // Dokumente
  { id: 'a5', text: 'Bitte zeigen Sie mir Ihren Ausweis.', category: 'Dokumente' },
  { id: 'a6', text: 'Haben Sie alle Unterlagen dabei?', category: 'Dokumente' },
  { id: 'a7', text: 'Bitte bringen Sie folgende Unterlagen mit:', category: 'Dokumente' },
  { id: 'a8', text: 'Bitte unterschreiben Sie hier.', category: 'Dokumente' },
  { id: 'a9', text: 'Ich brauche eine Kopie davon.', category: 'Dokumente' },
  { id: 'a10', text: 'Dieses Dokument ist abgelaufen.', category: 'Dokumente' },

  // Verfahren
  { id: 'a11', text: 'Der Antrag wird bearbeitet.', category: 'Verfahren' },
  { id: 'a12', text: 'Sie erhalten einen Bescheid per Post.', category: 'Verfahren' },
  { id: 'a13', text: 'Die Bearbeitungszeit betraegt circa ... Wochen.', category: 'Verfahren' },
  { id: 'a14', text: 'Sie muessen einen neuen Termin vereinbaren.', category: 'Verfahren' },
  { id: 'a15', text: 'Bitte bezahlen Sie die Gebuehr an der Kasse.', category: 'Verfahren' },

  // Verabschiedung
  { id: 'a16', text: 'Haben Sie noch Fragen?', category: 'Verabschiedung' },
  { id: 'a17', text: 'Bitte kommen Sie wieder, wenn Sie alle Unterlagen haben.', category: 'Verabschiedung' },
  { id: 'a18', text: 'Auf Wiedersehen und alles Gute.', category: 'Verabschiedung' },
]

export const NGO_EMERGENCY_PHRASES: Phrase[] = [
  // Medizinisch
  { id: 'n1', text: 'Haben Sie Schmerzen?', category: 'Medizinisch' },
  { id: 'n2', text: 'Brauchen Sie einen Arzt?', category: 'Medizinisch' },
  { id: 'n3', text: 'Nehmen Sie Medikamente?', category: 'Medizinisch' },
  { id: 'n4', text: 'Sind Sie schwanger?', category: 'Medizinisch' },
  { id: 'n5', text: 'Wir rufen jetzt einen Krankenwagen.', category: 'Medizinisch' },

  // Sicherheit
  { id: 'n6', text: 'Sie sind hier sicher.', category: 'Sicherheit' },
  { id: 'n7', text: 'Niemand wird Sie hier verletzen.', category: 'Sicherheit' },
  { id: 'n8', text: 'Moechten Sie die Polizei rufen?', category: 'Sicherheit' },
  { id: 'n9', text: 'Wurden Sie bedroht oder verletzt?', category: 'Sicherheit' },

  // Grundbeduerfnisse
  { id: 'n10', text: 'Haben Sie Hunger oder Durst?', category: 'Grundbeduerfnisse' },
  { id: 'n11', text: 'Brauchen Sie einen Schlafplatz?', category: 'Grundbeduerfnisse' },
  { id: 'n12', text: 'Brauchen Sie Kleidung?', category: 'Grundbeduerfnisse' },
  { id: 'n13', text: 'Wo sind Ihre Kinder?', category: 'Grundbeduerfnisse' },
  { id: 'n14', text: 'Haben Sie Familie hier?', category: 'Grundbeduerfnisse' },

  // Beratung
  { id: 'n15', text: 'Ich bin Ihr Berater. Ich helfe Ihnen.', category: 'Beratung' },
  { id: 'n16', text: 'Alles, was Sie mir sagen, ist vertraulich.', category: 'Beratung' },
  { id: 'n17', text: 'Haben Sie einen Aufenthaltstitel?', category: 'Beratung' },
  { id: 'n18', text: 'Wann sind Sie in Deutschland angekommen?', category: 'Beratung' },
  { id: 'n19', text: 'Ich vereinbare einen Termin fuer Sie.', category: 'Beratung' },
  { id: 'n20', text: 'Kommen Sie morgen wieder. Wir helfen Ihnen weiter.', category: 'Beratung' },
]
