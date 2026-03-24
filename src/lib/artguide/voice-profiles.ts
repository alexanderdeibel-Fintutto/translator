// Fintutto Art Guide — Voice Profile System
// Maps visitor preferences (age, gender) to the best available TTS voice
// Uses Google Cloud TTS voices with Chirp 3 HD as premium tier

import type { VoiceGender, VoiceAge } from './types'

// ============================================================================
// Voice Preset Definitions
// ============================================================================

export interface VoicePreset {
  id: string
  name: Record<string, string>          // multilingual display name
  description: Record<string, string>
  icon: string                           // emoji for quick recognition
  gender: VoiceGender
  age: VoiceAge
  tone: string                          // personality descriptor
  speakingRate: number                   // 0.8 - 1.2
  pitch: number                          // -4.0 to 4.0 semitones
}

/** Built-in voice presets — museums can also create custom ones */
export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'museumsfuehrerin',
    name: { de: 'Museumsfuehrerin', en: 'Museum Guide' },
    description: {
      de: 'Warme, kompetente Stimme — wie eine erfahrene Fuehrerin',
      en: 'Warm, knowledgeable voice — like an experienced guide',
    },
    icon: '🎙',
    gender: 'female',
    age: 'middle',
    tone: 'warm-professional',
    speakingRate: 0.95,
    pitch: 0,
  },
  {
    id: 'kunstprofessor',
    name: { de: 'Kunstprofessor', en: 'Art Professor' },
    description: {
      de: 'Sachliche, tiefgruendige Stimme — wie ein Kunsthistoriker',
      en: 'Measured, profound voice — like an art historian',
    },
    icon: '🎓',
    gender: 'male',
    age: 'mature',
    tone: 'academic-warm',
    speakingRate: 0.90,
    pitch: -1.0,
  },
  {
    id: 'entdeckerfreund',
    name: { de: 'Entdeckerfreund', en: 'Explorer Buddy' },
    description: {
      de: 'Begeisterte Stimme fuer junge Entdecker — macht Kunst spannend!',
      en: 'Enthusiastic voice for young explorers — makes art exciting!',
    },
    icon: '🔍',
    gender: 'neutral',
    age: 'young',
    tone: 'enthusiastic-friendly',
    speakingRate: 1.05,
    pitch: 1.0,
  },
  {
    id: 'audio_companion',
    name: { de: 'Audio-Begleiterin', en: 'Audio Companion' },
    description: {
      de: 'Lockere, nahbare Stimme — wie eine kunstbegeisterte Freundin',
      en: 'Relaxed, approachable voice — like an art-loving friend',
    },
    icon: '🎧',
    gender: 'female',
    age: 'young',
    tone: 'casual-engaging',
    speakingRate: 1.0,
    pitch: 0.5,
  },
  {
    id: 'geschichtenerzaehler',
    name: { de: 'Geschichtenerzaehler', en: 'Storyteller' },
    description: {
      de: 'Fesselnde Erzaehlstimme — jedes Werk wird zur Geschichte',
      en: 'Captivating narrative voice — every artwork becomes a story',
    },
    icon: '📖',
    gender: 'male',
    age: 'middle',
    tone: 'narrative-dramatic',
    speakingRate: 0.92,
    pitch: -0.5,
  },
  {
    id: 'kindererklaerer',
    name: { de: 'Kindererklaerer', en: "Kids' Explainer" },
    description: {
      de: 'Freundliche Stimme fuer Kinder — einfach und spassig',
      en: 'Friendly voice for children — simple and fun',
    },
    icon: '🧸',
    gender: 'neutral',
    age: 'child',
    tone: 'playful-clear',
    speakingRate: 0.90,
    pitch: 2.0,
  },
]

// ============================================================================
// Google Cloud TTS Voice Mapping (gender + age → voice name)
// ============================================================================

/** Maps gender + age combination to Google Cloud TTS voice names per language */
interface VoiceMapping {
  languageCode: string
  // Chirp 3 HD voices (premium)
  chirp?: Record<VoiceGender, Record<VoiceAge, string>>
  // Neural2/Studio voices (standard)
  neural?: Record<VoiceGender, Partial<Record<VoiceAge, string>>>
}

/**
 * Google Cloud TTS voice catalog for Art Guide.
 * Chirp 3 HD voices use character names (Achernar, Algieba, etc.)
 * that map to different genders and ages.
 *
 * Voice character mapping (approximate):
 * - Achernar: Male, middle-aged, warm
 * - Algieba: Female, middle-aged, professional
 * - Aoede: Female, young, friendly
 * - Autonoe: Female, mature, authoritative
 * - Callirrhoe: Female, young, casual
 * - Despina: Female, young, enthusiastic
 * - Erinome: Male, mature, deep
 * - Fenrir: Male, young, energetic
 * - Gacrux: Male, middle-aged, neutral
 * - Laomedeia: Female, middle-aged, warm
 * - Pulcherrima: Female, mature, elegant
 * - Sulafat: Male, young, casual
 * - Umbriel: Neutral, middle-aged, calm
 * - Vindemiatrix: Male, mature, refined
 * - Zubenelgenubi: Neutral, young, playful
 */
export const VOICE_CATALOG: Record<string, VoiceMapping> = {
  'de-DE': {
    languageCode: 'de-DE',
    chirp: {
      female: {
        child: 'de-DE-Chirp3-HD-Zubenelgenubi',
        young: 'de-DE-Chirp3-HD-Aoede',
        middle: 'de-DE-Chirp3-HD-Laomedeia',
        mature: 'de-DE-Chirp3-HD-Pulcherrima',
      },
      male: {
        child: 'de-DE-Chirp3-HD-Sulafat',
        young: 'de-DE-Chirp3-HD-Fenrir',
        middle: 'de-DE-Chirp3-HD-Achernar',
        mature: 'de-DE-Chirp3-HD-Vindemiatrix',
      },
      neutral: {
        child: 'de-DE-Chirp3-HD-Zubenelgenubi',
        young: 'de-DE-Chirp3-HD-Callirrhoe',
        middle: 'de-DE-Chirp3-HD-Umbriel',
        mature: 'de-DE-Chirp3-HD-Gacrux',
      },
    },
    neural: {
      female: { middle: 'de-DE-Neural2-C', young: 'de-DE-Neural2-F' },
      male: { middle: 'de-DE-Neural2-B', mature: 'de-DE-Neural2-D' },
      neutral: { middle: 'de-DE-Neural2-C' },
    },
  },
  'en-US': {
    languageCode: 'en-US',
    chirp: {
      female: {
        child: 'en-US-Chirp3-HD-Zubenelgenubi',
        young: 'en-US-Chirp3-HD-Aoede',
        middle: 'en-US-Chirp3-HD-Laomedeia',
        mature: 'en-US-Chirp3-HD-Pulcherrima',
      },
      male: {
        child: 'en-US-Chirp3-HD-Sulafat',
        young: 'en-US-Chirp3-HD-Fenrir',
        middle: 'en-US-Chirp3-HD-Achernar',
        mature: 'en-US-Chirp3-HD-Vindemiatrix',
      },
      neutral: {
        child: 'en-US-Chirp3-HD-Zubenelgenubi',
        young: 'en-US-Chirp3-HD-Callirrhoe',
        middle: 'en-US-Chirp3-HD-Umbriel',
        mature: 'en-US-Chirp3-HD-Gacrux',
      },
    },
    neural: {
      female: { middle: 'en-US-Neural2-C', young: 'en-US-Neural2-F' },
      male: { middle: 'en-US-Neural2-D', mature: 'en-US-Neural2-J' },
      neutral: { middle: 'en-US-Neural2-C' },
    },
  },
  'fr-FR': {
    languageCode: 'fr-FR',
    chirp: {
      female: {
        child: 'fr-FR-Chirp3-HD-Zubenelgenubi',
        young: 'fr-FR-Chirp3-HD-Aoede',
        middle: 'fr-FR-Chirp3-HD-Laomedeia',
        mature: 'fr-FR-Chirp3-HD-Pulcherrima',
      },
      male: {
        child: 'fr-FR-Chirp3-HD-Sulafat',
        young: 'fr-FR-Chirp3-HD-Fenrir',
        middle: 'fr-FR-Chirp3-HD-Achernar',
        mature: 'fr-FR-Chirp3-HD-Vindemiatrix',
      },
      neutral: {
        child: 'fr-FR-Chirp3-HD-Zubenelgenubi',
        young: 'fr-FR-Chirp3-HD-Callirrhoe',
        middle: 'fr-FR-Chirp3-HD-Umbriel',
        mature: 'fr-FR-Chirp3-HD-Gacrux',
      },
    },
    neural: {
      female: { middle: 'fr-FR-Neural2-A', young: 'fr-FR-Neural2-C' },
      male: { middle: 'fr-FR-Neural2-B', mature: 'fr-FR-Neural2-D' },
      neutral: { middle: 'fr-FR-Neural2-A' },
    },
  },
  'es-ES': {
    languageCode: 'es-ES',
    chirp: {
      female: {
        child: 'es-ES-Chirp3-HD-Zubenelgenubi',
        young: 'es-ES-Chirp3-HD-Aoede',
        middle: 'es-ES-Chirp3-HD-Laomedeia',
        mature: 'es-ES-Chirp3-HD-Pulcherrima',
      },
      male: {
        child: 'es-ES-Chirp3-HD-Sulafat',
        young: 'es-ES-Chirp3-HD-Fenrir',
        middle: 'es-ES-Chirp3-HD-Achernar',
        mature: 'es-ES-Chirp3-HD-Vindemiatrix',
      },
      neutral: {
        child: 'es-ES-Chirp3-HD-Zubenelgenubi',
        young: 'es-ES-Chirp3-HD-Callirrhoe',
        middle: 'es-ES-Chirp3-HD-Umbriel',
        mature: 'es-ES-Chirp3-HD-Gacrux',
      },
    },
    neural: {
      female: { middle: 'es-ES-Neural2-A', young: 'es-ES-Neural2-C' },
      male: { middle: 'es-ES-Neural2-B' },
      neutral: { middle: 'es-ES-Neural2-A' },
    },
  },
  'it-IT': {
    languageCode: 'it-IT',
    chirp: {
      female: {
        child: 'it-IT-Chirp3-HD-Zubenelgenubi',
        young: 'it-IT-Chirp3-HD-Aoede',
        middle: 'it-IT-Chirp3-HD-Laomedeia',
        mature: 'it-IT-Chirp3-HD-Pulcherrima',
      },
      male: {
        child: 'it-IT-Chirp3-HD-Sulafat',
        young: 'it-IT-Chirp3-HD-Fenrir',
        middle: 'it-IT-Chirp3-HD-Achernar',
        mature: 'it-IT-Chirp3-HD-Vindemiatrix',
      },
      neutral: {
        child: 'it-IT-Chirp3-HD-Zubenelgenubi',
        young: 'it-IT-Chirp3-HD-Callirrhoe',
        middle: 'it-IT-Chirp3-HD-Umbriel',
        mature: 'it-IT-Chirp3-HD-Gacrux',
      },
    },
    neural: {
      female: { middle: 'it-IT-Neural2-A' },
      male: { middle: 'it-IT-Neural2-C' },
      neutral: { middle: 'it-IT-Neural2-A' },
    },
  },
}

// ============================================================================
// Voice Resolution
// ============================================================================

export interface ResolvedVoice {
  voiceName: string
  languageCode: string
  speakingRate: number
  pitch: number
  quality: 'chirp3hd' | 'neural2'
  useBeta: boolean
}

/**
 * Resolve the best TTS voice based on visitor preferences.
 *
 * Priority:
 * 1. If visitor has a preset → use preset's gender/age
 * 2. If visitor chose gender + age → map directly
 * 3. Fallback to default (female, middle)
 *
 * Quality:
 * - artguide_professional & enterprise → Chirp 3 HD
 * - artguide_starter → Neural2
 */
export function resolveVoice(
  language: string,
  gender: VoiceGender = 'female',
  age: VoiceAge = 'middle',
  presetId?: string | null,
  usePremiumVoices = true,
): ResolvedVoice {
  // If preset is specified, override gender/age from preset
  let speakingRate = 0.95
  let pitch = 0
  if (presetId) {
    const preset = VOICE_PRESETS.find(p => p.id === presetId)
    if (preset) {
      gender = preset.gender
      age = preset.age
      speakingRate = preset.speakingRate
      pitch = preset.pitch
    }
  }

  // Find language in catalog (try exact, then prefix)
  const langKey = findLanguageKey(language)
  const mapping = langKey ? VOICE_CATALOG[langKey] : null

  // Try Chirp 3 HD first (premium)
  if (usePremiumVoices && mapping?.chirp) {
    const voiceName = mapping.chirp[gender]?.[age]
    if (voiceName) {
      return {
        voiceName,
        languageCode: mapping.languageCode,
        speakingRate,
        pitch,
        quality: 'chirp3hd',
        useBeta: true,
      }
    }
  }

  // Fall back to Neural2
  if (mapping?.neural) {
    const ageVoices = mapping.neural[gender]
    const voiceName = ageVoices?.[age] || ageVoices?.middle
    if (voiceName) {
      return {
        voiceName,
        languageCode: mapping.languageCode,
        speakingRate,
        pitch,
        quality: 'neural2',
        useBeta: false,
      }
    }
  }

  // Ultimate fallback: generic voice for the language
  const fallbackLang = langKey ? VOICE_CATALOG[langKey]?.languageCode : language
  return {
    voiceName: '',
    languageCode: fallbackLang || language,
    speakingRate,
    pitch,
    quality: 'neural2',
    useBeta: false,
  }
}

function findLanguageKey(language: string): string | null {
  // Exact match
  if (VOICE_CATALOG[language]) return language

  // Prefix match (e.g., "de" → "de-DE")
  const prefix = language.split('-')[0]
  for (const key of Object.keys(VOICE_CATALOG)) {
    if (key.startsWith(prefix)) return key
  }
  return null
}

/**
 * Get the appropriate content depth for a visitor's profile.
 * This determines which description field to use from the artwork.
 */
export function getContentFieldForVisitor(
  ageGroup: string,
  knowledgeLevel: string,
  tourDepth: string,
): keyof Pick<
  import('./types').Artwork,
  'description_brief' | 'description_standard' | 'description_detailed' |
  'description_children' | 'description_youth'
> {
  // Children always get children's content
  if (ageGroup === 'child') return 'description_children'
  if (ageGroup === 'youth') return 'description_youth'

  // Quick tour = brief descriptions
  if (tourDepth === 'quick') return 'description_brief'

  // Expert + deep dive = detailed
  if (knowledgeLevel === 'expert' || knowledgeLevel === 'professional') {
    return 'description_detailed'
  }
  if (tourDepth === 'deep_dive') return 'description_detailed'

  // Default = standard
  return 'description_standard'
}
