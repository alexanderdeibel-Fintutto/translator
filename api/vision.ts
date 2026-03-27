// /api/vision — Secure server-side proxy for Google Cloud Vision OCR
// Protects the API key from browser exposure.
// Security: Rate-limiting (10 req/min/IP), image size limit (10 MB), CORS guard.

export const config = { runtime: 'edge' }

// ── CORS ──────────────────────────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

// ── In-memory rate limiter (resets per Edge Function instance, ~1 min TTL) ───
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10          // max OCR requests per minute per IP
const RATE_WINDOW = 60_000     // 1 minute in ms
const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10 MB per image
const MAX_PAGES = 10           // max pages per batch request

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // API key guard
  const apiKey = process.env.GOOGLE_VISION_API_KEY || process.env.VITE_GOOGLE_TTS_API_KEY
  if (!apiKey) {
    return json({ error: 'Vision API not configured' }, 503)
  }

  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  if (!checkRateLimit(ip)) {
    return json(
      { error: 'Too many requests. Please wait a moment.' },
      429,
    )
  }

  // Parse body
  let body: { pages: string[] }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { pages } = body

  if (!Array.isArray(pages) || pages.length === 0) {
    return json({ error: 'pages array is required' }, 400)
  }

  if (pages.length > MAX_PAGES) {
    return json({ error: `Maximum ${MAX_PAGES} pages per request` }, 400)
  }

  // Validate each page (base64 string, size check)
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    if (typeof page !== 'string' || page.length === 0) {
      return json({ error: `Page ${i + 1} is invalid` }, 400)
    }
    // Rough byte estimate: base64 is ~4/3 of original
    const estimatedBytes = Math.ceil(page.length * 0.75)
    if (estimatedBytes > MAX_IMAGE_BYTES) {
      return json(
        { error: `Page ${i + 1} exceeds 10 MB limit. Please use a lower resolution.` },
        400,
      )
    }
  }

  // Build Google Vision batch request (one annotate request per page)
  const requests = pages.map(base64 => ({
    image: { content: base64 },
    features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
  }))

  try {
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      },
    )

    if (!visionRes.ok) {
      const errText = await visionRes.text()
      console.error('[Vision Proxy] Google API error:', errText)
      return json({ error: 'OCR service unavailable. Please try again.' }, 502)
    }

    const data = await visionRes.json()

    // Extract text per page — use fullTextAnnotation for best accuracy
    const texts: string[] = (data.responses as Array<{
      fullTextAnnotation?: { text: string }
      textAnnotations?: Array<{ description: string }>
      error?: { message: string }
    }>).map((r, i) => {
      if (r.error) {
        console.warn(`[Vision Proxy] Page ${i + 1} error:`, r.error.message)
        return ''
      }
      return (
        r.fullTextAnnotation?.text ||
        r.textAnnotations?.[0]?.description ||
        ''
      ).trim()
    })

    return json({ texts })
  } catch (err) {
    console.error('[Vision Proxy] Unexpected error:', err)
    return json({ error: 'Internal error. Please try again.' }, 500)
  }
}
