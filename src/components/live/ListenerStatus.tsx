import { Users, Globe, Radio } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getLanguageByCode } from '@/lib/languages'
import { ORIGINAL_LANG_CODE } from './LanguageChips'
import { useI18n } from '@/context/I18nContext'
import type { PresenceState } from '@/lib/session'

interface ListenerStatusProps {
  listeners: PresenceState[]
  listenersByLanguage: Record<string, number>
}

export default function ListenerStatus({ listeners, listenersByLanguage }: ListenerStatusProps) {
  const { t } = useI18n()
  const langEntries = Object.entries(listenersByLanguage)
    .filter(([lang]) => lang !== '_speaker')
    .sort((a, b) => b[1] - a[1])

  const uniqueLanguages = langEntries.length
  const totalListeners = listeners.length

  return (
    <Card className="p-4 space-y-3">
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm font-medium">
            {totalListeners} {t('live.listenersConnected')}
          </span>
          {totalListeners > 0 && (
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </div>
        {/* Group session badge */}
        {uniqueLanguages > 1 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] font-medium">
            <Radio className="h-3 w-3" aria-hidden="true" />
            {t('group.title')}
          </div>
        )}
      </div>

      {/* Multi-language broadcast stats */}
      {uniqueLanguages > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{uniqueLanguages} {t('group.languages')}</span>
          <span className="text-muted-foreground/30">|</span>
          <span>{totalListeners} {t('group.participants')}</span>
        </div>
      )}

      {langEntries.length > 0 ? (
        <div className="space-y-1.5">
          {langEntries.map(([lang, count]) => {
            const isOriginal = lang === ORIGINAL_LANG_CODE
            const langData = isOriginal ? null : getLanguageByCode(lang)
            const pct = totalListeners > 0 ? Math.round((count / totalListeners) * 100) : 0
            return (
              <div key={lang} className="flex items-center gap-2">
                <span className="text-sm shrink-0 w-6">{isOriginal ? '🔊' : langData?.flag}</span>
                <span className="text-xs flex-1 min-w-0 truncate">
                  {isOriginal ? t('live.originalLanguage') : (langData?.nativeName || lang)}
                </span>
                {/* Visual bar */}
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono w-6 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t('live.waitingForListeners')}
        </p>
      )}
    </Card>
  )
}
