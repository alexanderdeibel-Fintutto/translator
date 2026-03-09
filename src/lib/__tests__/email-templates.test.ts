import { describe, it, expect } from 'vitest'
import { EMAIL_TEMPLATES, renderTemplate } from '../email-templates'

describe('EMAIL_TEMPLATES', () => {
  it('has at least 4 templates', () => {
    expect(EMAIL_TEMPLATES.length).toBeGreaterThanOrEqual(4)
  })

  it('every template has name, subject, body', () => {
    for (const tpl of EMAIL_TEMPLATES) {
      expect(tpl.name).toBeTruthy()
      expect(tpl.subject).toBeTruthy()
      expect(tpl.body).toBeTruthy()
    }
  })

  it('all templates use {{name}} and {{link}} placeholders', () => {
    for (const tpl of EMAIL_TEMPLATES) {
      expect(tpl.body).toContain('{{name}}')
      expect(tpl.body).toContain('{{link}}')
    }
  })
})

describe('renderTemplate', () => {
  it('replaces all placeholders', () => {
    const result = renderTemplate(EMAIL_TEMPLATES[0], {
      name: 'Max Mustermann',
      company: 'Reise GmbH',
      link: 'https://example.com/demo',
    })
    expect(result.subject).toContain('Reise GmbH')
    expect(result.body).toContain('Max Mustermann')
    expect(result.body).toContain('https://example.com/demo')
    expect(result.body).not.toContain('{{name}}')
    expect(result.body).not.toContain('{{company}}')
    expect(result.body).not.toContain('{{link}}')
  })

  it('handles missing variables gracefully (leaves placeholder)', () => {
    const result = renderTemplate(EMAIL_TEMPLATES[0], { name: 'Test' })
    expect(result.body).toContain('Test')
    expect(result.body).toContain('{{link}}') // not replaced
  })

  it('replaces multiple occurrences of same variable', () => {
    const tpl = { name: 'test', subject: '{{x}} and {{x}}', body: '{{x}}' }
    const result = renderTemplate(tpl, { x: 'hello' })
    expect(result.subject).toBe('hello and hello')
    expect(result.body).toBe('hello')
  })
})
