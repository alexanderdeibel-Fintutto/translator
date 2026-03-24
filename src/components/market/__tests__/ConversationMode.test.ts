import { describe, it, expect } from 'vitest'
import type { ConversationTurn } from '../ConversationMode'

describe('ConversationMode types', () => {
  it('should accept valid conversation turns', () => {
    const turn: ConversationTurn = {
      id: 'turn-1',
      side: 'staff',
      originalText: 'Wie kann ich Ihnen helfen?',
      translatedText: 'How can I help you?',
      sourceLang: 'de',
      targetLang: 'en',
      timestamp: Date.now(),
    }

    expect(turn.id).toBe('turn-1')
    expect(turn.side).toBe('staff')
    expect(turn.sourceLang).toBe('de')
    expect(turn.targetLang).toBe('en')
  })

  it('should support both staff and guest sides', () => {
    const staffTurn: ConversationTurn = {
      id: '1',
      side: 'staff',
      originalText: 'Hallo',
      translatedText: 'Hello',
      sourceLang: 'de',
      targetLang: 'en',
      timestamp: 1000,
    }

    const guestTurn: ConversationTurn = {
      id: '2',
      side: 'guest',
      originalText: 'I need help',
      translatedText: 'Ich brauche Hilfe',
      sourceLang: 'en',
      targetLang: 'de',
      timestamp: 2000,
    }

    expect(staffTurn.side).toBe('staff')
    expect(guestTurn.side).toBe('guest')
    expect(guestTurn.timestamp).toBeGreaterThan(staffTurn.timestamp)
  })

  it('should maintain chronological order by timestamp', () => {
    const turns: ConversationTurn[] = [
      { id: '1', side: 'staff', originalText: 'A', translatedText: 'A', sourceLang: 'de', targetLang: 'en', timestamp: 100 },
      { id: '2', side: 'guest', originalText: 'B', translatedText: 'B', sourceLang: 'en', targetLang: 'de', timestamp: 200 },
      { id: '3', side: 'staff', originalText: 'C', translatedText: 'C', sourceLang: 'de', targetLang: 'en', timestamp: 300 },
    ]

    for (let i = 1; i < turns.length; i++) {
      expect(turns[i].timestamp).toBeGreaterThan(turns[i - 1].timestamp)
    }
  })
})
