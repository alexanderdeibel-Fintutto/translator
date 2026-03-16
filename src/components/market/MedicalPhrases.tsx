/**
 * MedicalPhrases — Pre-built medical phrase catalog
 *
 * Common medical phrases organized by category (triage, symptoms, instructions).
 * Designed for quick access during medical consultations.
 */

import { useState } from 'react'
import { Heart, Stethoscope, Pill, AlertTriangle, ChevronDown, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface MedicalPhrase {
  id: string
  text: string
  category: 'triage' | 'symptoms' | 'instructions' | 'emergency'
}

export const MEDICAL_PHRASES: MedicalPhrase[] = [
  // Emergency / Triage
  { id: 'em1', text: 'Haben Sie Schmerzen?', category: 'emergency' },
  { id: 'em2', text: 'Wo tut es weh?', category: 'emergency' },
  { id: 'em3', text: 'Seit wann haben Sie diese Beschwerden?', category: 'emergency' },
  { id: 'em4', text: 'Sind Sie allergisch gegen Medikamente?', category: 'emergency' },
  { id: 'em5', text: 'Nehmen Sie regelmaessig Medikamente ein?', category: 'emergency' },
  { id: 'em6', text: 'Koennen Sie atmen?', category: 'emergency' },
  { id: 'em7', text: 'Wir muessen Sie sofort behandeln.', category: 'emergency' },
  // Symptoms
  { id: 'sy1', text: 'Haben Sie Fieber?', category: 'symptoms' },
  { id: 'sy2', text: 'Haben Sie Uebelkeit oder Erbrechen?', category: 'symptoms' },
  { id: 'sy3', text: 'Haben Sie Durchfall?', category: 'symptoms' },
  { id: 'sy4', text: 'Koennen Sie gut schlafen?', category: 'symptoms' },
  { id: 'sy5', text: 'Haben Sie Kopfschmerzen?', category: 'symptoms' },
  { id: 'sy6', text: 'Ist Ihnen schwindelig?', category: 'symptoms' },
  { id: 'sy7', text: 'Haben Sie Husten?', category: 'symptoms' },
  { id: 'sy8', text: 'Haben Sie Atemnot?', category: 'symptoms' },
  // Instructions
  { id: 'in1', text: 'Bitte nehmen Sie im Wartezimmer Platz.', category: 'instructions' },
  { id: 'in2', text: 'Bitte machen Sie den Oberkoerper frei.', category: 'instructions' },
  { id: 'in3', text: 'Bitte tief einatmen und ausatmen.', category: 'instructions' },
  { id: 'in4', text: 'Wir machen jetzt eine Blutabnahme.', category: 'instructions' },
  { id: 'in5', text: 'Sie bekommen ein Rezept fuer die Apotheke.', category: 'instructions' },
  { id: 'in6', text: 'Kommen Sie in einer Woche zur Kontrolle.', category: 'instructions' },
  { id: 'in7', text: 'Sie muessen nuechtern sein fuer die Untersuchung.', category: 'instructions' },
  // Triage
  { id: 'tr1', text: 'Wie stark sind Ihre Schmerzen von 1 bis 10?', category: 'triage' },
  { id: 'tr2', text: 'Waren Sie in letzter Zeit operiert?', category: 'triage' },
  { id: 'tr3', text: 'Sind Sie schwanger?', category: 'triage' },
  { id: 'tr4', text: 'Haben Sie Ihre Versichertenkarte dabei?', category: 'triage' },
  { id: 'tr5', text: 'Wie heisst Ihr Hausarzt?', category: 'triage' },
]

const CATEGORIES = [
  { key: 'emergency' as const, label: 'Notfall / Akut', icon: AlertTriangle, color: 'text-red-600' },
  { key: 'triage' as const, label: 'Triage / Aufnahme', icon: Stethoscope, color: 'text-blue-600' },
  { key: 'symptoms' as const, label: 'Symptome', icon: Heart, color: 'text-amber-600' },
  { key: 'instructions' as const, label: 'Anweisungen', icon: Pill, color: 'text-green-600' },
]

interface MedicalPhrasesProps {
  onSpeak: (text: string) => void
  className?: string
}

export default function MedicalPhrases({ onSpeak, className = '' }: MedicalPhrasesProps) {
  const [expanded, setExpanded] = useState<string | null>('emergency')

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-semibold flex items-center gap-2 px-1">
        <Stethoscope className="h-4 w-4" />
        Medizinische Phrasen
      </h3>

      {CATEGORIES.map((cat) => {
        const phrases = MEDICAL_PHRASES.filter((p) => p.category === cat.key)
        const isOpen = expanded === cat.key

        return (
          <Card key={cat.key} className="overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : cat.key)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <cat.icon className={`h-4 w-4 ${cat.color}`} />
                {cat.label}
                <span className="text-xs text-muted-foreground">({phrases.length})</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="border-t divide-y">
                {phrases.map((phrase) => (
                  <button
                    key={phrase.id}
                    onClick={() => onSpeak(phrase.text)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1">{phrase.text}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
