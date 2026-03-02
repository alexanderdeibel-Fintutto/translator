// Lightweight pipeline latency instrumentation
// Measures: STT → Translation → Broadcast → TTS end-to-end

export interface PipelineTimings {
  sttStartMs: number
  sttEndMs: number
  translateStartMs: number
  translateEndMs: number
  broadcastMs: number
  ttsStartMs: number
  ttsEndMs: number
}

export interface LatencyReport {
  sttMs: number
  translateMs: number
  broadcastMs: number
  ttsMs: number
  totalMs: number
  provider?: string
  timestamp: number
}

const MAX_HISTORY = 50
const history: LatencyReport[] = []

let current: Partial<PipelineTimings> = {}

export function markSTTStart() {
  current = { sttStartMs: performance.now() }
}

export function markSTTEnd() {
  current.sttEndMs = performance.now()
}

export function markTranslateStart() {
  current.translateStartMs = performance.now()
}

export function markTranslateEnd() {
  current.translateEndMs = performance.now()
}

export function markBroadcast() {
  current.broadcastMs = performance.now()
}

export function markTTSStart() {
  current.ttsStartMs = performance.now()
}

export function markTTSEnd(provider?: string) {
  current.ttsEndMs = performance.now()
  finalize(provider)
}

function finalize(provider?: string) {
  const t = current
  if (!t.sttStartMs) return

  const report: LatencyReport = {
    sttMs: (t.sttEndMs || t.translateStartMs || 0) - t.sttStartMs,
    translateMs: t.translateStartMs && t.translateEndMs ? t.translateEndMs - t.translateStartMs : 0,
    broadcastMs: t.broadcastMs && t.translateEndMs ? t.broadcastMs - t.translateEndMs : 0,
    ttsMs: t.ttsStartMs && t.ttsEndMs ? t.ttsEndMs - t.ttsStartMs : 0,
    totalMs: (t.ttsEndMs || t.broadcastMs || t.translateEndMs || t.sttEndMs || performance.now()) - t.sttStartMs,
    provider,
    timestamp: Date.now(),
  }

  history.push(report)
  if (history.length > MAX_HISTORY) history.shift()

  if (import.meta.env.DEV) {
    console.log(
      `[Latency] STT: ${report.sttMs.toFixed(0)}ms | Translate: ${report.translateMs.toFixed(0)}ms | Broadcast: ${report.broadcastMs.toFixed(0)}ms | TTS: ${report.ttsMs.toFixed(0)}ms | Total: ${report.totalMs.toFixed(0)}ms${provider ? ` (${provider})` : ''}`
    )
  }

  current = {}
}

export function getLatencyHistory(): readonly LatencyReport[] {
  return history
}

export function getAverageLatency(): LatencyReport | null {
  if (history.length === 0) return null
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  return {
    sttMs: avg(history.map(r => r.sttMs)),
    translateMs: avg(history.map(r => r.translateMs)),
    broadcastMs: avg(history.map(r => r.broadcastMs)),
    ttsMs: avg(history.map(r => r.ttsMs)),
    totalMs: avg(history.map(r => r.totalMs)),
    timestamp: Date.now(),
  }
}

export function getP95Latency(): number {
  if (history.length === 0) return 0
  const sorted = [...history.map(r => r.totalMs)].sort((a, b) => a - b)
  const idx = Math.floor(sorted.length * 0.95)
  return sorted[Math.min(idx, sorted.length - 1)]
}
