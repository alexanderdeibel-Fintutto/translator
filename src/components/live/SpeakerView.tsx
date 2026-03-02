import { Mic, MicOff, StopCircle, WifiOff, Loader2, Download, Bluetooth, FileText, Activity } from 'lucide-react'
import { useRef, useCallback, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import SessionQRCode from './SessionQRCode'
import WifiQRCode from './WifiQRCode'
import ListenerStatus from './ListenerStatus'
import LiveTranscript from './LiveTranscript'
import ConnectionModeIndicator from './ConnectionModeIndicator'
import { getLanguageByCode } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'
import { useBleAdvertiser } from '@/hooks/useBleDiscovery'
import { getLatencyHistory, getAverageLatency, type LatencyReport } from '@/lib/latency'
import type { useLiveSession } from '@/hooks/useLiveSession'

type Session = ReturnType<typeof useLiveSession>

interface SpeakerViewProps {
  session: Session
}

export default function SpeakerView({ session }: SpeakerViewProps) {
  const { t } = useI18n()
  const sessionStartRef = useRef(Date.now())

  const isBleMode = session.connectionMode === 'ble'

  // BLE discovery advertising: auto-start when session is active (skip in BLE transport mode — GATT server advertises)
  const { isAdvertising } = useBleAdvertiser(isBleMode ? null : (session.sessionCode || null))

  const hasHotspot = session.hotspotInfo?.ssid && session.hotspotInfo?.password

  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [latency, setLatency] = useState<{ last: LatencyReport | null; avg: LatencyReport | null }>({ last: null, avg: null })

  // Poll latency stats while recording
  useEffect(() => {
    if (!session.isRecording) return
    const interval = setInterval(() => {
      const history = getLatencyHistory()
      const last = history.length > 0 ? history[history.length - 1] : null
      const avg = getAverageLatency()
      setLatency({ last, avg })
    }, 2000)
    return () => clearInterval(interval)
  }, [session.isRecording])

  const getProtocolMeta = useCallback(() => {
    const now = new Date()
    const durationMs = Date.now() - sessionStartRef.current
    const durationMin = Math.round(durationMs / 60000)
    const sourceLangData = getLanguageByCode(session.sourceLanguage)
    const connectionLabel = session.connectionMode === 'ble' ? t('liveSession.bleDirect') : session.connectionMode === 'local' ? t('liveSession.localNetwork') : t('liveSession.cloudConnection')
    return { now, durationMin, sourceLangData, connectionLabel }
  }, [session.sourceLanguage, session.connectionMode])

  const downloadProtocol = useCallback((format: 'txt' | 'md') => {
    const { now, durationMin, sourceLangData, connectionLabel } = getProtocolMeta()
    setExportMenuOpen(false)

    const dateStr = now.toLocaleDateString(undefined) + ' ' + now.toLocaleTimeString(undefined)

    let protocol: string
    let mimeType: string
    let ext: string

    if (format === 'md') {
      // Markdown format
      mimeType = 'text/markdown;charset=utf-8'
      ext = 'md'
      protocol = `# guidetranslator — ${t('protocol.title')}\n\n`
      protocol += `| ${t('protocol.field')} | ${t('protocol.value')} |\n|------|------|\n`
      protocol += `| ${t('protocol.session')} | \`${session.sessionCode}\` |\n`
      protocol += `| ${t('protocol.date')} | ${dateStr} |\n`
      protocol += `| ${t('protocol.duration')} | ${durationMin} ${t('protocol.minutes')} |\n`
      protocol += `| ${t('protocol.sourceLangShort')} | ${sourceLangData?.flag || ''} ${sourceLangData?.name || session.sourceLanguage} |\n`
      protocol += `| ${t('protocol.listeners')} | ${session.listenerCount} |\n`
      protocol += `| ${t('protocol.connection')} | ${connectionLabel} |\n\n`
      protocol += `---\n\n## ${t('protocol.translations')}\n\n`

      for (const chunk of session.translationHistory) {
        const time = new Date(chunk.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const targetLangData = getLanguageByCode(chunk.targetLanguage)
        protocol += `**${time}** — ${targetLangData?.flag || ''} ${targetLangData?.name || chunk.targetLanguage}\n\n`
        protocol += `> ${sourceLangData?.flag || ''} ${chunk.sourceText}\n\n`
        protocol += `> ${targetLangData?.flag || ''} **${chunk.translatedText}**\n\n`
      }

      protocol += `---\n\n*${t('protocol.createdWith')} [guidetranslator](https://guidetranslator.com)*\n`
    } else {
      // Plain text format
      mimeType = 'text/plain;charset=utf-8'
      ext = 'txt'
      protocol = `========================================\n`
      protocol += `GUIDETRANSLATOR - ${t('protocol.title').toUpperCase()}\n`
      protocol += `========================================\n\n`
      protocol += `${t('protocol.session')}: ${session.sessionCode}\n`
      protocol += `${t('protocol.date')}: ${dateStr}\n`
      protocol += `${t('protocol.duration')}: ${durationMin} ${t('protocol.minutesFull')}\n`
      protocol += `${t('protocol.sourceLanguage')}: ${sourceLangData?.name || session.sourceLanguage}\n`
      protocol += `${t('protocol.listeners')}: ${session.listenerCount}\n`
      protocol += `${t('protocol.connection')}: ${connectionLabel}\n`
      protocol += `\n----------------------------------------\n`
      protocol += `${t('protocol.translations').toUpperCase()}\n`
      protocol += `----------------------------------------\n\n`

      for (const chunk of session.translationHistory) {
        const time = new Date(chunk.timestamp).toLocaleTimeString(undefined)
        const targetLangData = getLanguageByCode(chunk.targetLanguage)
        protocol += `[${time}]\n`
        protocol += `  ${sourceLangData?.flag || ''} ${chunk.sourceText}\n`
        protocol += `  ${targetLangData?.flag || ''} ${chunk.translatedText} (${targetLangData?.name || chunk.targetLanguage})\n\n`
      }

      protocol += `----------------------------------------\n`
      protocol += `${t('protocol.endOfProtocol')}\n`
      protocol += `${t('protocol.createdWith')} guidetranslator.com\n`
    }

    const blob = new Blob([protocol], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${t('protocol.filename')}-${session.sessionCode}-${now.toISOString().slice(0, 10)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [session.sessionCode, session.sourceLanguage, session.translationHistory, session.listenerCount, getProtocolMeta])

  return (
    <div className="space-y-4">
      {/* Connection mode indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <ConnectionModeIndicator
            mode={session.connectionMode}
            isConnected={session.isConnected}
            isResolving={session.isResolvingConnection}
            serverUrl={session.connectionServerUrl}
            isHotspotHost={!!session.hotspotInfo}
          />
          {(isAdvertising || isBleMode) && (
            <span className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400">
              <Bluetooth className="h-3 w-3" aria-hidden="true" />
              {isBleMode ? 'GATT' : 'BLE'}
            </span>
          )}
        </div>
      </div>

      {/* iOS manual hotspot instruction */}
      {session.hotspotInfo?.manualHotspotRequired && (
        <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 text-sky-700 dark:text-sky-400 rounded-lg text-sm" role="alert">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('live.hotspotInstruction')}</span>
        </div>
      )}

      {/* Connection status bar (skip in BLE mode — GATT server is always "connected") */}
      {!isBleMode && !session.isConnected && !session.isResolvingConnection && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{t('live.disconnected')}</span>
          <Loader2 className="h-4 w-4 animate-spin ml-auto shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: QR Codes + Controls */}
        <div className="space-y-4">
          {/* WiFi QR code (hotspot mode only) — shown FIRST so listeners connect to WiFi */}
          {hasHotspot && (
            <WifiQRCode
              ssid={session.hotspotInfo!.ssid}
              password={session.hotspotInfo!.password}
              step={1}
            />
          )}

          {/* Session QR code — listeners scan AFTER connecting to WiFi (not in BLE mode) */}
          {isBleMode ? (
            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-center space-y-2">
              <Bluetooth className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400" />
              <p className="font-mono font-bold text-lg tracking-widest">{session.sessionCode}</p>
              <p className="text-xs text-muted-foreground">
                {t('live.bleAutoDiscovery')}
              </p>
            </div>
          ) : (
            <SessionQRCode
              code={session.sessionCode}
              sessionUrl={session.sessionUrl}
            />
          )}

          <div className="flex gap-2">
            {session.isRecording ? (
              <Button
                onClick={session.stopRecording}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <MicOff className="h-4 w-4" />
                {t('live.pause')}
              </Button>
            ) : (
              <Button
                onClick={session.startRecording}
                className="flex-1 gap-2"
                disabled={!isBleMode && !session.isConnected}
              >
                <Mic className="h-4 w-4" />
                {t('live.startRecording')}
              </Button>
            )}
          </div>

          {/* Download Protocol Button - appears after first translation */}
          {session.translationHistory.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
              >
                <Download className="h-4 w-4" />
                {t('live.downloadProtocol')}
              </Button>
              {exportMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => downloadProtocol('txt')}
                    className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-accent transition-colors text-sm"
                    aria-label={t('protocol.exportText')}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('protocol.exportText')}
                  </button>
                  <button
                    onClick={() => downloadProtocol('md')}
                    className="flex items-center gap-2 px-3 py-2.5 w-full text-left hover:bg-accent transition-colors text-sm"
                    aria-label={t('protocol.exportMarkdown')}
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('protocol.exportMarkdown')}
                  </button>
                </div>
              )}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:text-destructive"
            onClick={session.endSession}
          >
            <StopCircle className="h-4 w-4" />
            {t('live.endSession')}
          </Button>

          <ListenerStatus
            listeners={session.listeners}
            listenersByLanguage={session.listenersByLanguage}
          />
        </div>

        {/* Right: Transcript */}
        <div className="lg:col-span-2 flex flex-col">
          {session.isRecording && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">{t('live.recording')}</span>
              {session.currentTranscript && (
                <span className="text-sm text-muted-foreground/60 truncate ml-2">
                  {session.currentTranscript}
                </span>
              )}
            </div>
          )}

          {/* Pipeline latency stats */}
          {session.isRecording && latency.last && (
            <div className="flex items-center gap-3 mb-3 px-2 py-1.5 bg-muted/50 rounded-lg text-[11px] font-mono text-muted-foreground">
              <Activity className="h-3 w-3 shrink-0" />
              <span title="Speech-to-Text">STT {latency.last.sttMs.toFixed(0)}ms</span>
              <span className="text-muted-foreground/30">|</span>
              <span title="Translation">Translate {latency.last.translateMs.toFixed(0)}ms</span>
              <span className="text-muted-foreground/30">|</span>
              <span title="Total pipeline" className="font-semibold text-foreground/70">
                Σ {latency.last.totalMs.toFixed(0)}ms
              </span>
              {latency.avg && (
                <>
                  <span className="text-muted-foreground/30">|</span>
                  <span>ø {latency.avg.totalMs.toFixed(0)}ms</span>
                </>
              )}
            </div>
          )}

          <LiveTranscript
            chunks={session.translationHistory}
            currentText={session.isRecording ? session.currentTranscript : undefined}
          />
        </div>
      </div>

      {session.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg" role="alert">
          {session.error}
        </div>
      )}
    </div>
  )
}
