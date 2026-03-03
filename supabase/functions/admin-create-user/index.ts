// Supabase Edge Function: Admin Create User (Lead Conversion)
// Deploy with: supabase functions deploy admin-create-user
// Required secrets: RESEND_API_KEY (optional, for welcome email)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify auth — must be admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: callerUser } } = await userClient.auth.getUser()
    if (!callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerProfile } = await userClient
      .from('gt_users')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (!callerProfile || callerProfile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request
    const { leadId, tierId, email, displayName } = await req.json()

    if (!leadId || !tierId || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields: leadId, tierId, email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service role client for admin operations
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Create auth user with random password (they'll use password reset)
    const tempPassword = crypto.randomUUID()
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (createError || !newUser.user) {
      return new Response(JSON.stringify({ error: createError?.message ?? 'Failed to create user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create gt_users profile
    const { error: profileError } = await adminClient
      .from('gt_users')
      .insert({
        id: newUser.user.id,
        email,
        display_name: displayName ?? email,
        tier_id: tierId,
        role: 'user',
      })

    if (profileError) {
      return new Response(JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update lead as converted
    const { error: leadError } = await adminClient
      .from('gt_leads')
      .update({
        converted_user_id: newUser.user.id,
        converted_at: new Date().toISOString(),
        pipeline_stage: 'gewonnen',
      })
      .eq('id', leadId)

    if (leadError) {
      console.error('Lead update failed:', leadError)
    }

    // Generate password reset link
    const { data: resetData } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    // Send welcome email via Resend (optional)
    if (RESEND_API_KEY && resetData?.properties?.action_link) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GuideTranslator <noreply@guidetranslator.com>',
          to: [email],
          subject: 'Willkommen bei GuideTranslator!',
          text: `Hallo ${displayName ?? email},\n\nIhr Account wurde erstellt. Bitte setzen Sie Ihr Passwort ueber folgenden Link:\n\n${resetData.properties.action_link}\n\nBeste Gruesse,\nDas GuideTranslator Team`,
        }),
      })
    }

    return new Response(JSON.stringify({
      success: true,
      userId: newUser.user.id,
      resetLink: resetData?.properties?.action_link ?? null,
    }), {
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
