// Fintutto Art Guide — TTS Service
// Extends the existing tts.ts with personalized voice selection
// Supports age/gender-based voice mapping and offline caching

import { speakWithCloudTTS, prefetchCloudTTS } from '../tts'
import { getCachedTTSAudio, cacheTTSAudio } from '../offline/tts-cache'
import { resolveVoice, type ResolvedVoice } from './voice-profiles'
import type { VisitorProfile, Artwork, MultilingualText } from './types'
import { getContentFieldForVisitor } from './voice-profiles'

// ============================================================================
// Art Guide TTS — Personalized Voice Playback
// ============================================================================

export interface ArtGuideTTSOptions {
  text: string
  language: string
  voiceGender?: 'male' | 'female' | 'neutral'
  voiceAge?: 'child' | 'young' | 'middle' | 'mature'
  voicePreset?: string | null
  usePremiumVoices?: boolean
  speakingRate?: number
  pitch?: number
}

/**
 * Speak text using the Art Guide personalized voice system.
 * Resolves the best voice based on visitor preferences, then uses
 * the existing Cloud TTS infrastructure with caching.
 */
export async function speakArtGuide(options: ArtGuideTTSOptions): Promise<HTMLAudioElement> {
  const voice = resolveVoice(
    options.language,
    options.voiceGender,
    options.voiceAge,
    options.voicePreset,
    options.usePremiumVoices ?? true,
  )

  // Build a unique cache key that includes voice parameters
  const cacheKey = buildCacheKey(options.text, voice)

  // Check cache first
  try {
    const cached = await getCachedTTSAudio(cacheKey, voice.languageCode, voice.quality)
    if (cached) {
      console.log('[ArtGuideTTS] Playing from cache')
      const url = URL.createObjectURL(cached)
      const audio = new Audio(url)
      audio.playbackRate = options.speakingRate ?? voice.speakingRate
      audio.addEventListener('ended', () => URL.revokeObjectURL(url))
      audio.addEventListener('error', () => URL.revokeObjectURL(url))
      return audio
    }
  } catch {
    // Cache miss — fetch from API
  }

  // Fetch from Google Cloud TTS via existing infrastructure
  const audio = await speakWithCloudTTS(options.text, voice.languageCode, voice.quality)
  audio.playbackRate = options.speakingRate ?? voice.speakingRate

  return audio
}

/**
 * Speak an artwork's description using the visitor's preferred voice.
 * Selects the right content depth based on visitor profile.
 */
export async function speakArtworkDescription(
  artwork: Artwork,
  visitor: VisitorProfile,
): Promise<HTMLAudioElement | null> {
  const contentField = getContentFieldForVisitor(
    visitor.age_group,
    visitor.knowledge_level,
    visitor.preferred_tour_depth,
  )

  const text = getLocalizedText(artwork[contentField], visitor.language)
  if (!text) return null

  return speakArtGuide({
    text,
    language: visitor.language,
    voiceGender: visitor.preferred_voice_gender,
    voiceAge: visitor.preferred_voice_age,
    voicePreset: visitor.preferred_voice_preset,
    usePremiumVoices: true,
    speakingRate: visitor.audio_speed,
  })
}

/**
 * Prefetch artwork audio for offline use.
 * Call this when a museum is downloaded for offline use.
 */
export function prefetchArtworkAudio(
  artwork: Artwork,
  visitor: VisitorProfile,
): void {
  const contentField = getContentFieldForVisitor(
    visitor.age_group,
    visitor.knowledge_level,
    visitor.preferred_tour_depth,
  )

  const text = getLocalizedText(artwork[contentField], visitor.language)
  if (!text) return

  const voice = resolveVoice(
    visitor.language,
    visitor.preferred_voice_gender,
    visitor.preferred_voice_age,
    visitor.preferred_voice_preset,
    true,
  )

  prefetchCloudTTS(text, voice.languageCode, voice.quality)
}

/**
 * Prefetch all artworks in a tour for seamless offline playback.
 */
export function prefetchTourAudio(
  artworks: Artwork[],
  visitor: VisitorProfile,
): void {
  // Stagger prefetches to avoid overwhelming the API
  artworks.forEach((artwork, index) => {
    setTimeout(() => {
      prefetchArtworkAudio(artwork, visitor)
    }, index * 500) // 500ms between requests
  })
}

// ============================================================================
// Audio Player State Management
// ============================================================================

export interface AudioPlayerState {
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  artworkId: string | null
  error: string | null
}

const initialState: AudioPlayerState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  artworkId: null,
  error: null,
}

type AudioPlayerListener = (state: AudioPlayerState) => void

/**
 * Global audio player manager for the Art Guide.
 * Ensures only one audio plays at a time and tracks state.
 */
class ArtGuideAudioPlayer {
  private state: AudioPlayerState = { ...initialState }
  private currentAudio: HTMLAudioElement | null = null
  private listeners: Set<AudioPlayerListener> = new Set()
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null

  subscribe(listener: AudioPlayerListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(fn => fn({ ...this.state }))
  }

  private updateState(patch: Partial<AudioPlayerState>) {
    Object.assign(this.state, patch)
    this.notify()
  }

  async play(artwork: Artwork, visitor: VisitorProfile): Promise<void> {
    // Stop any currently playing audio
    this.stop()

    this.updateState({
      isLoading: true,
      artworkId: artwork.id,
      error: null,
    })

    try {
      const audio = await speakArtworkDescription(artwork, visitor)
      if (!audio) {
        this.updateState({
          isLoading: false,
          error: 'Kein Audio verfuegbar fuer dieses Werk',
        })
        return
      }

      this.currentAudio = audio

      audio.addEventListener('loadedmetadata', () => {
        this.updateState({ duration: audio.duration })
      })

      audio.addEventListener('ended', () => {
        this.updateState({
          isPlaying: false,
          isPaused: false,
          currentTime: 0,
        })
        this.stopTimeTracking()
      })

      audio.addEventListener('error', () => {
        this.updateState({
          isPlaying: false,
          isLoading: false,
          error: 'Fehler bei der Audiowiedergabe',
        })
        this.stopTimeTracking()
      })

      await audio.play()

      this.updateState({
        isPlaying: true,
        isLoading: false,
      })

      this.startTimeTracking()
    } catch (err) {
      this.updateState({
        isLoading: false,
        error: 'Audio konnte nicht geladen werden',
      })
    }
  }

  pause(): void {
    if (this.currentAudio && this.state.isPlaying) {
      this.currentAudio.pause()
      this.updateState({ isPlaying: false, isPaused: true })
      this.stopTimeTracking()
    }
  }

  resume(): void {
    if (this.currentAudio && this.state.isPaused) {
      this.currentAudio.play()
      this.updateState({ isPlaying: true, isPaused: false })
      this.startTimeTracking()
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
    this.stopTimeTracking()
    this.updateState({ ...initialState })
  }

  seek(time: number): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = time
      this.updateState({ currentTime: time })
    }
  }

  setSpeed(rate: number): void {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate
    }
  }

  getState(): AudioPlayerState {
    return { ...this.state }
  }

  private startTimeTracking(): void {
    this.stopTimeTracking()
    this.timeUpdateInterval = setInterval(() => {
      if (this.currentAudio) {
        this.updateState({ currentTime: this.currentAudio.currentTime })
      }
    }, 250)
  }

  private stopTimeTracking(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }
  }
}

/** Singleton audio player instance */
export const audioPlayer = new ArtGuideAudioPlayer()

// ============================================================================
// Helpers
// ============================================================================

function buildCacheKey(text: string, voice: ResolvedVoice): string {
  return `ag|${voice.voiceName}|${text.trim().substring(0, 100)}`
}

function getLocalizedText(text: MultilingualText | undefined, language: string): string {
  if (!text) return ''
  return text[language] || text['en'] || text['de'] || Object.values(text)[0] || ''
}
