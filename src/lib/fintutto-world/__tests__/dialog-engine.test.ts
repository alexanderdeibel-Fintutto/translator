// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase with chainable query builder
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()

function chainable(): Record<string, any> {
  const self: Record<string, any> = {}
  self.insert = (d: any) => { mockInsert(d); return self }
  self.update = (d: any) => { mockUpdate(d); return self }
  self.select = (...a: any[]) => { mockSelect(...a); return self }
  self.eq = (c: string, v: any) => { mockEq(c, v); return self }
  self.order = (c: string, o?: any) => { mockOrder(c, o); return self }
  self.limit = (n: number) => { mockLimit(n); return self }
  self.single = () => mockSingle()
  return self
}

vi.mock('../../supabase', () => ({
  supabase: {
    from: () => chainable(),
    functions: { invoke: vi.fn() },
  },
}))

import {
  buildUniversalSystemPrompt,
  buildPoiContextPrompt,
  buildOnboardingPrompt,
  createDialog,
  addDialogMessage,
  getActiveDialog,
  completeDialog,
  buildRecommendationPrompt,
} from '../dialog-engine'

import type { UniversalPersonalizationContext } from '../types'

const mockContext: UniversalPersonalizationContext = {
  ageGroup: 'adult',
  knowledgeLevel: 'casual',
  preferredSalutation: null,
  contentStyle: 'narrative',
  tourDepth: 'standard',
  language: 'de',
  secondaryLanguages: [],
  aiTone: 'warm',
  aiDetailLevel: 'standard',
  includeAnecdotes: true,
  includeComparisons: true,
  includeTechnique: false,
  childMode: false,
  proactiveSuggestions: true,
  questionFrequency: 'moderate',
  accessibilityNeeds: [],
  voiceGender: 'female',
  voiceAge: 'middle',
  voicePreset: null,
  audioSpeed: 1.0,
  dietaryPreferences: [],
  budgetLevel: 'medium',
  mobilityLevel: 'full',
  groupSize: 'solo',
  interests: ['art', 'history'],
  travelMode: 'day_trip',
  travelPartySize: 1,
  travelWithChildren: false,
  prefersIndoor: true,
  prefersOutdoor: true,
  notificationsEnabled: true,
  notificationRadiusMeters: 100,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('dialog-engine', () => {
  describe('buildUniversalSystemPrompt()', () => {
    it('includes core identity text', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'museum',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('Fintutto Guide')
    })

    it('includes context name when provided', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'museum',
        contextName: 'Alte Pinakothek',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('Alte Pinakothek')
    })

    it('includes proactive mode instructions', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'city',
        dialogMode: 'proactive',
      })
      expect(prompt).toContain('PROAKTIV')
    })

    it('includes guided/onboarding mode instructions', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'museum',
        dialogMode: 'guided',
      })
      expect(prompt).toContain('ONBOARDING')
    })

    it('includes reactive mode instructions', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'museum',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('REAKTIV')
    })

    it('adapts tone based on context', () => {
      const formalCtx = { ...mockContext, aiTone: 'formal' as const }
      const prompt = buildUniversalSystemPrompt(formalCtx, {
        contextType: 'museum',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('formell')
    })

    it('includes remaining time when provided', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'museum',
        dialogMode: 'reactive',
        remainingTime: 45,
      })
      expect(prompt).toContain('45')
    })

    it('includes interests from context', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'museum',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('art')
      expect(prompt).toContain('history')
    })

    it('includes language instruction', () => {
      const prompt = buildUniversalSystemPrompt(mockContext, {
        contextType: 'museum',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('Deutsch')
    })

    it('adapts for child age group', () => {
      const childCtx = { ...mockContext, ageGroup: 'child' as const }
      const prompt = buildUniversalSystemPrompt(childCtx, {
        contextType: 'museum',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('Kind')
    })

    it('includes accessibility notes for visual impairment', () => {
      const accessCtx = { ...mockContext, accessibilityNeeds: ['visual_impairment'] }
      const prompt = buildUniversalSystemPrompt(accessCtx, {
        contextType: 'museum',
        dialogMode: 'reactive',
      })
      expect(prompt).toContain('Audiodeskription')
    })
  })

  describe('buildPoiContextPrompt()', () => {
    const mockPoi = {
      poiType: 'artwork',
      name: { de: 'Sternennacht', en: 'Starry Night' },
      description: { de: 'Ein beruehmtes Gemaelde', en: 'A famous painting' },
      tags: ['impressionism', 'landscape'],
      contentLayers: {
        standard: { de: 'Standard Beschreibung', en: 'Standard description' },
        detailed: undefined,
        historicalContext: undefined,
        funFacts: undefined,
      },
      aiBaseKnowledge: null,
    }

    it('includes POI name in prompt', () => {
      const prompt = buildPoiContextPrompt(mockPoi as any, 'de')
      expect(prompt).toContain('Sternennacht')
    })

    it('includes tags', () => {
      const prompt = buildPoiContextPrompt(mockPoi as any, 'en')
      expect(prompt).toContain('impressionism')
    })

    it('includes question when provided', () => {
      const prompt = buildPoiContextPrompt(mockPoi as any, 'de', 'Wer hat das gemalt?')
      expect(prompt).toContain('Wer hat das gemalt?')
    })

    it('uses fallback text when language not available', () => {
      const prompt = buildPoiContextPrompt(mockPoi as any, 'fr')
      expect(prompt.length).toBeGreaterThan(0)
    })
  })

  describe('buildOnboardingPrompt()', () => {
    it('returns German prompt for de language', () => {
      const prompt = buildOnboardingPrompt('de', 'museum', 'Louvre')
      expect(prompt).toContain('Fintutto Guide')
      expect(prompt).toContain('Louvre')
    })

    it('returns English prompt for en language', () => {
      const prompt = buildOnboardingPrompt('en', 'city', 'Munich')
      expect(prompt).toContain('Fintutto Guide')
      expect(prompt).toContain('Munich')
    })

    it('falls back to English for unsupported languages', () => {
      const prompt = buildOnboardingPrompt('ja', 'museum')
      expect(prompt).toContain('Fintutto Guide')
    })
  })

  describe('createDialog()', () => {
    it('starts new dialog with correct parameters', async () => {
      mockSingle.mockResolvedValue({ data: { id: 'dialog-1' }, error: null })

      const id = await createDialog(
        'visitor-1',
        'museum',
        'museum-1',
        'Alte Pinakothek',
        null,
        null,
        mockContext,
        'reactive',
      )

      expect(id).toBe('dialog-1')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          visitor_id: 'visitor-1',
          context_type: 'museum',
          context_id: 'museum-1',
          context_name: 'Alte Pinakothek',
          status: 'active',
          dialog_mode: 'reactive',
          messages: [],
          total_messages: 0,
        }),
      )
    })

    it('returns null on database error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      })

      const id = await createDialog(
        'visitor-1',
        'museum',
        null,
        null,
        null,
        null,
        mockContext,
      )

      expect(id).toBeNull()
    })
  })

  describe('addDialogMessage()', () => {
    it('appends message to existing dialog', async () => {
      mockSingle.mockResolvedValue({
        data: {
          messages: [{ role: 'user', content: 'Hello' }],
          total_messages: 1,
        },
        error: null,
      })

      await addDialogMessage('dialog-1', {
        role: 'assistant',
        content: 'Hi there!',
      } as any)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          total_messages: 2,
        }),
      )
    })
  })

  describe('getActiveDialog()', () => {
    it('returns active dialog for visitor', async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: 'dialog-1',
          visitor_id: 'visitor-1',
          context_type: 'museum',
          context_id: 'museum-1',
          context_name: 'Test Museum',
          parent_type: null,
          parent_id: null,
          messages: [],
          total_messages: 0,
          personalization_snapshot: mockContext,
          status: 'active',
          dialog_mode: 'reactive',
          started_at: '2025-01-01T00:00:00Z',
          last_message_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      })

      const dialog = await getActiveDialog('visitor-1', 'museum', 'museum-1')

      expect(dialog).not.toBeNull()
      expect(dialog!.id).toBe('dialog-1')
      expect(dialog!.status).toBe('active')
    })

    it('returns null when no active dialog exists', async () => {
      mockSingle.mockResolvedValue({ data: null, error: null })

      const dialog = await getActiveDialog('visitor-1')
      expect(dialog).toBeNull()
    })
  })

  describe('completeDialog()', () => {
    it('sets dialog status to completed', async () => {
      await completeDialog('dialog-1')

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'completed' })
      expect(mockEq).toHaveBeenCalledWith('id', 'dialog-1')
    })
  })

  describe('buildRecommendationPrompt()', () => {
    it('returns system and user prompts', () => {
      const result = buildRecommendationPrompt(mockContext, {
        contextType: 'museum',
        contextName: 'Louvre',
        availablePois: [
          { id: 'p1', name: 'Mona Lisa', type: 'artwork', tags: ['painting'] },
        ],
        alreadyViewed: [],
      })

      expect(result.system).toBeTruthy()
      expect(result.user).toBeTruthy()
      expect(result.user).toContain('Louvre')
    })

    it('filters out already viewed POIs', () => {
      const result = buildRecommendationPrompt(mockContext, {
        contextType: 'museum',
        contextName: 'Test',
        availablePois: [
          { id: 'p1', name: 'Seen', type: 'artwork', tags: [] },
          { id: 'p2', name: 'Not Seen', type: 'artwork', tags: [] },
        ],
        alreadyViewed: ['p1'],
      })

      expect(result.user).toContain('Not Seen')
    })
  })
})
