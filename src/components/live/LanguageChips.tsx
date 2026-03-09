import { Radio } from 'lucide-react'
import { LANGUAGES } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'

interface LanguageChipsProps {
  selected: string
  onSelect: (code: string) => void
  exclude?: string
  /** Show a "Live" chip for hearing the guide's original audio (no translation) */
  showLive?: boolean
}

export default function LanguageChips({ selected, onSelect, exclude, showLive }: LanguageChipsProps) {
  const { t } = useI18n()
  const langs = exclude ? LANGUAGES.filter(l => l.code !== exclude) : LANGUAGES

  return (
    <div className="flex flex-wrap gap-2">
      {showLive && (
        <button
          onClick={() => onSelect('_live')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
            selected === '_live'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          {t('live.originalAudio') || 'Live (Original)'}
        </button>
      )}
      {langs.map(lang => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {lang.flag} {lang.nativeName}
        </button>
      ))}
    </div>
  )
}
