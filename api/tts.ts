// Vercel Edge Function — TTS Proxy
// Keeps Google Cloud TTS API key server-side.
// Returns audio as base64 JSON (same format as Google API).

export const config = { runtime: 'edge' }

const API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'
const API_URL_BETA = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize'

// --- Rate limiting (in-memory, per-IP) ---
const MAX_REQUESTS_PER_MINUTE = 20
const MAX_TEXT_LENGTH = 2000
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  entry.count++
  return entry.count > MAX_REQUESTS_PER_MINUTE
}

function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS
  if (env) return env.split(',').map(o => o.trim())
  return [
    'https://translator.fintutto.com',
    'https://fintutto.com',
    'https://www.fintutto.com',
  ]
}

interface TtsRequest {
  text: string
  languageCode: string
  voiceName?: string
  useBeta?: boolean
  speakingRate?: number
}

export default async function handler(req: Request) {
  const origin = req.headers.get('Origin') || ''

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(clientIp)) {
    return json({ error: 'Too many requests. Please try again later.' }, 429, origin)
  }

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return json({ error: 'TTS API key not configured' }, 503, origin)
  }

  let body: TtsRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, origin)
  }

  const { text, languageCode, voiceName, useBeta, speakingRate } = body
  if (!text?.trim() || !languageCode) {
    return json({ error: 'Missing required fields: text, languageCode' }, 400, origin)
  }

  // Input length validation
  if (text.length > MAX_TEXT_LENGTH) {
    return json({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters.` }, 400, origin)
  }

  // Language code validation
  if (!/^[a-z]{2,5}(-[A-Z]{2,4})?$/.test(languageCode)) {
    return json({ error: 'Invalid language code format' }, 400, origin)
  }

  const apiUrl = useBeta ? API_URL_BETA : API_URL

  const ttsBody: Record<string, unknown> = {
    input: { text },
    voice: {
      languageCode,
      ...(voiceName ? { name: voiceName } : {}),
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: speakingRate ?? 0.95,
      pitch: 0,
    },
  }

  try {
    const res = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ttsBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      return json({ error: `Google TTS failed (${res.status}): ${errText}` }, res.status, origin)
    }

    const data = await res.json()
    return json({ audioContent: data.audioContent }, 200, origin)
  } catch (err) {
    return json({ error: `TTS proxy error: ${err instanceof Error ? err.message : String(err)}` }, 502, origin)
  }
}

// --- Helpers ---

function json(data: unknown, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function corsHeaders(origin: string): Record<string, string> {
  const allowed = getAllowedOrigins()
  const allowedOrigin = allowed.includes(origin) ? origin : allowed[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}
