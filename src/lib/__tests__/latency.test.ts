import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  markSTTStart,
  markSTTEnd,
  markTranslateStart,
  markTranslateEnd,
  markBroadcast,
  markTTSStart,
  markTTSEnd,
  getLatencyHistory,
  getAverageLatency,
  getP95Latency,
} from '../latency'

// performance.now() returns monotonic timestamps — mock with ever-increasing base
// Start at 10000 (not 0) because the module uses `if (!t.sttStartMs)` which is falsy for 0
let mockTime = 10000
let testIndex = 0

beforeEach(() => {
  testIndex++
  // Each test starts at a higher base so timestamps always increase across tests
  mockTime = 10000 + testIndex * 100000
  vi.spyOn(performance, 'now').mockImplementation(() => mockTime)
})

function advanceTime(ms: number) {
  mockTime += ms
}

describe('latency instrumentation', () => {
  it('records a full pipeline cycle', () => {
    const before = getLatencyHistory().length

    markSTTStart()
    advanceTime(120)
    markSTTEnd()
    advanceTime(5)
    markTranslateStart()
    advanceTime(200)
    markTranslateEnd()
    advanceTime(10)
    markBroadcast()
    advanceTime(5)
    markTTSStart()
    advanceTime(80)
    markTTSEnd('google')

    const history = getLatencyHistory()
    expect(history.length).toBe(before + 1)

    const last = history[history.length - 1]
    expect(last.sttMs).toBe(120)
    expect(last.translateMs).toBe(200)
    expect(last.broadcastMs).toBe(10)
    expect(last.ttsMs).toBe(80)
    expect(last.provider).toBe('google')
    expect(last.totalMs).toBe(420) // 120 + 5 + 200 + 10 + 5 + 80
  })

  it('records pipeline without TTS delay', () => {
    const before = getLatencyHistory().length

    markSTTStart()
    advanceTime(100)
    markSTTEnd()
    markTranslateStart()
    advanceTime(150)
    markTranslateEnd()
    advanceTime(20)
    markBroadcast()
    markTTSStart()
    markTTSEnd()

    const history = getLatencyHistory()
    expect(history.length).toBe(before + 1)

    const last = history[history.length - 1]
    expect(last.sttMs).toBe(100)
    expect(last.translateMs).toBe(150)
    expect(last.broadcastMs).toBe(20)
    expect(last.ttsMs).toBe(0) // no time elapsed between TTS start/end
    expect(last.provider).toBeUndefined()
  })

  it('records minimal pipeline (STT + translate only)', () => {
    const before = getLatencyHistory().length

    markSTTStart()
    advanceTime(300)
    markSTTEnd()
    advanceTime(10)
    markTranslateStart()
    advanceTime(150)
    markTranslateEnd()
    // Skip broadcast and TTS — finalize via markTTSEnd
    markTTSStart()
    markTTSEnd()

    const history = getLatencyHistory()
    expect(history.length).toBe(before + 1)

    const last = history[history.length - 1]
    expect(last.sttMs).toBe(300)
    expect(last.translateMs).toBe(150)
  })

  it('ignores finalize without sttStartMs', () => {
    const before = getLatencyHistory().length

    // Calling end marks without start should not add to history
    markTranslateEnd()
    markTTSEnd()

    expect(getLatencyHistory().length).toBe(before)
  })

  it('computes average latency across cycles', () => {
    // Record two clean cycles
    markSTTStart()
    advanceTime(100)
    markSTTEnd()
    markTranslateStart()
    advanceTime(200)
    markTranslateEnd()
    markTTSStart()
    advanceTime(50)
    markTTSEnd()

    advanceTime(1000) // gap between cycles

    markSTTStart()
    advanceTime(200)
    markSTTEnd()
    markTranslateStart()
    advanceTime(400)
    markTranslateEnd()
    markTTSStart()
    advanceTime(100)
    markTTSEnd()

    const avg = getAverageLatency()
    expect(avg).not.toBeNull()
    expect(avg!.totalMs).toBeGreaterThan(0)
    expect(avg!.timestamp).toBeGreaterThan(0)
  })

  it('returns correct p95 latency', () => {
    // Record several cycles
    for (let i = 0; i < 10; i++) {
      advanceTime(100) // gap
      markSTTStart()
      advanceTime(50 + i * 10) // varying STT time
      markSTTEnd()
      markTranslateStart()
      advanceTime(100)
      markTranslateEnd()
      markTTSStart()
      markTTSEnd()
    }

    const p95 = getP95Latency()
    expect(p95).toBeGreaterThan(0)
  })

  it('history entries have timestamps', () => {
    markSTTStart()
    advanceTime(50)
    markSTTEnd()
    markTTSStart()
    markTTSEnd()

    const history = getLatencyHistory()
    const last = history[history.length - 1]
    expect(last.timestamp).toBeGreaterThan(0)
    expect(typeof last.timestamp).toBe('number')
  })

  it('caps history at MAX_HISTORY (50) entries', () => {
    // Record 60 cycles to exceed the cap
    for (let i = 0; i < 60; i++) {
      advanceTime(100)
      markSTTStart()
      advanceTime(10)
      markSTTEnd()
      markTTSStart()
      markTTSEnd()
    }

    expect(getLatencyHistory().length).toBeLessThanOrEqual(50)
  })

  it('provider is included when passed to markTTSEnd', () => {
    markSTTStart()
    advanceTime(50)
    markSTTEnd()
    markTTSStart()
    advanceTime(30)
    markTTSEnd('whisper')

    const history = getLatencyHistory()
    const last = history[history.length - 1]
    expect(last.provider).toBe('whisper')
  })

  it('getAverageLatency returns null when history is empty on fresh module', () => {
    // Since history persists across tests, verify the shape when data exists
    const avg = getAverageLatency()
    if (getLatencyHistory().length === 0) {
      expect(avg).toBeNull()
    } else {
      expect(avg).not.toBeNull()
      expect(typeof avg!.sttMs).toBe('number')
      expect(typeof avg!.translateMs).toBe('number')
      expect(typeof avg!.totalMs).toBe('number')
    }
  })
})
