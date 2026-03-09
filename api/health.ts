// Vercel Edge Function — Health Check Endpoint
// Used by uptime monitoring (e.g. UptimeRobot, Checkly, cron) to verify system status.
// Returns JSON with service reachability status.

export const config = { runtime: 'edge' }

interface ServiceStatus {
  status: 'ok' | 'degraded' | 'down'
  latencyMs?: number
  error?: string
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  services: {
    translate: ServiceStatus
    tts: ServiceStatus
    supabase: ServiceStatus
  }
}

async function checkService(url: string, init: RequestInit): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, { ...init, signal: controller.signal })
    clearTimeout(timeout)
    const latencyMs = Date.now() - start
    if (res.ok || res.status === 400 || res.status === 405) {
      // 400/405 = endpoint exists but bad request — still "up"
      return { status: 'ok', latencyMs }
    }
    return { status: 'degraded', latencyMs, error: `HTTP ${res.status}` }
  } catch (err) {
    return { status: 'down', latencyMs: Date.now() - start, error: String(err) }
  }
}

export default async function handler(req: Request) {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''

  const [translate, tts, supabase] = await Promise.all([
    checkService(`https://${req.headers.get('host')}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test', source: 'en', target: 'de' }),
    }),
    checkService(`https://${req.headers.get('host')}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test', languageCode: 'en-US' }),
    }),
    supabaseUrl
      ? checkService(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            apikey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
          },
        })
      : { status: 'down' as const, error: 'SUPABASE_URL not configured' },
  ])

  const services = { translate, tts, supabase }
  const allStatuses = Object.values(services).map(s => s.status)
  const overallStatus: HealthResponse['status'] = allStatuses.every(s => s === 'ok')
    ? 'ok'
    : allStatuses.some(s => s === 'down')
      ? 'down'
      : 'degraded'

  const body: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services,
  }

  const httpStatus = overallStatus === 'ok' ? 200 : overallStatus === 'degraded' ? 207 : 503

  return new Response(JSON.stringify(body, null, 2), {
    status: httpStatus,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store',
    },
  })
}

// --- CORS (same pattern as other endpoints) ---
const ALLOWED_ORIGINS = new Set([
  'https://guidetranslator.com',
  'https://www.guidetranslator.com',
  'https://app.guidetranslator.com',
  'https://listener.guidetranslator.com',
])

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  try {
    const url = new URL(origin)
    return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}
