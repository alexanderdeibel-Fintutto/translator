import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createTransports,
  getSessionUrlWithTransport,
  parseSessionUrl,
  probeLocalServer,
  discoverLocalServer,
} from '../connection-manager'
import type { TransportPair } from '../connection-manager'

// --- createTransports ---

describe('createTransports', () => {
  it('returns local-ws transports for local mode with URL', () => {
    const pair = createTransports({ mode: 'local', localServerUrl: 'ws://192.168.8.1:8765' })
    expect(pair.mode).toBe('local')
    expect(pair.broadcast.type).toBe('local-ws')
    expect(pair.presence.type).toBe('local-ws')
    expect(pair.serverUrl).toBe('ws://192.168.8.1:8765')
  })

  it('returns local-ws transports for hotspot mode with URL', () => {
    const pair = createTransports(
      { mode: 'hotspot', localServerUrl: 'ws://172.20.10.1:8765' },
      { ssid: 'GT-Test', password: '12345', serverUrl: 'ws://172.20.10.1:8765', gatewayIp: '172.20.10.1', port: 8765 },
    )
    expect(pair.mode).toBe('local')
    expect(pair.broadcast.type).toBe('local-ws')
    expect(pair.hotspotInfo?.ssid).toBe('GT-Test')
  })

  it('returns supabase transports for cloud mode', () => {
    const pair = createTransports({ mode: 'cloud' })
    expect(pair.mode).toBe('cloud')
    expect(pair.broadcast.type).toBe('supabase')
    expect(pair.presence.type).toBe('supabase')
  })

  it('falls back to cloud when local mode has no URL', () => {
    const pair = createTransports({ mode: 'local' })
    expect(pair.mode).toBe('cloud')
    expect(pair.broadcast.type).toBe('supabase')
  })
})

// --- getSessionUrlWithTransport ---

describe('getSessionUrlWithTransport', () => {
  it('generates cloud URL without ws param', () => {
    const transport: TransportPair = {
      broadcast: { type: 'supabase' } as TransportPair['broadcast'],
      presence: { type: 'supabase' } as TransportPair['presence'],
      mode: 'cloud',
    }
    const url = getSessionUrlWithTransport('ABC-123', transport)
    expect(url).toContain('/live/ABC-123')
    expect(url).not.toContain('ws=')
  })

  it('includes ws param for local mode', () => {
    const transport: TransportPair = {
      broadcast: { type: 'local-ws' } as TransportPair['broadcast'],
      presence: { type: 'local-ws' } as TransportPair['presence'],
      mode: 'local',
      serverUrl: 'ws://192.168.8.1:8765',
    }
    const url = getSessionUrlWithTransport('XYZ-789', transport)
    expect(url).toContain('/live/XYZ-789')
    expect(url).toContain('ws=')
    expect(url).toContain('192.168.8.1')
  })

  it('includes ble param for BLE mode', () => {
    const transport: TransportPair = {
      broadcast: { type: 'ble' } as TransportPair['broadcast'],
      presence: { type: 'ble' } as TransportPair['presence'],
      mode: 'ble',
    }
    const url = getSessionUrlWithTransport('BLE-001', transport)
    expect(url).toContain('/live/BLE-001')
    expect(url).toContain('ble=1')
  })
})

// --- parseSessionUrl ---

describe('parseSessionUrl', () => {
  it('extracts session code from URL', () => {
    const result = parseSessionUrl('https://translator.fintutto.cloud/live/ABC-123')
    expect(result.code).toBe('ABC-123')
    expect(result.localServerUrl).toBeUndefined()
  })

  it('extracts session code and ws server URL', () => {
    const result = parseSessionUrl(
      'https://translator.fintutto.cloud/live/XYZ-789?ws=ws%3A%2F%2F192.168.8.1%3A8765',
    )
    expect(result.code).toBe('XYZ-789')
    expect(result.localServerUrl).toBe('ws://192.168.8.1:8765')
  })

  it('handles invalid URLs gracefully', () => {
    const result = parseSessionUrl('not-a-url')
    expect(result.code).toBe('')
  })

  it('handles URLs without session code', () => {
    const result = parseSessionUrl('https://example.com/other')
    expect(result.code).toBe('')
  })
})

// --- probeLocalServer ---

describe('probeLocalServer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when server responds with 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    const result = await probeLocalServer('ws://192.168.8.1:8765', 500)
    expect(result).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      'http://192.168.8.1:8765/health',
      expect.objectContaining({ mode: 'cors' }),
    )
  })

  it('returns false when server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')))
    const result = await probeLocalServer('ws://10.0.0.1:8765', 500)
    expect(result).toBe(false)
  })

  it('returns false when server responds with non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await probeLocalServer('ws://192.168.1.1:8765', 500)
    expect(result).toBe(false)
  })

  it('converts wss:// to https:// for probe', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    await probeLocalServer('wss://secure.local:8765')
    expect(fetch).toHaveBeenCalledWith(
      'https://secure.local:8765/health',
      expect.anything(),
    )
  })
})

// --- discoverLocalServer ---

describe('discoverLocalServer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns first responding server URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('192.168.8.1')) {
        return Promise.resolve({ ok: true })
      }
      return Promise.reject(new Error('timeout'))
    }))

    const result = await discoverLocalServer(8765)
    expect(result).toBe('ws://192.168.8.1:8765')
  })

  it('returns null when no server responds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    const result = await discoverLocalServer(8765)
    expect(result).toBeNull()
  })
})
