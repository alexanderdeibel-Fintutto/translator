import { useState } from 'react'
import { Volume2, VolumeX, LogOut, Loader2, WifiOff, Subtitles, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageChips from './LanguageChips'
import LiveTranscript from './LiveTranscript'
import ConnectionModeIndicator from './ConnectionModeIndicator'
import { getLanguageByCode } from '@/lib/languages'
import type { useLiveSession } from '@/hooks/useLiveSession'

type Session = ReturnType<typeof useLiveSession>

interface ListenerViewProps {
  session: Session
}

export default function ListenerView({ session }: ListenerViewProps) {
  const langData = getLanguageByCode(session.selectedLanguage)
  const [subtitleMode, setSubtitleMode] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  if (session.sessionEnded) {
    return (
      <Card className="p-8 text-center space-y-4">
        <p className="text-xl font-semibold">Session beendet</p>
        <p className="text-muted-foreground">
          Der Speaker hat die Live-Übersetzung beendet.
        </p>
        <Button onClick={session.leaveSession}>Zurück</Button>
      </Card>
    )
  }

  // Fullscreen subtitle mode — large text, dark background, minimal UI
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 cursor-pointer"
        onClick={() => setFullscreen(false)}
      >
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {session.isConnected && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setFullscreen(false) }}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
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
              Warte auf Übersetzung...
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
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Verbindung unterbrochen — Versuche erneut zu verbinden...</span>
          <Loader2 className="h-4 w-4 animate-spin ml-auto shrink-0" />
        </div>
      )}

      {/* Current translation - large display */}
      <Card className="p-6 min-h-[200px] flex items-center justify-center relative">
        {/* Fullscreen button */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Vollbild-Untertitel"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {session.currentTranslation ? (
          <div className="text-center space-y-2 w-full">
            <p className="text-2xl md:text-3xl font-medium leading-relaxed break-words">
              {session.currentTranslation}
            </p>
            {session.isSpeaking && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="h-4 w-4 animate-pulse" />
                Wird vorgelesen...
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto opacity-40" />
            <p className="text-lg">Warte auf Übersetzung...</p>
            <p className="text-sm">
              Session <span className="font-mono font-bold">{session.sessionCode}</span>
            </p>
            {session.isConnected && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Verbunden
              </span>
            )}
          </div>
        )}
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
        <Button
          variant={session.autoTTS ? 'default' : 'outline'}
          size="sm"
          onClick={() => session.setAutoTTS(!session.autoTTS)}
          className="gap-1.5"
        >
          {session.autoTTS ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          Auto-Vorlesen
        </Button>

        <Button
          variant={subtitleMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSubtitleMode(!subtitleMode)}
          className="gap-1.5"
        >
          <Subtitles className="h-3.5 w-3.5" />
          Untertitel
        </Button>

        <div className="flex-1" />

        <span className="text-sm text-muted-foreground">
          {langData?.flag} {langData?.name}
        </span>

        <Button variant="ghost" size="sm" onClick={session.leaveSession} className="gap-1.5 text-destructive">
          <LogOut className="h-3.5 w-3.5" />
          Verlassen
        </Button>
      </div>

      {/* Language selection */}
      <Card className="p-4">
        <p className="text-sm font-medium mb-3">Zielsprache wählen</p>
        <LanguageChips
          selected={session.selectedLanguage}
          onSelect={session.selectLanguage}
          exclude={session.sourceLanguage}
        />
      </Card>

      {/* Transcript history */}
      {session.receivedChunks.length > 1 && (
        <LiveTranscript chunks={session.receivedChunks} isListener />
      )}
    </div>
  )
}
