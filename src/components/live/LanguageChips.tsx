import { LANGUAGES } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'

/** Special language code for "listen to original without translation" */
export const ORIGINAL_LANG_CODE = 'original'

interface LanguageChipsProps {
  selected: string
  onSelect: (code: string) => void
  exclude?: string
  /** Show an "Original (no translation)" chip at the top */
  showOriginal?: boolean
}

export default function LanguageChips({ selected, onSelect, exclude, showOriginal }: LanguageChipsProps) {
  const { t } = useI18n()
  const langs = exclude ? LANGUAGES.filter(l => l.code !== exclude) : LANGUAGES

  return (
    <div className="flex flex-wrap gap-2">
      {showOriginal && (
        <button
          onClick={() => onSelect(ORIGINAL_LANG_CODE)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === ORIGINAL_LANG_CODE
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {t('live.originalLanguage')}
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
