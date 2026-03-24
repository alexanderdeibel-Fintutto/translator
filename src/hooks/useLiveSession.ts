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
import type { ConnectionConfig, BackChannelMessage, ListenerAnnounce } from '@/lib/transport/types'

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
  const [backChannelMessages, setBackChannelMessages] = useState<BackChannelMessage[]>([])

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

  // Stable refs for broadcast and presence to avoid infinite re-render loops.
  // broadcast and presence return new object references on every render, which
  // causes useCallback/useEffect to re-run infinitely when used as dependencies.
  // By reading through refs, we always get the latest value without triggering re-renders.
  const broadcastRef = useRef(broadcast)
  broadcastRef.current = broadcast
  const presenceRef = useRef(presence)
  presenceRef.current = presence

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

    // Subscribe to broadcast channel (speaker receives backchannel + listener_announce)
    broadcastRef.current.subscribe(
      code,
      undefined, // onTranslation (speaker doesn't receive translations)
      undefined, // onSessionInfo
      undefined, // onStatus
      (msg: BackChannelMessage) => {
        setBackChannelMessages((prev) => [...prev, msg])
      },
      // onListenerAnnounce — track listener languages via broadcast (presence fallback)
      (data: ListenerAnnounce) => {
        const key = `${data.deviceName}:${data.targetLanguage}`
        announcedListenersRef.current.set(key, data)
      },
    )

    // Join presence as speaker
    presenceRef.current.join(code, {
      deviceName: `Speaker (${getDeviceName()})`,
      targetLanguage: '_speaker',
      joinedAt: new Date().toISOString(),
    })

    return code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection])

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
      broadcastRef.current.broadcast('heartbeat', { t: Date.now() })
    }, 10_000) // every 10 seconds
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, sessionCode])

  // Broadcast session info periodically when listener count changes
  useEffect(() => {
    if (role !== 'speaker' || !sessionCode) return

    const send = () => {
      lastBroadcastRef.current = Date.now()
      broadcastRef.current.broadcast('session_info', {
        sessionCode,
        speakerName: getDeviceName(),
        sourceLanguage,
        listenerCount: presenceRef.current.listenerCount,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, sessionCode, sourceLanguage, presence.listenerCount])

  // Process a single text through translation fan-out
  const processTranslation = useCallback(async (text: string) => {
    // Get unique target languages from connected listeners (presence)
    // Use ref to avoid stale closure — presence object changes on every render
    const presenceLangs = Object.keys(presenceRef.current.listenersByLanguage)
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

    // Diagnostic: log what we see (console.error survives production builds)
    console.error(`[LiveSession] processTranslation: text="${text.slice(0, 30)}", presenceLangs=[${presenceLangs}], announcedLangs=[${[...announcedLangs]}], allTargetLangs=[${allTargetLangs}], broadcast.connected=${broadcastRef.current.isConnected}`)

    // Separate _live listeners (passthrough, no translation needed) from regular
    const hasLiveListeners = allTargetLangs.includes('_live')
    let targetLangs = allTargetLangs.filter(lang => lang !== '_live')

    if (allTargetLangs.length === 0) {
      // No listeners detected via presence/announce yet.
      // Still broadcast as _live so listeners who ARE connected but not yet
      // visible (common on iOS — presence/announce can lag) get the source text.
      // Also record in speaker's history and presence fallback.
      const chunk: TranslationChunk = {
        id: generateChunkId(),
        sourceText: text,
        translatedText: text,
        sourceLang: sourceLanguage,
        targetLanguage: '_live',
        isFinal: true,
        timestamp: Date.now(),
      }
      // Broadcast as _live — listeners with _live selected will receive it,
      // and listeners with other languages at least see the speaker is active
      broadcastRef.current.broadcast('translation', chunk as unknown as Record<string, unknown>)
      // Write to presence fallback so iOS listeners can pick it up
      try {
        presenceRef.current.updatePresence({
          lastChunks: JSON.stringify([{
            id: chunk.id,
            sourceText: chunk.sourceText,
            translatedText: chunk.translatedText,
            sourceLang: chunk.sourceLang,
            targetLanguage: chunk.targetLanguage,
            timestamp: chunk.timestamp,
          }]),
          lastChunkBatch: Date.now(),
        })
      } catch { /* best-effort */ }
      setTranslationHistory(prev => {
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
      broadcastRef.current.broadcast('translation', liveChunk as unknown as Record<string, unknown>)
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
      broadcastRef.current.broadcast('translation', chunk as unknown as Record<string, unknown>)
    }

    // Fallback: also write translations to speaker's presence state.
    // Supabase broadcast can silently fail on iOS Safari/WebKit while presence
    // continues to work. The listener watches for this and accepts translations
    // via presence if they don't arrive via broadcast.
    const allChunks = [
      ...(hasLiveListeners ? [{
        id: generateChunkId(),
        sourceText: text,
        translatedText: text,
        sourceLang: sourceLanguage,
        targetLanguage: '_live',
        isFinal: true,
        timestamp: Date.now(),
      }] : []),
      ...results,
    ]
    if (allChunks.length > 0) {
      try {
        presenceRef.current.updatePresence({
          lastChunks: JSON.stringify(allChunks.map(c => ({
            id: c.id,
            sourceText: c.sourceText,
            translatedText: c.translatedText,
            sourceLang: c.sourceLang,
            targetLanguage: c.targetLanguage,
            timestamp: c.timestamp,
          }))),
          lastChunkBatch: Date.now(),
        })
      } catch { /* presence fallback is best-effort */ }
    }

    // Add to local history (one entry per source text, capped at 100)
    // ALWAYS show source text in speaker's history — even if translation fails.
    // Use the first successful translation if available, otherwise fall back to source text.
    const historyChunk: TranslationChunk = results.length > 0 ? results[0] : {
      id: generateChunkId(),
      sourceText: text,
      translatedText: text,
      sourceLang: sourceLanguage,
      targetLanguage: hasLiveListeners ? '_live' : (targetLangs[0] || sourceLanguage),
      isFinal: true,
      timestamp: Date.now(),
    }

    setTranslationHistory(prev => {
      // Dedup: skip if chunk with same ID already exists
      if (prev.some(c => c.id === historyChunk.id)) return prev
      // Also dedup by source text within last 3 seconds (same STT result processed twice)
      const cutoff = Date.now() - 3000
      if (prev.some(c => c.sourceText === historyChunk.sourceText && c.timestamp > cutoff)) return prev
      const next = [...prev, historyChunk]
      return next.length > 100 ? next.slice(-100) : next
    })

    // Warn if some translations failed
    const failed = settled.filter(r => r.status === 'rejected')
    if (failed.length > 0) {
      console.warn(`[Live] ${failed.length}/${settled.length} translations failed`)
    }
  // IMPORTANT: Do NOT add presence or broadcast as dependencies here.
  // Both return new object references on every render, causing an infinite re-render loop
  // when a listener joins (presence changes → processTranslation recreated → re-render → repeat).
  // Instead, we read them via stable refs (presenceRef, broadcastRef) defined above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceLanguage])

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

    // Dedup: skip if we already processed this exact or very similar text recently.
    // Also catches near-duplicates from STT punctuation revisions (e.g., "hello" vs "Hello!").
    const now = Date.now()
    const recents = recentFinalsRef.current
    // Purge old entries
    while (recents.length > 0 && now - recents[0].time > 5000) {
      recents.shift()
    }
    const normalized = trimmed.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
    if (recents.some(f => {
      // Exact match
      if (f.text === normalized) return true
      // Containment match: new text is contained in a recent final or vice versa
      // (catches cases where STT re-emits partial or extended versions)
      if (normalized.length > 5 && f.text.length > 5) {
        if (f.text.includes(normalized) || normalized.includes(f.text)) return true
      }
      return false
    })) {
      console.log(`[Live] Dedup: skipping duplicate/similar final "${trimmed.slice(0, 40)}..."`)
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
    broadcastRef.current.broadcast('status', { speaking: false, ended: true } satisfies StatusMessage)
    recognition.stopListening()
    announcedListenersRef.current.clear()
    if (announceIntervalRef.current) {
      clearInterval(announceIntervalRef.current)
      announceIntervalRef.current = null
    }
    setTimeout(() => {
      broadcastRef.current.unsubscribe()
      presenceRef.current.leave()
      setRole(null)
      setSessionCode('')
      setSessionEnded(true)
    }, 500) // Brief delay so listeners receive the end message
  }, [recognition])

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

  // Track last broadcast message received on listener side for stale connection detection
  const lastBroadcastReceivedRef = useRef(0)
  const listenerReconnectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const joinArgsRef = useRef<{ code: string; targetLang: string; connectionConfig?: ConnectionConfig } | null>(null)

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
    lastBroadcastReceivedRef.current = Date.now()
    joinArgsRef.current = { code, targetLang, connectionConfig }

    // Initialize connection mode
    if (connectionConfig) {
      await connection.initialize(connectionConfig)
    }

    // Subscribe to broadcast
    broadcastRef.current.subscribe(
      code,
      // onTranslation
      (chunk: TranslationChunk) => {
        lastBroadcastReceivedRef.current = Date.now()
        console.error(`[Listener] Received chunk: targetLang=${chunk.targetLanguage}, selected=${selectedLanguageRef.current}, match=${chunk.targetLanguage === selectedLanguageRef.current}, text="${chunk.translatedText?.slice(0, 30)}"`)
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
      // onSessionInfo — track heartbeat from speaker to detect dead broadcast channel
      () => {
        lastBroadcastReceivedRef.current = Date.now()
      },
      // onStatus
      (status: StatusMessage) => {
        lastBroadcastReceivedRef.current = Date.now()
        if (status.ended) {
          setSessionEnded(true)
        }
      },
    )

    // Join presence as listener
    presenceRef.current.join(code, {
      deviceName: getDeviceName(),
      targetLanguage: targetLang,
      joinedAt: new Date().toISOString(),
    })

    // Broadcast-based announce — see useEffect below for connection-aware sending.
    // The 15s interval keeps the speaker's announce map fresh.
    if (announceIntervalRef.current) clearInterval(announceIntervalRef.current)
    announceIntervalRef.current = setInterval(() => {
      broadcastRef.current.broadcast('listener_announce', {
        targetLanguage: selectedLanguageRef.current,
        deviceName: getDeviceName(),
        ts: Date.now(),
      })
    }, 15_000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection])

  // --- Reactive listener announce: fires on EVERY connect/reconnect ---
  // The old approach used a fixed 1s setTimeout which was too early for iOS
  // (channel not yet SUBSCRIBED). This useEffect sends the announce as soon as
  // the broadcast channel is actually connected, and re-sends on every reconnect.
  useEffect(() => {
    if (role !== 'listener' || !broadcast.isConnected || !sessionCode) return
    console.error(`[Listener] Connected! Sending listener_announce for lang=${selectedLanguageRef.current}`)
    broadcastRef.current.broadcast('listener_announce', {
      targetLanguage: selectedLanguageRef.current,
      deviceName: getDeviceName(),
      ts: Date.now(),
    })
  // broadcast.isConnected is a primitive (boolean) — safe to use as dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, broadcast.isConnected, sessionCode])

  const selectLanguage = useCallback((lang: string) => {
    setSelectedLanguage(lang)
    selectedLanguageRef.current = lang // Sync ref immediately for incoming broadcasts
    setReceivedChunks([]) // Clear old translations from previous language
    setCurrentTranslation('')
    presenceRef.current.updatePresence({ targetLanguage: lang })
    // Re-announce immediately so speaker picks up the new language
    broadcastRef.current.broadcast('listener_announce', {
      targetLanguage: lang,
      deviceName: getDeviceName(),
      ts: Date.now(),
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Presence-based translation fallback (listener side) ---
  // Supabase broadcast can silently fail on iOS Safari/WebKit.
  // When this happens, translations never arrive via broadcast, but presence
  // continues to work. The speaker writes translations to their presence state.
  // We watch for those and accept them if we haven't received them via broadcast.
  const lastProcessedBatchRef = useRef(0)
  const presenceFallbackCountRef = useRef(0)

  useEffect(() => {
    if (role !== 'listener') return

    // Find speaker's presence entry
    const speakerEntry = presence.listeners.find(l => l.targetLanguage === '_speaker')
    if (!speakerEntry?.lastChunks || !speakerEntry.lastChunkBatch) return

    // Skip if we already processed this batch
    if (speakerEntry.lastChunkBatch <= lastProcessedBatchRef.current) return
    lastProcessedBatchRef.current = speakerEntry.lastChunkBatch

    try {
      const chunks: TranslationChunk[] = JSON.parse(speakerEntry.lastChunks)
      const myLang = selectedLanguageRef.current

      for (const chunk of chunks) {
        if (chunk.targetLanguage !== myLang) continue

        // Check if we already received this chunk via broadcast (dedup by ID)
        setReceivedChunks(prev => {
          if (prev.some(c => c.id === chunk.id)) return prev // Already have it
          presenceFallbackCountRef.current++
          console.error(`[Listener] Presence fallback: accepted chunk #${presenceFallbackCountRef.current} id=${chunk.id}, text="${chunk.translatedText?.slice(0, 30)}"`)
          const fullChunk: TranslationChunk = { ...chunk, isFinal: true }
          const next = [...prev, fullChunk]

          // Also update current translation display
          setCurrentTranslation(fullChunk.translatedText)

          // Auto-TTS for fallback-delivered chunks
          if (autoTTSRef.current && fullChunk.translatedText) {
            const ttsLangCode = myLang === '_live' ? fullChunk.sourceLang : myLang
            const lang = getLanguageByCode(ttsLangCode)
            ttsRef.current(fullChunk.translatedText, lang?.speechCode || ttsLangCode)
          }

          return next.length > 100 ? next.slice(-100) : next
        })
      }
    } catch {
      console.error('[Listener] Failed to parse presence fallback chunks')
    }
  }, [role, presence.listeners])

  const leaveSession = useCallback(() => {
    tts.stop()
    if (announceIntervalRef.current) {
      clearInterval(announceIntervalRef.current)
      announceIntervalRef.current = null
    }
    broadcastRef.current.unsubscribe()
    presenceRef.current.leave()
    joinArgsRef.current = null
    if (listenerReconnectTimerRef.current) {
      clearInterval(listenerReconnectTimerRef.current)
      listenerReconnectTimerRef.current = null
    }
    setRole(null)
    setSessionCode('')
  }, [tts])

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

    // Back channel
    broadcast: broadcast.broadcast,
    backChannelMessages,
    clearBackChannel: () => setBackChannelMessages([]),

    // Tier limits
    listenerLimitReached,
    sessionLimitReached,
    languageLimitReached,
    maxListeners: tierConfig.limits.maxListeners,
    maxLanguages: tierConfig.limits.maxLanguages,

    // Diagnostics (for debug panel)
    getDiagnostics: broadcast.getDiagnostics,
    presenceFallbackCount: presenceFallbackCountRef.current,
  }
}
