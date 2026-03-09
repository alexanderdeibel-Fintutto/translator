// Supabase Edge Function: Admin Create User (Lead Conversion)
// Deploy with: supabase functions deploy admin-create-user
// Required secrets: RESEND_API_KEY (optional, for welcome email)
//
// IMPORTANT: This function always returns HTTP 200 with { success: true/false }
// because supabase-js functions.invoke() discards response bodies on non-2xx.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200, // Always 200 so supabase-js passes the body through
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(error: string, code?: string) {
  console.log('ERROR:', error)
  return jsonResponse({ success: false, error, code: code ?? 'ERROR' })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate required env vars
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.log('Missing env vars:', {
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
      })
      return errorResponse('Server configuration error: missing environment variables', 'CONFIG_ERROR')
    }

    // Verify auth — must be admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Nicht autorisiert - kein Auth-Header', 'UNAUTHORIZED')
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: callerUser } } = await userClient.auth.getUser()
    if (!callerUser) {
      return errorResponse('Nicht autorisiert - ungueltiger Token', 'UNAUTHORIZED')
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
      return errorResponse(`Profil-Lookup fehlgeschlagen: ${profileLookupError.message}`, 'PROFILE_LOOKUP_FAILED')
    }

    if (!callerProfile || callerProfile.role !== 'admin') {
      return errorResponse(`Admin-Rolle erforderlich. Ihre Rolle: ${callerProfile?.role ?? 'nicht gefunden'}`, 'FORBIDDEN')
    }

    // Parse request — leadId is optional (direct user creation vs lead conversion)
    const body = await req.json()
    const { leadId, tierId, email, displayName, password: providedPassword, role: requestedRole } = body
    console.log('Request body:', JSON.stringify({ leadId, tierId, email, displayName, role: requestedRole, hasPassword: !!providedPassword }))

    if (!email) {
      return errorResponse('Pflichtfeld fehlt: E-Mail', 'VALIDATION_ERROR')
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
      const msg = createError.message || ''
      if (msg.includes('already been registered') || msg.includes('already exists') || msg.includes('duplicate') || msg.includes('unique')) {
        console.log('Auth user already exists, looking up by email:', email)
        const { data: listData } = await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 5,
        })
        const existing = listData?.users?.find((u: any) => u.email === email)

        if (!existing) {
          console.log('User not found via listUsers, trying gt_users lookup')
          const { data: profileMatch } = await adminClient
            .from('gt_users')
            .select('id')
            .eq('email', email)
            .single()
          if (profileMatch) {
            userId = profileMatch.id
            console.log('Found existing user via gt_users:', userId)
          } else {
            return errorResponse('Benutzer existiert bereits in Auth, konnte aber nicht gefunden werden. Bitte in Supabase Dashboard pruefen.', 'USER_EXISTS_NOT_FOUND')
          }
        } else {
          userId = existing.id
          console.log('Found existing auth user:', userId)
        }
      } else {
        console.log('Auth user creation failed:', msg, JSON.stringify(createError))
        return errorResponse(`Auth-Fehler: ${msg}`, 'AUTH_ERROR')
      }
    } else if (!newUser?.user) {
      return errorResponse('Auth-User konnte nicht erstellt werden (kein User-Objekt zurueckgegeben)', 'AUTH_ERROR')
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
      console.log('Profile creation failed:', profileError.message)
      return errorResponse(`Profil-Erstellung fehlgeschlagen: ${profileError.message}`, 'PROFILE_ERROR')
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
        console.log('Lead update failed:', leadError)
      }
    }

    // Generate password reset link
    const { data: resetData } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    // Send welcome email via Resend (optional)
    if (RESEND_API_KEY && resetData?.properties?.action_link) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
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
        if (!emailRes.ok) {
          console.log('Welcome email failed:', emailRes.status, await emailRes.text())
        }
      } catch (emailErr) {
        console.log('Welcome email error:', emailErr instanceof Error ? emailErr.message : String(emailErr))
      }
    }

    return jsonResponse({
      success: true,
      id: userId,
      email,
      display_name: displayName ?? email,
      role: effectiveRole,
      created_at: new Date().toISOString(),
      userId: userId,
      resetLink: resetData?.properties?.action_link ?? null,
    })
  } catch (error) {
    console.log('Unhandled exception:', error.message, error.stack)
    return errorResponse(`Unerwarteter Fehler: ${error.message}`, 'UNHANDLED')
  }
})
