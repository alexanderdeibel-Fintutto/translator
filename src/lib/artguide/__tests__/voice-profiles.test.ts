import { describe, it, expect } from 'vitest'
import {
  VOICE_PRESETS,
  VOICE_CATALOG,
  resolveVoice,
  getContentFieldForVisitor,
  type VoicePreset,
  type ResolvedVoice,
} from '../voice-profiles'

describe('voice-profiles', () => {
  describe('VOICE_PRESETS', () => {
    it('should have at least 5 presets', () => {
      expect(VOICE_PRESETS.length).toBeGreaterThanOrEqual(5)
    })

    it('should have unique IDs', () => {
      const ids = VOICE_PRESETS.map(p => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should have valid speaking rates', () => {
      for (const preset of VOICE_PRESETS) {
        expect(preset.speakingRate).toBeGreaterThanOrEqual(0.8)
        expect(preset.speakingRate).toBeLessThanOrEqual(1.2)
      }
    })

    it('should have valid gender values', () => {
      const validGenders = ['male', 'female', 'neutral']
      for (const preset of VOICE_PRESETS) {
        expect(validGenders).toContain(preset.gender)
      }
    })

    it('should have valid age values', () => {
      const validAges = ['child', 'young', 'middle', 'mature']
      for (const preset of VOICE_PRESETS) {
        expect(validAges).toContain(preset.age)
      }
    })

    it('should have multilingual names', () => {
      for (const preset of VOICE_PRESETS) {
        expect(preset.name.de).toBeTruthy()
        expect(preset.name.en).toBeTruthy()
      }
    })
  })

  describe('VOICE_CATALOG', () => {
    it('should have de-DE voice mappings', () => {
      expect(VOICE_CATALOG['de-DE']).toBeDefined()
      expect(VOICE_CATALOG['de-DE'].chirp).toBeDefined()
      expect(VOICE_CATALOG['de-DE'].neural).toBeDefined()
    })

    it('should have en-US voice mappings', () => {
      expect(VOICE_CATALOG['en-US']).toBeDefined()
    })

    it('should have chirp voices for all gender/age combos in de-DE', () => {
      const chirp = VOICE_CATALOG['de-DE'].chirp!
      for (const gender of ['female', 'male', 'neutral'] as const) {
        for (const age of ['child', 'young', 'middle', 'mature'] as const) {
          expect(chirp[gender][age]).toBeTruthy()
        }
      }
    })
  })

  describe('resolveVoice', () => {
    it('should return chirp3hd voice for de-DE with premium enabled', () => {
      const result = resolveVoice('de-DE', 'female', 'middle', null, true)
      expect(result.quality).toBe('chirp3hd')
      expect(result.voiceName).toContain('Chirp3-HD')
      expect(result.languageCode).toBe('de-DE')
      expect(result.useBeta).toBe(true)
    })

    it('should return neural2 voice when premium disabled', () => {
      const result = resolveVoice('de-DE', 'female', 'middle', null, false)
      expect(result.quality).toBe('neural2')
      expect(result.voiceName).toContain('Neural2')
      expect(result.useBeta).toBe(false)
    })

    it('should override gender/age from preset', () => {
      // museumsfuehrerin preset: female, middle, speakingRate 0.95, pitch 0
      const result = resolveVoice('de-DE', 'male', 'young', 'museumsfuehrerin', true)
      // Should use preset's female/middle, not the provided male/young
      expect(result.voiceName).toContain('Laomedeia') // female middle in de-DE
      expect(result.speakingRate).toBe(0.95)
      expect(result.pitch).toBe(0)
    })

    it('should use kunstprofessor preset correctly', () => {
      const result = resolveVoice('de-DE', 'female', 'young', 'kunstprofessor', true)
      // kunstprofessor: male, mature
      expect(result.voiceName).toContain('Vindemiatrix') // male mature in de-DE
      expect(result.speakingRate).toBe(0.90)
      expect(result.pitch).toBe(-1.0)
    })

    it('should handle language prefix matching (de -> de-DE)', () => {
      const result = resolveVoice('de', 'female', 'middle', null, true)
      expect(result.languageCode).toBe('de-DE')
      expect(result.voiceName).toBeTruthy()
    })

    it('should return fallback for unknown language', () => {
      const result = resolveVoice('xx-XX', 'female', 'middle', null, true)
      expect(result.voiceName).toBe('')
      expect(result.quality).toBe('neural2')
      expect(result.languageCode).toBe('xx-XX')
    })

    it('should handle unknown preset gracefully (no override)', () => {
      const result = resolveVoice('de-DE', 'male', 'young', 'nonexistent_preset', true)
      // Should use provided male/young since preset not found
      expect(result.voiceName).toContain('Fenrir') // male young in de-DE
    })

    it('should fall back to neural2 middle when specific age not available', () => {
      const result = resolveVoice('es-ES', 'male', 'young', null, false)
      // es-ES neural male only has 'middle'
      expect(result.quality).toBe('neural2')
      expect(result.voiceName).toBe('es-ES-Neural2-B')
    })

    it('should use default gender and age when not provided', () => {
      const result = resolveVoice('en-US')
      // Defaults: female, middle, premium=true
      expect(result.voiceName).toBeTruthy()
    })
  })

  describe('getContentFieldForVisitor', () => {
    it('should return description_children for child age group', () => {
      expect(getContentFieldForVisitor('child', 'beginner', 'standard')).toBe('description_children')
    })

    it('should return description_youth for youth age group', () => {
      expect(getContentFieldForVisitor('youth', 'beginner', 'standard')).toBe('description_youth')
    })

    it('should return description_brief for quick tour', () => {
      expect(getContentFieldForVisitor('adult', 'beginner', 'quick')).toBe('description_brief')
    })

    it('should return description_detailed for expert knowledge level', () => {
      expect(getContentFieldForVisitor('adult', 'expert', 'standard')).toBe('description_detailed')
    })

    it('should return description_detailed for professional knowledge level', () => {
      expect(getContentFieldForVisitor('adult', 'professional', 'standard')).toBe('description_detailed')
    })

    it('should return description_detailed for deep_dive tour', () => {
      expect(getContentFieldForVisitor('adult', 'beginner', 'deep_dive')).toBe('description_detailed')
    })

    it('should return description_standard as default', () => {
      expect(getContentFieldForVisitor('adult', 'beginner', 'standard')).toBe('description_standard')
    })

    it('should prioritize child over quick tour', () => {
      expect(getContentFieldForVisitor('child', 'expert', 'quick')).toBe('description_children')
    })

    it('should prioritize youth over expert knowledge', () => {
      expect(getContentFieldForVisitor('youth', 'expert', 'deep_dive')).toBe('description_youth')
    })
  })
})
