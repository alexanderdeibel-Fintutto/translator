// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import {
  PIPELINE_STAGES,
  NOTE_TYPES,
  PARTICIPANT_ROLES,
  PRE_TRANSLATION_TYPES,
  EVENT_SESSION_TYPES,
  EVENT_SESSION_STATUSES,
  SEGMENT_TAG_PRESETS,
  FOLLOW_UP_PRESETS,
} from '../admin-types'

describe('admin-types', () => {
  describe('PIPELINE_STAGES', () => {
    it('should have exactly 9 stages', () => {
      expect(PIPELINE_STAGES).toHaveLength(9)
    })

    it('each stage should have id, label, color', () => {
      for (const stage of PIPELINE_STAGES) {
        expect(typeof stage.id).toBe('string')
        expect(stage.id.length).toBeGreaterThan(0)
        expect(typeof stage.label).toBe('string')
        expect(stage.label.length).toBeGreaterThan(0)
        expect(typeof stage.color).toBe('string')
        expect(stage.color.length).toBeGreaterThan(0)
      }
    })

    it('should start with "neu" and end with "verloren"', () => {
      expect(PIPELINE_STAGES[0].id).toBe('neu')
      expect(PIPELINE_STAGES[PIPELINE_STAGES.length - 1].id).toBe('verloren')
    })

    it('should contain all expected stages in correct order', () => {
      const expectedOrder = [
        'neu', 'eingeladen', 'registriert', 'kalkulation',
        'demo', 'angebot', 'verhandlung', 'gewonnen', 'verloren',
      ]
      const actualOrder = PIPELINE_STAGES.map(s => s.id)
      expect(actualOrder).toEqual(expectedOrder)
    })

    it('should have "gewonnen" as second to last', () => {
      expect(PIPELINE_STAGES[7].id).toBe('gewonnen')
    })

    it('all colors should start with "bg-"', () => {
      for (const stage of PIPELINE_STAGES) {
        expect(stage.color).toMatch(/^bg-/)
      }
    })

    it('should have no duplicate ids', () => {
      const ids = PIPELINE_STAGES.map(s => s.id)
      const unique = new Set(ids)
      expect(unique.size).toBe(ids.length)
    })
  })

  describe('NOTE_TYPES', () => {
    it('should have exactly 4 entries', () => {
      expect(NOTE_TYPES).toHaveLength(4)
    })

    it('should contain note, call, email, meeting', () => {
      const ids = NOTE_TYPES.map(n => n.id)
      expect(ids).toContain('note')
      expect(ids).toContain('call')
      expect(ids).toContain('email')
      expect(ids).toContain('meeting')
    })

    it('each entry should have id and label', () => {
      for (const noteType of NOTE_TYPES) {
        expect(typeof noteType.id).toBe('string')
        expect(typeof noteType.label).toBe('string')
        expect(noteType.label.length).toBeGreaterThan(0)
      }
    })
  })

  describe('PARTICIPANT_ROLES', () => {
    it('should be a non-empty array', () => {
      expect(PARTICIPANT_ROLES.length).toBeGreaterThan(0)
    })

    it('should contain speaker, moderator, panelist, interpreter, guest', () => {
      const ids = PARTICIPANT_ROLES.map(r => r.id)
      expect(ids).toContain('speaker')
      expect(ids).toContain('moderator')
      expect(ids).toContain('panelist')
      expect(ids).toContain('interpreter')
      expect(ids).toContain('guest')
    })

    it('each role should have id and label', () => {
      for (const role of PARTICIPANT_ROLES) {
        expect(typeof role.id).toBe('string')
        expect(typeof role.label).toBe('string')
        expect(role.label.length).toBeGreaterThan(0)
      }
    })
  })

  describe('PRE_TRANSLATION_TYPES', () => {
    it('should be a non-empty array', () => {
      expect(PRE_TRANSLATION_TYPES.length).toBeGreaterThan(0)
    })

    it('should contain speech, questions, biography, glossary, agenda, notes', () => {
      const ids = PRE_TRANSLATION_TYPES.map(t => t.id)
      expect(ids).toContain('speech')
      expect(ids).toContain('questions')
      expect(ids).toContain('biography')
      expect(ids).toContain('glossary')
      expect(ids).toContain('agenda')
      expect(ids).toContain('notes')
    })

    it('each type should have id and label', () => {
      for (const type of PRE_TRANSLATION_TYPES) {
        expect(typeof type.id).toBe('string')
        expect(typeof type.label).toBe('string')
        expect(type.label.length).toBeGreaterThan(0)
      }
    })
  })

  describe('EVENT_SESSION_TYPES', () => {
    it('should be a non-empty array', () => {
      expect(EVENT_SESSION_TYPES.length).toBeGreaterThan(0)
    })

    it('should contain session, panel, tour, conference, workshop', () => {
      const ids = EVENT_SESSION_TYPES.map(t => t.id)
      expect(ids).toContain('session')
      expect(ids).toContain('panel')
      expect(ids).toContain('tour')
      expect(ids).toContain('conference')
      expect(ids).toContain('workshop')
    })

    it('each type should have id and label', () => {
      for (const type of EVENT_SESSION_TYPES) {
        expect(typeof type.id).toBe('string')
        expect(typeof type.label).toBe('string')
        expect(type.label.length).toBeGreaterThan(0)
      }
    })
  })

  describe('EVENT_SESSION_STATUSES', () => {
    it('should be a non-empty array', () => {
      expect(EVENT_SESSION_STATUSES.length).toBeGreaterThan(0)
    })

    it('should contain draft, prepared, active, completed, archived', () => {
      const ids = EVENT_SESSION_STATUSES.map(s => s.id)
      expect(ids).toContain('draft')
      expect(ids).toContain('prepared')
      expect(ids).toContain('active')
      expect(ids).toContain('completed')
      expect(ids).toContain('archived')
    })

    it('each status should have id, label, and color', () => {
      for (const status of EVENT_SESSION_STATUSES) {
        expect(typeof status.id).toBe('string')
        expect(typeof status.label).toBe('string')
        expect(status.label.length).toBeGreaterThan(0)
        expect(typeof status.color).toBe('string')
        expect(status.color).toMatch(/^bg-/)
      }
    })
  })

  describe('SEGMENT_TAG_PRESETS', () => {
    it('should have an "all" key', () => {
      expect(SEGMENT_TAG_PRESETS.all).toBeDefined()
      expect(Array.isArray(SEGMENT_TAG_PRESETS.all)).toBe(true)
    })

    it('"all" key should contain non-empty array', () => {
      expect(SEGMENT_TAG_PRESETS.all.length).toBeGreaterThan(0)
    })

    it('should have segment-specific presets', () => {
      expect(SEGMENT_TAG_PRESETS.guide).toBeDefined()
      expect(SEGMENT_TAG_PRESETS.agency).toBeDefined()
      expect(SEGMENT_TAG_PRESETS.event).toBeDefined()
      expect(SEGMENT_TAG_PRESETS.cruise).toBeDefined()
    })

    it('cruise presets should contain known cruise lines', () => {
      expect(SEGMENT_TAG_PRESETS.cruise).toContain('AIDA')
      expect(SEGMENT_TAG_PRESETS.cruise).toContain('MSC')
    })

    it('internal presets should include Admin and Entwickler', () => {
      expect(SEGMENT_TAG_PRESETS.internal).toContain('Admin')
      expect(SEGMENT_TAG_PRESETS.internal).toContain('Entwickler')
    })

    it('all arrays should contain only strings', () => {
      for (const [_key, tags] of Object.entries(SEGMENT_TAG_PRESETS)) {
        expect(Array.isArray(tags)).toBe(true)
        for (const tag of tags) {
          expect(typeof tag).toBe('string')
        }
      }
    })
  })

  describe('FOLLOW_UP_PRESETS', () => {
    it('should be a non-empty array', () => {
      expect(FOLLOW_UP_PRESETS.length).toBeGreaterThan(0)
    })

    it('each preset should have label and days', () => {
      for (const preset of FOLLOW_UP_PRESETS) {
        expect(typeof preset.label).toBe('string')
        expect(preset.label.length).toBeGreaterThan(0)
        expect(typeof preset.days).toBe('number')
        expect(preset.days).toBeGreaterThan(0)
      }
    })

    it('days should be in ascending order', () => {
      for (let i = 1; i < FOLLOW_UP_PRESETS.length; i++) {
        expect(FOLLOW_UP_PRESETS[i].days).toBeGreaterThan(FOLLOW_UP_PRESETS[i - 1].days)
      }
    })

    it('should contain a "Morgen" (1 day) preset', () => {
      const morgen = FOLLOW_UP_PRESETS.find(p => p.days === 1)
      expect(morgen).toBeDefined()
      expect(morgen!.label).toBe('Morgen')
    })
  })
})
