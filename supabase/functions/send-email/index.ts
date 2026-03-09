// Supabase Edge Function: Send Email via Resend
// Deploy with: supabase functions deploy send-email
// Required secrets: RESEND_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const ALLOWED_ORIGINS = new Set([
  'https://guidetranslator.com',
  'https://www.guidetranslator.com',
  'https://app.guidetranslator.com',
])

function getCorsHeaders(origin: string | null): Record<string, string> {
  let allowedOrigin = ''
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    allowedOrigin = origin
  } else if (origin) {
    try { if (new URL(origin).hostname === 'localhost') allowedOrigin = origin } catch { /* */ }
  }
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify auth — must be admin or sales_agent
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check role
    const { data: profile } = await supabase
      .from('gt_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'sales_agent'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const { to, subject, body, replyTo } = await req.json()

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send via Resend API
    const emailPayload: Record<string, unknown> = {
      from: 'GuideTranslator <noreply@guidetranslator.com>',
      to: [to],
      subject,
      text: body,
    }
    if (replyTo) emailPayload.reply_to = replyTo

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      return new Response(JSON.stringify({ error: `Resend API error: ${errorData}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await resendResponse.json()
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
