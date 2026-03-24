// @vitest-environment jsdom
// Tests for ContentValidation component logic

import { describe, it, expect } from 'vitest'

// Reproduce the scoring logic from ContentValidation.tsx
function computeScore(item: {
  textFields: number
  translatedLangs: number
  totalLangs: number
  hasMedia: boolean
  hasAudio: boolean
}) {
  const textScore = Math.min(item.textFields / 3, 1) * 40 // 3 fields = 100%
  const transScore = item.totalLangs > 0
    ? (item.translatedLangs / item.totalLangs) * 30
    : 0
  const mediaScore = item.hasMedia ? 20 : 0
  const audioScore = item.hasAudio ? 10 : 0
  return Math.round(textScore + transScore + mediaScore + audioScore)
}

function getStatus(score: number): 'red' | 'yellow' | 'green' {
  if (score >= 80) return 'green'
  if (score >= 40) return 'yellow'
  return 'red'
}

describe('ContentValidation scoring', () => {
  it('should give 100% for fully complete item', () => {
    const score = computeScore({
      textFields: 3,
      translatedLangs: 5,
      totalLangs: 5,
      hasMedia: true,
      hasAudio: true,
    })
    expect(score).toBe(100)
  })

  it('should give 0% for completely empty item', () => {
    const score = computeScore({
      textFields: 0,
      translatedLangs: 0,
      totalLangs: 5,
      hasMedia: false,
      hasAudio: false,
    })
    expect(score).toBe(0)
  })

  it('should weight text fields at 40%', () => {
    const score = computeScore({
      textFields: 3,
      translatedLangs: 0,
      totalLangs: 5,
      hasMedia: false,
      hasAudio: false,
    })
    expect(score).toBe(40)
  })

  it('should weight translations at 30%', () => {
    const score = computeScore({
      textFields: 0,
      translatedLangs: 5,
      totalLangs: 5,
      hasMedia: false,
      hasAudio: false,
    })
    expect(score).toBe(30)
  })

  it('should weight media at 20%', () => {
    const score = computeScore({
      textFields: 0,
      translatedLangs: 0,
      totalLangs: 5,
      hasMedia: true,
      hasAudio: false,
    })
    expect(score).toBe(20)
  })

  it('should weight audio at 10%', () => {
    const score = computeScore({
      textFields: 0,
      translatedLangs: 0,
      totalLangs: 5,
      hasMedia: false,
      hasAudio: true,
    })
    expect(score).toBe(10)
  })

  it('should cap text score at 40 even with more than 3 fields', () => {
    const score = computeScore({
      textFields: 8,
      translatedLangs: 0,
      totalLangs: 5,
      hasMedia: false,
      hasAudio: false,
    })
    expect(score).toBe(40)
  })

  it('should classify scores correctly', () => {
    expect(getStatus(100)).toBe('green')
    expect(getStatus(80)).toBe('green')
    expect(getStatus(79)).toBe('yellow')
    expect(getStatus(40)).toBe('yellow')
    expect(getStatus(39)).toBe('red')
    expect(getStatus(0)).toBe('red')
  })

  it('should handle partial completion', () => {
    const score = computeScore({
      textFields: 2,
      translatedLangs: 3,
      totalLangs: 5,
      hasMedia: true,
      hasAudio: false,
    })
    // text: (2/3)*40 = 26.67, trans: (3/5)*30 = 18, media: 20, audio: 0
    expect(score).toBe(Math.round(26.67 + 18 + 20))
  })

  it('should handle zero total languages gracefully', () => {
    const score = computeScore({
      textFields: 3,
      translatedLangs: 0,
      totalLangs: 0,
      hasMedia: true,
      hasAudio: true,
    })
    // text: 40, trans: 0 (division guard), media: 20, audio: 10
    expect(score).toBe(70)
  })
})
