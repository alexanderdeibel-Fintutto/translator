// @vitest-environment jsdom
// Tests for WorkflowManager — templates, triggers, actions

import { describe, it, expect } from 'vitest'
import { WORKFLOW_TEMPLATES } from '../WorkflowManager'
import type { WorkflowRule, TriggerType, ActionType, WorkflowCondition } from '../WorkflowManager'

describe('WorkflowManager', () => {
  describe('WORKFLOW_TEMPLATES', () => {
    it('should have 5 predefined templates', () => {
      expect(WORKFLOW_TEMPLATES).toHaveLength(5)
    })

    it('should have unique names', () => {
      const names = WORKFLOW_TEMPLATES.map(t => t.name)
      expect(new Set(names).size).toBe(names.length)
    })

    it('should have valid trigger types', () => {
      const validTriggers: TriggerType[] = ['status_change', 'content_created', 'ai_complete', 'schedule', 'completeness_reached']
      for (const tmpl of WORKFLOW_TEMPLATES) {
        expect(validTriggers).toContain(tmpl.trigger.type)
      }
    })

    it('should have valid action types', () => {
      const validActions: ActionType[] = ['change_status', 'send_notification', 'ai_enrich', 'ai_translate', 'add_tag', 'set_highlight']
      for (const tmpl of WORKFLOW_TEMPLATES) {
        for (const action of tmpl.actions) {
          expect(validActions).toContain(action.type)
        }
      }
    })

    it('should have at least one action per template', () => {
      for (const tmpl of WORKFLOW_TEMPLATES) {
        expect(tmpl.actions.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('should not use German special characters', () => {
      const specialChars = /[äöüßÄÖÜ]/
      for (const tmpl of WORKFLOW_TEMPLATES) {
        expect(tmpl.name).not.toMatch(specialChars)
        expect(tmpl.description).not.toMatch(specialChars)
      }
    })
  })

  describe('condition matching logic', () => {
    function matchCondition(operator: string, condValue: string, itemValue: string | number): boolean {
      if (operator === 'equals') return String(itemValue) === condValue
      if (operator === 'not_equals') return String(itemValue) !== condValue
      if (operator === 'greater_than') return Number(itemValue) > parseFloat(condValue)
      if (operator === 'less_than') return Number(itemValue) < parseFloat(condValue)
      if (operator === 'contains') return String(itemValue).includes(condValue)
      return false
    }

    it('should match equals', () => {
      expect(matchCondition('equals', 'draft', 'draft')).toBe(true)
      expect(matchCondition('equals', 'draft', 'published')).toBe(false)
    })

    it('should match not_equals', () => {
      expect(matchCondition('not_equals', 'draft', 'published')).toBe(true)
      expect(matchCondition('not_equals', 'draft', 'draft')).toBe(false)
    })

    it('should match greater_than', () => {
      expect(matchCondition('greater_than', '4.5', 4.8)).toBe(true)
      expect(matchCondition('greater_than', '4.5', 4.0)).toBe(false)
    })

    it('should match less_than', () => {
      expect(matchCondition('less_than', '3.0', 2.5)).toBe(true)
      expect(matchCondition('less_than', '3.0', 4.0)).toBe(false)
    })

    it('should match contains', () => {
      expect(matchCondition('contains', 'museum', 'Kunstmuseum')).toBe(true)
      expect(matchCondition('contains', 'Park', 'Museum')).toBe(false)
    })
  })

  describe('template: Auto-Review nach KI', () => {
    const tmpl = WORKFLOW_TEMPLATES[0]

    it('should trigger on ai_complete', () => {
      expect(tmpl.trigger.type).toBe('ai_complete')
    })

    it('should only apply to drafts', () => {
      expect(tmpl.conditions).toHaveLength(1)
      expect(tmpl.conditions[0].field).toBe('status')
      expect(tmpl.conditions[0].value).toBe('draft')
    })

    it('should change status to review', () => {
      expect(tmpl.actions[0].type).toBe('change_status')
      expect(tmpl.actions[0].params.to).toBe('review')
    })

    it('should be active by default', () => {
      expect(tmpl.is_active).toBe(true)
    })
  })

  describe('template: Auto-Uebersetzen bei Review', () => {
    const tmpl = WORKFLOW_TEMPLATES[2]

    it('should trigger on status_change to review', () => {
      expect(tmpl.trigger.type).toBe('status_change')
      expect(tmpl.trigger.params.to).toBe('review')
    })

    it('should translate to EN and FR', () => {
      expect(tmpl.actions[0].type).toBe('ai_translate')
      expect(tmpl.actions[0].params.languages).toBe('en,fr')
    })

    it('should be inactive by default', () => {
      expect(tmpl.is_active).toBe(false)
    })
  })

  describe('template: Auto-Publish bei Vollstaendigkeit', () => {
    const tmpl = WORKFLOW_TEMPLATES[4]

    it('should trigger on completeness_reached', () => {
      expect(tmpl.trigger.type).toBe('completeness_reached')
    })

    it('should require 80% threshold', () => {
      expect(tmpl.trigger.params.threshold).toBe('80')
    })

    it('should only apply to items in review', () => {
      expect(tmpl.conditions[0].value).toBe('review')
    })

    it('should publish', () => {
      expect(tmpl.actions[0].params.to).toBe('published')
    })
  })
})
