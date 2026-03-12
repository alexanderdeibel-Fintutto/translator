// Speech-to-Text abstraction layer
// Supports: Web Speech API (Chrome/Edge), Google Cloud STT (iOS + fallback)
// Future: Apple SpeechAnalyzer (iOS 26)

import { getTranslation, type UILanguage } from '@/lib/i18n'
import { getGoogleApiKey } from '@/lib/api-key'

// Type declarations for Web Speech API (not in all TS lib bundles)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

export type STTProvider = 'web-speech' | 'apple-speech-analyzer' | 'google-cloud-stt' | 'whisper'

// --- Sentence boundary detection for streaming segmentation ---
// Detects sentence-ending punctuation (Latin, CJK, Arabic) followed by whitespace or end-of-string
const SENTENCE_END_RE = /[.!?;\u3002\uFF01\uFF1F\u061F](?:\s+|$)/g

export function detectSentenceBoundary(text: string): { final: string; remainder: string } | null {
  let lastIndex = -1
  let match: RegExpExecArray | null
  SENTENCE_END_RE.lastIndex = 0
  while ((match = SENTENCE_END_RE.exec(text)) !== null) {
    lastIndex = match.index + match[0].length
  }
  if (lastIndex > 0) {
    return { final: text.slice(0, lastIndex).trim(), remainder: text.slice(lastIndex).trim() }
  }
  return null
}

export interface STTResult {
  text: string
  isFinal: boolean
  confidence?: number
}

export interface STTEngine {
  readonly provider: STTProvider
  readonly isSupported: boolean
  start(lang: string, onResult: (result: STTResult) => void, onError: (error: string) => void): Promise<void>
  stop(): void
}

// --- Web Speech API engine (current default) ---

export function createWebSpeechEngine(): STTEngine {
  let recognition: SpeechRecognitionInstance | null = null
  let shouldBeListening = false
  let lastSyntheticFinal = '' // Tracks text emitted as synthetic isFinal from interim results
  let serviceCheckTimer: ReturnType<typeof setTimeout> | null = null
  let restartTimer: ReturnType<typeof setTimeout> | null = null // Debounce restart to prevent rapid beeps on Android
  const recentFinals: Array<{ text: string; time: number }> = [] // Dedup buffer for recently emitted finals

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  return {
    provider: 'web-speech',
    isSupported,

    async start(lang, onResult, onError) {
      // Clean up existing
      if (recognition) {
        try { recognition.abort() } catch { /* ignore */ }
        recognition = null
      }

      // Require secure context for mediaDevices API
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        onError('Voice input requires HTTPS. Please use a secure connection.')
        return
      }

      // Request mic permission — getUserMedia is needed to prompt permission dialog.
      // We immediately release the stream because SpeechRecognition captures its own
      // audio internally. Keeping a parallel getUserMedia stream open causes audio
      // artifacts (ringing/feedback) on some Android devices (e.g., Pixel).
      try {
        const permStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        // Release immediately — SpeechRecognition uses its own mic stream
        permStream.getTracks().forEach(t => t.stop())
      } catch (e) {
        if (e instanceof DOMException && e.name === 'NotAllowedError') {
          onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.micDeniedHint'))
        } else {
          onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.micUnavailableHint'))
        }
        return
      }

      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognitionCtor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = lang

      // Helper: check if text was recently emitted as final (dedup for Android restarts)
      // Only dedup within a short window after a restart — legitimate repeated
      // sentences (user genuinely says the same thing twice) should pass through.
      let lastRestartTime = 0 // Set when onend restarts recognition
      // Post-restart suppression: ignore interim results for a brief window after restart
      // to prevent echo/duplicate fragments that Chrome often emits right after start()
      const POST_RESTART_SUPPRESSION_MS = 400

      const isDuplicateFinal = (text: string): boolean => {
        const now = Date.now()
        // Purge entries older than 2.5 seconds
        while (recentFinals.length > 0 && now - recentFinals[0].time > 2500) {
          recentFinals.shift()
        }
        // Only dedup if we recently restarted recognition (within 3s)
        // This avoids dropping legitimate repeated sentences during normal speech
        if (now - lastRestartTime > 3000) return false
        const normalized = text.trim().toLowerCase()
        return recentFinals.some(f => f.text === normalized)
      }

      const trackFinal = (text: string) => {
        recentFinals.push({ text: text.trim().toLowerCase(), time: Date.now() })
        // Keep buffer bounded
        if (recentFinals.length > 20) recentFinals.shift()
      }

      recognition.onresult = (event) => {
        // Clear service check — we got results, the service works
        if (serviceCheckTimer) { clearTimeout(serviceCheckTimer); serviceCheckTimer = null }

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0].transcript
          const confidence = result[0].confidence

          // After a restart, Chrome often re-emits the tail of the previous utterance
          // as interim results. Suppress interims during the post-restart window to
          // avoid duplicate/echo fragments appearing in the UI and translation pipeline.
          if (!result.isFinal && lastRestartTime > 0) {
            const sinceRestart = Date.now() - lastRestartTime
            if (sinceRestart < POST_RESTART_SUPPRESSION_MS) {
              continue // Skip this interim — too soon after restart
            }
          }

          if (result.isFinal) {
            // Dedup: if we already synthetically finalized part of this text, emit only the delta
            if (lastSyntheticFinal && text.startsWith(lastSyntheticFinal)) {
              const delta = text.slice(lastSyntheticFinal.length).trim()
              lastSyntheticFinal = ''
              if (delta && !isDuplicateFinal(delta)) {
                trackFinal(delta)
                onResult({ text: delta, isFinal: true, confidence })
              }
            } else {
              lastSyntheticFinal = ''
              if (!isDuplicateFinal(text)) {
                trackFinal(text)
                onResult({ text, isFinal: true, confidence })
              }
            }
          } else {
            // Interim result: check for sentence boundaries to emit early finals
            const boundary = detectSentenceBoundary(text)
            if (boundary) {
              // Emit completed sentence(s) as synthetic final (with dedup)
              if (!isDuplicateFinal(boundary.final)) {
                trackFinal(boundary.final)
                onResult({ text: boundary.final, isFinal: true, confidence })
              }
              lastSyntheticFinal = boundary.final
              // Emit remainder as interim
              if (boundary.remainder) {
                onResult({ text: boundary.remainder, isFinal: false })
              }
            } else {
              onResult({ text, isFinal: false })
            }
          }
        }
      }

      recognition.onerror = (event) => {
        const err = event as SpeechRecognitionErrorEvent
        if (err.error === 'no-speech') return // non-fatal
        if (err.error === 'aborted') return

        shouldBeListening = false

        const uiLang = (localStorage.getItem('ui-language') || 'de') as UILanguage

        // getUserMedia already succeeded above, so 'not-allowed' here means the
        // speech SERVICE is blocked (Opera, certain WebKit browsers), NOT a mic
        // permission issue. Tag all non-mic errors so the hook can detect & fallback.
        if (err.error === 'not-allowed' || err.error === 'service-not-allowed' || err.error === 'network') {
          console.warn(`[STT] Web Speech service error: ${err.error}`)
          onError(`[web-speech-unavailable] ${getTranslation(uiLang, 'error.sttGeneric').replace('{error}', err.error)}`)
        } else {
          onError(getTranslation(uiLang, 'error.sttGeneric').replace('{error}', err.error))
        }
      }

      recognition.onend = () => {
        if (shouldBeListening && recognition) {
          // Reset synthetic final tracking — new recognition session starts fresh
          lastSyntheticFinal = ''
          // Debounce restart to prevent rapid audio artifacts on Android Chrome.
          // 600ms gives Chrome enough time to fully release the audio session
          // before starting a new one, avoiding system sounds on Pixel devices.
          if (restartTimer) clearTimeout(restartTimer)
          restartTimer = setTimeout(() => {
            restartTimer = null
            if (shouldBeListening && recognition) {
              lastRestartTime = Date.now()
              try { recognition.start(); return } catch { /* fall through */ }
            }
            shouldBeListening = false
          }, 600)
          return
        }
        shouldBeListening = false
      }

      shouldBeListening = true
      try {
        recognition.start()
        // Detect broken Web Speech services (Opera, some WebKit):
        // If no result arrives within 4s, assume the service is non-functional
        serviceCheckTimer = setTimeout(() => {
          if (shouldBeListening && recognition) {
            console.warn('[STT] Web Speech started but no results after 4s — triggering fallback')
            onError(`[web-speech-unavailable] Speech service not responding`)
          }
          serviceCheckTimer = null
        }, 4000)
      } catch {
        shouldBeListening = false
        recognition = null
        const uiLang = (localStorage.getItem('ui-language') || 'de') as UILanguage
        onError(getTranslation(uiLang, 'error.sttStartFailed'))
      }
    },

    stop() {
      shouldBeListening = false
      if (serviceCheckTimer) { clearTimeout(serviceCheckTimer); serviceCheckTimer = null }
      if (restartTimer) { clearTimeout(restartTimer); restartTimer = null }
      if (recognition) {
        // Use stop() instead of abort() — stop() lets Chrome finalize the current
        // audio session cleanly, which avoids transient sounds on Android devices.
        // abort() terminates immediately and can cause audio artifacts.
        try { recognition.stop() } catch { /* ignore */ }
        recognition = null
      }
      // No stream to stop — getUserMedia stream was released immediately after permission check
      // Clear dedup buffer
      recentFinals.length = 0
    },
  }
}

// --- Apple SpeechAnalyzer stub (iOS 26+) ---
// Will be implemented when native app wrapper is built.
// Apple SpeechAnalyzer provides:
//   - On-device processing (no network needed)
//   - Multi-language support
//   - Real-time streaming transcription
//   - Integration via WKWebView message handlers

export function createAppleSpeechAnalyzerEngine(): STTEngine {
  // Check if running inside a native iOS app with SpeechAnalyzer bridge
  const isSupported =
    typeof window !== 'undefined' &&
    'webkit' in window &&
    !!(window as unknown as Record<string, unknown>).fintuttoNative

  return {
    provider: 'apple-speech-analyzer',
    isSupported,

    async start(_lang, _onResult, onError) {
      onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.appleSpeechNotAvailable'))
    },

    stop() {
      // Will send stop message to WKWebView handler
    },
  }
}

// --- iOS detection ---
// All iOS browsers (Safari, Chrome, Firefox) use WebKit under the hood.
// WebKit exposes webkitSpeechRecognition but .start() fires 'service-not-allowed'.

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

// --- Google Cloud Speech-to-Text engine ---
// Primary STT on iOS (where Web Speech API is broken) and general fallback.
// Uses the same API key as TTS and Translate.

const STT_API_URL = 'https://speech.googleapis.com/v1/speech:recognize'

function pcmToBase64Linear16(chunks: Float32Array[]): string {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
  const merged = new Float32Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  const int16 = new Int16Array(merged.length)
  for (let i = 0; i < merged.length; i++) {
    const s = Math.max(-1, Math.min(1, merged[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
  }
  const bytes = new Uint8Array(int16.buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function mapSTTLanguageCode(lang: string): string {
  const map: Record<string, string> = {
    'zh-CN': 'cmn-Hans-CN',
    'nb-NO': 'no-NO',
  }
  return map[lang] || lang
}

export function createGoogleCloudSTTEngine(): STTEngine {
  let stream: MediaStream | null = null
  let audioContext: AudioContext | null = null
  let processor: ScriptProcessorNode | null = null
  let audioChunks: Float32Array[] = []
  let isActive = false
  let sendInterval: ReturnType<typeof setInterval> | null = null
  let onResultCallback: ((result: STTResult) => void) | null = null
  let activeLang = ''
  let actualSampleRate = 16000
  let emittedFinalText = '' // Tracks text already emitted as isFinal for sentence segmentation
  let lastInterimText = '' // Tracks last interim text for stability detection
  let interimStableCount = 0 // How many consecutive intervals returned similar/identical text
  let lastFinalEmitTime = 0 // Timestamp of last isFinal emission for time-based fallback
  let visibilityHandler: (() => void) | null = null // iOS AudioContext resume on visibility change

  const isSupported =
    typeof window !== 'undefined' &&
    !!getGoogleApiKey() &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  async function recognizeChunks(chunks: Float32Array[], lang: string): Promise<string> {
    if (chunks.length === 0) return ''

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

    try {
      const apiKey = getGoogleApiKey()
      if (!apiKey) throw new Error('Google STT API key not configured')

      const response = await fetch(`${STT_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: actualSampleRate,
            languageCode: mapSTTLanguageCode(lang),
            enableAutomaticPunctuation: true,
          },
          audio: { content: pcmToBase64Linear16(chunks) },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`[STT] Google Cloud STT error ${response.status}:`, errorBody)
        throw new Error(`Google STT ${response.status}: ${errorBody}`)
      }

      const data = await response.json()
      if (data.results && data.results.length > 0) {
        return data.results
          .map((r: { alternatives?: { transcript?: string }[] }) =>
            r.alternatives?.[0]?.transcript || ''
          )
          .join(' ')
          .trim()
      }
      return ''
    } finally {
      clearTimeout(timeout)
    }
  }

  return {
    provider: 'google-cloud-stt',
    isSupported,

    async start(lang, onResult, onError) {
      onResultCallback = onResult
      activeLang = lang
      audioChunks = []
      emittedFinalText = ''
      lastInterimText = ''
      interimStableCount = 0
      lastFinalEmitTime = Date.now()

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (e) {
        if (e instanceof DOMException && e.name === 'NotAllowedError') {
          onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.micDeniedHint'))
        } else {
          onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.micUnavailableHint'))
        }
        return
      }

      // Don't hardcode sampleRate — iOS Safari may ignore it and use 48kHz
      audioContext = new AudioContext()
      actualSampleRate = audioContext.sampleRate
      const source = audioContext.createMediaStreamSource(stream)
      processor = audioContext.createScriptProcessor(4096, 1, 1)

      // iOS WebKit suspends AudioContext when page goes to background or after inactivity.
      // Auto-resume to prevent recording from silently stopping.
      const tryResumeAudioContext = () => {
        if (audioContext && audioContext.state === 'suspended' && isActive) {
          console.log('[STT] AudioContext suspended, attempting resume...')
          audioContext.resume().catch(() => {})
        }
      }

      audioContext.addEventListener('statechange', tryResumeAudioContext)

      // Also resume on visibility change (user switches back to tab/app)
      visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          tryResumeAudioContext()
        }
      }
      document.addEventListener('visibilitychange', visibilityHandler)

      // Hard limit: keep max ~30 seconds of audio to prevent memory issues
      const maxBufferChunks = Math.ceil((30 * actualSampleRate) / 4096)

      processor.onaudioprocess = (e) => {
        if (!isActive) return
        audioChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)))
        // Enforce hard memory limit — discard oldest chunks beyond 30s
        if (audioChunks.length > maxBufferChunks) {
          audioChunks.splice(0, audioChunks.length - maxBufferChunks)
        }
      }

      // Connect processor through a zero-gain node to prevent mic audio from playing
      // through speakers (which causes feedback/echo). ScriptProcessorNode needs to be
      // connected to the audio graph to fire onaudioprocess events.
      const silencer = audioContext.createGain()
      silencer.gain.value = 0
      source.connect(processor)
      processor.connect(silencer)
      silencer.connect(audioContext.destination)
      isActive = true

      onResult({ text: '...', isFinal: false })

      // Helper: emit text as isFinal and trim audio buffer
      const emitFinal = (text: string) => {
        if (!onResultCallback) return
        onResultCallback({ text, isFinal: true })
        emittedFinalText += (emittedFinalText ? ' ' : '') + text
        lastFinalEmitTime = Date.now()
        lastInterimText = ''
        interimStableCount = 0

        // Trim audio buffer: keep only last ~5 seconds for context
        const keepChunks = Math.ceil((5 * actualSampleRate) / 4096)
        if (audioChunks.length > keepChunks * 2) {
          audioChunks = audioChunks.slice(-keepChunks)
        }
      }

      let isRecognizing = false // Guard against overlapping API calls
      sendInterval = setInterval(async () => {
        if (!isActive || audioChunks.length === 0 || isRecognizing) return
        isRecognizing = true
        // Cap audio sent per request to ~15 seconds max to limit payload size
        const maxSendChunks = Math.ceil((15 * actualSampleRate) / 4096)
        const sendFrom = Math.max(0, audioChunks.length - maxSendChunks)
        const snapshot = audioChunks.slice(sendFrom)
        try {
          const fullText = await recognizeChunks(snapshot, activeLang)
          if (!onResultCallback) return

          if (!fullText) {
            // No text recognized — if we had pending interim text, check stability timeout
            if (lastInterimText) {
              interimStableCount++
              // After 2 empty polls (~4s silence) with pending interim text, emit as final
              if (interimStableCount >= 2) {
                console.log('[STT] Silence timeout — emitting pending interim as final')
                emitFinal(lastInterimText)
              }
            }
            return
          }

          // Extract only the NEW text (beyond what we already finalized)
          const newText = emittedFinalText && fullText.startsWith(emittedFinalText)
            ? fullText.slice(emittedFinalText.length).trim()
            : (emittedFinalText ? fullText : fullText) // fallback: use full text if no prefix match

          if (!newText) {
            // Same text as before — increment stability counter
            if (lastInterimText) {
              interimStableCount++
              if (interimStableCount >= 3) {
                console.log('[STT] Stable text timeout — emitting as final')
                emitFinal(lastInterimText)
              }
            }
            return
          }

          // Check for sentence boundaries → emit synthetic isFinal
          const boundary = detectSentenceBoundary(newText)
          if (boundary) {
            emitFinal(boundary.final)

            // Emit remainder as interim
            if (boundary.remainder) {
              lastInterimText = boundary.remainder
              interimStableCount = 0
              onResultCallback({ text: boundary.remainder, isFinal: false })
            }
          } else {
            // No sentence boundary — check for time-based or stability-based finalization
            const timeSinceLastFinal = Date.now() - lastFinalEmitTime
            const wordCount = newText.split(/\s+/).length

            // Stability check: same text for 2+ consecutive polls (~4s)
            const isStable = newText === lastInterimText
            if (isStable) {
              interimStableCount++
            } else {
              interimStableCount = 0
            }

            // Force emit as isFinal if:
            // 1a. Short text (< 5 words) stable for 1+ interval (~2s) — fast single-word capture, OR
            // 1b. Longer text stable for 2+ intervals (~4s of no change), OR
            // 2. More than 6 seconds since last isFinal and we have substantial text (3+ words), OR
            // 3. Word count exceeds 20 (long utterance without punctuation)
            if (
              (isStable && wordCount < 5 && interimStableCount >= 1) ||
              (isStable && interimStableCount >= 2) ||
              (timeSinceLastFinal > 6000 && wordCount >= 3) ||
              wordCount >= 20
            ) {
              console.log(`[STT] Force-finalizing: stable=${interimStableCount}, elapsed=${timeSinceLastFinal}ms, words=${wordCount}`)
              emitFinal(newText)
            } else {
              // Emit as interim
              lastInterimText = newText
              onResultCallback({ text: newText, isFinal: false })
            }
          }
        } catch (err) {
          console.error('[STT] Recognition error:', err)
          if (err instanceof Error && (err.message.includes('403') || err.message.includes('401') || err.message.includes('400'))) {
            // Extract the actual Google API error message for better diagnostics
            let detail = ''
            try {
              const jsonStart = err.message.indexOf('{')
              if (jsonStart >= 0) {
                const parsed = JSON.parse(err.message.slice(jsonStart))
                detail = parsed?.error?.message || ''
              }
            } catch { /* ignore parse errors */ }

            const apiKey = getGoogleApiKey()
            const keyHint = apiKey ? ` (Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)})` : ''
            const errorDetail = detail
              ? `Cloud STT API: ${detail}${keyHint}`
              : getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.cloudSttNotAvailable') + keyHint

            onError(errorDetail)
            isActive = false
          }
        } finally {
          isRecognizing = false
        }
      }, 2000) // 2s interval (was 3s) for smoother updates on iOS
    },

    stop() {
      isActive = false

      // Clean up visibility listener (iOS AudioContext resume)
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
        visibilityHandler = null
      }

      if (sendInterval) {
        clearInterval(sendInterval)
        sendInterval = null
      }

      // Flush any pending interim text as final before stopping.
      // Skip the async final recognition — it frequently re-recognizes text that was
      // already emitted via the 2s polling, causing duplicate sentences. The interim
      // flush above captures any remaining text that hasn't been finalized yet.
      if (lastInterimText && onResultCallback) {
        onResultCallback({ text: lastInterimText, isFinal: true })
        lastInterimText = ''
      }

      if (processor) { processor.disconnect(); processor = null }
      if (audioContext) { audioContext.close().catch(() => {}); audioContext = null }
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
      audioChunks = []
      onResultCallback = null
      activeLang = ''
      emittedFinalText = ''
      lastInterimText = ''
      interimStableCount = 0
      lastFinalEmitTime = 0
    },
  }
}

// --- Android detection ---
// Chrome on Android plays an unavoidable system beep/ding every time
// SpeechRecognition.start() is called. With continuous mode, the recognition
// periodically stops and restarts, causing repeated beeps. The beep also
// interferes with mic input, degrading recognition quality.
// Solution: use Google Cloud STT on Android (no system sounds, direct mic access).

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

// --- Engine selection ---

export function getBestSTTEngine(): STTEngine {
  // 1. Prefer Apple SpeechAnalyzer when in native iOS wrapper
  const apple = createAppleSpeechAnalyzerEngine()
  if (apple.isSupported) return apple

  // 2. On iOS: use Google Cloud STT (Web Speech API is broken on all iOS browsers)
  if (isIOS()) {
    const googleSTT = createGoogleCloudSTTEngine()
    if (googleSTT.isSupported) return googleSTT
  }

  // 3. On Android: use Google Cloud STT to avoid Chrome's system beep sound.
  //    Chrome Android plays a "ding" on every recognition.start(), which repeats
  //    in continuous mode and interferes with mic capture. Google Cloud STT uses
  //    getUserMedia directly — no system sounds, no restart issues.
  if (isAndroid()) {
    const googleSTT = createGoogleCloudSTTEngine()
    if (googleSTT.isSupported) return googleSTT
  }

  // 4. Web Speech API (streaming, real-time — desktop Chrome/Edge)
  const webSpeech = createWebSpeechEngine()
  if (webSpeech.isSupported) return webSpeech

  // 5. Google Cloud STT (fallback for any browser with mic access)
  const googleFallback = createGoogleCloudSTTEngine()
  if (googleFallback.isSupported) return googleFallback

  // 5. Whisper offline (last resort — requires model download)
  return {
    provider: 'whisper',
    isSupported: typeof WebAssembly !== 'undefined',
    async start(lang, onResult, onError) {
      try {
        const { createWhisperSTTEngine } = await import('./offline/stt-engine')
        const engine = createWhisperSTTEngine()
        await engine.start(lang, onResult, onError)
        // Store engine reference for stop()
        ;(this as unknown as Record<string, STTEngine>)._activeEngine = engine
      } catch {
        onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.whisperNotAvailable'))
      }
    },
    stop() {
      const active = (this as unknown as Record<string, STTEngine>)._activeEngine
      if (active) {
        active.stop()
        delete (this as unknown as Record<string, STTEngine>)._activeEngine
      }
    },
  }
}
