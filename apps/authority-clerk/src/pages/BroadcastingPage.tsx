/**
 * Broadcasting Page — AmtTranslator (Jobcenter-Modus)
 *
 * Enables one-to-many translation: one clerk speaks,
 * multiple visitors receive simultaneous translations
 * in their own language.
 *
 * Use cases:
 * - Gruppeninformationsveranstaltungen (Jobcenter)
 * - Erstaufnahme-Briefings (BAMF)
 * - Wartezimmer-Durchsagen
 *
 * Design: Behörden-Professionell — Blue/Slate für Jobcenter-Modus
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Radio,
  Users,
  Mic,
  MicOff,
  Square,
  QrCode,
  Globe,
  Shield,
  Volume2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QRCodeSVG } from 'qrcode.react'

function generateBroadcastCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'BC-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const BROADCAST_TOPICS = [
  { id: 'buergergeld', label: 'Bürgergeld-Erstantrag', icon: '📋' },
  { id: 'arbeitsvermittlung', label: 'Arbeitsvermittlung', icon: '💼' },
  { id: 'eingliederung', label: 'Eingliederungsvereinbarung', icon: '🤝' },
  { id: 'massnahmen', label: 'Maßnahmen & Kurse', icon: '📚' },
  { id: 'sanktionen', label: 'Mitwirkungspflichten', icon: '⚠️' },
  { id: 'erstaufnahme', label: 'Erstaufnahme-Briefing', icon: '🏠' },
  { id: 'asyl', label: 'Asylverfahren-Info', icon: '📄' },
  { id: 'sonstiges', label: 'Sonstiges', icon: '💬' },
]

const MOCK_LISTENERS = [
  { id: 1, lang: '🇸🇦', name: 'Arabisch', active: true },
  { id: 2, lang: '🇹🇷', name: 'Türkisch', active: true },
  { id: 3, lang: '🇺🇦', name: 'Ukrainisch', active: true },
  { id: 4, lang: '🇷🇺', name: 'Russisch', active: false },
  { id: 5, lang: '🇮🇷', name: 'Persisch', active: true },
]

type BroadcastState = 'idle' | 'ready' | 'live' | 'paused' | 'ended'

export default function BroadcastingPage() {
  const navigate = useNavigate()
  const [broadcastCode] = useState(generateBroadcastCode)
  const [topic, setTopic] = useState('')
  const [state, setState] = useState<BroadcastState>('idle')
  const [listenerCount, setListenerCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const broadcastUrl = `https://authority-visitor.fintutto.world/${broadcastCode}`

  // Simulate listeners joining
  useEffect(() => {
    if (state === 'ready' || state === 'live') {
      const interval = setInterval(() => {
        setListenerCount((prev) => Math.min(prev + Math.floor(Math.random() * 2), 12))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [state])

  // Timer
  useEffect(() => {
    if (state === 'live') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setState('ready')
    setShowQR(true)
  }

  const handleGoLive = () => {
    setState('live')
    setIsRecording(true)
    // Simulate transcript
    const phrases = [
      'Guten Tag, willkommen beim Jobcenter.',
      'Heute informieren wir Sie über den Bürgergeld-Antrag.',
      'Bitte hören Sie aufmerksam zu.',
      'Bei Fragen können Sie sich melden.',
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < phrases.length) {
        setTranscript((prev) => [...prev, phrases[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 4000)
  }

  const handlePause = () => {
    setState('paused')
    setIsRecording(false)
  }

  const handleResume = () => {
    setState('live')
    setIsRecording(true)
  }

  const handleEnd = () => {
    setState('ended')
    setIsRecording(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(broadcastCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Radio className="h-5 w-5 text-blue-600" />
            Gruppeninfo Broadcasting
          </h1>
          <p className="text-sm text-muted-foreground">
            Simultanübersetzung für mehrere Teilnehmer
          </p>
        </div>
      </div>

      {/* Status Banner */}
      {state === 'live' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-red-700 dark:text-red-400">LIVE</span>
          <span className="text-sm text-red-600 dark:text-red-400">
            {formatTime(elapsedSeconds)}
          </span>
          <div className="ml-auto flex items-center gap-1 text-sm text-red-600">
            <Users className="h-4 w-4" />
            {listenerCount} Zuhörer
          </div>
        </div>
      )}

      {state === 'ended' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <Check className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-700 dark:text-green-400">
            Broadcast beendet — {formatTime(elapsedSeconds)} · {listenerCount} Teilnehmer
          </span>
        </div>
      )}

      {/* Topic Selection */}
      {state === 'idle' && (
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-sm">Thema auswählen</h2>
          <div className="grid grid-cols-2 gap-2">
            {BROADCAST_TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                  topic === t.id
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-accent'
                }`}
              >
                <span className="text-lg mr-2">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* QR Code + Session Code */}
      {(state === 'ready' || state === 'live' || state === 'paused') && (
        <Card className="p-4 space-y-3 border-blue-200 dark:border-blue-800">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowQR(!showQR)}
          >
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-sm">Teilnehmer einladen</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {listenerCount} verbunden
              </span>
            </div>
            {showQR ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showQR && (
            <div className="space-y-3">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-white rounded-xl border">
                  <QRCodeSVG value={broadcastUrl} size={120} level="H" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Session-Code:</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold tracking-widest text-blue-800 dark:text-blue-300">
                      {broadcastCode}
                    </span>
                    <button onClick={handleCopyCode}>
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Besucher öffnen amttranslator.de und geben diesen Code ein.
                  </p>
                </div>
              </div>

              {/* Live listeners */}
              {listenerCount > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Verbundene Sprachen:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_LISTENERS.filter((l) => l.active).map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs"
                      >
                        <span>{l.lang}</span>
                        <span className="text-blue-700 dark:text-blue-400">{l.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Live Transcript */}
      {transcript.length > 0 && (
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-sm">Live-Transkript</h2>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {transcript.map((line, i) => (
              <p
                key={i}
                className="text-sm text-muted-foreground border-l-2 border-blue-200 pl-3"
              >
                {line}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {state === 'idle' && (
          <Button
            onClick={handleStart}
            className="w-full bg-blue-700 hover:bg-blue-800"
            size="lg"
          >
            <Radio className="h-5 w-5 mr-2" />
            Broadcasting vorbereiten
          </Button>
        )}

        {state === 'ready' && (
          <Button
            onClick={handleGoLive}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            <Mic className="h-5 w-5 mr-2" />
            LIVE gehen — Übersetzung starten
          </Button>
        )}

        {state === 'live' && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handlePause}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button
              onClick={handleEnd}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Square className="h-4 w-4 mr-2" />
              Beenden
            </Button>
          </div>
        )}

        {state === 'paused' && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleResume}
              className="bg-blue-700 hover:bg-blue-800"
            >
              <Mic className="h-4 w-4 mr-2" />
              Fortsetzen
            </Button>
            <Button
              onClick={handleEnd}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Square className="h-4 w-4 mr-2" />
              Beenden
            </Button>
          </div>
        )}

        {state === 'ended' && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate('/history')}
              variant="outline"
            >
              Protokoll ansehen
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Zurück zum Start
            </Button>
          </div>
        )}
      </div>

      {/* Info Cards */}
      {state === 'idle' && (
        <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
          <div className="space-y-1">
            <Globe className="h-5 w-5 mx-auto" />
            <p>Simultanübersetzung in 40+ Sprachen</p>
          </div>
          <div className="space-y-1">
            <Users className="h-5 w-5 mx-auto" />
            <p>Bis zu 50 Teilnehmer gleichzeitig</p>
          </div>
          <div className="space-y-1">
            <Shield className="h-5 w-5 mx-auto" />
            <p>100% offline, keine Datenweitergabe</p>
          </div>
        </div>
      )}
    </div>
  )
}
