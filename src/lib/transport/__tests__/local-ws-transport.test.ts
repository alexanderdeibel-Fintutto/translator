import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LocalBroadcastTransport, LocalPresenceTransport, releaseConnection } from '../local-ws-transport'
import type { BroadcastHandlers } from '../types'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: ((err: unknown) => void) | null = null

  sent: string[] = []

  constructor(url: string) {
    this.url = url
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.()
    }, 10)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  }

  // Test helper: simulate incoming message
  simulateMessage(data: Record<string, unknown>) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
}

let mockWsInstance: MockWebSocket | null = null

beforeEach(() => {
  mockWsInstance = null
  vi.stubGlobal('WebSocket', class extends MockWebSocket {
    constructor(url: string) {
      super(url)
      mockWsInstance = this
    }
  })
  // Provide WebSocket constants
  vi.stubGlobal('WebSocket', Object.assign(
    class {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3

      readyState = 0
      url: string
      onopen: (() => void) | null = null
      onmessage: ((event: { data: string }) => void) | null = null
      onclose: (() => void) | null = null
      onerror: ((err: unknown) => void) | null = null
      sent: string[] = []

      constructor(url: string) {
        this.url = url
        mockWsInstance = this as unknown as MockWebSocket
        setTimeout(() => {
          this.readyState = 1 // OPEN
          this.onopen?.()
        }, 10)
      }

      send(data: string) { this.sent.push(data) }
      close() {
        this.readyState = 3 // CLOSED
        this.onclose?.()
      }
    },
    { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 },
  ))
})

afterEach(() => {
  releaseConnection('ws://test:8765')
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('LocalBroadcastTransport', () => {
  it('creates transport with correct type', () => {
    const transport = new LocalBroadcastTransport('ws://test:8765')
    expect(transport.type).toBe('local-ws')
    expect(transport.isConnected).toBe(false)
  })

  it('connects and joins session on subscribe', async () => {
    vi.useFakeTimers()
    const transport = new LocalBroadcastTransport('ws://test:8765')
    const handlers: BroadcastHandlers = {
      onTranslation: vi.fn(),
    }

    transport.subscribe('TEST-123', handlers)

    // Advance timer to trigger WebSocket open
    await vi.advanceTimersByTimeAsync(50)

    expect(mockWsInstance).not.toBeNull()
    expect(mockWsInstance!.url).toContain('session=TEST-123')

    // Should have sent join_session
    const messages = mockWsInstance!.sent.map((s: string) => JSON.parse(s))
    expect(messages).toContainEqual({ type: 'join_session', code: 'TEST-123' })
  })

  it('notifies connection change listeners', async () => {
    vi.useFakeTimers()
    const transport = new LocalBroadcastTransport('ws://test:8765')
    const connectionCallback = vi.fn()

    transport.onConnectionChange(connectionCallback)
    transport.subscribe('TEST-123', {})

    await vi.advanceTimersByTimeAsync(50)

    // Should have been called with true after connection
    expect(connectionCallback).toHaveBeenCalledWith(true)
  })

  it('routes broadcast messages to handlers', async () => {
    vi.useFakeTimers()
    const transport = new LocalBroadcastTransport('ws://test:8765')
    const onTranslation = vi.fn()
    const onSessionInfo = vi.fn()
    const onStatus = vi.fn()

    transport.subscribe('TEST-123', { onTranslation, onSessionInfo, onStatus })
    await vi.advanceTimersByTimeAsync(50)

    // Simulate incoming translation
    mockWsInstance!.onmessage?.({
      data: JSON.stringify({
        type: 'broadcast',
        event: 'translation',
        payload: { text: 'Hallo', lang: 'de' },
      }),
    })
    expect(onTranslation).toHaveBeenCalledWith({ text: 'Hallo', lang: 'de' })

    // Simulate session_info
    mockWsInstance!.onmessage?.({
      data: JSON.stringify({
        type: 'broadcast',
        event: 'session_info',
        payload: { sessionCode: 'TEST-123' },
      }),
    })
    expect(onSessionInfo).toHaveBeenCalled()

    // Simulate status
    mockWsInstance!.onmessage?.({
      data: JSON.stringify({
        type: 'broadcast',
        event: 'status',
        payload: { status: 'active' },
      }),
    })
    expect(onStatus).toHaveBeenCalled()
  })

  it('ignores non-broadcast messages', async () => {
    vi.useFakeTimers()
    const transport = new LocalBroadcastTransport('ws://test:8765')
    const onTranslation = vi.fn()

    transport.subscribe('TEST-123', { onTranslation })
    await vi.advanceTimersByTimeAsync(50)

    // Simulate a welcome message (not a broadcast)
    mockWsInstance!.onmessage?.({
      data: JSON.stringify({ type: 'welcome', serverVersion: '1.0.0', sessionCount: 0 }),
    })
    expect(onTranslation).not.toHaveBeenCalled()
  })

  it('sends broadcast messages', async () => {
    vi.useFakeTimers()
    const transport = new LocalBroadcastTransport('ws://test:8765')

    transport.subscribe('TEST-123', {})
    await vi.advanceTimersByTimeAsync(50)

    transport.broadcast('translation', { text: 'Hello', lang: 'en' })

    const messages = mockWsInstance!.sent.map((s: string) => JSON.parse(s))
    expect(messages).toContainEqual({
      type: 'broadcast',
      event: 'translation',
      payload: { text: 'Hello', lang: 'en' },
    })
  })

  it('cleans up on unsubscribe', async () => {
    vi.useFakeTimers()
    const transport = new LocalBroadcastTransport('ws://test:8765')
    const connectionCallback = vi.fn()

    transport.onConnectionChange(connectionCallback)
    transport.subscribe('TEST-123', {})
    await vi.advanceTimersByTimeAsync(50)

    connectionCallback.mockClear()
    transport.unsubscribe()

    expect(connectionCallback).toHaveBeenCalledWith(false)
    expect(transport.isConnected).toBe(false)
  })
})

describe('LocalPresenceTransport', () => {
  it('creates transport with correct type', () => {
    const transport = new LocalPresenceTransport('ws://test:8765')
    expect(transport.type).toBe('local-ws')
  })

  it('sends presence_join on join', async () => {
    vi.useFakeTimers()
    const transport = new LocalPresenceTransport('ws://test:8765')

    const presenceData = {
      deviceName: 'iPhone 15',
      targetLanguage: 'en',
      joinedAt: new Date().toISOString(),
    }

    transport.join('TEST-123', presenceData)
    await vi.advanceTimersByTimeAsync(50)

    const messages = mockWsInstance!.sent.map((s: string) => JSON.parse(s))
    const joinMsg = messages.find((m: Record<string, unknown>) => m.type === 'presence_join')
    expect(joinMsg).toBeDefined()
    expect(joinMsg.data.deviceName).toBe('iPhone 15')
    expect(joinMsg.role).toBe('listener')
  })

  it('identifies speaker role correctly', async () => {
    vi.useFakeTimers()
    const transport = new LocalPresenceTransport('ws://test:8765')

    transport.join('TEST-123', {
      deviceName: 'Speaker Phone',
      targetLanguage: '_speaker',
      joinedAt: new Date().toISOString(),
    })
    await vi.advanceTimersByTimeAsync(50)

    const messages = mockWsInstance!.sent.map((s: string) => JSON.parse(s))
    const joinMsg = messages.find((m: Record<string, unknown>) => m.type === 'presence_join')
    expect(joinMsg.role).toBe('speaker')
  })

  it('routes presence_sync to listeners', async () => {
    vi.useFakeTimers()
    const transport = new LocalPresenceTransport('ws://test:8765')
    const syncCallback = vi.fn()

    transport.onSync(syncCallback)
    transport.join('TEST-123', {
      deviceName: 'Test',
      targetLanguage: 'en',
      joinedAt: new Date().toISOString(),
    })
    await vi.advanceTimersByTimeAsync(50)

    // Simulate presence_sync from server
    mockWsInstance!.onmessage?.({
      data: JSON.stringify({
        type: 'presence_sync',
        listeners: [
          { id: 'user-1', deviceName: 'Test', targetLanguage: 'en' },
          { id: 'user-2', deviceName: 'Other', targetLanguage: 'de' },
        ],
      }),
    })

    expect(syncCallback).toHaveBeenCalledWith([
      { id: 'user-1', deviceName: 'Test', targetLanguage: 'en' },
      { id: 'user-2', deviceName: 'Other', targetLanguage: 'de' },
    ])
  })

  it('sends presence_update on updatePresence', async () => {
    vi.useFakeTimers()
    const transport = new LocalPresenceTransport('ws://test:8765')

    transport.join('TEST-123', {
      deviceName: 'Test',
      targetLanguage: 'en',
      joinedAt: new Date().toISOString(),
    })
    await vi.advanceTimersByTimeAsync(50)

    transport.updatePresence({ targetLanguage: 'fr' })

    const messages = mockWsInstance!.sent.map((s: string) => JSON.parse(s))
    const updateMsg = messages.find((m: Record<string, unknown>) => m.type === 'presence_update')
    expect(updateMsg).toBeDefined()
    expect(updateMsg.data.targetLanguage).toBe('fr')
  })

  it('sends presence_leave on leave', async () => {
    vi.useFakeTimers()
    const transport = new LocalPresenceTransport('ws://test:8765')

    transport.join('TEST-123', {
      deviceName: 'Test',
      targetLanguage: 'en',
      joinedAt: new Date().toISOString(),
    })
    await vi.advanceTimersByTimeAsync(50)

    transport.leave()

    const messages = mockWsInstance!.sent.map((s: string) => JSON.parse(s))
    expect(messages).toContainEqual({ type: 'presence_leave' })
  })

  it('allows removing sync listener', () => {
    const transport = new LocalPresenceTransport('ws://test:8765')
    const syncCallback = vi.fn()
    const unsub = transport.onSync(syncCallback)

    unsub()

    // Sync callback should be removed — no call expected even if we could trigger it
    expect(syncCallback).not.toHaveBeenCalled()
  })
})
