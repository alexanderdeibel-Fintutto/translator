/**
 * Form Templates — Authority Market
 *
 * Pre-translated form templates for common government office scenarios.
 * Clerks select a template, choose the visitor's language, and get
 * an instant translation of standard texts (instructions, checklists).
 */

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { translateText } from '@/lib/translate'

export interface FormTemplate {
  id: string
  title: string
  category: string
  /** German source text */
  text: string
}

/** Pre-defined government form templates */
export const AUTHORITY_FORM_TEMPLATES: FormTemplate[] = [
  // Anmeldung
  {
    id: 'anmeldung-info',
    title: 'Anmeldung Wohnsitz',
    category: 'Meldewesen',
    text: 'Sie muessen sich innerhalb von 14 Tagen nach dem Einzug bei der Meldebehoerde anmelden. Bitte bringen Sie folgende Unterlagen mit: Personalausweis oder Reisepass, Wohnungsgeberbestaetigung, ausgefuelltes Anmeldeformular.',
  },
  {
    id: 'abmeldung-info',
    title: 'Abmeldung Wohnsitz',
    category: 'Meldewesen',
    text: 'Bei Umzug ins Ausland muessen Sie sich abmelden. Bitte bringen Sie mit: Personalausweis oder Reisepass, Abmeldeformular. Die Abmeldung ist kostenfrei.',
  },
  // Auslaenderbehoerde
  {
    id: 'aufenthaltstitel-verlaengerung',
    title: 'Aufenthaltstitel Verlaengerung',
    category: 'Auslaenderbehoerde',
    text: 'Ihr Aufenthaltstitel laeuft bald ab. Bitte stellen Sie rechtzeitig (mindestens 8 Wochen vorher) einen Antrag auf Verlaengerung. Erforderliche Unterlagen: gueltiger Reisepass, biometrisches Passfoto, Nachweis der Lebensunterhaltssicherung, Mietvertrag, Krankenversicherungsnachweis.',
  },
  {
    id: 'niederlassungserlaubnis',
    title: 'Niederlassungserlaubnis',
    category: 'Auslaenderbehoerde',
    text: 'Fuer die Niederlassungserlaubnis benoetigen Sie: mindestens 5 Jahre Aufenthaltserlaubnis, gesicherter Lebensunterhalt, ausreichende Deutschkenntnisse (B1), Grundkenntnisse der Rechts- und Gesellschaftsordnung, ausreichender Wohnraum.',
  },
  // Sozialamt
  {
    id: 'buergergeld-antrag',
    title: 'Buergergeld Erstantrag',
    category: 'Sozialamt',
    text: 'Fuer den Buergergeld-Antrag benoetigen Sie: Personalausweis/Reisepass, Mietvertrag und letzte Nebenkostenabrechnung, Kontoauszuege der letzten 3 Monate, Einkommensnachweise, Aufenthaltstitel (bei auslaendischen Staatsangehoerigen).',
  },
  {
    id: 'kindergeld',
    title: 'Kindergeld Antrag',
    category: 'Familienkasse',
    text: 'Kindergeld wird fuer alle Kinder bis zum 18. Lebensjahr gezahlt. Erforderliche Unterlagen: Geburtsurkunde des Kindes, Steuer-Identifikationsnummer von Eltern und Kind, Aufenthaltstitel (bei auslaendischen Staatsangehoerigen), Bankverbindung.',
  },
  // Standesamt
  {
    id: 'eheschliessung',
    title: 'Eheschliessung Anmeldung',
    category: 'Standesamt',
    text: 'Zur Anmeldung der Eheschliessung benoetigen beide Partner: gueltigen Personalausweis oder Reisepass, aktuelle Geburtsurkunde, Aufenthaltsbescheinigung, ggf. Ehefaehigkeitszeugnis, ggf. rechtskraeftiges Scheidungsurteil.',
  },
  // Fuehrerscheinstelle
  {
    id: 'fuehrerschein-umschreibung',
    title: 'Fuehrerschein Umschreibung',
    category: 'Fuehrerscheinstelle',
    text: 'Zur Umschreibung eines auslaendischen Fuehrerscheins benoetigen Sie: gueltigen auslaendischen Fuehrerschein mit amtlicher Uebersetzung, Personalausweis oder Reisepass, biometrisches Passfoto, Sehtest, Erste-Hilfe-Kurs Bescheinigung, Meldebestaetigung.',
  },
]

interface FormTemplatesProps {
  templates?: FormTemplate[]
  /** Called when translated text should be spoken/used */
  onUseTranslation?: (translated: string, lang: string) => void
}

const TARGET_LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
  { code: 'ar', label: 'AR' },
  { code: 'fa', label: 'FA' },
  { code: 'uk', label: 'UK' },
  { code: 'ru', label: 'RU' },
  { code: 'pl', label: 'PL' },
  { code: 'ro', label: 'RO' },
]

export default function FormTemplates({
  templates = AUTHORITY_FORM_TEMPLATES,
  onUseTranslation,
}: FormTemplatesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [translating, setTranslating] = useState<string | null>(null)
  const [translated, setTranslated] = useState<{ text: string; lang: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const categories = [...new Set(templates.map((t) => t.category))]

  const handleTranslate = async (template: FormTemplate, lang: string) => {
    setTranslating(`${template.id}-${lang}`)
    setTranslated(null)
    try {
      const result = await translateText(template.text, 'de', lang)
      setTranslated({ text: result.translatedText, lang })
    } catch {
      setTranslated({ text: 'Uebersetzung fehlgeschlagen', lang })
    }
    setTranslating(null)
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-teal-700" />
        <h2 className="font-semibold">Formular-Vorlagen</h2>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {cat}
          </p>
          {templates
            .filter((t) => t.category === cat)
            .map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === template.id ? null : template.id)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent transition-colors"
                >
                  <span className="text-sm font-medium">{template.title}</span>
                  {expandedId === template.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {expandedId === template.id && (
                  <div className="px-4 pb-4 space-y-3 border-t">
                    {/* German source */}
                    <p className="text-sm text-muted-foreground mt-3">
                      {template.text}
                    </p>

                    {/* Language buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {TARGET_LANGS.map((lang) => (
                        <Button
                          key={lang.code}
                          variant="outline"
                          size="sm"
                          onClick={() => handleTranslate(template, lang.code)}
                          disabled={translating !== null}
                          className="text-xs px-2 py-1 h-7"
                        >
                          {translating === `${template.id}-${lang.code}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            lang.label
                          )}
                        </Button>
                      ))}
                    </div>

                    {/* Translation result */}
                    {translated && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <p
                          className="text-sm"
                          dir={['ar', 'fa'].includes(translated.lang) ? 'rtl' : 'ltr'}
                        >
                          {translated.text}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(translated.text)}
                            className="text-xs gap-1 h-7"
                          >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copied ? 'Kopiert' : 'Kopieren'}
                          </Button>
                          {onUseTranslation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUseTranslation(translated.text, translated.lang)}
                              className="text-xs h-7"
                            >
                              Verwenden
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
        </div>
      ))}
    </div>
  )
}
