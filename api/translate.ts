// Vercel Edge Function — Translation Proxy
// Keeps API keys server-side, bypasses ad-blockers/CSP issues.
// Cascade: Azure (if configured) → Google → MyMemory

export const config = { runtime: 'edge' }

const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const AZURE_TRANSLATE_URL = 'https://api.cognitive.microsofttranslator.com/translate'
const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

// --- Rate limiting (in-memory, per-IP, resets on cold start) ---
const MAX_REQUESTS_PER_MINUTE = 30
const MAX_TEXT_LENGTH = 5000
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

// Allowed origins (set ALLOWED_ORIGINS env var as comma-separated list, or defaults to Fintutto domains)
function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS
  if (env) return env.split(',').map(o => o.trim())
  return [
    'https://translator.fintutto.com',
    'https://fintutto.com',
    'https://www.fintutto.com',
  ]
}

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

  let body: TranslateRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, origin)
  }

  const { text, source, target } = body
  if (!text?.trim() || !source || !target) {
    return json({ error: 'Missing required fields: text, source, target' }, 400, origin)
  }

  // Input length validation
  if (text.length > MAX_TEXT_LENGTH) {
    return json({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters.` }, 400, origin)
  }

  // Language code validation (ISO 639-1: 2-5 chars)
  if (!/^[a-z]{2,5}(-[A-Z]{2})?$/.test(source) || !/^[a-z]{2,5}(-[A-Z]{2})?$/.test(target)) {
    return json({ error: 'Invalid language code format' }, 400, origin)
  }

  const errors: string[] = []

  // 1. Azure Translator (if configured — 2M chars/month free, then $10/1M)
  const azureKey = process.env.AZURE_TRANSLATE_KEY
  if (azureKey) {
    try {
      const result = await translateAzure(text, source, target, azureKey)
      return json(result, 200, origin)
    } catch (err) {
      errors.push(`Azure: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // 2. Google Translate (500K chars/month free, then $20/1M)
  const googleKey = process.env.GOOGLE_API_KEY
  if (googleKey) {
    try {
      const result = await translateGoogle(text, source, target, googleKey)
      return json(result, 200, origin)
    } catch (err) {
      errors.push(`Google: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // 3. MyMemory (free, 10K chars/day)
  try {
    const result = await translateMyMemory(text, source, target)
    return json(result, 200, origin)
  } catch (err) {
    errors.push(`MyMemory: ${err instanceof Error ? err.message : String(err)}`)
  }

  return json({ error: `All providers failed: ${errors.join(' | ')}` }, 502, origin)
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
