// Speech-to-Text abstraction layer
// Supports: Web Speech API (Chrome/Edge), Google Cloud STT (iOS + fallback)
// Future: Apple SpeechAnalyzer (iOS 26)

import { getTranslation, type UILanguage } from '@/lib/i18n'

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
  let stream: MediaStream | null = null
  let shouldBeListening = false
  let lastSyntheticFinal = '' // Tracks text emitted as synthetic isFinal from interim results

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
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
      }

      // Request mic permission
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

      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognitionCtor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = lang

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0].transcript
          const confidence = result[0].confidence

          if (result.isFinal) {
            // Dedup: if we already synthetically finalized part of this text, emit only the delta
            if (lastSyntheticFinal && text.startsWith(lastSyntheticFinal)) {
              const delta = text.slice(lastSyntheticFinal.length).trim()
              lastSyntheticFinal = ''
              if (delta) {
                onResult({ text: delta, isFinal: true, confidence })
              }
            } else {
              lastSyntheticFinal = ''
              onResult({ text, isFinal: true, confidence })
            }
          } else {
            // Interim result: check for sentence boundaries to emit early finals
            const boundary = detectSentenceBoundary(text)
            if (boundary) {
              // Emit completed sentence(s) as synthetic final
              onResult({ text: boundary.final, isFinal: true, confidence })
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
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }

        if (err.error === 'not-allowed') {
          onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.micDeniedHint'))
        } else if (err.error === 'network') {
          onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.networkStt'))
        } else {
          onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.sttGeneric').replace('{error}', err.error))
        }
      }

      recognition.onend = () => {
        if (shouldBeListening && recognition) {
          try { recognition.start(); return } catch { /* fall through */ }
        }
        shouldBeListening = false
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
      }

      shouldBeListening = true
      try {
        recognition.start()
      } catch {
        shouldBeListening = false
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
        recognition = null
        const uiLang = (localStorage.getItem('ui-language') || 'de') as UILanguage
        onError(getTranslation(uiLang, 'error.sttStartFailed'))
      }
    },

    stop() {
      shouldBeListening = false
      if (recognition) {
        try { recognition.abort() } catch { /* ignore */ }
        recognition = null
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
      }
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

const STT_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY || 'AIzaSyD0jpDgyihxFytR-jDIxEHj17kl4Oz9FGY'
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

  const isSupported =
    typeof window !== 'undefined' &&
    !!STT_API_KEY &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  async function recognizeChunks(chunks: Float32Array[], lang: string): Promise<string> {
    if (chunks.length === 0) return ''

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

    try {
      const response = await fetch(`${STT_API_URL}?key=${STT_API_KEY}`, {
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
        throw new Error(`Google STT ${response.status}`)
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

      source.connect(processor)
      processor.connect(audioContext.destination)
      isActive = true

      onResult({ text: '...', isFinal: false })

      sendInterval = setInterval(async () => {
        if (!isActive || audioChunks.length === 0) return
        // Cap audio sent per request to ~15 seconds max to limit payload size
        const maxSendChunks = Math.ceil((15 * actualSampleRate) / 4096)
        const sendFrom = Math.max(0, audioChunks.length - maxSendChunks)
        const snapshot = audioChunks.slice(sendFrom)
        try {
          const fullText = await recognizeChunks(snapshot, activeLang)
          if (!fullText || !onResultCallback) return

          // Extract only the NEW text (beyond what we already finalized)
          const newText = emittedFinalText && fullText.startsWith(emittedFinalText)
            ? fullText.slice(emittedFinalText.length).trim()
            : (emittedFinalText ? fullText : fullText) // fallback: use full text if no prefix match

          if (!newText) return

          // Check for sentence boundaries → emit synthetic isFinal
          const boundary = detectSentenceBoundary(newText)
          if (boundary) {
            onResultCallback({ text: boundary.final, isFinal: true })
            emittedFinalText += (emittedFinalText ? ' ' : '') + boundary.final

            // Trim audio buffer: keep only last ~5 seconds for context
            const keepChunks = Math.ceil((5 * actualSampleRate) / 4096)
            if (audioChunks.length > keepChunks * 2) {
              audioChunks = audioChunks.slice(-keepChunks)
            }

            // Emit remainder as interim
            if (boundary.remainder) {
              onResultCallback({ text: boundary.remainder, isFinal: false })
            }
          } else {
            // No sentence boundary yet — emit as interim
            onResultCallback({ text: newText, isFinal: false })
          }
        } catch (err) {
          // Non-fatal — continue recording
          if (err instanceof Error && err.message.includes('403')) {
            onError(getTranslation((localStorage.getItem('ui-language') || 'de') as UILanguage, 'error.cloudSttNotAvailable'))
            isActive = false
          }
        }
      }, 3000)
    },

    stop() {
      isActive = false

      if (sendInterval) {
        clearInterval(sendInterval)
        sendInterval = null
      }

      if (audioChunks.length > 0 && onResultCallback) {
        const finalChunks = [...audioChunks]
        const callback = onResultCallback
        const lang = activeLang
        const alreadyEmitted = emittedFinalText

        recognizeChunks(finalChunks, lang).then(text => {
          if (!text) return
          // Only emit the portion not yet finalized via synthetic finals
          const remainder = alreadyEmitted && text.startsWith(alreadyEmitted)
            ? text.slice(alreadyEmitted.length).trim()
            : text
          if (remainder) callback({ text: remainder, isFinal: true })
        }).catch(() => {})
      }

      if (processor) { processor.disconnect(); processor = null }
      if (audioContext) { audioContext.close().catch(() => {}); audioContext = null }
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
      audioChunks = []
      onResultCallback = null
      activeLang = ''
      emittedFinalText = ''
    },
  }
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

  // 3. Web Speech API (streaming, real-time — Chrome/Edge/Android)
  const webSpeech = createWebSpeechEngine()
  if (webSpeech.isSupported) return webSpeech

  // 4. Google Cloud STT (fallback for any browser with mic access)
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
