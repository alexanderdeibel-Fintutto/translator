import { useState, useCallback } from 'react'
import { BookOpen, Volume2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import LanguageSelector from '@/components/translator/LanguageSelector'
import { getPhrasePacks } from '@/lib/offline/phrase-packs'
import { translateText } from '@/lib/translate'
import { getLanguageByCode, RTL_LANGUAGES } from '@/lib/languages'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

interface TranslatedPhrase {
  original: string
  translated: string
  loading: boolean
}

export default function PhrasebookPage() {
  const packs = getPhrasePacks()
  const [activePackId, setActivePackId] = useState('migrant')
  const [targetLang, setTargetLang] = useState('ar')
  const [translations, setTranslations] = useState<Record<string, TranslatedPhrase>>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const tts = useSpeechSynthesis()

  const activePack = packs.find(p => p.id === activePackId) || packs[0]

  const grouped = activePack?.phrases.reduce((acc, phrase) => {
    if (!acc[phrase.category]) acc[phrase.category] = []
    acc[phrase.category].push(phrase.text)
    return acc
  }, {} as Record<string, string[]>) ?? {}

  // Auto-expand all categories
  const allCategories = Object.keys(grouped)
  const visibleCategories = expandedCategories.size > 0
    ? allCategories.filter(c => expandedCategories.has(c))
    : allCategories

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (prev.size === 0) {
        // First click: show only this one
        allCategories.forEach(c => { if (c !== cat) next.add(c) })
        // Actually we want to collapse others, so: show all expanded by default, toggle collapses
        next.add(cat)
        return next
      }
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      if (next.size === allCategories.length) return new Set() // all collapsed = reset
      return next
    })
  }

  const handleTranslate = useCallback(async (phrase: string) => {
    const key = `${phrase}|${targetLang}`
    if (translations[key]?.translated) {
      // Already translated — speak it
      const lang = getLanguageByCode(targetLang)
      tts.speak(translations[key].translated, lang?.speechCode || targetLang)
      return
    }

    setTranslations(prev => ({ ...prev, [key]: { original: phrase, translated: '', loading: true } }))

    try {
      const result = await translateText(phrase, 'de', targetLang)
      setTranslations(prev => ({
        ...prev,
        [key]: { original: phrase, translated: result.translatedText, loading: false },
      }))
      // Auto-speak
      const lang = getLanguageByCode(targetLang)
      tts.speak(result.translatedText, lang?.speechCode || targetLang)
    } catch {
      setTranslations(prev => ({
        ...prev,
        [key]: { original: phrase, translated: '⚠ Übersetzung fehlgeschlagen', loading: false },
      }))
    }
  }, [targetLang, translations, tts])

  const handleSpeak = useCallback((text: string) => {
    const lang = getLanguageByCode(targetLang)
    tts.speak(text, lang?.speechCode || targetLang)
  }, [targetLang, tts])

  const isRtl = RTL_LANGUAGES.has(targetLang)

  return (
    <div className="container py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="gradient-text-translator">Phrasebook</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Wichtige Sätze sofort übersetzen und vorlesen lassen. Tippen Sie auf einen Satz.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-end gap-3 flex-wrap">
        <LanguageSelector value={targetLang} onChange={setTargetLang} label="Übersetzen nach" />
      </div>

      {/* Pack Tabs */}
      <div className="flex gap-2 flex-wrap">
        {packs.map(pack => (
          <button
            key={pack.id}
            onClick={() => {
              setActivePackId(pack.id)
              setExpandedCategories(new Set())
            }}
            className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activePackId === pack.id
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            <span>{pack.icon}</span>
            {pack.name}
          </button>
        ))}
      </div>

      {/* Phrases by Category */}
      <div className="space-y-4">
        {allCategories.map(category => {
          const phrases = grouped[category]
          const isVisible = visibleCategories.includes(category)
          return (
            <Card key={category}>
              <CardHeader
                className="pb-2 cursor-pointer select-none"
                onClick={() => toggleCategory(category)}
              >
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {category}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({phrases.length})
                    </span>
                  </span>
                  {isVisible
                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              {isVisible && (
                <CardContent className="space-y-2">
                  {phrases.map(phrase => {
                    const key = `${phrase}|${targetLang}`
                    const t = translations[key]
                    return (
                      <div key={phrase} className="space-y-1">
                        <button
                          onClick={() => handleTranslate(phrase)}
                          className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>🇩🇪 {phrase}</span>
                            {t?.loading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
                          </div>
                        </button>
                        {t?.translated && !t.loading && (
                          <div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20"
                            dir={isRtl ? 'rtl' : 'ltr'}
                          >
                            <span className="text-sm flex-1">{t.translated}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 h-7 w-7"
                              onClick={() => handleSpeak(t.translated)}
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
