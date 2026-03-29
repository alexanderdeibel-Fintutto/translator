/**
 * ToneSelector — Tonfall-Anpassung
 *
 * Mitarbeiter wählt den Tonfall für seine Antworten:
 * - Formell: "Bitte nehmen Sie Platz." (Behörde, Arztpraxis)
 * - Freundlich: "Kommen Sie rein, ich helfe Ihnen gleich!" (Hotel, Service)
 * - Beruhigend: "Keine Sorge, wir kümmern uns darum." (Notfall, Krankenhaus)
 * - Direkt: "Ausweis bitte." (Sicherheit, schnelle Abfertigung)
 *
 * Der gewählte Tonfall wird als Kontext an die KI übergeben
 * und beeinflusst die Smart-Reply-Vorschläge.
 *
 * Einbindung: In ConversationPage neben dem Kontext-Selektor
 */

import { useState } from 'react'
import { Smile, Briefcase, Heart, Zap } from 'lucide-react'

export type ToneMode = 'formal' | 'friendly' | 'calming' | 'direct'

export interface ToneConfig {
  id: ToneMode
  label: string
  description: string
  icon: React.ReactNode
  color: string
  /** Anweisung für die KI */
  aiInstruction: string
  /** Beispiel-Transformation */
  example: { before: string; after: string }
}

export const TONE_CONFIGS: ToneConfig[] = [
  {
    id: 'formal',
    label: 'Formell',
    description: 'Höflich und professionell',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    color: 'blue',
    aiInstruction: 'Antworte formell und höflich, verwende Sie-Form, professionelle Sprache.',
    example: {
      before: 'Warte kurz.',
      after: 'Bitte haben Sie einen Moment Geduld.',
    },
  },
  {
    id: 'friendly',
    label: 'Freundlich',
    description: 'Warm und einladend',
    icon: <Smile className="h-3.5 w-3.5" />,
    color: 'green',
    aiInstruction: 'Antworte freundlich und warm, lächelnd, einladend und hilfsbereit.',
    example: {
      before: 'Ich helfe Ihnen.',
      after: 'Natürlich, ich helfe Ihnen gerne!',
    },
  },
  {
    id: 'calming',
    label: 'Beruhigend',
    description: 'Ruhig und einfühlsam',
    icon: <Heart className="h-3.5 w-3.5" />,
    color: 'violet',
    aiInstruction: 'Antworte beruhigend und einfühlsam, zeige Verständnis, vermittle Sicherheit.',
    example: {
      before: 'Das dauert noch.',
      after: 'Keine Sorge, wir kümmern uns darum. Alles wird gut.',
    },
  },
  {
    id: 'direct',
    label: 'Direkt',
    description: 'Klar und präzise',
    icon: <Zap className="h-3.5 w-3.5" />,
    color: 'orange',
    aiInstruction: 'Antworte kurz, klar und direkt. Keine Floskeln, nur das Wesentliche.',
    example: {
      before: 'Könnten Sie mir bitte Ihren Ausweis zeigen?',
      after: 'Ausweis bitte.',
    },
  },
]

const COLOR_CLASSES: Record<string, { active: string; hover: string; text: string }> = {
  blue: {
    active: 'bg-blue-100 border-blue-400 dark:bg-blue-950/40 dark:border-blue-500',
    hover: 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  green: {
    active: 'bg-green-100 border-green-400 dark:bg-green-950/40 dark:border-green-500',
    hover: 'hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950/20',
    text: 'text-green-700 dark:text-green-300',
  },
  violet: {
    active: 'bg-violet-100 border-violet-400 dark:bg-violet-950/40 dark:border-violet-500',
    hover: 'hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/20',
    text: 'text-violet-700 dark:text-violet-300',
  },
  orange: {
    active: 'bg-orange-100 border-orange-400 dark:bg-orange-950/40 dark:border-orange-500',
    hover: 'hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-300',
  },
}

interface ToneSelectorProps {
  value: ToneMode
  onChange: (tone: ToneMode) => void
  /** Kompakte Darstellung (nur Icons) */
  compact?: boolean
}

export default function ToneSelector({ value, onChange, compact = false }: ToneSelectorProps) {
  const [showTooltip, setShowTooltip] = useState<ToneMode | null>(null)

  if (compact) {
    return (
      <div className="flex gap-1">
        {TONE_CONFIGS.map(tone => {
          const colors = COLOR_CLASSES[tone.color]
          const isActive = value === tone.id
          return (
            <div key={tone.id} className="relative">
              <button
                onClick={() => onChange(tone.id)}
                onMouseEnter={() => setShowTooltip(tone.id)}
                onMouseLeave={() => setShowTooltip(null)}
                className={`p-1.5 rounded-lg border transition-all ${
                  isActive
                    ? `${colors.active} ${colors.text}`
                    : `border-transparent text-muted-foreground ${colors.hover}`
                }`}
                title={tone.label}
              >
                {tone.icon}
              </button>
              {showTooltip === tone.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border rounded text-xs whitespace-nowrap shadow-md z-50">
                  {tone.label}: {tone.description}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {TONE_CONFIGS.map(tone => {
        const colors = COLOR_CLASSES[tone.color]
        const isActive = value === tone.id
        return (
          <button
            key={tone.id}
            onClick={() => onChange(tone.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
              isActive
                ? `${colors.active} ${colors.text} font-medium`
                : `border-border bg-background text-muted-foreground ${colors.hover}`
            }`}
          >
            <span className={isActive ? colors.text : 'text-muted-foreground'}>
              {tone.icon}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-medium leading-tight">{tone.label}</div>
              <div className="text-[10px] opacity-70 leading-tight truncate">{tone.description}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Hook: Satz nach Tonfall umformulieren ────────────────────────────────────

/**
 * Formuliert einen Satz nach dem gewählten Tonfall um.
 * Nutzt GPT-4.1-nano (schnell, günstig) für die Transformation.
 * Fallback: gibt den Original-Satz zurück.
 */
export async function reformulateTone(
  text: string,
  tone: ToneMode,
  targetLang: string = 'de'
): Promise<string> {
  const config = TONE_CONFIGS.find(t => t.id === tone)
  if (!config || tone === 'formal') return text // Formell ist Standard, kein Umbau nötig

  try {
    const response = await fetch('/api/reformulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        instruction: config.aiInstruction,
        lang: targetLang,
      }),
    })
    if (!response.ok) throw new Error()
    const data = await response.json()
    return data.result || text
  } catch {
    // Fallback: einfache lokale Transformation
    return applyLocalTone(text, tone)
  }
}

function applyLocalTone(text: string, tone: ToneMode): string {
  switch (tone) {
    case 'friendly':
      // Ausrufezeichen hinzufügen wenn keins da
      if (!text.endsWith('!') && !text.endsWith('?')) {
        return text.replace(/\.$/, '!') || text + '!'
      }
      return text
    case 'calming':
      // "Keine Sorge" voranstellen bei kurzen Sätzen
      if (text.length < 60 && !text.toLowerCase().includes('keine sorge')) {
        return `Keine Sorge — ${text.charAt(0).toLowerCase() + text.slice(1)}`
      }
      return text
    case 'direct':
      // Floskeln entfernen
      return text
        .replace(/^Könnten Sie bitte /i, '')
        .replace(/^Würden Sie bitte /i, '')
        .replace(/^Dürfte ich Sie bitten, /i, '')
        .replace(/\?$/, '.')
    default:
      return text
  }
}
