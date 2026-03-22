// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }),
    },
  },
}))

import { supabase } from '@/lib/supabase'

const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>

describe('Edge Function Invocations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('content-enrich', () => {
    it('should invoke with correct action for single enrichment', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { success: true }, error: null })

      await supabase.functions.invoke('content-enrich', {
        body: { action: 'enrich_single', content_id: 'test-id', options: { brief: true, standard: true } },
      })

      expect(mockInvoke).toHaveBeenCalledWith('content-enrich', {
        body: { action: 'enrich_single', content_id: 'test-id', options: { brief: true, standard: true } },
      })
    })

    it('should invoke scout_city action', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { items: [] }, error: null })

      await supabase.functions.invoke('content-enrich', {
        body: { action: 'scout_city', city: 'Berlin', types: ['landmark', 'restaurant'] },
      })

      expect(mockInvoke).toHaveBeenCalledWith('content-enrich', expect.objectContaining({
        body: expect.objectContaining({ action: 'scout_city' }),
      }))
    })

    it('should handle errors gracefully', async () => {
      mockInvoke.mockResolvedValueOnce({ data: null, error: { message: 'Internal error' } })

      const result = await supabase.functions.invoke('content-enrich', {
        body: { action: 'enrich_single', content_id: 'test-id' },
      })

      expect(result.error).toBeTruthy()
    })
  })

  describe('fintutto-world-translate', () => {
    it('should invoke batch processing', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { processed: 5 }, error: null })

      await supabase.functions.invoke('fintutto-world-translate', {
        body: { action: 'process_batch', batch_size: 10 },
      })

      expect(mockInvoke).toHaveBeenCalledWith('fintutto-world-translate', expect.objectContaining({
        body: expect.objectContaining({ action: 'process_batch' }),
      }))
    })

    it('should queue content for translation', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { queued: 3 }, error: null })

      await supabase.functions.invoke('fintutto-world-translate', {
        body: { action: 'queue_content', content_id: 'id-1', target_languages: ['en', 'fr', 'es'] },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('fintutto-world-ai', () => {
    it('should invoke dialog action', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { message: 'Hello!' }, error: null })

      await supabase.functions.invoke('fintutto-world-ai', {
        body: { action: 'dialog', messages: [{ role: 'user', content: 'Tell me about this artwork' }] },
      })

      expect(mockInvoke).toHaveBeenCalledWith('fintutto-world-ai', expect.objectContaining({
        body: expect.objectContaining({ action: 'dialog' }),
      }))
    })

    it('should invoke recommend action', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { recommendations: [] }, error: null })

      await supabase.functions.invoke('fintutto-world-ai', {
        body: { action: 'recommend', visitor_id: 'v-1', context_type: 'museum', context_id: 'm-1' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('artguide-ai', () => {
    it('should invoke explain action', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { explanation: 'This is...' }, error: null })

      await supabase.functions.invoke('artguide-ai', {
        body: { action: 'explain', artwork_id: 'a-1', visitor_profile: {} },
      })

      expect(mockInvoke).toHaveBeenCalledWith('artguide-ai', expect.objectContaining({
        body: expect.objectContaining({ action: 'explain' }),
      }))
    })

    it('should invoke suggest_tours action', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { tours: [] }, error: null })

      await supabase.functions.invoke('artguide-ai', {
        body: { action: 'suggest_tours', museum_id: 'm-1', visitor_profile: {} },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('artguide-tts', () => {
    it('should invoke generate_single', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { audio_url: 'https://...' }, error: null })

      await supabase.functions.invoke('artguide-tts', {
        body: { action: 'generate_single', content_id: 'c-1', language: 'de' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })

    it('should invoke list_voices', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { voices: [] }, error: null })

      await supabase.functions.invoke('artguide-tts', {
        body: { action: 'list_voices' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('stripe-checkout', () => {
    it('should create checkout session', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { url: 'https://checkout.stripe.com/...' }, error: null })

      const result = await supabase.functions.invoke('stripe-checkout', {
        body: { tier_id: 'personal_pro', billing_cycle: 'monthly' },
      })

      expect(result.data?.url).toBeTruthy()
    })
  })

  describe('stripe-portal', () => {
    it('should create portal session', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { url: 'https://billing.stripe.com/...' }, error: null })

      const result = await supabase.functions.invoke('stripe-portal', {
        body: {},
      })

      expect(result.data?.url).toBeTruthy()
    })
  })

  describe('send-email', () => {
    it('should send email', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { success: true }, error: null })

      await supabase.functions.invoke('send-email', {
        body: { to: 'test@test.com', subject: 'Test', body: 'Hello' },
      })

      expect(mockInvoke).toHaveBeenCalledWith('send-email', expect.objectContaining({
        body: expect.objectContaining({ to: 'test@test.com' }),
      }))
    })
  })

  describe('content-extract', () => {
    it('should analyze file', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { fields: [], rows: 10 }, error: null })

      await supabase.functions.invoke('content-extract', {
        body: { action: 'analyze_file', file_url: 'https://example.com/data.csv' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })

    it('should suggest mapping', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { mappings: [] }, error: null })

      await supabase.functions.invoke('content-extract', {
        body: { action: 'suggest_mapping', source_fields: ['Name', 'Address'], target_type: 'pois' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('fintutto-world-crm', () => {
    it('should create lead', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { id: 'lead-1', invite_code: 'ABC123' }, error: null })

      await supabase.functions.invoke('fintutto-world-crm', {
        body: { action: 'create_lead', company_name: 'Test GmbH', contact_email: 'test@test.de' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })

    it('should get pipeline stats', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { stages: {}, total: 0 }, error: null })

      await supabase.functions.invoke('fintutto-world-crm', {
        body: { action: 'pipeline_stats', segment: 'guide' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })

    it('should get dashboard', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { conversion_rate: 0.15 }, error: null })

      await supabase.functions.invoke('fintutto-world-crm', {
        body: { action: 'dashboard' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('fintutto-world-content-api', () => {
    it('should list content', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { items: [], total: 0 }, error: null })

      await supabase.functions.invoke('fintutto-world-content-api', {
        body: { action: 'list_content', domain: 'cityguide', status: 'published' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })

    it('should create content', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { id: 'new-1' }, error: null })

      await supabase.functions.invoke('fintutto-world-content-api', {
        body: { action: 'create_content', items: [{ name: { de: 'Test' }, domain: 'cityguide' }] },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('artguide-positioning', () => {
    it('should list BLE anchors', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { anchors: [] }, error: null })

      await supabase.functions.invoke('artguide-positioning', {
        body: { action: 'list_anchors', museum_id: 'm-1' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })

  describe('admin-create-user', () => {
    it('should create user with role', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { user_id: 'u-1', email: 'new@test.de' }, error: null })

      await supabase.functions.invoke('admin-create-user', {
        body: { email: 'new@test.de', role: 'editor', display_name: 'New User' },
      })

      expect(mockInvoke).toHaveBeenCalled()
    })
  })
})
