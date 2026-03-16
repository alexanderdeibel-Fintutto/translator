/**
 * Language Flag Selector
 *
 * Alternative to LanguageChips that shows large country flags
 * instead of text labels. Designed for users with limited literacy
 * (refugees, young children, elderly visitors).
 *
 * Used by: authority-visitor, ngo-client, school-student
 */

import { Radio } from 'lucide-react'
import { LANGUAGES } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'

interface LanguageFlagsProps {
  selected: string
  onSelect: (code: string) => void
  exclude?: string
  /** Show a "Live" option for original audio */
  showLive?: boolean
  /** Show only these language codes (for market-specific presets) */
  priorityCodes?: string[]
  /** Show native name below flag */
  showLabel?: boolean
}

export default function LanguageFlags({
  selected,
  onSelect,
  exclude,
  showLive,
  priorityCodes,
  showLabel = true,
}: LanguageFlagsProps) {
  const { t } = useI18n()

  let langs = exclude ? LANGUAGES.filter(l => l.code !== exclude) : [...LANGUAGES]

  // If priority codes given, show those first, then the rest
  if (priorityCodes && priorityCodes.length > 0) {
    const prioritySet = new Set(priorityCodes)
    const priority = langs.filter(l => prioritySet.has(l.code))
    const rest = langs.filter(l => !prioritySet.has(l.code))
    langs = [...priority, ...rest]
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {showLive && (
        <button
          onClick={() => onSelect('_live')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
            selected === '_live'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
          }`}
        >
          <Radio className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">Live</span>
        </button>
      )}
      {langs.map(lang => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
            selected === lang.code
              ? 'bg-primary/10 ring-2 ring-primary ring-offset-2'
              : 'bg-muted hover:bg-muted/80'
          }`}
          title={lang.name}
        >
          <span className="text-2xl leading-none">{lang.flag}</span>
          {showLabel && (
            <span className={`text-xs mt-1.5 font-medium truncate max-w-full ${
              selected === lang.code ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {lang.nativeName}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
