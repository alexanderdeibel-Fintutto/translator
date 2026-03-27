import { useState, useCallback, useRef, useEffect } from 'react'

// Resize image to max 2048px and convert to base64 — reduces payload without losing OCR quality
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
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      // Extract pure base64 (no data: prefix)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve(dataUrl.split(',')[1])
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}
import { Camera, Image, Loader2, ArrowRightLeft, Copy, Check, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from '@/components/translator/LanguageSelector'
import { translateText } from '@/lib/translate'
import { getLanguageByCode, isRTL } from '@/lib/languages'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'
import { useTierId } from '@/context/UserContext'
import { hasFeature } from '@/lib/tiers'
import { UpgradePrompt } from '@/components/pricing/UpgradePrompt'

export default function CameraTranslatePage() {
  const { t } = useI18n()
  const tierId = useTierId()
  const canCamera = hasFeature(tierId, 'cameraOcr')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('de')
  const [extractedText, setExtractedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const tts = useSpeechSynthesis()

  // Revoke old object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const extractTextFromImage = useCallback(async (file: File): Promise<string> => {
    // Convert file to base64 (resize to max 2048px to reduce payload)
    const base64 = await fileToBase64(file)

    // Call secure server-side proxy — API key never leaves our infrastructure
    const response = await fetch('/api/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: [base64] }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || 'CAMERA_OCR_FAILED')
    }

    const data = await response.json()
    const text = data.texts?.[0]
    if (!text) {
      throw new Error('CAMERA_NO_TEXT')
    }
    return text
  }, [])

  const handleImageCapture = useCallback(async (file: File) => {
    // Revoke previous object URL to prevent memory leak
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setError(null)
    setExtractedText('')
    setTranslatedText('')

    // Extract text
    setIsExtracting(true)
    try {
      const text = await extractTextFromImage(file)
      setExtractedText(text)

      // Auto-translate
      setIsTranslating(true)
      const result = await translateText(text, sourceLang, targetLang)
      setTranslatedText(result.translatedText)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      const errorMap: Record<string, string> = {
        OFFLINE_NO_MODEL: t('error.offlineNoModel'),
        ALL_PROVIDERS_FAILED: t('error.allProvidersFailed'),
        CAMERA_NO_API_KEY: t('error.cameraNoApiKey'),
        CAMERA_OCR_FAILED: t('error.cameraOcrFailed'),
        CAMERA_NO_TEXT: t('error.cameraNoText'),
      }
      setError(errorMap[msg] || msg || t('error.unknown'))
    } finally {
      setIsExtracting(false)
      setIsTranslating(false)
    }
  }, [extractTextFromImage, sourceLang, targetLang])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageCapture(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
  }

  const handleCopy = async () => {
    if (!translatedText) return
    try {
      await navigator.clipboard.writeText(translatedText)
      setCopied(true)
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available (insecure context)
    }
  }

  const handleSpeak = () => {
    if (tts.isSpeaking) {
      tts.stop()
    } else {
      const lang = getLanguageByCode(targetLang)
      tts.speak(translatedText, lang?.speechCode || targetLang)
    }
  }

  const targetLangData = getLanguageByCode(targetLang)

  if (!canCamera) {
    return (
      <div className="container py-6 space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="gradient-text-translator">{t('camera.title')}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{t('camera.subtitle')}</p>
        </div>
        <UpgradePrompt tierId={tierId} limitType="feature_locked" featureName="Kamera-Übersetzer" />
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          <span className="gradient-text-translator">{t('camera.title')}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('camera.subtitle')}
        </p>
      </div>

      {/* Language bar */}
      <div className="flex items-end justify-center gap-3">
        <LanguageSelector value={sourceLang} onChange={setSourceLang} label={t('translator.from')} />
        <Button variant="outline" size="icon" onClick={swapLanguages} className="mb-0.5 shrink-0" aria-label={t('translator.swap')}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <LanguageSelector value={targetLang} onChange={setTargetLang} label={t('translator.to')} />
      </div>

      {/* Capture buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
          disabled={isExtracting || isTranslating}
        >
          <Camera className="h-5 w-5" />
          {t('camera.capture')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          size="lg"
          variant="outline"
          onClick={() => galleryInputRef.current?.click()}
          className="gap-2"
          disabled={isExtracting || isTranslating}
        >
          <Image className="h-5 w-5" />
          {t('camera.gallery')}
        </Button>
      </div>

      {/* Preview + Results */}
      {previewUrl && (
        <Card className="overflow-hidden">
          <img
            src={previewUrl}
            alt="Captured"
            className="w-full max-h-64 object-contain bg-muted"
          />
        </Card>
      )}

      {/* Loading states */}
      <div aria-live="polite">
        {isExtracting && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>{t('camera.extracting')}</span>
          </div>
        )}
        {isTranslating && !isExtracting && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>{t('translator.translating')}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center" role="alert">
          {error}
        </div>
      )}

      {/* Extracted text */}
      {extractedText && (
        <Card className="p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t('camera.extracted')}</p>
          <p className="text-sm" dir={isRTL(sourceLang) ? 'rtl' : 'ltr'}>
            {extractedText}
          </p>
        </Card>
      )}

      {/* Translation result */}
      {translatedText && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              {targetLangData?.flag} {t('camera.translation')}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleSpeak} aria-label={tts.isSpeaking ? t('translator.stop') : t('translator.speak')}>
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={t('translator.copy')}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-lg font-medium" dir={isRTL(targetLang) ? 'rtl' : 'ltr'}>
            {translatedText}
          </p>
        </Card>
      )}

      {/* Empty state hint */}
      {!previewUrl && !error && (
        <div className="text-center py-8 space-y-2">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground/30" aria-hidden="true" />
          <p className="text-muted-foreground text-sm">
            {t('camera.hint')}
          </p>
        </div>
      )}
    </div>
  )
}
