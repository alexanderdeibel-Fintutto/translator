// @vitest-environment jsdom
// Tests for nice-to-have feature modules

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Apple STT ──────────────────────────────────────────────────────
describe('stt-apple', () => {
  let mod: typeof import('../stt-apple')

  beforeEach(async () => {
    mod = await import('../stt-apple')
  })

  it('should report unavailable', () => {
    expect(mod.isAppleSttAvailable()).toBe(false)
  })

  it('should throw on start', async () => {
    await expect(mod.startAppleStt({ language: 'en', continuous: true, interimResults: true }))
      .rejects.toThrow('Apple SpeechAnalyzer not yet available')
  })

  it('should return capabilities with reason', () => {
    const caps = mod.getAppleSttCapabilities()
    expect(caps.available).toBe(false)
    expect(caps.languages).toEqual([])
    expect(caps.reason).toContain('iOS 26')
  })

  it('stopAppleStt should be no-op', () => {
    expect(() => mod.stopAppleStt()).not.toThrow()
  })
})

// ── Whisper STT ────────────────────────────────────────────────────
describe('stt-whisper', () => {
  let mod: typeof import('../stt-whisper')

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn())
    mod = await import('../stt-whisper')
  })

  it('should report not configured without API key', () => {
    expect(mod.isWhisperConfigured()).toBe(false)
  })

  it('should estimate cost correctly', () => {
    // 60 seconds = 1 minute = $0.006
    expect(mod.estimateWhisperCost(60)).toBeCloseTo(0.006)
    // 300 seconds = 5 minutes = $0.03
    expect(mod.estimateWhisperCost(300)).toBeCloseTo(0.03)
    // 0 seconds = $0
    expect(mod.estimateWhisperCost(0)).toBe(0)
  })

  it('should throw without API key', async () => {
    const blob = new Blob(['audio'], { type: 'audio/webm' })
    await expect(mod.transcribeWithWhisper(blob)).rejects.toThrow('VITE_OPENAI_API_KEY')
  })
})

// ── BLE Audio ──────────────────────────────────────────────────────
describe('ble-audio', () => {
  let mod: typeof import('../ble-audio')

  beforeEach(async () => {
    mod = await import('../ble-audio')
  })

  it('should detect BLE support', () => {
    // jsdom has no bluetooth API
    expect(mod.isBleAudioSupported()).toBe(false)
  })

  it('should throw when BLE not available', async () => {
    const buffer = new ArrayBuffer(100)
    await expect(mod.startBleAudioBroadcast(buffer)).rejects.toThrow('Web Bluetooth')
  })

  it('should estimate transfer time', () => {
    // 100KB should take ~1 second at ~100KB/s
    const time = mod.estimateBleTransferTime(100 * 1024)
    expect(time).toBeGreaterThan(500)
    expect(time).toBeLessThan(2000)
  })

  it('should handle small files', () => {
    expect(mod.estimateBleTransferTime(0)).toBe(0)
  })
})

// ── QR Generator ───────────────────────────────────────────────────
describe('qr-generator', () => {
  let mod: typeof import('../qr-generator')

  beforeEach(async () => {
    mod = await import('../qr-generator')
  })

  it('should generate SVG string', () => {
    const svg = mod.generateQrSvg('https://example.com')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  it('should generate data URL', () => {
    const dataUrl = mod.generateQrDataUrl('https://example.com')
    expect(dataUrl).toContain('data:image/svg+xml')
  })

  it('should generate blob', () => {
    const blob = mod.generateQrBlob('https://example.com')
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/svg+xml')
  })

  it('should batch generate QR codes', () => {
    const items = [
      { id: '1', url: 'https://a.com', label: 'A' },
      { id: '2', url: 'https://b.com', label: 'B' },
    ]
    const results = mod.batchGenerateQr(items)
    expect(results).toHaveLength(2)
    expect(results[0].id).toBe('1')
    expect(results[0].svg).toContain('<svg')
    expect(results[1].dataUrl).toContain('data:image')
  })

  it('should respect custom options', () => {
    const svg = mod.generateQrSvg('test', { size: 512, darkColor: '#ff0000' })
    expect(svg).toContain('512')
    expect(svg).toContain('#ff0000')
  })
})

// ── A/B Testing ────────────────────────────────────────────────────
describe('ab-testing', () => {
  let mod: typeof import('../fintutto-world/ab-testing')

  beforeEach(async () => {
    mod = await import('../fintutto-world/ab-testing')
  })

  describe('assignVariant', () => {
    it('should return consistent assignment', () => {
      const v1 = mod.assignVariant('test-1', 'visitor-1', [50, 50])
      const v2 = mod.assignVariant('test-1', 'visitor-1', [50, 50])
      expect(v1).toBe(v2) // same input = same output
    })

    it('should return valid variant index', () => {
      for (let i = 0; i < 100; i++) {
        const v = mod.assignVariant('test', `visitor-${i}`, [50, 50])
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    })

    it('should distribute roughly evenly for 50/50 split', () => {
      const counts = [0, 0]
      for (let i = 0; i < 1000; i++) {
        const v = mod.assignVariant('test-ab', `v-${i}`, [50, 50])
        counts[v]++
      }
      // Each should get roughly 400-600 out of 1000
      expect(counts[0]).toBeGreaterThan(300)
      expect(counts[1]).toBeGreaterThan(300)
    })

    it('should handle 3-way split', () => {
      const v = mod.assignVariant('test-3', 'visitor-1', [33, 33, 34])
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(2)
    })

    it('should handle 100/0 split', () => {
      for (let i = 0; i < 50; i++) {
        const v = mod.assignVariant('all-control', `v-${i}`, [100, 0])
        expect(v).toBe(0)
      }
    })
  })

  describe('calculateSignificance', () => {
    it('should return 0 for empty data', () => {
      expect(mod.calculateSignificance(0, 0, 0, 0)).toBe(0)
    })

    it('should return 0 for identical rates', () => {
      const sig = mod.calculateSignificance(50, 100, 50, 100)
      expect(sig).toBeLessThan(0.1)
    })

    it('should return high confidence for large differences', () => {
      const sig = mod.calculateSignificance(10, 1000, 100, 1000)
      expect(sig).toBeGreaterThan(0.9)
    })

    it('should be bounded between 0 and 1', () => {
      const sig = mod.calculateSignificance(5, 10, 8, 10)
      expect(sig).toBeGreaterThanOrEqual(0)
      expect(sig).toBeLessThanOrEqual(1)
    })
  })

  describe('getTestContentLayer', () => {
    it('should return correct content layer', () => {
      const test: import('../fintutto-world/ab-testing').AbTest = {
        id: 't1',
        name: 'Test',
        description: 'desc',
        variants: [
          { id: 'v1', name: 'Brief', contentLayer: 'brief' },
          { id: 'v2', name: 'Detailed', contentLayer: 'detailed' },
        ],
        trafficSplit: [50, 50],
        status: 'running',
        startDate: '2026-01-01',
        metric: 'engagement_time',
      }
      expect(mod.getTestContentLayer(test, 0)).toBe('brief')
      expect(mod.getTestContentLayer(test, 1)).toBe('detailed')
    })

    it('should default to standard for invalid index', () => {
      const test: import('../fintutto-world/ab-testing').AbTest = {
        id: 't1', name: 'T', description: '', variants: [],
        trafficSplit: [], status: 'draft', startDate: '', metric: 'rating',
      }
      expect(mod.getTestContentLayer(test, 99)).toBe('standard')
    })
  })
})

// ── Offline Admin ──────────────────────────────────────────────────
describe('offline-admin', () => {
  let mod: typeof import('../offline/offline-admin')

  beforeEach(async () => {
    localStorage.clear()
    mod = await import('../offline/offline-admin')
  })

  it('should start with empty queue', () => {
    expect(mod.getAdminQueue()).toEqual([])
    expect(mod.getPendingCount()).toBe(0)
  })

  it('should queue operations', () => {
    mod.queueAdminOp({ table: 'fw_content_items', operation: 'update', data: { name: 'test' }, recordId: 'r1' })
    expect(mod.getPendingCount()).toBe(1)

    const queue = mod.getAdminQueue()
    expect(queue[0].table).toBe('fw_content_items')
    expect(queue[0].operation).toBe('update')
    expect(queue[0].retries).toBe(0)
    expect(queue[0].id).toBeTruthy()
    expect(queue[0].timestamp).toBeGreaterThan(0)
  })

  it('should queue multiple operations', () => {
    mod.queueAdminOp({ table: 'a', operation: 'insert', data: {} })
    mod.queueAdminOp({ table: 'b', operation: 'delete', data: {}, recordId: 'x' })
    expect(mod.getPendingCount()).toBe(2)
  })

  it('should remove from queue', () => {
    mod.queueAdminOp({ table: 'a', operation: 'insert', data: {} })
    const id = mod.getAdminQueue()[0].id
    mod.removeFromQueue(id)
    expect(mod.getPendingCount()).toBe(0)
  })

  it('should clear queue', () => {
    mod.queueAdminOp({ table: 'a', operation: 'insert', data: {} })
    mod.queueAdminOp({ table: 'b', operation: 'insert', data: {} })
    mod.clearAdminQueue()
    expect(mod.getPendingCount()).toBe(0)
  })

  it('should sync queue with executor', async () => {
    mod.queueAdminOp({ table: 'a', operation: 'insert', data: {} })
    mod.queueAdminOp({ table: 'b', operation: 'insert', data: {} })

    const executor = vi.fn().mockResolvedValue(true)
    const result = await mod.syncAdminQueue(executor)

    expect(result.synced).toBe(2)
    expect(result.failed).toBe(0)
    expect(executor).toHaveBeenCalledTimes(2)
    expect(mod.getPendingCount()).toBe(0)
  })

  it('should handle failed sync', async () => {
    mod.queueAdminOp({ table: 'a', operation: 'insert', data: {} })

    const executor = vi.fn().mockResolvedValue(false)
    const result = await mod.syncAdminQueue(executor)

    // After 1 failure, retries increments but not yet removed (< 3 retries)
    expect(result.synced).toBe(0)
  })

  it('should handle corrupt localStorage', () => {
    localStorage.setItem('fw_admin_offline_queue', 'not-json')
    expect(mod.getAdminQueue()).toEqual([])
  })
})

// ── Data Export ─────────────────────────────────────────────────────
describe('data-export', () => {
  it('should export required functions', async () => {
    const mod = await import('../fintutto-world/data-export')
    expect(typeof mod.exportVisitorData).toBe('function')
    expect(typeof mod.downloadExportedData).toBe('function')
    expect(typeof mod.requestDataDeletion).toBe('function')
  })

  it('downloadExportedData should create and click link', async () => {
    const mod = await import('../fintutto-world/data-export')
    const mockClick = vi.fn()
    const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const data = {
      profile: null, visits: [], interactions: [], dialogs: [],
      favorites: [], notifications: [], exportedAt: '2026-01-01',
    }
    mod.downloadExportedData(data)
    expect(mockClick).toHaveBeenCalled()

    mockCreateElement.mockRestore()
  })
})

// ── Partner Portal ─────────────────────────────────────────────────
describe('partner-portal', () => {
  // Basic structural tests
  it('should export required functions', async () => {
    const mod = await import('../fintutto-world/partner-portal')
    expect(typeof mod.getPartnerDashboard).toBe('function')
    expect(typeof mod.upsertOffer).toBe('function')
    expect(typeof mod.getPartnerAnalytics).toBe('function')
  })
})
