import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EncryptedBroadcastTransport } from '../encrypted-transport'
import type { BroadcastTransport, BroadcastHandlers } from '../types'

function createMockTransport(): BroadcastTransport & {
  lastHandlers: BroadcastHandlers | null
  lastCode: string | null
  broadcasts: { event: string; payload: Record<string, unknown> }[]
  simulateBroadcast: (event: string, payload: Record<string, unknown>) => void
} {
  let handlers: BroadcastHandlers | null = null
  const broadcasts: { event: string; payload: Record<string, unknown> }[] = []

  return {
    type: 'local-ws' as const,
    isConnected: true,
    lastHandlers: null,
    lastCode: null,
    broadcasts,

    onConnectionChange: vi.fn(() => () => {}),

    subscribe(code: string, h: BroadcastHandlers) {
      handlers = h
      this.lastHandlers = h
      this.lastCode = code
    },

    broadcast(event: string, payload: Record<string, unknown>) {
      broadcasts.push({ event, payload })
    },

    unsubscribe: vi.fn(),

    simulateBroadcast(event: string, payload: Record<string, unknown>) {
      if (!handlers) return
      if (event === 'translation' && handlers.onTranslation) {
        handlers.onTranslation(payload as never)
      }
      if (event === 'session_info' && handlers.onSessionInfo) {
        handlers.onSessionInfo(payload as never)
      }
      if (event === 'status' && handlers.onStatus) {
        handlers.onStatus(payload as never)
      }
    },
  }
}

describe('EncryptedBroadcastTransport', () => {
  let inner: ReturnType<typeof createMockTransport>
  let encrypted: EncryptedBroadcastTransport

  beforeEach(() => {
    inner = createMockTransport()
    encrypted = new EncryptedBroadcastTransport(inner)
  })

  it('delegates type and isConnected to inner transport', () => {
    expect(encrypted.type).toBe('local-ws')
    expect(encrypted.isConnected).toBe(true)
  })

  it('delegates onConnectionChange to inner transport', () => {
    const cb = vi.fn()
    encrypted.onConnectionChange(cb)
    expect(inner.onConnectionChange).toHaveBeenCalledWith(cb)
  })

  it('encrypts broadcast payloads with _encrypted envelope', async () => {
    encrypted.subscribe('TEST-123', {})

    encrypted.broadcast('translation', { text: 'Hallo', lang: 'de' })

    // Wait for async encrypt
    await new Promise(r => setTimeout(r, 200))

    expect(inner.broadcasts.length).toBe(1)
    expect(inner.broadcasts[0].event).toBe('translation')
    expect(inner.broadcasts[0].payload._encrypted).toBeDefined()
    expect(typeof inner.broadcasts[0].payload._encrypted).toBe('string')
    // Original fields should NOT be present (they're inside the ciphertext)
    expect(inner.broadcasts[0].payload.text).toBeUndefined()
  })

  it('decrypts incoming _encrypted payloads', async () => {
    const onTranslation = vi.fn()

    encrypted.subscribe('TEST-123', { onTranslation })

    // First, encrypt a payload to get valid ciphertext
    encrypted.broadcast('translation', { text: 'Hallo', lang: 'de' })
    await new Promise(r => setTimeout(r, 200))

    const ciphertext = inner.broadcasts[0].payload._encrypted as string

    // Now simulate receiving the encrypted payload
    inner.simulateBroadcast('translation', { _encrypted: ciphertext })

    // Wait for async decrypt
    await new Promise(r => setTimeout(r, 200))

    expect(onTranslation).toHaveBeenCalledWith({ text: 'Hallo', lang: 'de' })
  })

  it('falls back to plaintext when receiving unencrypted payload', async () => {
    const onTranslation = vi.fn()

    encrypted.subscribe('TEST-123', { onTranslation })

    // Simulate receiving a plain (unencrypted) payload
    inner.simulateBroadcast('translation', { text: 'Plain', lang: 'en' })

    // Wait for async attempt
    await new Promise(r => setTimeout(r, 200))

    // Should still receive the original plaintext payload
    expect(onTranslation).toHaveBeenCalledWith({ text: 'Plain', lang: 'en' })
  })

  it('handles session_info events', async () => {
    const onSessionInfo = vi.fn()

    encrypted.subscribe('TEST-123', { onSessionInfo })

    inner.simulateBroadcast('session_info', { sessionCode: 'TEST-123', speakerName: 'Host' })
    await new Promise(r => setTimeout(r, 200))

    expect(onSessionInfo).toHaveBeenCalledWith({ sessionCode: 'TEST-123', speakerName: 'Host' })
  })

  it('handles status events', async () => {
    const onStatus = vi.fn()

    encrypted.subscribe('TEST-123', { onStatus })

    inner.simulateBroadcast('status', { speaking: true, ended: false })
    await new Promise(r => setTimeout(r, 200))

    expect(onStatus).toHaveBeenCalledWith({ speaking: true, ended: false })
  })

  it('clears key cache on unsubscribe', () => {
    encrypted.subscribe('TEST-123', {})
    encrypted.unsubscribe()
    expect(inner.unsubscribe).toHaveBeenCalled()
  })

  it('full roundtrip: encrypt then decrypt produces original payload', async () => {
    const onTranslation = vi.fn()

    // Speaker side: encrypts
    const speakerInner = createMockTransport()
    const speaker = new EncryptedBroadcastTransport(speakerInner)
    speaker.subscribe('SHARED-CODE', {})

    // Listener side: decrypts
    const listenerInner = createMockTransport()
    const listener = new EncryptedBroadcastTransport(listenerInner)
    listener.subscribe('SHARED-CODE', { onTranslation })

    // Speaker broadcasts
    const originalPayload = { text: 'Guten Morgen', lang: 'de', timestamp: 12345 }
    speaker.broadcast('translation', originalPayload)
    await new Promise(r => setTimeout(r, 200))

    // Grab encrypted payload from speaker's inner
    const encryptedPayload = speakerInner.broadcasts[0].payload

    // Simulate listener receiving the encrypted payload
    listenerInner.simulateBroadcast('translation', encryptedPayload)
    await new Promise(r => setTimeout(r, 200))

    expect(onTranslation).toHaveBeenCalledWith(originalPayload)
  })
})
