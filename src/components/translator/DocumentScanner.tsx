// DocumentScanner — Multi-page document OCR + translation
// Designed for authority/medical standalone use:
// - Up to 10 pages (passport, ID, medical letter, etc.)
// - Thumbnail strip with reorder/delete per page
// - Batch OCR via /api/vision proxy (secure, no key in browser)
// - Combined translation of all pages in reading order

import { useState, useCallback, useRef } from 'react'
import {
  Camera, ImagePlus, Loader2, Trash2, ArrowRightLeft,
  Copy, Check, Volume2, VolumeX, FileText, ChevronUp, ChevronDown, ScanLine
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from '@/components/translator/LanguageSelector'
import { translateText } from '@/lib/translate'
import { getLanguageByCode, isRTL } from '@/lib/languages'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 2048
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScannedPage {
  id: string
  previewUrl: string   // object URL for thumbnail
  base64: string       // compressed base64 for API
  extractedText: string
  status: 'pending' | 'scanning' | 'done' | 'error'
  errorMsg?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

interface DocumentScannerProps {
  /** Source language (the document's language) */
  sourceLang: string
  onSourceLangChange: (lang: string) => void
  /** Target language (language to translate into) */
  targetLang: string
  onTargetLangChange: (lang: string) => void
}

export default function DocumentScanner({
  sourceLang,
  onSourceLangChange,
  targetLang,
  onTargetLangChange,
}: DocumentScannerProps) {
  const { t } = useI18n()
  const tts = useSpeechSynthesis()

  const [pages, setPages] = useState<ScannedPage[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedText, setTranslatedText] = useState('')
  const [translationError, setTranslationError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const MAX_PAGES = 10

  // ── Add pages ───────────────────────────────────────────────────────────────

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remaining = MAX_PAGES - pages.length
    const toAdd = Array.from(files).slice(0, remaining)

    // Create pending page entries immediately (show thumbnails fast)
    const newPages: ScannedPage[] = toAdd.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      previewUrl: URL.createObjectURL(file),
      base64: '',
      extractedText: '',
      status: 'scanning' as const,
    }))

    setPages(prev => [...prev, ...newPages])
    setTranslatedText('')
    setTranslationError(null)

    // Process each file: resize → base64 → OCR
    const results = await Promise.allSettled(
      toAdd.map(async (file, i) => {
        const base64 = await fileToBase64(file)
        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pages: [base64] }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'OCR fehlgeschlagen')
        }
        const data = await res.json()
        const text = (data.texts?.[0] as string | undefined) || ''
        return { id: newPages[i].id, base64, text }
      })
    )

    setPages(prev => {
      const updated = [...prev]
      results.forEach((result, i) => {
        const idx = updated.findIndex(p => p.id === newPages[i].id)
        if (idx === -1) return
        if (result.status === 'fulfilled') {
          updated[idx] = {
            ...updated[idx],
            base64: result.value.base64,
            extractedText: result.value.text,
            status: result.value.text ? 'done' : 'error',
            errorMsg: result.value.text ? undefined : 'Kein Text erkannt',
          }
        } else {
          updated[idx] = {
            ...updated[idx],
            status: 'error',
            errorMsg: result.reason instanceof Error ? result.reason.message : 'Fehler',
          }
        }
      })
      return updated
    })
  }, [pages.length])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  // ── Page management ─────────────────────────────────────────────────────────

  const deletePage = (id: string) => {
    setPages(prev => {
      const page = prev.find(p => p.id === id)
      if (page) URL.revokeObjectURL(page.previewUrl)
      return prev.filter(p => p.id !== id)
    })
    if (selectedPageId === id) setSelectedPageId(null)
    setTranslatedText('')
  }

  const movePage = (id: string, direction: 'up' | 'down') => {
    setPages(prev => {
      const idx = prev.findIndex(p => p.id === id)
      if (idx === -1) return prev
      const next = direction === 'up' ? idx - 1 : idx + 1
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
    setTranslatedText('')
  }

  // ── Translate all pages ─────────────────────────────────────────────────────

  const translateAll = useCallback(async () => {
    const donePages = pages.filter(p => p.status === 'done' && p.extractedText)
    if (donePages.length === 0) return

    // Combine all pages with a clear separator
    const combined = donePages
      .map((p, i) => donePages.length > 1 ? `[Seite ${i + 1}]\n${p.extractedText}` : p.extractedText)
      .join('\n\n')

    setIsTranslating(true)
    setTranslationError(null)
    setTranslatedText('')

    try {
      const result = await translateText(combined, sourceLang, targetLang)
      setTranslatedText(result.translatedText)
    } catch (err) {
      setTranslationError(err instanceof Error ? err.message : 'Übersetzung fehlgeschlagen')
    } finally {
      setIsTranslating(false)
    }
  }, [pages, sourceLang, targetLang])

  // ── Copy / TTS ──────────────────────────────────────────────────────────────

  const handleCopy = async () => {
    if (!translatedText) return
    try {
      await navigator.clipboard.writeText(translatedText)
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard not available */ }
  }

  const handleSpeak = () => {
    if (tts.isSpeaking) {
      tts.stop()
    } else {
      const lang = getLanguageByCode(targetLang)
      tts.speak(translatedText, lang?.speechCode || targetLang)
    }
  }

  const swapLanguages = () => {
    onSourceLangChange(targetLang)
    onTargetLangChange(sourceLang)
    setTranslatedText('')
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const hasScanning = pages.some(p => p.status === 'scanning')
  const hasReady = pages.some(p => p.status === 'done' && p.extractedText)
  const canAddMore = pages.length < MAX_PAGES
  const selectedPage = pages.find(p => p.id === selectedPageId)
  const targetLangData = getLanguageByCode(targetLang)
  const isRTLTarget = isRTL(targetLang)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Language bar */}
      <div className="flex items-end justify-center gap-3">
        <LanguageSelector
          value={sourceLang}
          onChange={onSourceLangChange}
          label="Dokument-Sprache"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={swapLanguages}
          className="mb-0.5 shrink-0"
          aria-label={t('translator.swap')}
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <LanguageSelector
          value={targetLang}
          onChange={onTargetLangChange}
          label={t('translator.to')}
        />
      </div>

      {/* Capture buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          size="lg"
          onClick={() => cameraInputRef.current?.click()}
          disabled={!canAddMore || hasScanning}
          className="gap-2"
        >
          <Camera className="h-5 w-5" />
          Seite fotografieren
        </Button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          size="lg"
          variant="outline"
          onClick={() => galleryInputRef.current?.click()}
          disabled={!canAddMore || hasScanning}
          className="gap-2"
        >
          <ImagePlus className="h-5 w-5" />
          Aus Galerie
        </Button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Page limit hint */}
      {pages.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {pages.length} / {MAX_PAGES} Seiten
          {!canAddMore && ' — Maximum erreicht'}
        </p>
      )}

      {/* Page thumbnail strip */}
      {pages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Gescannte Seiten — Reihenfolge anpassen oder löschen
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {pages.map((page, idx) => (
              <Card
                key={page.id}
                className={`relative overflow-hidden cursor-pointer transition-all border-2 ${
                  selectedPageId === page.id
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-border hover:border-primary/40'
                }`}
                onClick={() => setSelectedPageId(prev => prev === page.id ? null : page.id)}
              >
                {/* Thumbnail */}
                <img
                  src={page.previewUrl}
                  alt={`Seite ${idx + 1}`}
                  className="w-full h-28 object-cover bg-muted"
                />

                {/* Status overlay */}
                {page.status === 'scanning' && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                {page.status === 'error' && (
                  <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                    <span className="text-xs text-destructive font-medium px-1 text-center">
                      {page.errorMsg || 'Fehler'}
                    </span>
                  </div>
                )}
                {page.status === 'done' && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center gap-0.5 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      <FileText className="h-2.5 w-2.5" />
                      Text erkannt
                    </span>
                  </div>
                )}

                {/* Page number */}
                <div className="absolute top-1 left-1 bg-background/80 text-xs font-bold px-1.5 py-0.5 rounded">
                  {idx + 1}
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 inset-x-0 bg-background/90 flex items-center justify-between px-1 py-0.5">
                  <div className="flex gap-0.5">
                    <button
                      onClick={e => { e.stopPropagation(); movePage(page.id, 'up') }}
                      disabled={idx === 0}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                      aria-label="Nach oben"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); movePage(page.id, 'down') }}
                      disabled={idx === pages.length - 1}
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                      aria-label="Nach unten"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deletePage(page.id) }}
                    className="p-0.5 rounded hover:bg-destructive/10 text-destructive"
                    aria-label="Seite löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Extracted text preview (when a page is selected) */}
      {selectedPage?.status === 'done' && selectedPage.extractedText && (
        <Card className="p-3 space-y-1">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Erkannter Text — Seite {pages.findIndex(p => p.id === selectedPage.id) + 1}
          </p>
          <p className="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
            {selectedPage.extractedText}
          </p>
        </Card>
      )}

      {/* Translate button */}
      {hasReady && (
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={translateAll}
          disabled={isTranslating || hasScanning}
        >
          {isTranslating
            ? <><Loader2 className="h-5 w-5 animate-spin" />Übersetze…</>
            : <><ScanLine className="h-5 w-5" />Dokument übersetzen ({pages.filter(p => p.status === 'done').length} Seite{pages.filter(p => p.status === 'done').length !== 1 ? 'n' : ''})</>
          }
        </Button>
      )}

      {/* Translation result */}
      {translatedText && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {targetLangData?.flag} Übersetzung ({targetLangData?.name})
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
                aria-label="Kopieren"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSpeak}
                aria-label={tts.isSpeaking ? 'Stoppen' : 'Vorlesen'}
              >
                {tts.isSpeaking
                  ? <VolumeX className="h-3.5 w-3.5" />
                  : <Volume2 className="h-3.5 w-3.5" />
                }
              </Button>
            </div>
          </div>
          <p
            className="text-sm whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed"
            dir={isRTLTarget ? 'rtl' : 'ltr'}
          >
            {translatedText}
          </p>
        </Card>
      )}

      {/* Translation error */}
      {translationError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center" role="alert">
          {translationError}
        </div>
      )}

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
          <ScanLine className="h-12 w-12 opacity-20" />
          <p className="text-sm text-center max-w-xs">
            Fotografieren Sie ein Dokument (Reisepass, Aufenthaltstitel, Arztbrief …) —
            bis zu 10 Seiten, automatische Texterkennung und Übersetzung.
          </p>
        </div>
      )}
    </div>
  )
}
