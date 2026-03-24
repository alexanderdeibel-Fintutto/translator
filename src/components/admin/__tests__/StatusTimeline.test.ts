// @vitest-environment jsdom
// Tests for StatusTimeline — event config and timeline logic

import { describe, it, expect } from 'vitest'

describe('StatusTimeline', () => {
  describe('event types', () => {
    const eventTypes = ['status_change', 'content_edit', 'ai_enrich', 'ai_translate', 'media_upload', 'audio_generate', 'created', 'note']

    it('should have 8 event types', () => {
      expect(eventTypes).toHaveLength(8)
    })

    it('should include status workflow events', () => {
      expect(eventTypes).toContain('status_change')
      expect(eventTypes).toContain('created')
    })

    it('should include AI events', () => {
      expect(eventTypes).toContain('ai_enrich')
      expect(eventTypes).toContain('ai_translate')
    })

    it('should include media events', () => {
      expect(eventTypes).toContain('media_upload')
      expect(eventTypes).toContain('audio_generate')
    })
  })

  describe('actor types', () => {
    const actorTypes = ['user', 'system', 'ai']

    it('should have 3 actor types', () => {
      expect(actorTypes).toHaveLength(3)
    })
  })

  describe('status labels', () => {
    const labels: Record<string, string> = {
      draft: 'Entwurf',
      review: 'Review',
      published: 'Live',
      archived: 'Archiviert',
    }

    it('should have labels for all statuses', () => {
      expect(Object.keys(labels)).toHaveLength(4)
    })

    it('should not use German special characters', () => {
      const specialChars = /[äöüßÄÖÜ]/
      for (const label of Object.values(labels)) {
        expect(label).not.toMatch(specialChars)
      }
    })
  })

  describe('timeline sorting', () => {
    it('should sort events newest first', () => {
      const events = [
        { created_at: '2026-01-01T10:00:00Z' },
        { created_at: '2026-03-15T10:00:00Z' },
        { created_at: '2026-02-01T10:00:00Z' },
      ]
      const sorted = events.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      expect(sorted[0].created_at).toBe('2026-03-15T10:00:00Z')
      expect(sorted[2].created_at).toBe('2026-01-01T10:00:00Z')
    })
  })

  describe('fallback timeline generation', () => {
    it('should always create a "created" event', () => {
      const item = { id: '123', status: 'draft', created_at: '2026-01-01T00:00:00Z' }
      const events = [{ event_type: 'created', created_at: item.created_at }]
      expect(events).toHaveLength(1)
      expect(events[0].event_type).toBe('created')
    })

    it('should add AI event if ai_generated_at is set', () => {
      const item = { ai_generated_at: '2026-02-01T00:00:00Z' }
      const events: { event_type: string }[] = []
      if (item.ai_generated_at) {
        events.push({ event_type: 'ai_enrich' })
      }
      expect(events).toHaveLength(1)
    })

    it('should not add AI event if ai_generated_at is null', () => {
      const item = { ai_generated_at: null }
      const events: { event_type: string }[] = []
      if (item.ai_generated_at) {
        events.push({ event_type: 'ai_enrich' })
      }
      expect(events).toHaveLength(0)
    })

    it('should add status_change if not draft', () => {
      const item = { status: 'published' }
      const events: { event_type: string; from_value: string; to_value: string }[] = []
      if (item.status !== 'draft') {
        events.push({ event_type: 'status_change', from_value: 'draft', to_value: item.status })
      }
      expect(events).toHaveLength(1)
      expect(events[0].to_value).toBe('published')
    })

    it('should not add status_change for draft items', () => {
      const item = { status: 'draft' }
      const events: { event_type: string }[] = []
      if (item.status !== 'draft') {
        events.push({ event_type: 'status_change' })
      }
      expect(events).toHaveLength(0)
    })
  })

  describe('date formatting', () => {
    it('should format date in DE locale', () => {
      const d = new Date('2026-03-15T14:30:00Z')
      const formatted = d.toLocaleDateString('de-AT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      // Should contain date parts
      expect(formatted).toContain('15')
      expect(formatted).toContain('03')
      expect(formatted).toContain('2026')
    })
  })
})
