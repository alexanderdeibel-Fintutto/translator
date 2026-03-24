/**
 * Cultural Hints — NGO Market
 *
 * Shows contextual cultural notes based on the client's language/region.
 * Helps social workers understand cultural context for better communication.
 */

import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface CulturalHint {
  topic: string
  hint: string
}

/** Cultural hints indexed by language code */
const CULTURAL_HINTS: Record<string, CulturalHint[]> = {
  ar: [
    { topic: 'Begruesssung', hint: 'Handschlag zwischen Mann und Frau nicht immer ueblich. Abwarten, ob die Hand angeboten wird.' },
    { topic: 'Blickkontakt', hint: 'Langer direkter Blickkontakt kann als unhoefllich oder aggressiv empfunden werden, besonders gegenueber Aelteren.' },
    { topic: 'Ja/Nein', hint: 'Aus Hoeflllichkeit wird manchmal "Ja" gesagt, auch wenn "Nein" gemeint ist. Bei wichtigen Fragen rueckversichern.' },
    { topic: 'Familie', hint: 'Familienaelteste haben oft Entscheidungsautoritaet. Moeglicherweise muss ein Familienmitglied einbezogen werden.' },
    { topic: 'Ramadan', hint: 'Waehrend des Ramadan wird gefastet. Termine moeglichst nicht auf den spaeteren Nachmittag legen.' },
  ],
  fa: [
    { topic: 'Hoeflichkeit', hint: '"Taarof" — formelle Hoeflichkeit ist zentral. Angebote werden oft erst beim dritten Mal angenommen.' },
    { topic: 'Vertrauen', hint: 'Vertrauensaufbau braucht Zeit. Smalltalk und persoenliche Anteilnahme sind wichtig.' },
    { topic: 'Begruesssung', hint: 'Die rechte Hand auf die Brust legen ist eine respektvolle Geste.' },
    { topic: 'Bildung', hint: 'Bildung hat einen sehr hohen Stellenwert. Viele iranische Gefluechtete haben akademische Hintergruende.' },
  ],
  tr: [
    { topic: 'Gastfreundschaft', hint: 'Tee oder Getraenke anzubieten ist ein Zeichen von Respekt und Gastfreundschaft.' },
    { topic: 'Ehre', hint: 'Das Konzept "Namus" (Ehre) ist wichtig. Themen rund um Familie sensibel ansprechen.' },
    { topic: 'Alter', hint: 'Aeltere Personen werden mit besonderem Respekt behandelt. Sie werden oft zuerst begruesst.' },
  ],
  uk: [
    { topic: 'Trauma', hint: 'Viele ukrainische Gefluechtete haben Kriegstraumata. Sensibel mit Geraeuschen und ploetzlichen Situationen umgehen.' },
    { topic: 'Selbststaendigkeit', hint: 'Hoher Wert auf Eigenstaendigkeit und Unabhaengigkeit. Hilfe wird manchmal nicht leicht angenommen.' },
    { topic: 'Bildung', hint: 'Hohes Bildungsniveau ist verbreitet. Berufliche Qualifikationen werden oft nicht anerkannt — frustierend fuer Betroffene.' },
  ],
  so: [
    { topic: 'Clan', hint: 'Clan-Zugehoerigkeit ist wichtig. Vermeiden Sie die Frage direkt — sie kann politisch sensibel sein.' },
    { topic: 'Oralitaet', hint: 'Somalisch hat erst seit 1972 eine Schriftform. Muendliche Kommunikation und Geschichtenerzaehlen sind zentral.' },
    { topic: 'Zeit', hint: 'Zeitverstaendnis kann flexibler sein. Puentklichkeit ist kulturell nicht immer prioritaer.' },
  ],
  ti: [
    { topic: 'Religion', hint: 'Die meisten Eritreer sind orthodoxe Christen oder Muslime. Religioeseesse Feiertage respektieren.' },
    { topic: 'Autoritaet', hint: 'Erfahrungen mit autoritaeren Strukturen koennen zu Misstrauen gegenueber Behoerden fuehren.' },
    { topic: 'Familiie', hint: 'Enge Familienbindungen auch ueber grosse Distanzen. Geldtransfers an Familie im Heimatland sind ueblich.' },
  ],
  ps: [
    { topic: 'Pashtunwali', hint: 'Ehrenkodex mit Schwerpunkt auf Gastfreundschaft, Schutz und Ehre. Respektvoller Umgang ist zentral.' },
    { topic: 'Gender', hint: 'Getrennte Beratung fuer Maenner und Frauen kann bevorzugt werden. Nachfragen.' },
    { topic: 'Konflikt', hint: 'Direkte Konfrontation vermeiden. Vermittlung durch Dritte ist kulturell verankert.' },
  ],
}

interface CulturalHintsProps {
  /** The client's language code */
  clientLang: string
}

export default function CulturalHints({ clientLang }: CulturalHintsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const langCode = clientLang.split('-')[0].toLowerCase()
  const hints = CULTURAL_HINTS[langCode]

  if (!hints) return null

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Kulturelle Hinweise</span>
          <span className="text-xs text-muted-foreground">
            ({langCode.toUpperCase()})
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3">
          {hints.map((hint, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {hint.topic}
              </p>
              <p className="text-sm text-muted-foreground">{hint.hint}</p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground/60 italic pt-1">
            Hinweise sind allgemeine Orientierung — jede Person ist individuell.
          </p>
        </div>
      )}
    </Card>
  )
}
