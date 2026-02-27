import { useState, useCallback, useRef, useEffect } from 'react'
import { useBroadcast } from './useBroadcast'
import { usePresence } from './usePresence'
import { useConnectionMode } from './useConnectionMode'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { translateText } from '@/lib/translate'
import { getLanguageByCode } from '@/lib/languages'
import { generateSessionCode } from '@/lib/session'
import { getSessionUrlWithTransport } from '@/lib/transport/connection-manager'
import type { TranslationChunk, SessionInfo, StatusMessage } from '@/lib/session'
import type { ConnectionConfig } from '@/lib/transport/types'

function generateChunkId(): string {
  return `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function getDeviceName(): string {
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua)) return 'iPad'
  if (/Android/i.test(ua)) return 'Android'
  if (/Mac/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows'
  return 'Browser'
}

export function useLiveSession() {
  const [role, setRole] = useState<'speaker' | 'listener' | null>(null)
  const [sessionCode, setSessionCode] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('de')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [currentTranslation, setCurrentTranslation] = useState('')
  const [receivedChunks, setReceivedChunks] = useState<TranslationChunk[]>([])
  const [translationHistory, setTranslationHistory] = useState<TranslationChunk[]>([])
  const [sessionEnded, setSessionEnded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoTTS, setAutoTTS] = useState(true)

  // Connection mode management
  const connection = useConnectionMode()

  // Pass transport instances to hooks (undefined = use default Supabase)
  const broadcast = useBroadcast(connection.broadcastTransport)
  const presence = usePresence(connection.presenceTransport)
  const recognition = useSpeechRecognition()
  const tts = useSpeechSynthesis()

  const isTranslatingRef = useRef(false)
  const selectedLanguageRef = useRef(selectedLanguage)
  selectedLanguageRef.current = selectedLanguage
  const autoTTSRef = useRef(autoTTS)
  autoTTSRef.current = autoTTS
  const ttsRef = useRef(tts.speak)
  ttsRef.current = tts.speak

  // --- SPEAKER ---

  const createSession = useCallback(async (
    sourceLang: string,
    connectionConfig?: ConnectionConfig,
  ) => {
    const code = generateSessionCode()
    setSessionCode(code)
    setSourceLanguage(sourceLang)
    setRole('speaker')
    setSessionEnded(false)
    setTranslationHistory([])
    setError(null)

    // Initialize connection mode
    if (connectionConfig) {
      // For BLE speaker mode, inject session code so GATT server can start
      const config = connectionConfig.mode === 'ble'
        ? { ...connectionConfig, bleSessionCode: code, bleSourceLanguage: sourceLang }
        : connectionConfig
      await connection.initialize(config)
    }

    // Subscribe to broadcast channel
    broadcast.subscribe(code)

    // Join presence as speaker
    presence.join(code, {
      deviceName: `Speaker (${getDeviceName()})`,
      targetLanguage: '_speaker',
      joinedAt: new Date().toISOString(),
    })

    return code
  }, [broadcast, presence, connection])

  // Broadcast session info periodically when listener count changes
  useEffect(() => {
    if (role !== 'speaker' || !sessionCode) return
    broadcast.broadcast('session_info', {
      sessionCode,
      speakerName: getDeviceName(),
      sourceLanguage,
      listenerCount: presence.listenerCount,
    } satisfies SessionInfo)
  }, [role, sessionCode, sourceLanguage, presence.listenerCount, broadcast])

  // Handle speech recognition results (speaker side)
  const handleSpeechResult = useCallback(async (text: string) => {
    if (isTranslatingRef.current || !text.trim()) return
    isTranslatingRef.current = true

    try {
      // Get unique target languages from connected listeners
      const targetLangs = Object.keys(presence.listenersByLanguage)
        .filter(lang => lang !== '_speaker')

      if (targetLangs.length === 0) return

      // Translate to all requested languages in parallel
      const results = await Promise.all(
        targetLangs.map(async (targetLang) => {
          const result = await translateText(text, sourceLanguage, targetLang)
          return {
            id: generateChunkId(),
            sourceText: text,
            translatedText: result.translatedText,
            sourceLang: sourceLanguage,
            targetLanguage: targetLang,
            isFinal: true,
            timestamp: Date.now(),
          } satisfies TranslationChunk
        })
      )

      // Broadcast each translation
      for (const chunk of results) {
        broadcast.broadcast('translation', chunk as unknown as Record<string, unknown>)
      }

      // Add to local history (one entry per source text)
      if (results.length > 0) {
        setTranslationHistory(prev => [...prev, results[0]])
      }
    } catch (err) {
      console.error('[Live] Translation fan-out failed:', err)
      setError(err instanceof Error ? err.message : 'Übersetzung fehlgeschlagen')
    } finally {
      isTranslatingRef.current = false
    }
  }, [sourceLanguage, presence.listenersByLanguage, broadcast])

  const startRecording = useCallback(() => {
    const lang = getLanguageByCode(sourceLanguage)
    recognition.startListening(lang?.speechCode || sourceLanguage, handleSpeechResult)
  }, [sourceLanguage, recognition, handleSpeechResult])

  const stopRecording = useCallback(() => {
    recognition.stopListening()
  }, [recognition])

  const endSession = useCallback(() => {
    broadcast.broadcast('status', { speaking: false, ended: true } satisfies StatusMessage)
    recognition.stopListening()
    setTimeout(() => {
      broadcast.unsubscribe()
      presence.leave()
      setRole(null)
      setSessionCode('')
      setSessionEnded(true)
    }, 500) // Brief delay so listeners receive the end message
  }, [broadcast, presence, recognition])

  // --- LISTENER ---

  const joinSession = useCallback(async (
    code: string,
    targetLang: string,
    connectionConfig?: ConnectionConfig,
  ) => {
    setSessionCode(code)
    setSelectedLanguage(targetLang)
    setRole('listener')
    setSessionEnded(false)
    setReceivedChunks([])
    setCurrentTranslation('')
    setError(null)

    // Initialize connection mode
    if (connectionConfig) {
      await connection.initialize(connectionConfig)
    }

    // Subscribe to broadcast
    broadcast.subscribe(
      code,
      // onTranslation
      (chunk: TranslationChunk) => {
        if (chunk.targetLanguage === selectedLanguageRef.current) {
          setCurrentTranslation(chunk.translatedText)
          setReceivedChunks(prev => [...prev, chunk])

          // Auto-TTS
          if (autoTTSRef.current && chunk.translatedText) {
            const lang = getLanguageByCode(selectedLanguageRef.current)
            ttsRef.current(chunk.translatedText, lang?.speechCode || selectedLanguageRef.current)
          }
        }
      },
      // onSessionInfo
      undefined,
      // onStatus
      (status: StatusMessage) => {
        if (status.ended) {
          setSessionEnded(true)
        }
      },
    )

    // Join presence as listener
    presence.join(code, {
      deviceName: getDeviceName(),
      targetLanguage: targetLang,
      joinedAt: new Date().toISOString(),
    })
  }, [broadcast, presence, connection])

  const selectLanguage = useCallback((lang: string) => {
    setSelectedLanguage(lang)
    presence.updatePresence({ targetLanguage: lang })
  }, [presence])

  const leaveSession = useCallback(() => {
    tts.stop()
    broadcast.unsubscribe()
    presence.leave()
    setRole(null)
    setSessionCode('')
  }, [broadcast, presence, tts])

  // --- Session URL for QR code ---
  const sessionUrl = sessionCode
    ? getSessionUrlWithTransport(sessionCode, {
        broadcast: connection.broadcastTransport!,
        presence: connection.presenceTransport!,
        mode: connection.mode,
        serverUrl: connection.serverUrl,
      })
    : ''

  return {
    // Session state
    role,
    sessionCode,
    sourceLanguage,
    isConnected: broadcast.isConnected,
    sessionEnded,
    error,

    // Connection mode
    connectionMode: connection.mode,
    connectionServerUrl: connection.serverUrl,
    isResolvingConnection: connection.isResolving,
    switchToCloud: connection.switchToCloud,
    switchToLocal: connection.switchToLocal,

    // Hotspot info (WiFi credentials for QR code, populated in hotspot mode)
    hotspotInfo: connection.hotspotInfo,

    // Session URL (includes local WS params when in local mode)
    sessionUrl,

    // Speaker
    createSession,
    endSession,
    isRecording: recognition.isListening,
    startRecording,
    stopRecording,
    currentTranscript: recognition.transcript,
    translationHistory,

    // Listener
    joinSession,
    leaveSession,
    selectedLanguage,
    selectLanguage,
    currentTranslation,
    receivedChunks,
    autoTTS,
    setAutoTTS,
    isSpeaking: tts.isSpeaking,

    // Shared
    listeners: presence.listeners.filter(l => l.targetLanguage !== '_speaker'),
    listenerCount: presence.listeners.filter(l => l.targetLanguage !== '_speaker').length,
    listenersByLanguage: presence.listenersByLanguage,
  }
}
