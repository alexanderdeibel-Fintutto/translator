// Supabase Edge Function: Admin Create User (Lead Conversion)
// Deploy with: supabase functions deploy admin-create-user
// Required secrets: RESEND_API_KEY (optional, for welcome email)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
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
    // Validate required env vars
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.log('ERROR: Missing env vars:', {
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
      })
      return new Response(JSON.stringify({ error: 'Server configuration error: missing environment variables' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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
    const { data: callerProfile, error: profileLookupError } = await adminClient
      .from('gt_users')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    console.log('Caller:', callerUser.id, 'Profile:', callerProfile, 'Error:', profileLookupError)

    if (profileLookupError) {
      return new Response(JSON.stringify({ error: `Profile lookup failed: ${profileLookupError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!callerProfile || callerProfile.role !== 'admin') {
      return new Response(JSON.stringify({ error: `Admin role required. Your role: ${callerProfile?.role ?? 'not found'}` }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request — leadId is optional (direct user creation vs lead conversion)
    const body = await req.json()
    const { leadId, tierId, email, displayName, password: providedPassword, role: requestedRole } = body
    console.log('Request body:', JSON.stringify({ leadId, tierId, email, displayName, role: requestedRole, hasPassword: !!providedPassword }))

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
    console.log('Creating auth user for:', email)
    let userId: string

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (createError) {
      // If user already exists, look them up and continue (profile may be missing)
      if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
        console.log('Auth user already exists, looking up by email:', email)
        const { data: existingUsers } = await adminClient.auth.admin.listUsers()
        const existing = existingUsers?.users?.find((u: any) => u.email === email)
        if (!existing) {
          console.log('ERROR: User reported as existing but not found via listUsers')
          return new Response(JSON.stringify({ error: 'User already registered but could not be found. Please contact support.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        userId = existing.id
        console.log('Found existing auth user:', userId)
      } else {
        console.log('ERROR: Auth user creation failed:', createError.message)
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else if (!newUser?.user) {
      console.log('ERROR: Auth user creation returned no user')
      return new Response(JSON.stringify({ error: 'Failed to create user' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      userId = newUser.user.id
      console.log('Auth user created:', userId)
    }

    // Create or update gt_users profile (trigger may have already created the row)
    const { error: profileError } = await adminClient
      .from('gt_users')
      .upsert({
        id: userId,
        email,
        display_name: displayName ?? email,
        tier_id: effectiveTier,
        role: effectiveRole,
      }, { onConflict: 'id' })

    if (profileError) {
      console.log('ERROR: Profile creation failed:', profileError.message)
      return new Response(JSON.stringify({ error: `Profile creation failed: ${profileError.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Profile created/updated')

    // Update lead as converted (only if leadId was provided)
    if (leadId) {
      const { error: leadError } = await adminClient
        .from('gt_leads')
        .update({
          converted_user_id: userId,
          converted_at: new Date().toISOString(),
          pipeline_stage: 'gewonnen',
        })
        .eq('id', leadId)

      if (leadError) {
        console.log('ERROR: Lead update failed:', leadError)
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
      id: userId,
      email,
      display_name: displayName ?? email,
      role: effectiveRole,
      created_at: new Date().toISOString(),
      userId: userId,
      resetLink: resetData?.properties?.action_link ?? null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.log('ERROR: Unhandled exception:', error.message, error.stack)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
