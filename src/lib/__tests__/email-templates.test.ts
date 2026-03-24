// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { EMAIL_TEMPLATES, renderTemplate } from '../email-templates'

describe('email-templates', () => {
  describe('EMAIL_TEMPLATES', () => {
    it('should have exactly 4 templates', () => {
      expect(EMAIL_TEMPLATES).toHaveLength(4)
    })

    it('each template should have name, subject, body', () => {
      for (const template of EMAIL_TEMPLATES) {
        expect(typeof template.name).toBe('string')
        expect(template.name.length).toBeGreaterThan(0)
        expect(typeof template.subject).toBe('string')
        expect(template.subject.length).toBeGreaterThan(0)
        expect(typeof template.body).toBe('string')
        expect(template.body.length).toBeGreaterThan(0)
      }
    })

    it('should contain Erstansprache template', () => {
      const found = EMAIL_TEMPLATES.find(t => t.name === 'Erstansprache')
      expect(found).toBeDefined()
    })

    it('should contain Demo-Einladung template', () => {
      const found = EMAIL_TEMPLATES.find(t => t.name === 'Demo-Einladung')
      expect(found).toBeDefined()
    })

    it('should contain Angebot template', () => {
      const found = EMAIL_TEMPLATES.find(t => t.name === 'Angebot')
      expect(found).toBeDefined()
    })

    it('should contain Nachfassen template', () => {
      const found = EMAIL_TEMPLATES.find(t => t.name === 'Nachfassen')
      expect(found).toBeDefined()
    })

    it('all templates should have placeholders in subject or body', () => {
      for (const template of EMAIL_TEMPLATES) {
        const combined = template.subject + template.body
        expect(combined).toContain('{{')
      }
    })
  })

  describe('renderTemplate', () => {
    it('should replace {{name}} in subject and body', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, { name: 'Max Mustermann' })
      expect(result.body).toContain('Max Mustermann')
      expect(result.body).not.toContain('{{name}}')
    })

    it('should replace {{company}} in subject and body', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, { company: 'TourCorp GmbH' })
      expect(result.subject).toContain('TourCorp GmbH')
      expect(result.body).toContain('TourCorp GmbH')
    })

    it('should replace {{link}} in body', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, { link: 'https://example.com/calc/123' })
      expect(result.body).toContain('https://example.com/calc/123')
    })

    it('should replace multiple variables in one template', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, {
        name: 'Anna',
        company: 'Reise AG',
        link: 'https://app.example.com',
      })
      expect(result.body).toContain('Anna')
      expect(result.body).toContain('Reise AG')
      expect(result.body).toContain('https://app.example.com')
      expect(result.subject).toContain('Reise AG')
    })

    it('should leave unknown placeholders as-is', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, { name: 'Test' })
      // {{company}} and {{link}} should still be present if not replaced
      expect(result.subject).toContain('{{company}}')
      expect(result.body).toContain('{{link}}')
    })

    it('should return subject and body as strings', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, {})
      expect(typeof result.subject).toBe('string')
      expect(typeof result.body).toBe('string')
    })

    it('should handle empty vars object', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, {})
      // All placeholders should remain
      expect(result.subject).toContain('{{company}}')
      expect(result.body).toContain('{{name}}')
    })

    it('should handle replacing with empty string', () => {
      const template = EMAIL_TEMPLATES[0]
      const result = renderTemplate(template, { name: '' })
      expect(result.body).not.toContain('{{name}}')
    })

    it('should work with all 4 templates', () => {
      for (const template of EMAIL_TEMPLATES) {
        const result = renderTemplate(template, {
          name: 'TestUser',
          company: 'TestCo',
          link: 'https://test.com',
        })
        expect(result.body).not.toContain('{{name}}')
        expect(result.body).not.toContain('{{link}}')
      }
    })
  })
})
