/**
 * useAudioBroadcast
 *
 * Speaker-side hook for the _live audio streaming mode.
 * Captures microphone audio in small chunks (~500ms) using the
 * Web Audio API, encodes them as base64 PCM (16-bit, 16kHz mono)
 * and broadcasts them over the existing Supabase Broadcast channel.
 *
 * Listeners receive these chunks via the `audio_chunk` broadcast event
 * and play them back using useAudioReceiver.
 *
 * Design goals:
 * - Reuse the existing broadcast channel (no extra infrastructure)
 * - Low latency: ~500ms chunk size
 * - Browser-compatible: Web Audio API (no Opus encoder needed)
 * - Graceful degradation: if mic unavailable, silently no-ops
 */

import { useCallback, useRef, useState } from 'react'

export interface AudioChunkPayload {
  /** Discriminator for the broadcast event */
  type: 'audio_chunk'
  /** Sequence number for ordering */
  seq: number
  /** Base64-encoded raw PCM: Int16, mono, 16kHz */
  data: string
  /** Sample rate (always 16000) */
  sampleRate: number
  /** Number of samples in this chunk */
  samples: number
  /** Timestamp (ms since epoch) */
  ts: number
}

export interface UseAudioBroadcastOptions {
  /** Chunk duration in milliseconds (default: 500) */
  chunkMs?: number
  /** Target sample rate (default: 16000) */
  sampleRate?: number
  /** Called with each encoded chunk ready to broadcast */
  onChunk: (chunk: AudioChunkPayload) => void
}

export interface UseAudioBroadcastReturn {
  isStreaming: boolean
  startAudioStream: () => Promise<void>
  stopAudioStream: () => void
  isSupported: boolean
}

export function useAudioBroadcast({
  chunkMs = 500,
  sampleRate = 16000,
  onChunk,
}: UseAudioBroadcastOptions): UseAudioBroadcastReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const seqRef = useRef(0)
  const bufferRef = useRef<Float32Array[]>([])
  const samplesAccRef = useRef(0)
  const onChunkRef = useRef(onChunk)
  onChunkRef.current = onChunk

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext) &&
    !!navigator.mediaDevices?.getUserMedia

  const stopAudioStream = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current.onaudioprocess = null
      processorRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    bufferRef.current = []
    samplesAccRef.current = 0
    setIsStreaming(false)
  }, [])

  const startAudioStream = useCallback(async () => {
    if (!isSupported) return
    try {
      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: sampleRate },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // Create AudioContext at desired sample rate
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioContextClass({ sampleRate })
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)

      // ScriptProcessorNode: 4096 samples per callback ≈ 256ms at 16kHz
      // We accumulate until we have chunkMs worth of samples
      const bufferSize = 4096
      const targetSamples = Math.floor((sampleRate * chunkMs) / 1000)
      const processor = ctx.createScriptProcessor(bufferSize, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        const input = e.inputBuffer.getChannelData(0)
        bufferRef.current.push(new Float32Array(input))
        samplesAccRef.current += input.length

        if (samplesAccRef.current >= targetSamples) {
          // Concatenate accumulated buffers
          const total = samplesAccRef.current
          const merged = new Float32Array(total)
          let offset = 0
          for (const buf of bufferRef.current) {
            merged.set(buf, offset)
            offset += buf.length
          }
          bufferRef.current = []
          samplesAccRef.current = 0

          // Convert Float32 → Int16 PCM
          const pcm = new Int16Array(total)
          for (let i = 0; i < total; i++) {
            const s = Math.max(-1, Math.min(1, merged[i]))
            pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
          }

          // Encode as base64
          const bytes = new Uint8Array(pcm.buffer)
          let binary = ''
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          const b64 = btoa(binary)

          const payload: AudioChunkPayload = {
            type: 'audio_chunk',
            seq: seqRef.current++,
            data: b64,
            sampleRate,
            samples: total,
            ts: Date.now(),
          }
          onChunkRef.current(payload)
        }
      }

      source.connect(processor)
      processor.connect(ctx.destination)

      setIsStreaming(true)
    } catch (err) {
      console.error('[AudioBroadcast] Failed to start:', err)
      stopAudioStream()
    }
  }, [isSupported, sampleRate, chunkMs, stopAudioStream])

  return { isStreaming, startAudioStream, stopAudioStream, isSupported }
}
