// @vitest-environment jsdom
// Tests for FieldTooltip component and FIELD_HELP registry

import { describe, it, expect } from 'vitest'
import { FIELD_HELP, useFieldHelp } from '../FieldTooltip'

describe('FieldTooltip', () => {
  describe('FIELD_HELP registry', () => {
    it('should have entries for all 8 content fields', () => {
      const contentKeys = [
        'content_brief', 'content_standard', 'content_detailed',
        'content_children', 'content_youth', 'content_fun_facts',
        'content_historical', 'content_technique',
      ]
      for (const key of contentKeys) {
        expect(FIELD_HELP[key]).toBeDefined()
        expect(FIELD_HELP[key].label).toBeTruthy()
        expect(FIELD_HELP[key].description).toBeTruthy()
      }
    })

    it('should have entries for general content fields', () => {
      expect(FIELD_HELP['name']).toBeDefined()
      expect(FIELD_HELP['slug']).toBeDefined()
      expect(FIELD_HELP['tags']).toBeDefined()
      expect(FIELD_HELP['status']).toBeDefined()
    })

    it('should have entries for geo fields', () => {
      expect(FIELD_HELP['lat']).toBeDefined()
      expect(FIELD_HELP['lng']).toBeDefined()
    })

    it('should have entries for import fields', () => {
      expect(FIELD_HELP['import_file']).toBeDefined()
      expect(FIELD_HELP['field_mapping']).toBeDefined()
    })

    it('should have entries for audio/TTS fields', () => {
      expect(FIELD_HELP['audio_voice']).toBeDefined()
      expect(FIELD_HELP['audio_speed']).toBeDefined()
    })

    it('should not use German special characters', () => {
      const specialChars = /[äöüßÄÖÜ]/
      for (const [, entry] of Object.entries(FIELD_HELP)) {
        expect(entry.label).not.toMatch(specialChars)
        expect(entry.description).not.toMatch(specialChars)
        if (entry.example) expect(entry.example).not.toMatch(specialChars)
        if (entry.bestPractice) expect(entry.bestPractice).not.toMatch(specialChars)
      }
    })

    it('should have examples for key fields', () => {
      expect(FIELD_HELP['content_brief'].example).toBeTruthy()
      expect(FIELD_HELP['slug'].example).toBeTruthy()
      expect(FIELD_HELP['tags'].example).toBeTruthy()
      expect(FIELD_HELP['lat'].example).toBeTruthy()
    })

    it('should have best practices for all fields', () => {
      for (const [key, entry] of Object.entries(FIELD_HELP)) {
        expect(entry.bestPractice).toBeTruthy()
      }
    })
  })

  describe('useFieldHelp hook', () => {
    it('should return help for known field', () => {
      const help = useFieldHelp('name')
      expect(help).not.toBeNull()
      expect(help?.label).toBe('Name / Titel')
    })

    it('should return null for unknown field', () => {
      const help = useFieldHelp('unknown_field_xyz')
      expect(help).toBeNull()
    })
  })

  describe('registry completeness', () => {
    it('should have at least 20 field entries', () => {
      const count = Object.keys(FIELD_HELP).length
      expect(count).toBeGreaterThanOrEqual(20)
    })

    it('should have description for every entry', () => {
      for (const [, entry] of Object.entries(FIELD_HELP)) {
        expect(entry.description.length).toBeGreaterThan(10)
      }
    })
  })
})
