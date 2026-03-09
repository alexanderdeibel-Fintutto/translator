// Vercel Edge Function — Contact Form Proxy
// Inserts contact requests into gt_contact_requests via Supabase

export const config = { runtime: 'edge' }

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

interface ContactRequest {
  firstName: string
  lastName?: string
  email: string
  company?: string
  phone?: string
  product?: string
  requestType?: string
  message: string
}

export default async function handler(req: Request) {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: 'Server configuration error' }, 503, origin)
  }

  let body: ContactRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, origin)
  }

  const { firstName, lastName, email, company, phone, product, requestType, message } = body
  if (!firstName?.trim() || !email?.trim() || !message?.trim()) {
    return json({ error: 'Missing required fields: firstName, email, message' }, 400, origin)
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email address' }, 400, origin)
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gt_contact_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        name: [firstName, lastName].filter(Boolean).join(' '),
        email: email.trim(),
        company: company?.trim() || null,
        phone: phone?.trim() || null,
        product: product?.trim() || null,
        request_type: requestType?.trim() || null,
        message: message.trim(),
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[Contact] Supabase insert failed:', res.status, errText)
      return json({ error: 'Failed to submit contact request' }, 500, origin)
    }

    return json({ ok: true }, 200, origin)
  } catch (err) {
    return json({ error: `Contact form error: ${err instanceof Error ? err.message : String(err)}` }, 502, origin)
  }
}

function json(data: unknown, status = 200, origin?: string | null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

const ALLOWED_ORIGINS = new Set([
  'https://guidetranslator.com',
  'https://www.guidetranslator.com',
  'https://app.guidetranslator.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5173', 'http://localhost:3000'] : []),
])

function corsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}
