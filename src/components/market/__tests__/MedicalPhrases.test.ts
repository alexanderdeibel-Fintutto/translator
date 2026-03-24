import { describe, it, expect } from 'vitest'
import { MEDICAL_PHRASES } from '../MedicalPhrases'

describe('MedicalPhrases data', () => {
  it('should have all required categories', () => {
    const categories = [...new Set(MEDICAL_PHRASES.map((p) => p.category))]
    expect(categories).toContain('emergency')
    expect(categories).toContain('triage')
    expect(categories).toContain('symptoms')
    expect(categories).toContain('instructions')
  })

  it('should have unique IDs', () => {
    const ids = MEDICAL_PHRASES.map((p) => p.id)
    const uniqueIds = [...new Set(ids)]
    expect(uniqueIds.length).toBe(ids.length)
  })

  it('should have at least 5 phrases per category', () => {
    const categories = ['emergency', 'triage', 'symptoms', 'instructions'] as const
    for (const cat of categories) {
      const count = MEDICAL_PHRASES.filter((p) => p.category === cat).length
      expect(count).toBeGreaterThanOrEqual(5)
    }
  })

  it('should have non-empty text for all phrases', () => {
    for (const phrase of MEDICAL_PHRASES) {
      expect(phrase.text.trim().length).toBeGreaterThan(0)
      expect(phrase.id.trim().length).toBeGreaterThan(0)
    }
  })

  it('should have at least 25 total phrases', () => {
    expect(MEDICAL_PHRASES.length).toBeGreaterThanOrEqual(25)
  })

  it('should not contain special German characters (project convention)', () => {
    for (const phrase of MEDICAL_PHRASES) {
      expect(phrase.text).not.toMatch(/[äöüßÄÖÜ]/)
    }
  })
})
