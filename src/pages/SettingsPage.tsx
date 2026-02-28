import { useState, useEffect, useRef } from 'react'
import { Download, Trash2, Wifi, WifiOff, Mic, Loader2, Key, Eye, EyeOff, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOffline } from '@/context/OfflineContext'
import LanguagePackCard from '@/components/settings/LanguagePackCard'
import StorageIndicator from '@/components/settings/StorageIndicator'
import { getLanguagePairStatus } from '@/lib/offline/model-manager'
import { getCacheStats, clearTranslationCache } from '@/lib/offline/translation-cache'
import { getTTSCacheStats, clearTTSCache } from '@/lib/offline/tts-cache'
// Dynamic import to avoid mixed static/dynamic import warning (stt.ts imports dynamically)
const sttEngine = () => import('@/lib/offline/stt-engine')
import { checkOfflineSupport, isIOSSafariNotStandalone } from '@/lib/offline/storage-manager'
import { getGoogleApiKey, setGoogleApiKey, hasGoogleApiKey } from '@/lib/api-key'
import { useI18n } from '@/context/I18nContext'

export default function SettingsPage() {
  const { t } = useI18n()
  const { networkMode, isPersistent, storageUsed, storagePercent, requestPersistence, refreshModels } = useOffline()

  const [languagePairs, setLanguagePairs] = useState<Awaited<ReturnType<typeof getLanguagePairStatus>>>([])
  const [translationCacheCount, setTranslationCacheCount] = useState(0)
  const [ttsCacheCount, setTtsCacheCount] = useState(0)
  const [whisperReady, setWhisperReady] = useState(false)
  const [whisperDownloading, setWhisperDownloading] = useState(false)
  const [whisperProgress, setWhisperProgress] = useState(0)
  const [whisperError, setWhisperError] = useState<string | null>(null)
  const [offlineSupport, setOfflineSupport] = useState<ReturnType<typeof checkOfflineSupport> | null>(null)
  const [showSafariHint, setShowSafariHint] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const apiKeyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
    setOfflineSupport(checkOfflineSupport())
    setShowSafariHint(isIOSSafariNotStandalone())
    setApiKey(getGoogleApiKey())
  }, [])

  async function loadData() {
    const { isWhisperAvailable } = await sttEngine()
    const [pairs, cacheStats, ttsStats, whisper] = await Promise.allSettled([
      getLanguagePairStatus(),
      getCacheStats(),
      getTTSCacheStats(),
      isWhisperAvailable(),
    ])
    if (pairs.status === 'fulfilled') setLanguagePairs(pairs.value)
    if (cacheStats.status === 'fulfilled') setTranslationCacheCount(cacheStats.value.entryCount)
    if (ttsStats.status === 'fulfilled') setTtsCacheCount(ttsStats.value.entryCount)
    if (whisper.status === 'fulfilled') setWhisperReady(whisper.value)
  }

  const handleRefresh = async () => {
    await refreshModels()
    await loadData()
  }

  const handleClearTranslationCache = async () => {
    await clearTranslationCache()
    await loadData()
  }

  const handleClearTTSCache = async () => {
    await clearTTSCache()
    await loadData()
  }

  const handleSaveApiKey = () => {
    setGoogleApiKey(apiKey)
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  const handleDownloadWhisper = async () => {
    setWhisperDownloading(true)
    setWhisperProgress(0)
    setWhisperError(null)
    try {
      const { preloadWhisper } = await sttEngine()
      await preloadWhisper((pct) => setWhisperProgress(Math.round(pct)))
      setWhisperReady(true)
    } catch (err) {
      console.error('[Settings] Whisper download failed:', err)
      setWhisperError(err instanceof Error ? err.message : t('error.unknown'))
    } finally {
      setWhisperDownloading(false)
    }
  }

  // Group language pairs by source language for better display
  const groupedPairs = languagePairs.reduce((acc, pair) => {
    const group = pair.src === 'en' ? 'Englisch →' : `${pair.src.toUpperCase()} →`
    if (!acc[group]) acc[group] = []
    acc[group].push(pair)
    return acc
  }, {} as Record<string, typeof languagePairs>)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Safari Homescreen Hint */}
      {showSafariHint && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>{t('settings.safariHintTitle')}</strong> {t('settings.safariHintText')}{' '}
              <span className="inline-block px-1 bg-amber-200/50 rounded">{t('settings.safariHintShare')}</span> →{' '}
              <span className="inline-block px-1 bg-amber-200/50 rounded">{t('settings.safariHintHome')}</span>.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Network Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {networkMode === 'offline' ? <WifiOff className="h-4 w-4 text-destructive" /> : <Wifi className="h-4 w-4 text-emerald-600" />}
            {t('settings.network')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${
              networkMode === 'online' ? 'bg-emerald-500' :
              networkMode === 'degraded' ? 'bg-amber-500' :
              'bg-destructive'
            }`} />
            <span className="text-sm">
              {networkMode === 'online' ? t('settings.networkOnline') :
               networkMode === 'degraded' ? t('settings.networkDegraded') :
               t('settings.networkOffline')}
            </span>
          </div>
          {offlineSupport && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(offlineSupport).map(([key, supported]) => (
                <span
                  key={key}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    supported ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {key}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('settings.storage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <StorageIndicator
            storageUsed={storageUsed}
            storagePercent={storagePercent}
            isPersistent={isPersistent}
            onRequestPersistence={requestPersistence}
          />
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" />
            Google Cloud API-Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('settings.apiKeyDesc')}
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={apiKeyInputRef}
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button size="sm" onClick={handleSaveApiKey} className="gap-1.5 shrink-0">
              {apiKeySaved ? <Check className="h-3.5 w-3.5" /> : <Key className="h-3.5 w-3.5" />}
              {apiKeySaved ? t('settings.apiKeySaved') : t('settings.apiKeySave')}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${hasGoogleApiKey() ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
            <span className="text-muted-foreground">
              {hasGoogleApiKey() ? t('settings.apiKeyActive') : t('settings.apiKeyInactive')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Offline Translation Models */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('settings.offlineLangs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('settings.offlineLangsDesc')}
          </p>
          {Object.entries(groupedPairs).map(([group, pairs]) => (
            <div key={group}>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{group}</h4>
              <div className="space-y-2">
                {pairs.map(pair => (
                  <LanguagePackCard
                    key={`${pair.src}-${pair.tgt}`}
                    src={pair.src}
                    tgt={pair.tgt}
                    modelId={pair.modelId}
                    downloaded={pair.downloaded}
                    sizeEstimateMB={pair.sizeEstimateMB}
                    onStatusChange={handleRefresh}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Offline Speech Recognition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            {t('settings.whisper')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {t('settings.whisperDesc')}
          </p>
          {whisperReady ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('settings.whisperReady')}
            </div>
          ) : whisperDownloading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${whisperProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{whisperProgress}%</span>
            </div>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleDownloadWhisper} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                {t('settings.whisperDownload')}
              </Button>
              {whisperError && (
                <p className="text-xs text-destructive mt-2" role="alert">{whisperError}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {t('settings.cache')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">{t('settings.translationCache')}</div>
              <div className="text-xs text-muted-foreground">{translationCacheCount} {t('settings.entries')} (30d)</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearTranslationCache}
              disabled={translationCacheCount === 0}
            >
              {t('settings.clear')}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">{t('settings.ttsCache')}</div>
              <div className="text-xs text-muted-foreground">{ttsCacheCount} {t('settings.audioClips')}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearTTSCache}
              disabled={ttsCacheCount === 0}
            >
              {t('settings.clear')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
