import { Languages, Mic, Globe, Zap, Radio, MessageCircle, Camera } from 'lucide-react'
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import TranslationPanel from '@/components/translator/TranslationPanel'
import TranslationHistory from '@/components/translator/TranslationHistory'
import QuickPhrases from '@/components/translator/QuickPhrases'
import { useTranslationHistory } from '@/hooks/useTranslationHistory'
import { useI18n } from '@/context/I18nContext'

export default function TranslatorPage() {
  const { t } = useI18n()
  const [quickText, setQuickText] = useState('')
  const [sourceLang, setSourceLang] = useState('')
  const [targetLang, setTargetLang] = useState('')
  const { history, addEntry, clearHistory, removeEntry } = useTranslationHistory()

  const handleConsumed = useCallback(() => {
    setQuickText('')
    setSourceLang('')
    setTargetLang('')
  }, [])

  const handleHistorySelect = useCallback((text: string, src: string, tgt: string) => {
    setQuickText(text)
    setSourceLang(src)
    setTargetLang(tgt)
  }, [])

  return (
    <div className="container py-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="gradient-text-translator">{t('translator.title')}</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t('translator.subtitle')}
        </p>
      </div>

      {/* Features Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[
          { icon: Globe, label: t('translator.languages') },
          { icon: Mic, label: t('translator.speechInput') },
          { icon: Languages, label: t('translator.instantTranslation') },
          { icon: Zap, label: t('translator.free') },
        ].map(f => (
          <div
            key={f.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
          >
            <f.icon className="h-3 w-3" aria-hidden="true" />
            {f.label}
          </div>
        ))}
        <Link to="/live">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
            <Radio className="h-3 w-3" aria-hidden="true" />
            {t('translator.liveSession')}
          </Button>
        </Link>
        <Link to="/conversation">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
            <MessageCircle className="h-3 w-3" aria-hidden="true" />
            {t('nav.conversation')}
          </Button>
        </Link>
        <Link to="/camera">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
            <Camera className="h-3 w-3" aria-hidden="true" />
            {t('nav.camera')}
          </Button>
        </Link>
      </div>

      {/* Main Translation */}
      <TranslationPanel
        initialText={quickText}
        initialSourceLang={sourceLang}
        initialTargetLang={targetLang}
        onInitialTextConsumed={handleConsumed}
        addEntry={addEntry}
      />

      {/* Quick Phrases & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickPhrases onSelect={setQuickText} />
        <TranslationHistory
          history={history}
          clearHistory={clearHistory}
          removeEntry={removeEntry}
          onSelect={handleHistorySelect}
        />
      </div>
    </div>
  )
}
