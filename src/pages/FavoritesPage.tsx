import { useState, useCallback } from 'react'
import { Star, Trash2, Search, Volume2, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useFavorites } from '@/hooks/useFavorites'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'
import { getLanguageByCode, isRTL } from '@/lib/languages'

export default function FavoritesPage() {
  const { t } = useI18n()
  const { favorites, removeFavorite, clearFavorites } = useFavorites()
  const tts = useSpeechSynthesis()
  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState<string | null>(null)

  const handleSpeak = useCallback((text: string, langCode: string) => {
    const lang = getLanguageByCode(langCode)
    tts.speak(text, lang?.speechCode || langCode)
  }, [tts])

  // Get unique language pairs for filter
  const langPairs = [...new Set(favorites.map(f => `${f.sourceLang}|${f.targetLang}`))]

  const filtered = favorites.filter(f => {
    const matchSearch = !search ||
      f.sourceText.toLowerCase().includes(search.toLowerCase()) ||
      f.translatedText.toLowerCase().includes(search.toLowerCase())
    const matchLang = !filterLang || `${f.sourceLang}|${f.targetLang}` === filterLang
    return matchSearch && matchLang
  })

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="gradient-text-translator">{t('favorites.title')}</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t('favorites.subtitle')}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="h-10 w-10 mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p>{t('favorites.empty')}</p>
          <p className="text-sm mt-1">{t('favorites.emptyHint')}</p>
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
                placeholder={t('favorites.search')}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={t('favorites.search')}
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

          {/* Stats & Clear */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filtered.length} {t('favorites.count')}
            </span>
            <Button variant="ghost" size="sm" onClick={clearFavorites} className="text-xs text-muted-foreground">
              <Trash2 className="h-3 w-3 mr-1" aria-hidden="true" />
              {t('favorites.clearAll')}
            </Button>
          </div>

          {/* Favorite Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(fav => {
              const srcLang = getLanguageByCode(fav.sourceLang)
              const tgtLang = getLanguageByCode(fav.targetLang)
              return (
                <Card key={fav.id} className="group relative">
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{srcLang?.flag}</span>
                        <span>{t('lang.' + fav.sourceLang)}</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        <span>{tgtLang?.flag}</span>
                        <span>{t('lang.' + fav.targetLang)}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleSpeak(fav.translatedText, fav.targetLang)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={t('translator.speak')}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          className="p-1 text-amber-500 hover:text-destructive transition-colors"
                          aria-label={t('favorites.remove')}
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{fav.sourceText}</p>
                    <p
                      className="text-sm text-primary"
                      dir={isRTL(fav.targetLang) ? 'rtl' : 'ltr'}
                    >
                      {fav.translatedText}
                    </p>
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
