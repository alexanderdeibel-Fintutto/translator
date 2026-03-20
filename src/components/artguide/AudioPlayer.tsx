import React, { useEffect, useState, useCallback } from 'react'
import { audioPlayer, type AudioPlayerState } from '@/lib/artguide/artguide-tts'
import type { Artwork, VisitorProfile } from '@/lib/artguide/types'

interface AudioPlayerProps {
  artwork: Artwork
  visitor: VisitorProfile
  compact?: boolean
  className?: string
}

/**
 * Art Guide Audio Player — plays personalized artwork descriptions.
 * Uses the global audioPlayer singleton to ensure only one audio plays at a time.
 */
export function AudioPlayer({ artwork, visitor, compact = false, className = '' }: AudioPlayerProps) {
  const [state, setState] = useState<AudioPlayerState>(audioPlayer.getState())

  useEffect(() => {
    return audioPlayer.subscribe(setState)
  }, [])

  const isThisArtwork = state.artworkId === artwork.id
  const isPlaying = isThisArtwork && state.isPlaying
  const isPaused = isThisArtwork && state.isPaused
  const isLoading = isThisArtwork && state.isLoading

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      audioPlayer.pause()
    } else if (isPaused) {
      audioPlayer.resume()
    } else {
      audioPlayer.play(artwork, visitor)
    }
  }, [isPlaying, isPaused, artwork, visitor])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    audioPlayer.seek(parseFloat(e.target.value))
  }, [])

  function formatTime(seconds: number): string {
    if (!seconds || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (compact) {
    return (
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          isPlaying
            ? 'bg-amber-400 text-indigo-950'
            : 'bg-white/10 hover:bg-white/20 text-white'
        } ${className}`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
        <span className="text-sm font-medium">
          {isLoading ? 'Laden...' : isPlaying ? 'Pause' : 'Anhoeren'}
        </span>
      </button>
    )
  }

  return (
    <div className={`p-4 rounded-xl bg-white/10 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-amber-400 text-indigo-950 flex items-center justify-center flex-shrink-0 hover:bg-amber-300 transition disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6 ml-0.5" />
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={state.duration || 100}
            value={isThisArtwork ? state.currentTime : 0}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full appearance-none bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
          />
          <div className="flex justify-between mt-1 text-xs text-white/40">
            <span>{formatTime(isThisArtwork ? state.currentTime : 0)}</span>
            <span>{formatTime(isThisArtwork ? state.duration : 0)}</span>
          </div>
        </div>

        {/* Stop button */}
        {isThisArtwork && (isPlaying || isPaused) && (
          <button
            onClick={() => audioPlayer.stop()}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <StopIcon className="w-4 h-4 text-white/60" />
          </button>
        )}
      </div>

      {/* Error message */}
      {isThisArtwork && state.error && (
        <p className="text-red-400 text-sm mt-2">{state.error}</p>
      )}

      {/* Voice info */}
      <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
        <span>🎙</span>
        <span>
          {visitor.preferred_voice_preset
            ? visitor.preferred_voice_preset.replace(/_/g, ' ')
            : `${visitor.preferred_voice_gender} / ${visitor.preferred_voice_age}`}
        </span>
        <span>·</span>
        <span>{visitor.audio_speed}x</span>
      </div>
    </div>
  )
}

// Icon components
function PlayIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  )
}

function StopIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h12v12H6z" />
    </svg>
  )
}

export default AudioPlayer
