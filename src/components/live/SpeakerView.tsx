import { Mic, MicOff, StopCircle, WifiOff, Loader2, Download } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import SessionQRCode from './SessionQRCode'
import ListenerStatus from './ListenerStatus'
import LiveTranscript from './LiveTranscript'
import { getLanguageByCode } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'
import type { useLiveSession } from '@/hooks/useLiveSession'

type Session = ReturnType<typeof useLiveSession>

interface SpeakerViewProps {
  session: Session
}

export default function SpeakerView({ session }: SpeakerViewProps) {
  const { t } = useI18n()
  const sessionStartRef = useRef(Date.now())

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
  }, [session.sessionCode, session.sourceLanguage, session.translationHistory, session.listenerCount])

  return (
    <div className="space-y-4">
      {/* Connection status bar */}
      {!session.isConnected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{t('live.disconnected')}</span>
          <Loader2 className="h-4 w-4 animate-spin ml-auto shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: QR + Controls */}
        <div className="space-y-4">
          <SessionQRCode code={session.sessionCode} />

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
                disabled={!session.isConnected}
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
