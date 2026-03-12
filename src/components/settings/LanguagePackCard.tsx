import { useState } from 'react'
import { Download, Trash2, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getLanguageByCode } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'
import { preloadModel } from '@/lib/offline/translation-engine'
import { deleteModel } from '@/lib/offline/model-manager'

interface LanguagePackCardProps {
  src: string
  tgt: string
  modelId: string
  downloaded: boolean
  sizeEstimateMB: number
  onStatusChange: () => void
}

export default function LanguagePackCard({
  src,
  tgt,
  modelId,
  downloaded,
  sizeEstimateMB,
  onStatusChange,
}: LanguagePackCardProps) {
  const { t } = useI18n()
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const srcLang = getLanguageByCode(src)
  const tgtLang = getLanguageByCode(tgt)

  const handleDownload = async () => {
    setIsDownloading(true)
    setProgress(0)
    setError(null)

    // Retry up to 2 times on network errors
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await preloadModel(src, tgt, (pct) => setProgress(Math.round(pct)))
        onStatusChange()
        setIsDownloading(false)
        return
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const isNetworkError = msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('network') || msg.includes('TypeError')
        if (isNetworkError && attempt < 2) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
          continue
        }
        console.error('[LanguagePack] Download failed:', err)
        setError(
          isNetworkError
            ? t('error.networkDownload')
            : msg
        )
        break
      }
    }
    setIsDownloading(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteModel(modelId)
      onStatusChange()
    } catch (err) {
      console.error('[LanguagePack] Delete failed:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg shrink-0">{srcLang?.flag || src}</span>
        <span className="text-xs text-muted-foreground">→</span>
        <span className="text-lg shrink-0">{tgtLang?.flag || tgt}</span>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {srcLang?.name || src} → {tgtLang?.name || tgt}
          </div>
          <div className="text-xs text-muted-foreground">~{sizeEstimateMB} MB</div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isDownloading ? (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : downloaded ? (
          <>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3" /> {t('settings.ready')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={t('settings.deleteLanguagePack')}
              className="h-8 w-8"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              {t('settings.downloadPack')}
            </Button>
            {error && (
              <p className="text-[10px] text-destructive max-w-[160px] text-right">{error}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
