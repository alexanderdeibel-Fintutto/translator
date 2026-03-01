import { useState, useCallback } from 'react'
import { Clock, Trash2, Search, Volume2, ArrowRight, X, Star, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslationHistory, type HistoryEntry } from '@/hooks/useTranslationHistory'
import { useFavorites } from '@/hooks/useFavorites'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'
import { getLanguageByCode, isRTL } from '@/lib/languages'

export default function HistoryPage() {
  const { t } = useI18n()
  const { history, clearHistory, removeEntry } = useTranslationHistory()
  const { isFavorite, toggleFavorite } = useFavorites()
  const tts = useSpeechSynthesis()
  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const handleSpeak = useCallback((text: string, langCode: string) => {
    const lang = getLanguageByCode(langCode)
    tts.speak(text, lang?.speechCode || langCode)
  }, [tts])

  // Get unique language pairs for filter
  const langPairs = [...new Set(history.map(f => `${f.sourceLang}|${f.targetLang}`))]

  const filtered = history.filter(f => {
    const matchSearch = !search ||
      f.sourceText.toLowerCase().includes(search.toLowerCase()) ||
      f.translatedText.toLowerCase().includes(search.toLowerCase())
    const matchLang = !filterLang || `${f.sourceLang}|${f.targetLang}` === filterLang
    return matchSearch && matchLang
  })

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - ts
    if (diff < 60_000) return t('history.justNow')
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min`
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h`
    if (d.toDateString() === new Date(now.getTime() - 86400_000).toDateString()) return t('history.yesterday')
    return d.toLocaleDateString()
  }

  const handleExportHistory = useCallback(() => {
    const data = JSON.stringify(history, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translator-history-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [history])

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="gradient-text-translator">{t('historyPage.title')}</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t('historyPage.subtitle')}
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p>{t('history.empty')}</p>
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('historyPage.search')}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={t('historyPage.search')}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={t('translator.delete')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterLang(null)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  !filterLang ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                {t('phrasebook.all')}
              </button>
              {langPairs.map(pair => {
                const [src, tgt] = pair.split('|')
                const srcLang = getLanguageByCode(src)
                const tgtLang = getLanguageByCode(tgt)
                return (
                  <button
                    key={pair}
                    onClick={() => setFilterLang(pair)}
                    className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                      filterLang === pair ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
                    }`}
                  >
                    {srcLang?.flag} → {tgtLang?.flag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {t('historyPage.entries')}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleExportHistory} className="text-xs text-muted-foreground gap-1">
                <Download className="h-3 w-3" aria-hidden="true" />
                {t('historyPage.export')}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-muted-foreground gap-1">
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                {t('history.clear')}
              </Button>
            </div>
          </div>

          {/* History entries */}
          <div className="space-y-2">
            {filtered.map(entry => {
              const srcLang = getLanguageByCode(entry.sourceLang)
              const tgtLang = getLanguageByCode(entry.targetLang)
              const starred = isFavorite(entry.sourceText, entry.targetLang)
              return (
                <Card key={entry.id} className="group">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{srcLang?.flag} {t('lang.' + entry.sourceLang)}</span>
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          <span>{tgtLang?.flag} {t('lang.' + entry.targetLang)}</span>
                          <span className="ml-auto">{formatTime(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm">{entry.sourceText}</p>
                        <p
                          className="text-sm text-primary"
                          dir={isRTL(entry.targetLang) ? 'rtl' : 'ltr'}
                        >
                          {entry.translatedText}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => handleSpeak(entry.translatedText, entry.targetLang)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={t('translator.speak')}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleFavorite({
                            sourceText: entry.sourceText,
                            translatedText: entry.translatedText,
                            sourceLang: entry.sourceLang,
                            targetLang: entry.targetLang,
                          })}
                          className={`p-1.5 transition-colors ${starred ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400'}`}
                          aria-label={starred ? t('favorites.remove') : t('favorites.add')}
                        >
                          <Star className={`h-3.5 w-3.5 ${starred ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => removeEntry(entry.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          aria-label={t('translator.delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {filtered.length === 0 && search && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>{t('favorites.noResults')}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
