// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  buildArtworkSystemPrompt,
  buildArtworkUserPrompt,
  buildTourSuggestionPrompt,
  buildContentGenerationPrompt,
  buildPersonalizationContext,
} from '../ai-service'

import type { PersonalizationContext } from '../types'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockPersonalization: PersonalizationContext = {
  age_group: 'adult',
  knowledge_level: 'casual',
  preferred_salutation: null,
  content_style: 'narrative',
  tour_depth: 'standard',
  language: 'de',
  ai_tone: 'warm',
  ai_detail_level: 'standard',
  include_anecdotes: true,
  include_comparisons: true,
  include_technique: false,
  child_mode: false,
  accessibility_needs: [],
  voice_gender: 'female',
  voice_age: 'middle',
  voice_preset: null,
  audio_speed: 1.0,
}

const mockArtwork = {
  id: 'art-1',
  museum_id: 'm1',
  title: { de: 'Sternennacht', en: 'Starry Night' },
  artist_name: 'Vincent van Gogh',
  artist_birth_year: '1853',
  artist_death_year: '1890',
  year_created: '1889',
  medium: 'Oel auf Leinwand',
  dimensions: '73.7 x 92.1 cm',
  style: 'Post-Impressionismus',
  epoch: '19. Jahrhundert',
  origin: 'Niederlande',
  description_standard: { de: 'Ein ikonisches Nachtbild', en: 'An iconic night scene' },
  description_detailed: { de: 'Detaillierte Beschreibung hier' },
  historical_context: { de: 'Entstanden in Saint-Remy-de-Provence' },
  technique_details: undefined,
  fun_facts: { de: 'Van Gogh malte es aus dem Gedaechtnis' },
  ai_base_knowledge: { key_facts: ['painted from memory'] },
  tags: ['landscape', 'night'],
  is_highlight: true,
  room_id: 'room-1',
}

describe('ai-service', () => {
  describe('buildArtworkSystemPrompt()', () => {
    it('includes museum name', () => {
      const prompt = buildArtworkSystemPrompt(mockPersonalization, 'Alte Pinakothek')
      expect(prompt).toContain('Alte Pinakothek')
    })

    it('includes anti-hallucination instruction', () => {
      const prompt = buildArtworkSystemPrompt(mockPersonalization, 'Museum')
      expect(prompt).toContain('erfinde KEINE')
    })

    it('adapts tone for formal setting', () => {
      const ctx = { ...mockPersonalization, ai_tone: 'formal' as const }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('formell')
    })

    it('adapts tone for casual setting', () => {
      const ctx = { ...mockPersonalization, ai_tone: 'casual' as const }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('locker')
    })

    it('adapts for child age group', () => {
      const ctx = { ...mockPersonalization, age_group: 'child' as const }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('Kind')
    })

    it('adapts for youth age group', () => {
      const ctx = { ...mockPersonalization, age_group: 'youth' as const }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('Jugendlicher')
    })

    it('adapts for expert knowledge level', () => {
      const ctx = { ...mockPersonalization, knowledge_level: 'expert' as const }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('Kunstkenner')
    })

    it('includes anecdote instruction when enabled', () => {
      const ctx = { ...mockPersonalization, include_anecdotes: true }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('Anekdoten')
    })

    it('includes comparison instruction when enabled', () => {
      const ctx = { ...mockPersonalization, include_comparisons: true }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('Vergleiche')
    })

    it('handles minimal detail level', () => {
      const ctx = { ...mockPersonalization, ai_detail_level: 'minimal' as const }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('2-3 Saetze')
    })

    it('handles detailed level', () => {
      const ctx = { ...mockPersonalization, ai_detail_level: 'detailed' as const }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('8-12 Saetze')
    })

    it('includes accessibility notes for visual impairment', () => {
      const ctx = { ...mockPersonalization, accessibility_needs: ['visual_impairment'] }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('Audiodeskription')
    })

    it('includes preferred salutation when set', () => {
      const ctx = { ...mockPersonalization, preferred_salutation: 'Herr Mueller' }
      const prompt = buildArtworkSystemPrompt(ctx, 'Museum')
      expect(prompt).toContain('Herr Mueller')
    })

    it('includes language instruction', () => {
      const prompt = buildArtworkSystemPrompt(mockPersonalization, 'Museum')
      expect(prompt).toContain('Deutsch')
    })
  })

  describe('buildArtworkUserPrompt()', () => {
    it('includes artwork title', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de')
      expect(prompt).toContain('Sternennacht')
    })

    it('includes artist name and dates', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de')
      expect(prompt).toContain('Vincent van Gogh')
      expect(prompt).toContain('1853')
      expect(prompt).toContain('1890')
    })

    it('includes creation year', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de')
      expect(prompt).toContain('1889')
    })

    it('includes medium and dimensions', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de')
      expect(prompt).toContain('Oel auf Leinwand')
      expect(prompt).toContain('73.7 x 92.1 cm')
    })

    it('includes question when provided', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de', 'Was stellt das Bild dar?')
      expect(prompt).toContain('Was stellt das Bild dar?')
    })

    it('uses default explanation request when no question', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de')
      expect(prompt).toContain('erklaere dieses Kunstwerk')
    })

    it('includes fun facts', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de')
      expect(prompt).toContain('Van Gogh malte es aus dem Gedaechtnis')
    })

    it('includes AI base knowledge', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'de')
      expect(prompt).toContain('painted from memory')
    })

    it('falls back to English when language not available', () => {
      const prompt = buildArtworkUserPrompt(mockArtwork as any, 'fr')
      // Should fall back to en title
      expect(prompt).toContain('Starry Night')
    })
  })

  describe('buildTourSuggestionPrompt()', () => {
    const artworks = [
      {
        id: 'a1',
        title: { de: 'Bild 1', en: 'Painting 1' },
        artist_name: 'Artist A',
        epoch: 'Modern',
        style: 'Abstract',
        room_id: 'r1',
        tags: ['abstract', 'modern'],
        is_highlight: true,
      },
      {
        id: 'a2',
        title: { de: 'Bild 2', en: 'Painting 2' },
        artist_name: 'Artist B',
        epoch: 'Classical',
        style: 'Realism',
        room_id: 'r2',
        tags: ['realism'],
        is_highlight: false,
      },
    ]

    it('returns system and user prompts', () => {
      const result = buildTourSuggestionPrompt(artworks as any, 'de')
      expect(result.system).toBeTruthy()
      expect(result.user).toBeTruthy()
    })

    it('includes artworks in user prompt', () => {
      const result = buildTourSuggestionPrompt(artworks as any, 'de')
      expect(result.user).toContain('Bild 1')
      expect(result.user).toContain('Bild 2')
    })

    it('excludes specified artwork IDs', () => {
      const result = buildTourSuggestionPrompt(artworks as any, 'de', {
        excludeArtworkIds: ['a1'],
      })
      expect(result.user).not.toContain('"id": "a1"')
    })

    it('includes target audience constraint when provided', () => {
      const result = buildTourSuggestionPrompt(artworks as any, 'de', {
        targetAudience: 'children',
      })
      expect(result.user).toContain('children')
    })

    it('includes duration constraint when provided', () => {
      const result = buildTourSuggestionPrompt(artworks as any, 'de', {
        durationMinutes: 45,
      })
      expect(result.user).toContain('45')
    })

    it('includes theme constraint when provided', () => {
      const result = buildTourSuggestionPrompt(artworks as any, 'de', {
        theme: 'Impressionismus',
      })
      expect(result.user).toContain('Impressionismus')
    })

    it('system prompt mentions JSON format', () => {
      const result = buildTourSuggestionPrompt(artworks as any, 'de')
      expect(result.system).toContain('JSON')
    })
  })

  describe('buildContentGenerationPrompt()', () => {
    it('returns system and user prompts', () => {
      const result = buildContentGenerationPrompt(mockArtwork as any, 'de', 'description_standard')
      expect(result.system).toBeTruthy()
      expect(result.user).toBeTruthy()
    })

    it('includes field-specific instructions', () => {
      const result = buildContentGenerationPrompt(mockArtwork as any, 'de', 'description_children')
      expect(result.user).toContain('kindgerecht')
    })

    it('includes fun_facts instructions', () => {
      const result = buildContentGenerationPrompt(mockArtwork as any, 'de', 'fun_facts')
      expect(result.user).toContain('ueberraschende')
    })

    it('includes anti-hallucination instruction in system prompt', () => {
      const result = buildContentGenerationPrompt(mockArtwork as any, 'de', 'description_standard')
      expect(result.system).toContain('erfinde NICHTS')
    })
  })

  describe('buildPersonalizationContext()', () => {
    it('maps visitor profile to personalization context', () => {
      const visitor = {
        age_group: 'adult',
        knowledge_level: 'enthusiast',
        preferred_salutation: 'Dr. Schmidt',
        preferred_content_style: 'narrative',
        preferred_tour_depth: 'deep_dive',
        language: 'de',
        ai_personality_tone: 'academic',
        ai_detail_level: 'detailed',
        ai_include_anecdotes: true,
        ai_include_comparisons: false,
        ai_include_technique: true,
        ai_child_mode: false,
        accessibility_needs: ['visual_impairment'],
        preferred_voice_gender: 'male',
        preferred_voice_age: 'senior',
        preferred_voice_preset: 'preset-1',
        audio_speed: 0.8,
      }

      const ctx = buildPersonalizationContext(visitor as any)

      expect(ctx.age_group).toBe('adult')
      expect(ctx.knowledge_level).toBe('enthusiast')
      expect(ctx.preferred_salutation).toBe('Dr. Schmidt')
      expect(ctx.ai_tone).toBe('academic')
      expect(ctx.ai_detail_level).toBe('detailed')
      expect(ctx.include_anecdotes).toBe(true)
      expect(ctx.include_comparisons).toBe(false)
      expect(ctx.include_technique).toBe(true)
      expect(ctx.accessibility_needs).toContain('visual_impairment')
      expect(ctx.audio_speed).toBe(0.8)
    })
  })
})
