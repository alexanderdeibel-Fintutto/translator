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

    // Use service role client for admin operations (bypasses RLS)
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check caller's role using service role client to bypass RLS
    const { data: callerProfile } = await adminClient
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

    // Parse request — leadId is optional (direct user creation vs lead conversion)
    const { leadId, tierId, email, displayName, password: providedPassword, role: requestedRole } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing required field: email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const effectiveTier = tierId || 'free'
    const effectiveRole = requestedRole || 'user'

    // Create auth user — use provided password or generate temp one
    const tempPassword = providedPassword || crypto.randomUUID()
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

    // Create or update gt_users profile (trigger may have already created the row)
    const { error: profileError } = await adminClient
      .from('gt_users')
      .upsert({
        id: newUser.user.id,
        email,
        display_name: displayName ?? email,
        tier_id: effectiveTier,
        role: effectiveRole,
      }, { onConflict: 'id' })

    if (profileError) {
      return new Response(JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update lead as converted (only if leadId was provided)
    if (leadId) {
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
      id: newUser.user.id,
      email,
      display_name: displayName ?? email,
      role: effectiveRole,
      created_at: new Date().toISOString(),
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
