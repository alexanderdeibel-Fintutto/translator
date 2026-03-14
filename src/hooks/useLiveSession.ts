import { useState, useCallback, useRef, useEffect } from 'react'
import { useBroadcast } from './useBroadcast'
import { usePresence } from './usePresence'
import { useConnectionMode } from './useConnectionMode'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'
import { translateText } from '@/lib/translate'
import { markSTTEnd, markTranslateStart, markTranslateEnd, markBroadcast } from '@/lib/latency'
import { getLanguageByCode } from '@/lib/languages'
import { generateSessionCode } from '@/lib/session'
import { getSessionUrlWithTransport } from '@/lib/transport/connection-manager'
import { TIERS, type TierId } from '@/lib/tiers'
import { recordSessionMinute, recordPeakListeners, isWithinSessionLimit } from '@/lib/usage-tracker'
import type { TranslationChunk, SessionInfo, StatusMessage } from '@/lib/session'
import type { ConnectionConfig, ListenerAnnounce } from '@/lib/transport/types'

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

export function useLiveSession(userTierId: TierId = 'free') {
  const { t } = useI18n()
  const [role, setRole] = useState<'speaker' | 'listener' | null>(null)
  const [sessionCode, setSessionCode] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('de')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [currentTranslation, setCurrentTranslation] = useState('')
  const [receivedChunks, setReceivedChunks] = useState<TranslationChunk[]>([])
  const [translationHistory, setTranslationHistory] = useState<TranslationChunk[]>([])
  const [sessionEnded, setSessionEnded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoTTS, setAutoTTSRaw] = useState(true)
  const [listenerLimitReached, setListenerLimitReached] = useState(false)
  const [sessionLimitReached, setSessionLimitReached] = useState(false)
  const [languageLimitReached, setLanguageLimitReached] = useState(false)

  // Tier config
  const tierConfig = TIERS[userTierId] ?? TIERS.free
  const tierRef = useRef(tierConfig)
  tierRef.current = tierConfig

  // Connection mode management
  const connection = useConnectionMode()

  // Pass transport instances to hooks (undefined = use default Supabase)
  const broadcast = useBroadcast(connection.broadcastTransport)
  const presence = usePresence(connection.presenceTransport)
  const recognition = useSpeechRecognition()
  const tts = useSpeechSynthesis()

  // Wrap setAutoTTS to unlock iOS audio when user enables auto-speak
  const setAutoTTS = useCallback((value: boolean) => {
    if (value) tts.warmup()
    setAutoTTSRaw(value)
  }, [tts])

  // Broadcast-based listener announce — fallback when presence is unreliable (iOS)
  // Maps "deviceName:targetLanguage" → ListenerAnnounce with timestamp
  const announcedListenersRef = useRef<Map<string, ListenerAnnounce>>(new Map())
  const announceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isTranslatingRef = useRef(false)
  const pendingTextsRef = useRef<string[]>([])
  const selectedLanguageRef = useRef(selectedLanguage)
  selectedLanguageRef.current = selectedLanguage
  const autoTTSRef = useRef(autoTTS)
  autoTTSRef.current = autoTTS
  const ttsRef = useRef(tts.speak)
  ttsRef.current = tts.speak
  const processTranslationRef = useRef<(text: string) => Promise<void>>(async () => {})

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

    // Subscribe to broadcast channel — listen for listener_announce as fallback to presence
    broadcast.subscribe(
      code,
      undefined, // onTranslation (speaker doesn't receive translations)
      undefined, // onSessionInfo
      undefined, // onStatus
      // onListenerAnnounce — track listener languages via broadcast (presence fallback)
      (data: ListenerAnnounce) => {
        const key = `${data.deviceName}:${data.targetLanguage}`
        announcedListenersRef.current.set(key, data)
      },
    )

    // Join presence as speaker
    presence.join(code, {
      deviceName: `Speaker (${getDeviceName()})`,
      targetLanguage: '_speaker',
      joinedAt: new Date().toISOString(),
    })

    return code
  }, [broadcast, presence, connection])

  // Broadcast session info when listener count changes (throttled to 1s)
  const lastBroadcastRef = useRef(0)
  const broadcastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track listener count and enforce tier limits
  useEffect(() => {
    if (role !== 'speaker') return
    recordPeakListeners(presence.listenerCount)

    const maxListeners = tierRef.current.limits.maxListeners
    if (maxListeners > 0 && presence.listenerCount > maxListeners) {
      setListenerLimitReached(true)
    } else {
      setListenerLimitReached(false)
    }
  }, [role, presence.listenerCount])

  // Track session minutes (tick every 60s while speaker is active)
  useEffect(() => {
    if (role !== 'speaker' || !sessionCode) return
    const interval = setInterval(() => {
      recordSessionMinute(1)
      if (!isWithinSessionLimit(tierRef.current.id)) {
        setSessionLimitReached(true)
      }
    }, 60_000) // every 60 seconds
    return () => clearInterval(interval)
  }, [role, sessionCode])

  // Speaker heartbeat: send a lightweight ping every 10s so listeners can detect
  // silent channel death (common on iOS WebKit — Safari, Firefox, Chrome).
  // Without this, a listener's channel can appear "connected" but receive nothing.
  useEffect(() => {
    if (role !== 'speaker' || !sessionCode) return
    const interval = setInterval(() => {
      broadcast.broadcast('heartbeat', { t: Date.now() })
    }, 10_000) // every 10 seconds
    return () => clearInterval(interval)
  }, [role, sessionCode, broadcast])

  // Broadcast session info periodically when listener count changes
  useEffect(() => {
    if (role !== 'speaker' || !sessionCode) return

    const send = () => {
      lastBroadcastRef.current = Date.now()
      broadcast.broadcast('session_info', {
        sessionCode,
        speakerName: getDeviceName(),
        sourceLanguage,
        listenerCount: presence.listenerCount,
      } satisfies SessionInfo)
    }

    const elapsed = Date.now() - lastBroadcastRef.current
    if (elapsed >= 1000) {
      send()
    } else {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current)
      broadcastTimerRef.current = setTimeout(send, 1000 - elapsed)
    }

    return () => {
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current)
    }
  }, [role, sessionCode, sourceLanguage, presence.listenerCount, broadcast])

  // Process a single text through translation fan-out
  const processTranslation = useCallback(async (text: string) => {
    // Get unique target languages from connected listeners (presence)
    const presenceLangs = Object.keys(presence.listenersByLanguage)
      .filter(lang => lang !== '_speaker')

    // Merge with broadcast-announced languages (fallback for broken presence on iOS)
    // Expire entries older than 45s (announce interval is 15s, so 3 missed = stale)
    const now = Date.now()
    const announcedLangs = new Set<string>()
    for (const [key, entry] of announcedListenersRef.current) {
      if (now - entry.ts > 45_000) {
        announcedListenersRef.current.delete(key)
      } else {
        announcedLangs.add(entry.targetLanguage)
      }
    }

    // Union of presence + announced languages
    const allTargetLangs = [...new Set([...presenceLangs, ...announcedLangs])]
      .filter(lang => lang !== '_speaker')

    // Separate _live listeners (passthrough, no translation needed) from regular
    const hasLiveListeners = allTargetLangs.includes('_live')
    let targetLangs = allTargetLangs.filter(lang => lang !== '_live')

    if (allTargetLangs.length === 0) {
      // No listeners yet — still record source text in speaker's history
      // so the speaker sees their own transcript
      const chunk: TranslationChunk = {
        id: generateChunkId(),
        sourceText: text,
        translatedText: text,
        sourceLang: sourceLanguage,
        targetLanguage: sourceLanguage,
        isFinal: true,
        timestamp: Date.now(),
      }
      setTranslationHistory(prev => {
        // Dedup by source text within last 3 seconds
        const cutoff = Date.now() - 3000
        if (prev.some(c => c.sourceText === text && c.timestamp > cutoff)) return prev
        const next = [...prev, chunk]
        return next.length > 100 ? next.slice(-100) : next
      })
      return
    }

    // Broadcast source text to _live listeners (no translation, no API call)
    if (hasLiveListeners) {
      const liveChunk: TranslationChunk = {
        id: generateChunkId(),
        sourceText: text,
        translatedText: text,
        sourceLang: sourceLanguage,
        targetLanguage: '_live',
        isFinal: true,
        timestamp: Date.now(),
      }
      broadcast.broadcast('translation', liveChunk as unknown as Record<string, unknown>)
    }

    // Enforce language limit per tier (0 = unlimited) — _live doesn't count
    const maxLangs = tierRef.current.limits.maxLanguages
    if (maxLangs > 0 && targetLangs.length > maxLangs) {
      console.warn(`[LiveSession] Language limit reached: ${targetLangs.length}/${maxLangs}, trimming to first ${maxLangs}`)
      targetLangs = targetLangs.slice(0, maxLangs)
      setLanguageLimitReached(true)
    } else {
      setLanguageLimitReached(false)
    }

    // Translate to all requested languages in parallel (resilient — individual failures don't block others)
    const settled = targetLangs.length > 0
      ? await Promise.allSettled(
          targetLangs.map(async (targetLang) => {
            const result = await translateText(text, sourceLanguage, targetLang)
            const chunk: TranslationChunk = {
              id: generateChunkId(),
              sourceText: text,
              translatedText: result.translatedText,
              sourceLang: sourceLanguage,
              targetLanguage: targetLang,
              isFinal: true,
              timestamp: Date.now(),
            }
            return chunk
          })
        )
      : []

    const results = settled
      .filter((r): r is PromiseFulfilledResult<TranslationChunk> => r.status === 'fulfilled')
      .map(r => r.value)

    // Broadcast each successful translation
    for (const chunk of results) {
      broadcast.broadcast('translation', chunk as unknown as Record<string, unknown>)
    }

    // Add to local history (one entry per source text, capped at 100)
    const historyChunk = results.length > 0 ? results[0] : (hasLiveListeners ? {
      id: generateChunkId(),
      sourceText: text,
      translatedText: text,
      sourceLang: sourceLanguage,
      targetLanguage: sourceLanguage,
      isFinal: true,
      timestamp: Date.now(),
    } as TranslationChunk : null)

    if (historyChunk) {
      setTranslationHistory(prev => {
        // Dedup: skip if chunk with same ID already exists
        if (prev.some(c => c.id === historyChunk.id)) return prev
        // Also dedup by source text within last 3 seconds (same STT result processed twice)
        const cutoff = Date.now() - 3000
        if (prev.some(c => c.sourceText === historyChunk.sourceText && c.timestamp > cutoff)) return prev
        const next = [...prev, historyChunk]
        return next.length > 100 ? next.slice(-100) : next
      })
    }

    // Warn if some translations failed
    const failed = settled.filter(r => r.status === 'rejected')
    if (failed.length > 0) {
      console.warn(`[Live] ${failed.length}/${settled.length} translations failed`)
    }
  }, [sourceLanguage, presence.listenersByLanguage, broadcast])

  // Keep ref in sync so drainQueue always calls the latest version
  processTranslationRef.current = processTranslation

  // Drain the pending queue one item at a time
  // Uses processTranslationRef to avoid stale closures when listeners join/leave
  const drainQueue = useCallback(async () => {
    if (isTranslatingRef.current) return
    const next = pendingTextsRef.current.shift()
    if (!next) return

    isTranslatingRef.current = true
    try {
      await processTranslationRef.current(next)
    } catch (err) {
      console.error('[Live] Translation fan-out failed:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      isTranslatingRef.current = false
      // Process next queued item if any
      if (pendingTextsRef.current.length > 0) {
        drainQueue()
      }
    }
  }, [])

  // Dedup: track recently processed final texts to prevent double-broadcast
  const recentFinalsRef = useRef<Array<{ text: string; time: number }>>([])

  // Handle speech recognition results (speaker side) — queue-based, never drops
  const handleSpeechResult = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    // Dedup: skip if we already processed this exact text in the last 3 seconds
    const now = Date.now()
    const recents = recentFinalsRef.current
    // Purge old entries
    while (recents.length > 0 && now - recents[0].time > 3000) {
      recents.shift()
    }
    const normalized = trimmed.toLowerCase()
    if (recents.some(f => f.text === normalized)) {
      console.log(`[Live] Dedup: skipping duplicate final "${trimmed.slice(0, 40)}..."`)
      return
    }
    recents.push({ text: normalized, time: now })
    if (recents.length > 20) recents.shift()

    pendingTextsRef.current.push(trimmed)
    drainQueue()
  }, [drainQueue])

  const startRecording = useCallback(() => {
    const lang = getLanguageByCode(sourceLanguage)
    // markSTTStart is called per-utterance via handleSpeechResult flow
    recognition.startListening(lang?.speechCode || sourceLanguage, handleSpeechResult)
  }, [sourceLanguage, recognition, handleSpeechResult])

  const stopRecording = useCallback(() => {
    recognition.stopListening()
  }, [recognition])

  const endSession = useCallback(() => {
    broadcast.broadcast('status', { speaking: false, ended: true } satisfies StatusMessage)
    recognition.stopListening()
    announcedListenersRef.current.clear()
    if (announceIntervalRef.current) {
      clearInterval(announceIntervalRef.current)
      announceIntervalRef.current = null
    }
    setTimeout(() => {
      broadcast.unsubscribe()
      presence.leave()
      setRole(null)
      setSessionCode('')
      setSessionEnded(true)
    }, 500) // Brief delay so listeners receive the end message
  }, [broadcast, presence, recognition])

  // Detect disconnect during active session and show feedback
  const disconnectMsg = t('error.connectionLost')
  useEffect(() => {
    if (role && !broadcast.isConnected && !sessionEnded) {
      setError(disconnectMsg)
    } else if (role && broadcast.isConnected && error === disconnectMsg) {
      setError(null) // Clear disconnect error on reconnect
    }
  }, [broadcast.isConnected, role, sessionEnded, error, disconnectMsg])

  // --- LISTENER ---

  const joinSession = useCallback(async (
    code: string,
    targetLang: string,
    connectionConfig?: ConnectionConfig,
  ) => {
    // Unlock iOS audio during this user gesture (tap "Join")
    // so that auto-TTS can play audio programmatically later
    tts.warmup()

    setSessionCode(code)
    setSelectedLanguage(targetLang)
    selectedLanguageRef.current = targetLang // Sync ref immediately for broadcast filter
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
          setReceivedChunks(prev => {
            // Dedup: skip if chunk with same ID already exists (duplicate from reconnect)
            if (prev.some(c => c.id === chunk.id)) return prev
            const next = [...prev, chunk]
            return next.length > 100 ? next.slice(-100) : next
          })

          // Auto-TTS — for _live mode use the source language's voice
          if (autoTTSRef.current && chunk.translatedText) {
            const ttsLangCode = selectedLanguageRef.current === '_live'
              ? chunk.sourceLang
              : selectedLanguageRef.current
            const lang = getLanguageByCode(ttsLangCode)
            ttsRef.current(chunk.translatedText, lang?.speechCode || ttsLangCode)
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

    // Broadcast-based announce — fallback when presence is unreliable (iOS Safari)
    // Send immediately and then every 15s so speaker always knows our language
    const sendAnnounce = () => {
      broadcast.broadcast('listener_announce', {
        targetLanguage: selectedLanguageRef.current,
        deviceName: getDeviceName(),
        ts: Date.now(),
      })
    }
    // Small delay to let the channel connect first
    setTimeout(sendAnnounce, 1000)
    if (announceIntervalRef.current) clearInterval(announceIntervalRef.current)
    announceIntervalRef.current = setInterval(sendAnnounce, 15_000)
  }, [broadcast, presence, connection])

  const selectLanguage = useCallback((lang: string) => {
    setSelectedLanguage(lang)
    selectedLanguageRef.current = lang // Sync ref immediately for incoming broadcasts
    setReceivedChunks([]) // Clear old translations from previous language
    setCurrentTranslation('')
    presence.updatePresence({ targetLanguage: lang })
    // Re-announce immediately so speaker picks up the new language
    broadcast.broadcast('listener_announce', {
      targetLanguage: lang,
      deviceName: getDeviceName(),
      ts: Date.now(),
    })
  }, [presence, broadcast])

  const leaveSession = useCallback(() => {
    tts.stop()
    if (announceIntervalRef.current) {
      clearInterval(announceIntervalRef.current)
      announceIntervalRef.current = null
    }
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
    currentTranscript: recognition.interimTranscript,
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

    // Tier limits
    listenerLimitReached,
    sessionLimitReached,
    languageLimitReached,
    maxListeners: tierConfig.limits.maxListeners,
    maxLanguages: tierConfig.limits.maxLanguages,
  }
}
