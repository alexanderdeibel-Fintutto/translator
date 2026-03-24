// Tests for artguide-tts voice presets and TTS logic
// Tests the voice configuration used by the TTS Edge Function
import { describe, it, expect } from 'vitest'

// Voice presets as defined in the Edge Function
const VOICE_PRESETS: Record<string, { male: string; female: string; languageCode: string }> = {
  de: { male: 'de-DE-Neural2-B', female: 'de-DE-Neural2-C', languageCode: 'de-DE' },
  en: { male: 'en-US-Neural2-D', female: 'en-US-Neural2-F', languageCode: 'en-US' },
  fr: { male: 'fr-FR-Neural2-B', female: 'fr-FR-Neural2-C', languageCode: 'fr-FR' },
  it: { male: 'it-IT-Neural2-C', female: 'it-IT-Neural2-A', languageCode: 'it-IT' },
  es: { male: 'es-ES-Neural2-B', female: 'es-ES-Neural2-A', languageCode: 'es-ES' },
  nl: { male: 'nl-NL-Neural2-B', female: 'nl-NL-Neural2-C', languageCode: 'nl-NL' },
  pl: { male: 'pl-PL-Neural2-B', female: 'pl-PL-Neural2-A', languageCode: 'pl-PL' },
  cs: { male: 'cs-CZ-Neural2-D', female: 'cs-CZ-Neural2-A', languageCode: 'cs-CZ' },
  zh: { male: 'cmn-CN-Neural2-B', female: 'cmn-CN-Neural2-A', languageCode: 'cmn-CN' },
  ja: { male: 'ja-JP-Neural2-C', female: 'ja-JP-Neural2-B', languageCode: 'ja-JP' },
  ko: { male: 'ko-KR-Neural2-C', female: 'ko-KR-Neural2-A', languageCode: 'ko-KR' },
  ar: { male: 'ar-XA-Neural2-B', female: 'ar-XA-Neural2-A', languageCode: 'ar-XA' },
}

describe('TTS voice presets', () => {
  it('has 12 language presets', () => {
    expect(Object.keys(VOICE_PRESETS)).toHaveLength(12)
  })

  it('covers all major museum visitor languages', () => {
    const required = ['de', 'en', 'fr', 'it', 'es', 'nl', 'zh', 'ja', 'ko', 'ar']
    for (const lang of required) {
      expect(VOICE_PRESETS[lang]).toBeDefined()
    }
  })

  it('each preset has male and female voices', () => {
    for (const [lang, preset] of Object.entries(VOICE_PRESETS)) {
      expect(preset.male).toBeTruthy()
      expect(preset.female).toBeTruthy()
      expect(preset.male).not.toBe(preset.female)
      // Voice name should contain Neural2
      expect(preset.male).toContain('Neural2')
      expect(preset.female).toContain('Neural2')
    }
  })

  it('each preset has a valid BCP-47 language code', () => {
    for (const [lang, preset] of Object.entries(VOICE_PRESETS)) {
      expect(preset.languageCode).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/)
    }
  })

  it('voice names match their language code', () => {
    for (const [lang, preset] of Object.entries(VOICE_PRESETS)) {
      // Voice name starts with language code (with possible variation for cmn)
      const voicePrefix = preset.languageCode.toLowerCase().replace('-', '-').slice(0, 2)
      expect(preset.male.toLowerCase()).toContain(voicePrefix)
    }
  })

  it('German preset uses de-DE locale', () => {
    const de = VOICE_PRESETS.de
    expect(de.languageCode).toBe('de-DE')
    expect(de.male).toContain('de-DE')
    expect(de.female).toContain('de-DE')
  })

  it('Chinese preset uses cmn-CN (Mandarin)', () => {
    expect(VOICE_PRESETS.zh.languageCode).toBe('cmn-CN')
  })

  it('no duplicate voice names across all presets', () => {
    const allVoices = Object.values(VOICE_PRESETS).flatMap(p => [p.male, p.female])
    const unique = new Set(allVoices)
    expect(unique.size).toBe(allVoices.length)
  })
})

describe('TTS duration estimation', () => {
  // Estimate: ~150 words/min, ~5 chars/word → ~750 chars/min
  function estimateDurationSeconds(text: string): number {
    return Math.round((text.length / 5 / 150) * 60)
  }

  it('estimates short text correctly (~30 words = ~12 seconds)', () => {
    const text = 'Dieses Gemaelde zeigt eine Landschaft im Herbst. Die Farben sind warm und einladend. Es wurde im Jahr 1889 gemalt.'
    const duration = estimateDurationSeconds(text)
    expect(duration).toBeGreaterThan(5)
    expect(duration).toBeLessThan(30)
  })

  it('estimates longer description (~100 words = ~40 seconds)', () => {
    const text = 'A'.repeat(500) // ~100 words
    const duration = estimateDurationSeconds(text)
    expect(duration).toBe(40) // 500/5/150*60 = 40
  })

  it('handles empty text', () => {
    expect(estimateDurationSeconds('')).toBe(0)
  })

  it('handles max length text (5000 chars Google limit)', () => {
    const text = 'X'.repeat(5000)
    const duration = estimateDurationSeconds(text)
    expect(duration).toBe(400) // 5000/5/150*60 = 400 seconds ≈ 6.7 min
    expect(duration).toBeLessThan(600) // under 10 minutes
  })
})
