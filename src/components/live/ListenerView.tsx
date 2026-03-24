import { useState, useRef, useCallback, useEffect } from 'react'
import { Volume2, VolumeX, LogOut, Loader2, WifiOff, Subtitles, Maximize2, Minimize2, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageChips from './LanguageChips'
import LiveTranscript from './LiveTranscript'
import ConnectionModeIndicator from './ConnectionModeIndicator'
import BackChannel, { type BackChannelResponse } from './BackChannel'
import { AudioModeToggle, AudioModeDisplay } from './AudioModeToggle'
import TapWord from './TapWord'
import { getLanguageByCode } from '@/lib/languages'
import { useI18n } from '@/context/I18nContext'
import { useRTL } from '@/hooks/useRTL'
import type { useLiveSession } from '@/hooks/useLiveSession'

type Session = ReturnType<typeof useLiveSession>

interface ListenerViewProps {
  session: Session
}

/** Live-updating debug panel with transport diagnostics */
function DebugPanel({ session }: { session: Session }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(id)
  }, [])
  const diag = session.getDiagnostics()
  const lastMsgAgo = diag.lastMessageAt > 0 ? `${Math.round((Date.now() - diag.lastMessageAt) / 1000)}s ago` : 'never'
  // suppress unused var warning
  void tick

  return (
    <Card className="p-3 text-xs font-mono space-y-1 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300">
      <p className="font-bold text-yellow-700 dark:text-yellow-400">DEBUG INFO</p>
      <p>Connected: {session.isConnected ? 'YES' : 'NO'}</p>
      <p>Mode: {session.connectionMode}</p>
      <p>Session: {session.sessionCode}</p>
      <p>Selected lang: {session.selectedLanguage}</p>
      <p className="font-bold">--- Broadcast Channel ---</p>
      <p>Messages received: {diag.receivedCount}</p>
      <p>Last message: {lastMsgAgo}</p>
      <p>Reconnects: {diag.reconnectCount}</p>
      <p className="font-bold">--- Translations ---</p>
      <p>Chunks (broadcast): {session.receivedChunks.length}</p>
      <p>Chunks (presence fallback): {session.presenceFallbackCount}</p>
      <p>Current: {session.currentTranslation ? `"${session.currentTranslation.slice(0, 50)}"` : '(none)'}</p>
      <p className="font-bold">--- Status ---</p>
      <p>Session ended: {session.sessionEnded ? 'YES' : 'NO'}</p>
      <p>Error: {session.error || '(none)'}</p>
      <p>Listeners: {session.listenerCount}</p>
      <p className="text-yellow-600 dark:text-yellow-500 pt-1">Tap 3x on session code to close</p>
    </Card>
  )
}

export default function ListenerView({ session }: ListenerViewProps) {
  const { t } = useI18n()
  const langData = getLanguageByCode(session.selectedLanguage)
  const [subtitleMode, setSubtitleMode] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [audioMode, setAudioMode] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Automatically switch to RTL layout for Arabic, Farsi, etc.
  useRTL(session.selectedLanguage)

  const handleBackChannelSend = useCallback((response: BackChannelResponse) => {
    session.broadcast?.('backchannel', {
      responseId: response.id,
      emoji: response.emoji,
      label: response.label,
      senderLang: session.selectedLanguage,
      timestamp: Date.now(),
    })
  }, [session])

  // Triple-tap on session code to toggle debug panel
  const handleDebugTap = useCallback(() => {
    tapCountRef.current++
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0
      setShowDebug(prev => !prev)
    } else {
      tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0 }, 600)
    }
  }, [])

  if (session.sessionEnded) {
    return (
      <Card className="p-8 text-center space-y-4">
        <p className="text-xl font-semibold">{t('live.sessionEnded')}</p>
        <p className="text-muted-foreground">
          {t('live.sessionEndedDesc')}
        </p>
        <Button onClick={session.leaveSession}>{t('live.back')}</Button>
      </Card>
    )
  }

  // Fullscreen subtitle mode — large text, dark background, minimal UI
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 cursor-pointer"
        onClick={() => setFullscreen(false)}
        role="region"
        aria-label={t('live.fullscreen')}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {session.isConnected && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="sr-only">{t('live.connected')}</span>
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setFullscreen(false) }}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t('live.closeFullscreen')}
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-4xl w-full text-center">
          {session.currentTranslation ? (
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-relaxed text-white break-words animate-in fade-in duration-300">
              {session.currentTranslation}
            </p>
          ) : (
            <p className="text-2xl text-white/30">
              {t('live.waitingTranslation')}
            </p>
          )}
        </div>

        {/* Last 3 subtitles fading out at bottom */}
        {session.receivedChunks.length > 1 && (
          <div className="absolute bottom-6 left-6 right-6 space-y-2 max-w-4xl mx-auto">
            {session.receivedChunks.slice(-4, -1).map((chunk, i, arr) => (
              <p
                key={chunk.id}
                className="text-sm sm:text-base text-white/40 text-center truncate transition-opacity"
                style={{ opacity: 0.2 + (i / arr.length) * 0.4 }}
              >
                {chunk.translatedText}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection mode indicator */}
      <div className="px-1">
        <ConnectionModeIndicator
          mode={session.connectionMode}
          isConnected={session.isConnected}
          isResolving={session.isResolvingConnection}
          serverUrl={session.connectionServerUrl}
        />
      </div>

      {/* Connection status bar */}
      {!session.isConnected && !session.isResolvingConnection && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm" role="alert">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{t('live.disconnected')}</span>
          <Loader2 className="h-4 w-4 animate-spin ml-auto shrink-0" aria-hidden="true" />
        </div>
      )}

      {/* Current translation - large display (or audio mode) */}
      <Card className="p-6 min-h-[200px] flex items-center justify-center relative">
        {!audioMode && (
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t('live.fullscreen')}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        <div aria-live="polite">
          {audioMode ? (
            <AudioModeDisplay
              isSpeaking={session.isSpeaking}
              isConnected={session.isConnected}
              sessionCode={session.sessionCode}
            />
          ) : session.currentTranslation ? (
            <div className="text-center space-y-2 w-full">
              <TapWord
                text={session.currentTranslation}
                sourceLang={session.sourceLanguage}
                targetLang={session.selectedLanguage}
                className="text-center"
              />
              {session.isSpeaking && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4 animate-pulse" aria-hidden="true" />
                  {t('live.speaking')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto opacity-40" aria-hidden="true" />
              <p className="text-lg">{t('live.waitingTranslation')}</p>
              <p className="text-sm" onClick={handleDebugTap}>
                Session <span className="font-mono font-bold">{session.sessionCode}</span>
              </p>
              {session.isConnected && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  {t('live.connected')}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Live subtitles strip (when enabled) */}
      {subtitleMode && session.receivedChunks.length > 0 && (
        <div className="bg-black/90 rounded-lg p-4 space-y-1.5">
          {session.receivedChunks.slice(-5).map((chunk, i, arr) => (
            <p
              key={chunk.id}
              className="text-white text-center text-sm sm:text-base transition-opacity"
              style={{ opacity: i === arr.length - 1 ? 1 : 0.3 + (i / arr.length) * 0.5 }}
            >
              {chunk.translatedText}
            </p>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* _live mode: show audio activate button (iOS requires user gesture to start AudioContext) */}
        {session.selectedLanguage === '_live' ? (
          <Button
            variant={session.isAudioPlaying ? 'default' : 'outline'}
            size="sm"
            onClick={() => session.resumeAudio?.()}
            className="gap-1.5"
            aria-label="Live-Audio aktivieren"
          >
            <Radio className="h-3.5 w-3.5" />
            {session.isAudioPlaying ? 'Audio läuft ●' : 'Audio aktivieren'}
          </Button>
        ) : (
          <Button
            variant={session.autoTTS ? 'default' : 'outline'}
            size="sm"
            onClick={() => session.setAutoTTS(!session.autoTTS)}
            className="gap-1.5"
            aria-pressed={session.autoTTS}
            aria-label={t('live.autoSpeak')}
          >
            {session.autoTTS ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {t('live.autoSpeak')}
          </Button>
        )}

        <Button
          variant={subtitleMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSubtitleMode(!subtitleMode)}
          className="gap-1.5"
          aria-pressed={subtitleMode}
          aria-label={t('live.subtitles')}
        >
          <Subtitles className="h-3.5 w-3.5" />
          {t('live.subtitles')}
        </Button>

        <AudioModeToggle
          enabled={audioMode}
          onToggle={(on) => {
            setAudioMode(on)
            if (on && !session.autoTTS) session.setAutoTTS(true)
          }}
        />

        <BackChannel onSend={handleBackChannelSend} />

        <div className="flex-1" />

        <span className="text-sm text-muted-foreground">
          {langData?.flag} {langData?.name}
        </span>

        <Button variant="ghost" size="sm" onClick={session.leaveSession} className="gap-1.5 text-destructive" aria-label={t('live.leave')}>
          <LogOut className="h-3.5 w-3.5" />
          {t('live.leave')}
        </Button>
      </div>

      {/* Language selection */}
      <Card className="p-4">
        <p className="text-sm font-medium mb-3">{t('live.chooseTargetLang')}</p>
        <LanguageChips
          selected={session.selectedLanguage}
          onSelect={session.selectLanguage}
          exclude={session.sourceLanguage}
          showLive
        />
      </Card>

      {/* Transcript history */}
      {session.receivedChunks.length > 1 && (
        <LiveTranscript chunks={session.receivedChunks} isListener />
      )}

      {/* Debug panel — triple-tap session code to toggle */}
      {showDebug && <DebugPanel session={session} />}
    </div>
  )
}
