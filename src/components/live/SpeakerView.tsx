import { Mic, MicOff, StopCircle, WifiOff, Loader2, Download, Bluetooth } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import SessionQRCode from './SessionQRCode'
import WifiQRCode from './WifiQRCode'
import ListenerStatus from './ListenerStatus'
import LiveTranscript from './LiveTranscript'
import ConnectionModeIndicator from './ConnectionModeIndicator'
import { getLanguageByCode } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'
import { useBleAdvertiser } from '@/hooks/useBleDiscovery'
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

  const downloadProtocol = useCallback(() => {
    const now = new Date()
    const durationMs = Date.now() - sessionStartRef.current
    const durationMin = Math.round(durationMs / 60000)
    const sourceLangData = getLanguageByCode(session.sourceLanguage)

    let protocol = `========================================\n`
    protocol += `GUIDETRANSLATOR - SESSION-PROTOKOLL\n`
    protocol += `========================================\n\n`
    protocol += `Session-Code: ${session.sessionCode}\n`
    protocol += `Datum: ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString('de-DE')}\n`
    protocol += `Dauer: ${durationMin} Minuten\n`
    protocol += `Ausgangssprache: ${sourceLangData?.name || session.sourceLanguage}\n`
    protocol += `Zuhörer: ${session.listenerCount}\n`
    protocol += `Verbindung: ${session.connectionMode === 'ble' ? 'BLE Direkt' : session.connectionMode === 'local' ? 'Lokales Netzwerk' : 'Cloud'}\n`
    protocol += `\n----------------------------------------\n`
    protocol += `ÜBERSETZUNGEN\n`
    protocol += `----------------------------------------\n\n`

    for (const chunk of session.translationHistory) {
      const time = new Date(chunk.timestamp).toLocaleTimeString('de-DE')
      const targetLangData = getLanguageByCode(chunk.targetLanguage)
      protocol += `[${time}]\n`
      protocol += `  ${sourceLangData?.flag || ''} ${chunk.sourceText}\n`
      protocol += `  ${targetLangData?.flag || ''} ${chunk.translatedText} (${targetLangData?.name || chunk.targetLanguage})\n\n`
    }

    protocol += `----------------------------------------\n`
    protocol += `Ende des Protokolls\n`
    protocol += `Erstellt mit guidetranslator.com\n`

    const blob = new Blob([protocol], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protokoll-${session.sessionCode}-${now.toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [session.sessionCode, session.sourceLanguage, session.translationHistory, session.listenerCount, session.connectionMode])

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
              <Bluetooth className="h-3 w-3" />
              {isBleMode ? 'GATT' : 'BLE'}
            </span>
          )}
        </div>
      </div>

      {/* iOS manual hotspot instruction */}
      {session.hotspotInfo?.manualHotspotRequired && (
        <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 text-sky-700 dark:text-sky-400 rounded-lg text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Bitte aktiviere den <strong>Persönlichen Hotspot</strong> in den Einstellungen</span>
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
                Listener finden diese Session automatisch per Bluetooth
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
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={downloadProtocol}
            >
              <Download className="h-4 w-4" />
              {t('live.downloadProtocol')}
            </Button>
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

          <LiveTranscript
            chunks={session.translationHistory}
            currentText={session.isRecording ? session.currentTranscript : undefined}
          />
        </div>
      </div>

      {session.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {session.error}
        </div>
      )}
    </div>
  )
}
