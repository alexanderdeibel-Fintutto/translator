/**
 * useAudioReceiver
 *
 * Listener-side hook for the _live audio streaming mode.
 * Receives base64-encoded PCM chunks from the Supabase Broadcast channel
 * and plays them back in order using the Web Audio API.
 *
 * Features:
 * - Jitter buffer: queues chunks and plays them in sequence order
 * - Seamless playback: schedules each chunk immediately after the previous
 * - Handles packet loss: skips missing chunks after a timeout
 * - No extra dependencies: pure Web Audio API
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AudioChunkPayload } from './useAudioBroadcast'

export interface UseAudioReceiverOptions {
  /** Whether audio playback is enabled (user must gesture first on iOS) */
  enabled: boolean
  /** Called when playback starts/stops */
  onPlaybackChange?: (playing: boolean) => void
}

export interface UseAudioReceiverReturn {
  /** Feed a received chunk into the receiver */
  receiveChunk: (chunk: AudioChunkPayload) => void
  /** Whether audio is currently playing */
  isPlaying: boolean
  /** Resume AudioContext (must be called from a user gesture on iOS) */
  resume: () => Promise<void>
  isSupported: boolean
}

export function useAudioReceiver({
  enabled,
  onPlaybackChange,
}: UseAudioReceiverOptions): UseAudioReceiverReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  // Next scheduled playback time in AudioContext.currentTime
  const nextPlayTimeRef = useRef<number>(0)
  // Jitter buffer: Map<seq, chunk>
  const bufferRef = useRef<Map<number, AudioChunkPayload>>(new Map())
  const nextSeqRef = useRef<number>(0)
  const playingRef = useRef(false)
  const onPlaybackChangeRef = useRef(onPlaybackChange)
  onPlaybackChangeRef.current = onPlaybackChange

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext)

  // Lazy-init AudioContext (must be after user gesture on iOS)
  const getCtx = useCallback((): AudioContext | null => {
    if (!isSupported) return null
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new AudioContextClass()
    }
    return audioCtxRef.current
  }, [isSupported])

  const resume = useCallback(async () => {
    const ctx = getCtx()
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
    }
  }, [getCtx])

  const setPlaying = useCallback((val: boolean) => {
    if (playingRef.current !== val) {
      playingRef.current = val
      setIsPlaying(val)
      onPlaybackChangeRef.current?.(val)
    }
  }, [])

  const scheduleChunk = useCallback(
    (chunk: AudioChunkPayload) => {
      const ctx = getCtx()
      if (!ctx || ctx.state === 'suspended') return

      // Decode base64 → Uint8Array → Int16Array → Float32Array
      const binary = atob(chunk.data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const pcm = new Int16Array(bytes.buffer)
      const float32 = new Float32Array(pcm.length)
      for (let i = 0; i < pcm.length; i++) {
        float32[i] = pcm[i] / (pcm[i] < 0 ? 0x8000 : 0x7fff)
      }

      // Create AudioBuffer
      const audioBuffer = ctx.createBuffer(1, float32.length, chunk.sampleRate)
      audioBuffer.copyToChannel(float32, 0)

      // Schedule playback
      const now = ctx.currentTime
      const startTime = Math.max(now + 0.05, nextPlayTimeRef.current)
      nextPlayTimeRef.current = startTime + audioBuffer.duration

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(ctx.destination)
      source.start(startTime)

      setPlaying(true)

      // Detect when playback ends
      source.onended = () => {
        // If no more chunks scheduled soon, mark as not playing
        setTimeout(() => {
          const ctx2 = audioCtxRef.current
          if (ctx2 && nextPlayTimeRef.current <= ctx2.currentTime + 0.1) {
            setPlaying(false)
          }
        }, 200)
      }
    },
    [getCtx, setPlaying],
  )

  const drainBuffer = useCallback(() => {
    // Play all consecutive chunks starting from nextSeq
    while (bufferRef.current.has(nextSeqRef.current)) {
      const chunk = bufferRef.current.get(nextSeqRef.current)!
      bufferRef.current.delete(nextSeqRef.current)
      nextSeqRef.current++
      scheduleChunk(chunk)
    }
  }, [scheduleChunk])

  const receiveChunk = useCallback(
    (chunk: AudioChunkPayload) => {
      if (!enabled) return

      // Handle seq reset (new session)
      if (chunk.seq === 0) {
        bufferRef.current.clear()
        nextSeqRef.current = 0
        nextPlayTimeRef.current = 0
      }

      // Add to jitter buffer
      bufferRef.current.set(chunk.seq, chunk)

      // If we receive a chunk far ahead, skip missing ones
      if (chunk.seq > nextSeqRef.current + 5) {
        console.warn(`[AudioReceiver] Skipping to seq ${chunk.seq} (was at ${nextSeqRef.current})`)
        nextSeqRef.current = chunk.seq
      }

      drainBuffer()
    },
    [enabled, drainBuffer],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
    }
  }, [])

  return { receiveChunk, isPlaying, resume, isSupported }
}
