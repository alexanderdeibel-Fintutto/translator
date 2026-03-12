import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { isCloudTTSAvailable, speakWithCloudTTS, prefetchCloudTTS } from '@/lib/tts'
import type { VoiceQuality } from '@/lib/tts'
import { useI18n } from '@/context/I18nContext'

// iOS audio unlock: reuse ONE Audio element that was play()-ed during a user
// gesture. On iOS Safari, each new Audio() requires a fresh gesture for play().
// But re-setting .src on an already-unlocked element and calling play() works.
let iosAudioUnlocked = false
let sharedAudioElement: HTMLAudioElement | null = null
let ttsFallbackNotified = false
let sharedEndHandler: (() => void) | null = null
let sharedErrorHandler: (() => void) | null = null

/** Get or create the shared audio element (reused across all TTS playbacks) */
export function getSharedAudioElement(): HTMLAudioElement {
  if (!sharedAudioElement) {
    sharedAudioElement = new Audio()
  }
  return sharedAudioElement
}

function unlockIOSAudio() {
  if (iosAudioUnlocked) return
  if (typeof window === 'undefined') return

  // Play a tiny silent WAV on the SHARED element to unlock it
  try {
    const audio = getSharedAudioElement()
    const prevSrc = audio.src
    audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    audio.volume = 0
    audio.play().then(() => {
      audio.volume = 1
      iosAudioUnlocked = true
      console.log('[TTS] iOS audio unlocked via shared element')
    }).catch(() => {
      // Restore previous src if unlock failed
      if (prevSrc) audio.src = prevSrc
    })
  } catch { /* ignore */ }

  // Also warm up speechSynthesis
  if ('speechSynthesis' in window) {
    const utt = new SpeechSynthesisUtterance('')
    utt.volume = 0
    window.speechSynthesis.speak(utt)
  }
}

export function useSpeechSynthesis() {
  const { t } = useI18n()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEngine, setTtsEngine] = useState<'cloud' | 'browser' | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<Array<{ text: string; lang: string }>>([])
  const isProcessingRef = useRef(false)
  const voiceQualityRef = useRef<VoiceQuality>('neural2')
  const useCloudTTS = isCloudTTSAvailable()

  const isSupported = useCloudTTS || (typeof window !== 'undefined' && 'speechSynthesis' in window)

  // Load browser voices as fallback
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) return
    isProcessingRef.current = true

    const { text, lang } = queueRef.current.shift()!

    // Prefetch next item in queue while current one plays
    if (useCloudTTS && queueRef.current.length > 0) {
      const next = queueRef.current[0]
      prefetchCloudTTS(next.text, next.lang, voiceQualityRef.current)
    }

    speakImmediate(text, lang)

    function speakImmediate(text: string, lang: string) {
      if (useCloudTTS) {
        setIsSpeaking(true)
        setTtsEngine('cloud')
        speakWithCloudTTS(text, lang, voiceQualityRef.current)
          .then(newAudio => {
            // On iOS, reuse the shared (gesture-unlocked) element instead of
            // the new Audio from Cloud TTS — new elements need a fresh gesture.
            const audio = iosAudioUnlocked ? getSharedAudioElement() : newAudio
            audioRef.current = audio

            // Clean up previous event listeners on shared element
            const endHandler = () => {
              if (newAudio !== audio) URL.revokeObjectURL(newAudio.src)
              onFinished()
            }
            const errorHandler = () => {
              if (newAudio !== audio) URL.revokeObjectURL(newAudio.src)
              audioRef.current = null
              speakBrowserQueued(text, lang, true)
            }

            // Remove previous handlers from shared element before attaching new ones
            if (sharedEndHandler) audio.removeEventListener('ended', sharedEndHandler)
            if (sharedErrorHandler) audio.removeEventListener('error', sharedErrorHandler)
            sharedEndHandler = endHandler
            sharedErrorHandler = errorHandler
            audio.addEventListener('ended', endHandler)
            audio.addEventListener('error', errorHandler)

            if (audio !== newAudio) {
              // Transfer the blob URL to the shared element
              audio.src = newAudio.src
            }

            audio.play().catch(() => {
              audioRef.current = null
              speakBrowserQueued(text, lang, true)
            })
          })
          .catch((err) => {
            console.error('[TTS] Cloud TTS failed:', err)
            speakBrowserQueued(text, lang, true)
          })
      } else {
        speakBrowserQueued(text, lang)
      }
    }

    function speakBrowserQueued(text: string, lang: string, isFallback = false) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onFinished()
        return
      }

      // Only cancel if something is actually playing (avoids interfering with queued speech)
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
      setTtsEngine('browser')

      // Only show fallback notice once per session to avoid alarming red flashes
      if (isFallback && !ttsFallbackNotified) {
        ttsFallbackNotified = true
        toast.info(t('error.ttsFallback'), {
          duration: 3000,
        })
      }

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = 0.9

        const voices = voicesRef.current
        if (voices.length > 0) {
          const exactMatch = voices.find(v => v.lang === lang)
          const prefixMatch = voices.find(v => v.lang.startsWith(lang.split('-')[0]))
          if (exactMatch) {
            utterance.voice = exactMatch
          } else if (prefixMatch) {
            utterance.voice = prefixMatch
          }
        }

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = onFinished
        utterance.onerror = onFinished

        window.speechSynthesis.speak(utterance)
      }, 50)
    }

    function onFinished() {
      audioRef.current = null
      isProcessingRef.current = false
      if (queueRef.current.length > 0) {
        processQueue()
      } else {
        setIsSpeaking(false)
      }
    }
  }, [useCloudTTS])

  const speak = useCallback((text: string, lang: string) => {
    if (!text.trim()) return

    // Limit queue to 3 items to avoid audio backlog in rapid sentence mode
    // Drop oldest pending items (keep currently playing + newest)
    if (queueRef.current.length >= 3) {
      queueRef.current = queueRef.current.slice(-2)
    }

    // Add to queue
    queueRef.current.push({ text, lang })

    // Process if not already processing
    if (!isProcessingRef.current) {
      processQueue()
    }
  }, [processQueue])

  const setVoiceQuality = useCallback((quality: VoiceQuality) => {
    voiceQualityRef.current = quality
  }, [])

  const stop = useCallback(() => {
    // Clear queue
    queueRef.current = []
    isProcessingRef.current = false

    if (audioRef.current) {
      audioRef.current.pause()
      // Don't null the shared element — it gets reused
      if (audioRef.current !== sharedAudioElement) {
        audioRef.current = null
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  // Call during a user gesture (tap/click) to unlock iOS audio playback.
  // Must be called BEFORE any programmatic play() — e.g., on "Join" or "Auto-speak" toggle.
  const warmup = useCallback(() => {
    unlockIOSAudio()
  }, [])

  return {
    isSpeaking,
    isSupported,
    ttsEngine,
    speak,
    stop,
    warmup,
    setVoiceQuality,
  }
}
