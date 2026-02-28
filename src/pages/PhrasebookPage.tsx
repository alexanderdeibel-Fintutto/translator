import { useState, useCallback } from 'react'
import { Volume2, Loader2, BookOpen, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getMigrantPhrases } from '@/lib/offline/phrase-packs'
import { translateText } from '@/lib/translate'
import { getLanguageByCode, isRTL, LANGUAGES } from '@/lib/languages'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

// Target languages commonly needed by migrants
const MIGRANT_LANGUAGES = ['ar', 'fa', 'ps', 'ku', 'ti', 'am', 'so', 'ur', 'bn', 'sw', 'sq', 'tr', 'ru', 'uk', 'en', 'fr']

export default function PhrasebookPage() {
  const [targetLang, setTargetLang] = useState('ar')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null)
  const tts = useSpeechSynthesis()

  const pack = getMigrantPhrases()
  if (!pack) return null

  const categories = [...new Set(pack.phrases.map(p => p.category))]
  const filteredPhrases = activeCategory
    ? pack.phrases.filter(p => p.category === activeCategory)
    : pack.phrases

  const handlePhraseClick = useCallback(async (text: string) => {
    const key = `${text}:${targetLang}`
    if (translations[key]) {
      // Already translated — just speak it
      const lang = getLanguageByCode(targetLang)
      tts.speak(translations[key], lang?.speechCode || targetLang)
      return
    }

    setLoading(text)
    try {
      const result = await translateText(text, 'de', targetLang)
      setTranslations(prev => ({ ...prev, [key]: result.translatedText }))

      // Auto-speak
      const lang = getLanguageByCode(targetLang)
      tts.speak(result.translatedText, lang?.speechCode || targetLang)
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }, [targetLang, translations, tts])

  const handleBatchTranslate = useCallback(async () => {
    const untranslated = filteredPhrases.filter(p => !translations[`${p.text}:${targetLang}`])
    if (untranslated.length === 0) return

    setBatchProgress({ done: 0, total: untranslated.length })
    // Translate in batches of 3 to avoid rate limiting
    for (let i = 0; i < untranslated.length; i += 3) {
      const batch = untranslated.slice(i, i + 3)
      const results = await Promise.allSettled(
        batch.map(p => translateText(p.text, 'de', targetLang))
      )
      const updates: Record<string, string> = {}
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          updates[`${batch[idx].text}:${targetLang}`] = r.value.translatedText
        }
      })
      setTranslations(prev => ({ ...prev, ...updates }))
      setBatchProgress({ done: Math.min(i + 3, untranslated.length), total: untranslated.length })
    }
    setBatchProgress(null)
  }, [filteredPhrases, translations, targetLang])

  const untranslatedCount = filteredPhrases.filter(p => !translations[`${p.text}:${targetLang}`]).length
  const targetLangData = getLanguageByCode(targetLang)
  const availableLangs = MIGRANT_LANGUAGES.map(c => LANGUAGES.find(l => l.code === c)).filter(Boolean)

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="gradient-text-translator">Phrasebook</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Wichtige Saetze fuer Behoerden, Arzt, Wohnung, Arbeit, Schule, Polizei und Alltag. Phrase antippen zum Uebersetzen und Vorlesen.
        </p>
      </div>

      {/* Target language selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableLangs.map(lang => lang && (
          <button
            key={lang.code}
            onClick={() => setTargetLang(lang.code)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              targetLang === lang.code
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            !activeCategory ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
          }`}
        >
          Alle
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              activeCategory === cat ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Batch translate */}
      {untranslatedCount > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchTranslate}
            disabled={batchProgress !== null || !!loading}
            className="gap-2"
          >
            {batchProgress ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {batchProgress.done}/{batchProgress.total}
              </>
            ) : (
              <>
                <Languages className="h-3.5 w-3.5" />
                Alle übersetzen ({untranslatedCount})
              </>
            )}
          </Button>
        </div>
      )}

      {/* Phrase cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPhrases.map(phrase => {
          const key = `${phrase.text}:${targetLang}`
          const translated = translations[key]
          const isLoading = loading === phrase.text

          return (
            <Card
              key={phrase.text}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handlePhraseClick(phrase.text)}
            >
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                      {phrase.category}
                    </span>
                  </div>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>

                <p className="text-sm font-medium">{phrase.text}</p>

                {translated && (
                  <p
                    className="text-sm text-primary"
                    dir={isRTL(targetLang) ? 'rtl' : 'ltr'}
                  >
                    {targetLangData?.flag} {translated}
                  </p>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {filteredPhrases.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Keine Phrasen in dieser Kategorie.</p>
        </div>
      )}
    </div>
  )
}
