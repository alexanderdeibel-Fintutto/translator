/**
 * Parent Letter Translator Page
 *
 * Teachers paste a German parent letter (Elternbrief) and
 * translate it into one or more target languages. Results
 * can be copied or printed per language.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Languages, Copy, Check, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { translateText, type TranslationResult } from '@/lib/translate'

/** Common parent-letter target languages in German schools */
const TARGET_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Tuerkisch' },
  { code: 'ar', label: 'Arabisch' },
  { code: 'uk', label: 'Ukrainisch' },
  { code: 'ru', label: 'Russisch' },
  { code: 'pl', label: 'Polnisch' },
  { code: 'fa', label: 'Farsi' },
  { code: 'ro', label: 'Rumaenisch' },
  { code: 'sq', label: 'Albanisch' },
  { code: 'fr', label: 'Franzoesisch' },
  { code: 'es', label: 'Spanisch' },
  { code: 'ku', label: 'Kurdisch' },
]

interface TranslationEntry {
  lang: string
  label: string
  text: string
  loading: boolean
  error?: string
}

export default function ParentLetterPage() {
  const navigate = useNavigate()
  const [sourceText, setSourceText] = useState('')
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['en', 'tr', 'ar'])
  const [translations, setTranslations] = useState<TranslationEntry[]>([])
  const [copiedLang, setCopiedLang] = useState<string | null>(null)

  const toggleLang = (code: string) => {
    setSelectedLangs((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim() || selectedLangs.length === 0) return

    // Initialize entries
    const entries: TranslationEntry[] = selectedLangs.map((code) => ({
      lang: code,
      label: TARGET_LANGUAGES.find((l) => l.code === code)?.label || code,
      text: '',
      loading: true,
    }))
    setTranslations([...entries])

    // Translate in parallel
    const promises = entries.map(async (entry, idx) => {
      try {
        const result: TranslationResult = await translateText(
          sourceText.trim(),
          'de',
          entry.lang
        )
        entries[idx] = { ...entry, text: result.translatedText, loading: false }
      } catch (err) {
        entries[idx] = {
          ...entry,
          text: '',
          loading: false,
          error: 'Uebersetzung fehlgeschlagen',
        }
      }
      setTranslations([...entries])
    })

    await Promise.allSettled(promises)
  }, [sourceText, selectedLangs])

  const handleCopy = async (lang: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedLang(lang)
    setTimeout(() => setCopiedLang(null), 2000)
  }

  const handlePrintAll = () => {
    window.print()
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Elternbrief uebersetzen</h1>
          <p className="text-sm text-muted-foreground">
            Schulbriefe in mehrere Sprachen uebersetzen
          </p>
        </div>
      </div>

      {/* Source text input */}
      <Card className="p-4 space-y-3 print:hidden">
        <label className="text-sm font-medium">
          Elternbrief (Deutsch)
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Liebe Eltern, ..."
          rows={8}
          className="w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm resize-y"
        />
        <p className="text-xs text-muted-foreground">
          {sourceText.length} Zeichen
        </p>
      </Card>

      {/* Language selection */}
      <Card className="p-4 space-y-3 print:hidden">
        <label className="text-sm font-medium">Zielsprachen</label>
        <div className="flex flex-wrap gap-2">
          {TARGET_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => toggleLang(lang.code)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedLangs.includes(lang.code)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-background border-border hover:bg-accent'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Translate button */}
      <Button
        onClick={handleTranslate}
        disabled={!sourceText.trim() || selectedLangs.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 gap-2 print:hidden"
        size="lg"
      >
        <Languages className="h-4 w-4" />
        In {selectedLangs.length} Sprachen uebersetzen
      </Button>

      {/* Results */}
      {translations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="font-semibold">Uebersetzungen</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintAll}
              className="gap-1"
            >
              <Printer className="h-3 w-3" />
              Alle drucken
            </Button>
          </div>

          {translations.map((entry) => (
            <Card key={entry.lang} className="p-4 space-y-2 break-inside-avoid">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{entry.label}</span>
                {!entry.loading && entry.text && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(entry.lang, entry.text)}
                    className="gap-1 print:hidden"
                  >
                    {copiedLang === entry.lang ? (
                      <><Check className="h-3 w-3" /> Kopiert</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Kopieren</>
                    )}
                  </Button>
                )}
              </div>

              {entry.loading ? (
                <div className="flex items-center gap-2 py-4 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Wird uebersetzt...</span>
                </div>
              ) : entry.error ? (
                <p className="text-sm text-red-500">{entry.error}</p>
              ) : (
                <p
                  className="text-sm whitespace-pre-wrap"
                  dir={['ar', 'fa', 'ku'].includes(entry.lang) ? 'rtl' : 'ltr'}
                >
                  {entry.text}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
