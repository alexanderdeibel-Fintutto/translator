// Vercel Edge Function — Translation Proxy
// Keeps API keys server-side, bypasses ad-blockers/CSP issues.
// Cascade: Azure (if configured) → Google → MyMemory
//
// Security:
//   - IP-based in-memory rate limiting (60 req/min per IP)
//   - Hard text length limit (5 000 chars) to prevent cost abuse

export const config = { runtime: 'edge' }

// ── Rate limiter (in-memory, resets on cold start) ──────────────────────────
const RATE_WINDOW_MS  = 60_000  // 1 minute window
const RATE_MAX_REQ    = 60      // max requests per IP per window
const MAX_TEXT_LENGTH = 5_000   // hard server-side character limit

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

const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const AZURE_TRANSLATE_URL = 'https://api.cognitive.microsofttranslator.com/translate'
const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

interface TranslateRequest {
  text: string
  source: string
  target: string
}

interface TranslateResponse {
  translatedText: string
  provider: string
  match: number
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let body: TranslateRequest
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

  const { text, source, target } = body
  if (!text?.trim() || !source || !target) {
    return json({ error: 'Missing required fields: text, source, target' }, 400)
  }
  // Hard server-side text length limit — prevents cost abuse even if client is bypassed
  if (text.length > MAX_TEXT_LENGTH) {
    return json({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.` }, 413)
  }
  // Basic language code validation (BCP-47)
  if (!/^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{2,8})*$/.test(source) ||
      !/^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{2,8})*$/.test(target)) {
    return json({ error: 'Invalid language code format' }, 400)
  }

  const errors: string[] = []

  // 1. Azure Translator (if configured — 2M chars/month free, then $10/1M)
  const azureKey = process.env.AZURE_TRANSLATE_KEY
  if (azureKey) {
    try {
      const result = await translateAzure(text, source, target, azureKey)
      return json(result)
    } catch (err) {
      errors.push(`Azure: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // 2. Google Translate (500K chars/month free, then $20/1M)
  const googleKey = process.env.GOOGLE_API_KEY
  if (googleKey) {
    try {
      const result = await translateGoogle(text, source, target, googleKey)
      return json(result)
    } catch (err) {
      errors.push(`Google: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // 3. MyMemory (free, 10K chars/day)
  try {
    const result = await translateMyMemory(text, source, target)
    return json(result)
  } catch (err) {
    errors.push(`MyMemory: ${err instanceof Error ? err.message : String(err)}`)
  }

  return json({ error: `All providers failed: ${errors.join(' | ')}` }, 502)
}

// --- Provider implementations ---

async function translateAzure(
  text: string, source: string, target: string, apiKey: string,
): Promise<TranslateResponse> {
  const region = process.env.AZURE_TRANSLATE_REGION || 'westeurope'
  const url = `${AZURE_TRANSLATE_URL}?api-version=3.0&from=${source}&to=${target}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ Text: text }]),
  })

  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  const translated = data?.[0]?.translations?.[0]?.text
  if (!translated) throw new Error('Empty result')

  return { translatedText: translated, provider: 'azure', match: 1.0 }
}

async function translateGoogle(
  text: string, source: string, target: string, apiKey: string,
): Promise<TranslateResponse> {
  const res = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source, target, format: 'text' }),
  })

  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  const translated = data.data?.translations?.[0]?.translatedText
  if (!translated) throw new Error('Empty result')

  return { translatedText: translated, provider: 'google', match: 1.0 }
}

async function translateMyMemory(
  text: string, source: string, target: string,
): Promise<TranslateResponse> {
  const langPair = `${source}|${target}`
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)

  const data = await res.json()
  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(data.responseDetails || 'Translation failed')
  }

  return {
    translatedText: data.responseData.translatedText,
    provider: 'mymemory',
    match: data.responseData.match,
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
