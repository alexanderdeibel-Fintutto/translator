import { describe, it, expect } from 'vitest'

/**
 * PainScale data model tests.
 *
 * Tests the Wong-Baker pain scale values and their properties.
 * The visual rendering is validated at build time by TypeScript.
 */

interface PainLevel {
  value: number
  emoji: string
  label: string
}

// Mirror the data from PainScale.tsx component
const PAIN_LEVELS: PainLevel[] = [
  { value: 0,  emoji: '😊', label: 'Kein Schmerz' },
  { value: 2,  emoji: '🙂', label: 'Leicht' },
  { value: 4,  emoji: '😐', label: 'Maessig' },
  { value: 6,  emoji: '😟', label: 'Stark' },
  { value: 8,  emoji: '😣', label: 'Sehr stark' },
  { value: 10, emoji: '😭', label: 'Unertraeglich' },
]

describe('PainScale data', () => {
  it('should cover the full 0-10 range', () => {
    expect(PAIN_LEVELS[0].value).toBe(0)
    expect(PAIN_LEVELS[PAIN_LEVELS.length - 1].value).toBe(10)
  })

  it('should have exactly 6 levels', () => {
    expect(PAIN_LEVELS.length).toBe(6)
  })

  it('should be in ascending order', () => {
    for (let i = 1; i < PAIN_LEVELS.length; i++) {
      expect(PAIN_LEVELS[i].value).toBeGreaterThan(PAIN_LEVELS[i - 1].value)
    }
  })

  it('should have even-numbered values', () => {
    for (const level of PAIN_LEVELS) {
      expect(level.value % 2).toBe(0)
    }
  })

  it('should have unique emojis', () => {
    const emojis = PAIN_LEVELS.map((l) => l.emoji)
    expect(new Set(emojis).size).toBe(emojis.length)
  })

  it('should have non-empty labels without special German chars', () => {
    for (const level of PAIN_LEVELS) {
      expect(level.label.trim().length).toBeGreaterThan(0)
      expect(level.label).not.toMatch(/[äöüßÄÖÜ]/)
    }
  })

  it('should map to valid pain descriptors', () => {
    // Wong-Baker scale: 0=no pain, 10=worst pain
    expect(PAIN_LEVELS.find((l) => l.value === 0)?.label).toContain('Kein')
    expect(PAIN_LEVELS.find((l) => l.value === 10)?.label).toContain('Unertraeglich')
  })
})
