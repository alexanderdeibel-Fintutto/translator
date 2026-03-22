// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
const mockRpc = vi.fn()
const mockFrom = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

vi.mock('../../supabase', () => ({
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args),
    from: (table: string) => {
      mockFrom(table)
      return {
        update: (data: any) => {
          mockUpdate(data)
          return {
            eq: (col: string, val: string) => {
              mockEq(col, val)
              return { data: null, error: null }
            },
          }
        },
        select: (...args: any[]) => {
          mockSelect(...args)
          return {
            eq: (col: string, val: string) => {
              mockEq(col, val)
              return {
                single: () => mockSingle(),
              }
            },
          }
        },
      }
    },
  },
}))

import {
  getOrCreateProfile,
  updateProfile,
  getCachedProfile,
  clearCachedProfile,
} from '../visitor-profile'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('visitor-profile', () => {
  describe('getOrCreateProfile()', () => {
    it('creates profile with defaults from RPC', async () => {
      const mockProfileData = {
        id: 'profile-1',
        user_id: 'user-1',
        display_name: null,
        preferred_salutation: null,
        avatar_url: null,
        age_group: 'adult',
        birth_year: null,
        gender: null,
        country_of_origin: null,
        country_of_residence: null,
        primary_language: 'de',
        secondary_languages: [],
        ui_language: 'de',
        knowledge_level: 'casual',
        interests: [],
        favorite_categories: [],
        favorite_epochs: [],
        favorite_artists: [],
        dietary_preferences: [],
        budget_level: 'medium',
        mobility_level: 'full',
        accessibility_needs: [],
        preferred_tour_depth: 'standard',
        preferred_content_style: 'narrative',
        preferred_group_size: 'solo',
        typical_visit_duration_minutes: null,
        prefers_indoor: true,
        prefers_outdoor: true,
        preferred_voice_gender: 'female',
        preferred_voice_age: 'middle',
        preferred_voice_preset: null,
        audio_speed: 1.0,
        auto_play_audio: true,
        ai_personality_tone: 'warm',
        ai_detail_level: 'standard',
        ai_include_anecdotes: true,
        ai_include_comparisons: true,
        ai_include_technique: false,
        ai_child_mode: false,
        ai_proactive_suggestions: true,
        ai_question_frequency: 'moderate',
        notifications_enabled: true,
        notify_nearby_pois: true,
        notify_nearby_offers: true,
        notify_time_warnings: true,
        notify_recommendations: true,
        notification_radius_meters: 100,
        notification_cooldown_minutes: 5,
        current_lat: null,
        current_lng: null,
        current_context_type: null,
        current_context_id: null,
        travel_mode: null,
        travel_start_date: null,
        travel_end_date: null,
        travel_party_size: 1,
        travel_with_children: false,
        travel_children_ages: [],
        onboarding_completed: false,
        total_visits: 0,
        total_pois_viewed: 0,
        total_ai_conversations: 0,
        last_active_at: '2025-01-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
      }

      mockRpc.mockResolvedValue({ data: mockProfileData, error: null })

      const profile = await getOrCreateProfile()

      expect(profile).not.toBeNull()
      expect(profile!.id).toBe('profile-1')
      expect(profile!.primaryLanguage).toBe('de')
      expect(profile!.knowledgeLevel).toBe('casual')
      expect(profile!.ageGroup).toBe('adult')
      expect(profile!.budgetLevel).toBe('medium')
      expect(profile!.mobilityLevel).toBe('full')
      expect(profile!.onboardingCompleted).toBe(false)
    })

    it('loads existing profile from cache when RPC fails', async () => {
      // Put a profile in the cache first
      const cachedProfile = {
        id: 'cached-1',
        userId: 'user-1',
        primaryLanguage: 'en',
        knowledgeLevel: 'expert',
      }
      localStorage.setItem('fw_visitor_profile', JSON.stringify(cachedProfile))

      mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })

      const profile = await getOrCreateProfile()

      expect(profile).not.toBeNull()
      expect(profile!.id).toBe('cached-1')
    })

    it('returns null when no cache and RPC fails', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC failed' } })

      const profile = await getOrCreateProfile()

      expect(profile).toBeNull()
    })

    it('caches profile after successful load', async () => {
      const mockData = {
        id: 'profile-2',
        user_id: 'user-2',
        primary_language: 'fr',
        knowledge_level: 'beginner',
        age_group: 'youth',
        budget_level: 'budget',
        mobility_level: 'full',
        created_at: '2025-01-01T00:00:00Z',
      }

      mockRpc.mockResolvedValue({ data: mockData, error: null })

      await getOrCreateProfile()

      const cached = getCachedProfile()
      expect(cached).not.toBeNull()
      expect(cached!.id).toBe('profile-2')
    })
  })

  describe('updateProfile()', () => {
    it('calls supabase with the correct table', async () => {
      const result = await updateProfile('profile-1', {
        primaryLanguage: 'en',
        knowledgeLevel: 'expert',
      })

      expect(mockFrom).toHaveBeenCalledWith('fw_visitor_profiles')
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'profile-1')
    })
  })

  describe('getCachedProfile()', () => {
    it('returns null when no cached profile', () => {
      const result = getCachedProfile()
      expect(result).toBeNull()
    })

    it('returns cached profile from localStorage', () => {
      const profile = {
        id: 'cache-1',
        userId: 'user-1',
        primaryLanguage: 'de',
      }
      localStorage.setItem('fw_visitor_profile', JSON.stringify(profile))

      const result = getCachedProfile()
      expect(result).not.toBeNull()
      expect(result!.id).toBe('cache-1')
    })

    it('returns null on corrupted cache data', () => {
      localStorage.setItem('fw_visitor_profile', 'not-valid-json{{{')

      const result = getCachedProfile()
      expect(result).toBeNull()
    })
  })

  describe('clearCachedProfile()', () => {
    it('removes cached profile from localStorage', () => {
      localStorage.setItem('fw_visitor_profile', JSON.stringify({ id: 'x' }))

      clearCachedProfile()

      expect(localStorage.getItem('fw_visitor_profile')).toBeNull()
    })
  })
})
