/**
 * EmergencyMode — Notfall-Modus
 *
 * Ein roter Button öffnet sofort ein Overlay mit den wichtigsten
 * Notfall-Phrasen in der Gäste-Sprache — ohne Tippen, ohne Suchen.
 *
 * Kategorien:
 * - Medizinisch: "Rufen Sie einen Arzt!", "Wo tut es weh?"
 * - Sicherheit: "Bleiben Sie ruhig.", "Wir rufen die Polizei."
 * - Feuer/Evakuierung: "Verlassen Sie das Gebäude sofort!"
 * - Allgemein: "Ich rufe Hilfe.", "Alles wird gut."
 *
 * Einbindung: Als floating Button in ConversationPage (unten rechts)
 */

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Phone, Heart, Shield, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmergencyPhrase {
  id: string
  text: string
  category: 'medical' | 'safety' | 'fire' | 'general'
  priority: number
}

const EMERGENCY_PHRASES: EmergencyPhrase[] = [
  // Medizinisch — höchste Priorität
  { id: 'em1', text: 'Rufen Sie sofort einen Arzt!', category: 'medical', priority: 1 },
  { id: 'em2', text: 'Wir rufen jetzt den Krankenwagen.', category: 'medical', priority: 1 },
  { id: 'em3', text: 'Wo haben Sie Schmerzen?', category: 'medical', priority: 2 },
  { id: 'em4', text: 'Atmen Sie tief und ruhig.', category: 'medical', priority: 2 },
  { id: 'em5', text: 'Sind Sie allergisch gegen Medikamente?', category: 'medical', priority: 3 },
  { id: 'em6', text: 'Haben Sie Vorerkrankungen?', category: 'medical', priority: 3 },
  { id: 'em7', text: 'Ich bleibe bei Ihnen.', category: 'medical', priority: 2 },
  { id: 'em8', text: 'Bitte legen Sie sich hin.', category: 'medical', priority: 2 },

  // Sicherheit
  { id: 'es1', text: 'Bleiben Sie ruhig. Sie sind in Sicherheit.', category: 'safety', priority: 1 },
  { id: 'es2', text: 'Wir rufen die Polizei.', category: 'safety', priority: 1 },
  { id: 'es3', text: 'Verlassen Sie diesen Bereich sofort.', category: 'safety', priority: 1 },
  { id: 'es4', text: 'Wurden Sie verletzt?', category: 'safety', priority: 2 },
  { id: 'es5', text: 'Folgen Sie mir bitte.', category: 'safety', priority: 2 },
  { id: 'es6', text: 'Bitte warten Sie hier.', category: 'safety', priority: 3 },

  // Feuer / Evakuierung
  { id: 'ef1', text: 'Verlassen Sie das Gebäude sofort!', category: 'fire', priority: 1 },
  { id: 'ef2', text: 'Benutzen Sie die Treppe, nicht den Aufzug.', category: 'fire', priority: 1 },
  { id: 'ef3', text: 'Folgen Sie den Notausgang-Schildern.', category: 'fire', priority: 1 },
  { id: 'ef4', text: 'Sammelpunkt ist draußen vor dem Gebäude.', category: 'fire', priority: 2 },

  // Allgemein
  { id: 'eg1', text: 'Ich rufe sofort Hilfe.', category: 'general', priority: 1 },
  { id: 'eg2', text: 'Alles wird gut. Wir helfen Ihnen.', category: 'general', priority: 1 },
  { id: 'eg3', text: 'Bitte bleiben Sie ruhig.', category: 'general', priority: 1 },
  { id: 'eg4', text: 'Können Sie mich verstehen?', category: 'general', priority: 2 },
  { id: 'eg5', text: 'Gibt es jemanden, den wir anrufen sollen?', category: 'general', priority: 3 },
]

const CATEGORY_CONFIG = {
  medical: { label: 'Medizinisch', icon: <Heart className="h-4 w-4" />, color: 'red' },
  safety: { label: 'Sicherheit', icon: <Shield className="h-4 w-4" />, color: 'orange' },
  fire: { label: 'Feuer / Evakuierung', icon: <Flame className="h-4 w-4" />, color: 'orange' },
  general: { label: 'Allgemein', icon: <Phone className="h-4 w-4" />, color: 'blue' },
}

interface EmergencyModeProps {
  onSpeak: (text: string) => void
  /** Welche Kategorien anzeigen (Standard: alle) */
  categories?: EmergencyPhrase['category'][]
}

export default function EmergencyMode({
  onSpeak,
  categories = ['medical', 'safety', 'fire', 'general'],
}: EmergencyModeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<EmergencyPhrase['category']>('medical')
  const [justSpoken, setJustSpoken] = useState<string | null>(null)

  // ESC zum Schließen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  // Körper-Scroll sperren wenn offen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSpeak = (phrase: EmergencyPhrase) => {
    onSpeak(phrase.text)
    setJustSpoken(phrase.id)
    setTimeout(() => setJustSpoken(null), 1500)
  }

  const filteredPhrases = EMERGENCY_PHRASES
    .filter(p => p.category === activeCategory && categories.includes(p.category))
    .sort((a, b) => a.priority - b.priority)

  const availableCategories = categories.filter(c =>
    EMERGENCY_PHRASES.some(p => p.category === c)
  )

  return (
    <>
      {/* Notfall-Button — floating, immer sichtbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm shadow-lg transition-all active:scale-95"
        aria-label="Notfall-Modus öffnen"
      >
        <AlertTriangle className="h-4 w-4" />
        <span>Notfall</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
        >
          <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden border-2 border-red-500">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-red-600 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <span className="font-bold text-lg">Notfall-Modus</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Kategorie-Tabs */}
            <div className="flex border-b overflow-x-auto">
              {availableCategories.map(cat => {
                const config = CATEGORY_CONFIG[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeCategory === cat
                        ? 'border-red-500 text-red-600 dark:text-red-400'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                )
              })}
            </div>

            {/* Phrasen */}
            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
              {filteredPhrases.map(phrase => (
                <button
                  key={phrase.id}
                  onClick={() => handleSpeak(phrase)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all active:scale-98 ${
                    justSpoken === phrase.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                      : phrase.priority === 1
                        ? 'border-red-200 bg-red-50 dark:bg-red-950/20 hover:border-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-800 dark:text-red-200'
                        : 'border-border bg-muted/30 hover:border-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  {phrase.priority === 1 && (
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                  )}
                  {justSpoken === phrase.id ? '✓ Gesprochen' : phrase.text}
                </button>
              ))}
            </div>

            {/* Notruf-Hinweis */}
            <div className="px-4 py-3 bg-muted/50 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Notruf: <strong>112</strong> (EU) · <strong>110</strong> (Polizei) · <strong>19222</strong> (Krankenwagen DE)
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
