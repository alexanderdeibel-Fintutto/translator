// Vercel Edge Function — TTS Proxy
// Keeps Google Cloud TTS API key server-side.
// Returns audio as base64 JSON (same format as Google API).
//
// Security:
//   - IP-based in-memory rate limiting (30 req/min — TTS is more expensive than translate)
//   - Hard text length limit (1 000 chars) to prevent cost abuse

export const config = { runtime: 'edge' }

// ── Rate limiter ──────────────────────────────────────────────────────────────────────
const RATE_WINDOW_MS  = 60_000  // 1 minute window
const RATE_MAX_REQ    = 30      // TTS is expensive — stricter limit than translate
const MAX_TEXT_LENGTH = 1_000   // TTS hard limit (Google max is 5000 bytes)

interface RateBucket { count: number; resetAt: number }
const rateBuckets = new Map<string, RateBucket>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  let bucket = rateBuckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS }
    rateBuckets.set(ip, bucket)
  }
  bucket.count++
  if (rateBuckets.size > 10_000) {
    for (const [key, b] of rateBuckets) {
      if (now > b.resetAt) rateBuckets.delete(key)
    }
  }
  return bucket.count > RATE_MAX_REQ
}

function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

const API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize'
const API_URL_BETA = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize'

interface TtsRequest {
  text: string
  languageCode: string
  voiceName?: string
  useBeta?: boolean
  speakingRate?: number
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return json({ error: 'TTS API key not configured' }, 503)
  }

  let body: TtsRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  // Rate limiting
  const ip = getClientIP(req)
  if (isRateLimited(ip)) {
    return json({ error: 'Too many requests. Please slow down.' }, 429)
  }

  const { text, languageCode, voiceName, useBeta, speakingRate } = body
  if (!text?.trim() || !languageCode) {
    return json({ error: 'Missing required fields: text, languageCode' }, 400)
  }
  // Hard server-side text length limit — prevents cost abuse
  if (text.length > MAX_TEXT_LENGTH) {
    return json({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed for TTS.` }, 413)
  }
  // Basic language code validation
  if (!/^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{2,8})*$/.test(languageCode)) {
    return json({ error: 'Invalid language code format' }, 400)
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
      return json({ error: `Google TTS failed (${res.status}): ${errText}` }, res.status)
    }

    const data = await res.json()
    return json({ audioContent: data.audioContent })
  } catch (err) {
    return json({ error: `TTS proxy error: ${err instanceof Error ? err.message : String(err)}` }, 502)
  }
}

// --- Helpers ---

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  })
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
