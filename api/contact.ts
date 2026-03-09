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
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: 'Server configuration error' }, 503)
  }

  let body: ContactRequest
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { firstName, lastName, email, company, phone, product, requestType, message } = body
  if (!firstName?.trim() || !email?.trim() || !message?.trim()) {
    return json({ error: 'Missing required fields: firstName, email, message' }, 400)
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email address' }, 400)
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
      return json({ error: 'Failed to submit contact request' }, 500)
    }

    return json({ ok: true })
  } catch (err) {
    return json({ error: `Contact form error: ${err instanceof Error ? err.message : String(err)}` }, 502)
  }
}

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
