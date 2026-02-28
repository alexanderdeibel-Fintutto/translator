// Offline Speech-to-Text engine using Whisper via Transformers.js
// Works fully offline once the model is downloaded (~40MB)
// Non-streaming: records audio, then transcribes in one pass
// Uses AudioWorklet (modern) with ScriptProcessorNode fallback (legacy)

import type { STTEngine, STTResult } from '../stt'
import { isModelDownloaded, recordModelDownload } from './model-manager'
import { getTranslation, type UILanguage } from '@/lib/i18n'

function t(key: string): string {
  const lang = (localStorage.getItem('ui-language') || 'de') as UILanguage
  return getTranslation(lang, key)
}

const WHISPER_MODEL = 'Xenova/whisper-small'

let pipeline: unknown = null
let isLoading = false

async function getWhisperPipeline(onProgress?: (pct: number) => void) {
  if (pipeline) return pipeline
  if (isLoading) throw new Error('Whisper model is still loading')

  isLoading = true
  try {
    const { pipeline: createPipeline } = await import('@huggingface/transformers')
    pipeline = await createPipeline('automatic-speech-recognition', WHISPER_MODEL, {
      progress_callback: (data: { status: string; progress?: number; loaded?: number }) => {
        if (data.status === 'progress' && data.progress !== undefined && onProgress) {
          onProgress(data.progress)
        }
        if (data.status === 'done') {
          recordModelDownload(WHISPER_MODEL, 'stt', data.loaded || 0).catch(() => {})
        }
      },
    })
    return pipeline
  } finally {
    isLoading = false
  }
}

/**
 * Check if the Whisper STT model is downloaded and ready.
 */
export async function isWhisperAvailable(): Promise<boolean> {
  return isModelDownloaded(WHISPER_MODEL)
}

/**
 * Preload the Whisper model into memory.
 */
export async function preloadWhisper(onProgress?: (pct: number) => void): Promise<void> {
  await getWhisperPipeline(onProgress)
}

/**
 * Check if AudioWorklet is available (modern browsers).
 */
function supportsAudioWorklet(): boolean {
  return typeof AudioContext !== 'undefined' &&
    typeof AudioWorkletNode !== 'undefined'
}

/**
 * Create an offline STT engine using Whisper.
 * Records audio from the microphone, then transcribes on stop.
 * Uses AudioWorklet when available, falls back to ScriptProcessorNode.
 */
export function createWhisperSTTEngine(): STTEngine {
  let stream: MediaStream | null = null
  let audioContext: AudioContext | null = null
  let workletNode: AudioWorkletNode | null = null
  let legacyRecorder: ScriptProcessorNode | null = null
  let audioChunks: Float32Array[] = []
  let onResultCallback: ((result: STTResult) => void) | null = null
  let isActive = false
  let transcribeInterval: ReturnType<typeof setInterval> | null = null

  return {
    provider: 'whisper' as STTEngine['provider'],
    isSupported: typeof WebAssembly !== 'undefined' && typeof AudioContext !== 'undefined',

    async start(lang, onResult, onError) {
      onResultCallback = onResult

      // Get microphone
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } })
      } catch (e) {
        if (e instanceof DOMException && e.name === 'NotAllowedError') {
          onError(t('error.micDenied'))
        } else {
          onError(t('error.micUnavailable'))
        }
        return
      }

      // Verify model is loaded
      try {
        await getWhisperPipeline()
      } catch {
        onError(t('error.whisperNotLoaded'))
        if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
        return
      }

      // Set up audio recording
      audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(stream)
      audioChunks = []
      isActive = true

      // Try AudioWorklet (modern), fall back to ScriptProcessorNode
      if (supportsAudioWorklet()) {
        try {
          await audioContext.audioWorklet.addModule('/audio-capture-worklet.js')
          workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor')
          workletNode.port.onmessage = (e) => {
            if (isActive && e.data instanceof Float32Array) {
              audioChunks.push(new Float32Array(e.data))
            }
          }
          source.connect(workletNode)
          workletNode.connect(audioContext.destination)
        } catch {
          // AudioWorklet failed (e.g. insecure context), fall back
          console.warn('[STT] AudioWorklet failed, falling back to ScriptProcessorNode')
          setupLegacyRecorder(source)
        }
      } else {
        setupLegacyRecorder(source)
      }

      function setupLegacyRecorder(src: MediaStreamAudioSourceNode) {
        legacyRecorder = audioContext!.createScriptProcessor(4096, 1, 1)
        legacyRecorder.onaudioprocess = (e) => {
          if (!isActive) return
          const data = e.inputBuffer.getChannelData(0)
          audioChunks.push(new Float32Array(data))
        }
        src.connect(legacyRecorder)
        legacyRecorder.connect(audioContext!.destination)
      }

      // Show interim "listening" result
      onResult({ text: '...', isFinal: false })

      // Auto-transcribe every 5 seconds for interim results
      transcribeInterval = setInterval(async () => {
        if (!isActive || audioChunks.length === 0) return
        try {
          const audio = mergeAudioChunks(audioChunks)
          const pipe = await getWhisperPipeline() as (audio: Float32Array, opts?: { language: string }) => Promise<{ text: string }>
          const result = await pipe(audio, { language: lang.split('-')[0] })
          if (result.text.trim() && onResultCallback) {
            onResultCallback({ text: result.text.trim(), isFinal: false })
          }
        } catch {
          // Transcription failed — silently continue recording
        }
      }, 5000)
    },

    stop() {
      isActive = false

      // Clear interval
      if (transcribeInterval) {
        clearInterval(transcribeInterval)
        transcribeInterval = null
      }

      // Final transcription
      if (audioChunks.length > 0 && onResultCallback) {
        const audio = mergeAudioChunks(audioChunks)
        const callback = onResultCallback

        getWhisperPipeline().then(async (pipe) => {
          const typedPipe = pipe as (audio: Float32Array, opts?: { language: string }) => Promise<{ text: string }>
          const result = await typedPipe(audio)
          if (result.text.trim()) {
            callback({ text: result.text.trim(), isFinal: true })
          }
        }).catch(() => {})
      }

      // Cleanup AudioWorklet
      if (workletNode) {
        workletNode.port.postMessage('stop')
        workletNode.disconnect()
        workletNode = null
      }

      // Cleanup legacy ScriptProcessorNode
      if (legacyRecorder) {
        legacyRecorder.disconnect()
        legacyRecorder = null
      }

      if (audioContext) {
        audioContext.close().catch(() => {})
        audioContext = null
      }
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
        stream = null
      }
      audioChunks = []
      onResultCallback = null
    },
  }
}

function mergeAudioChunks(chunks: Float32Array[]): Float32Array {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
  const merged = new Float32Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return merged
}
