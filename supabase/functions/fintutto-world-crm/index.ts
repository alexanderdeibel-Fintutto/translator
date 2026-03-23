// Supabase Edge Function: Fintutto World CRM API
// Sales pipeline management for Fintutto World segments
// Handles: leads, activities, tasks, campaigns, invites, dashboard
// Deploy with: supabase functions deploy fintutto-world-crm

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// Types
// ============================================================================

interface LeadInput {
  segment_id: string
  company_name: string
  contact_email: string
  contact_first_name: string
  contact_last_name?: string
  contact_phone?: string
  company_website?: string
  source?: string
  priority?: string
  tags?: string[]
  internal_notes?: string
  target_tier_id?: string
  campaign_id?: string
}

interface LeadFilters {
  segment_id?: string
  status?: string
  assigned_to?: string
  source?: string
  priority?: string
  search?: string
  tags?: string[]
  date_from?: string
  date_to?: string
}

interface CampaignInput {
  name: string
  campaign_type: string
  target_segments: string[]
  description?: string
  email_subject?: string
  email_template?: string
}

type CrmAction =
  | 'create_lead'
  | 'update_lead'
  | 'list_leads'
  | 'get_lead'
  | 'add_activity'
  | 'create_task'
  | 'complete_task'
  | 'send_invite'
  | 'track_invite'
  | 'create_campaign'
  | 'pipeline_stats'
  | 'dashboard'

interface CrmRequest {
  action: CrmAction
  // create_lead
  lead?: LeadInput
  // update_lead
  lead_id?: string
  updates?: Record<string, unknown>
  // list_leads
  filters?: LeadFilters
  page?: number
  per_page?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  // add_activity
  activity_type?: string
  title?: string
  description?: string
  metadata?: Record<string, unknown>
  // create_task
  task_type?: string
  priority?: string
  due_at?: string
  assigned_to?: string
  // complete_task
  task_id?: string
  // send_invite
  template_key?: string
  custom_message?: string
  // track_invite
  code?: string
  event?: 'visited' | 'registered'
  user_id?: string
  // create_campaign
  campaign?: CampaignInput
  // pipeline_stats
  segment_id?: string
}

// ============================================================================
// Helper: Template Rendering
// ============================================================================

function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value ?? '')
  }
  return result
}

// ============================================================================
// Helper: JSON Response
// ============================================================================

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status)
}

// ============================================================================
// Helper: Log Activity
// ============================================================================

async function logActivity(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  activityType: string,
  title: string,
  description?: string,
  metadata?: Record<string, unknown>,
  userId?: string,
) {
  await supabase.from('fw_crm_activities').insert({
    lead_id: leadId,
    activity_type: activityType,
    title,
    description: description ?? null,
    metadata: metadata ?? null,
    performed_by: userId ?? null,
  })
}

// ============================================================================
// Action: create_lead
// ============================================================================

async function handleCreateLead(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
  userId: string,
) {
  const lead = body.lead
  if (!lead) return errorResponse('lead object is required')
  if (!lead.segment_id) return errorResponse('segment_id is required')
  if (!lead.company_name) return errorResponse('company_name is required')
  if (!lead.contact_email) return errorResponse('contact_email is required')
  if (!lead.contact_first_name) return errorResponse('contact_first_name is required')

  // Generate invite code via database function
  const { data: codeResult, error: codeError } = await supabase.rpc('fw_generate_invite_code')
  if (codeError) return errorResponse(`Failed to generate invite code: ${codeError.message}`, 500)

  const inviteCode = codeResult as string
  const landingUrl = `https://world.fintutto.com/invite/${inviteCode}`

  // Insert lead
  const { data: newLead, error: leadError } = await supabase
    .from('fw_crm_leads')
    .insert({
      segment_id: lead.segment_id,
      company_name: lead.company_name,
      contact_email: lead.contact_email,
      contact_first_name: lead.contact_first_name,
      contact_last_name: lead.contact_last_name ?? null,
      contact_phone: lead.contact_phone ?? null,
      company_website: lead.company_website ?? null,
      source: lead.source ?? null,
      priority: lead.priority ?? 'medium',
      tags: lead.tags ?? [],
      internal_notes: lead.internal_notes ?? null,
      target_tier_id: lead.target_tier_id ?? null,
      campaign_id: lead.campaign_id ?? null,
      invite_code: inviteCode,
      invite_landing_url: landingUrl,
      assigned_to: userId,
      status: 'new',
    })
    .select()
    .single()

  if (leadError) return errorResponse(`Failed to create lead: ${leadError.message}`, 500)

  // Store invite code in invite_codes table
  await supabase.from('fw_crm_invite_codes').insert({
    code: inviteCode,
    lead_id: newLead.id,
    landing_url: landingUrl,
  })

  // Log activity
  await logActivity(supabase, newLead.id, 'lead_created', `Lead created: ${lead.company_name}`, null, null, userId)

  return jsonResponse({ lead: newLead, invite_code: inviteCode, landing_url: landingUrl })
}

// ============================================================================
// Action: update_lead
// ============================================================================

async function handleUpdateLead(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
  userId: string,
) {
  const { lead_id, updates } = body
  if (!lead_id) return errorResponse('lead_id is required')
  if (!updates || Object.keys(updates).length === 0) return errorResponse('updates object is required')

  // If status is changing, fetch old status for activity log
  let oldStatus: string | null = null
  if (updates.status) {
    const { data: existing } = await supabase
      .from('fw_crm_leads')
      .select('status')
      .eq('id', lead_id)
      .single()
    oldStatus = existing?.status ?? null
  }

  const { data: updated, error } = await supabase
    .from('fw_crm_leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', lead_id)
    .select()
    .single()

  if (error) return errorResponse(`Failed to update lead: ${error.message}`, 500)

  // Log status change if applicable
  if (updates.status && oldStatus && oldStatus !== updates.status) {
    await logActivity(
      supabase,
      lead_id,
      'status_changed',
      `Status changed: ${oldStatus} -> ${updates.status}`,
      null,
      { old_status: oldStatus, new_status: updates.status },
      userId,
    )
  }

  return jsonResponse({ lead: updated })
}

// ============================================================================
// Action: list_leads
// ============================================================================

async function handleListLeads(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
) {
  const filters = body.filters ?? {}
  const page = body.page ?? 1
  const perPage = body.per_page ?? 25
  const sortBy = body.sort_by ?? 'created_at'
  const sortDir = body.sort_dir ?? 'desc'
  const offset = (page - 1) * perPage

  let query = supabase
    .from('fw_crm_leads')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.segment_id) query = query.eq('segment_id', filters.segment_id)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
  if (filters.source) query = query.eq('source', filters.source)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.date_from) query = query.gte('created_at', filters.date_from)
  if (filters.date_to) query = query.lte('created_at', filters.date_to)

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  if (filters.search) {
    const s = `%${filters.search}%`
    query = query.or(
      `company_name.ilike.${s},contact_email.ilike.${s},contact_first_name.ilike.${s},contact_last_name.ilike.${s}`
    )
  }

  // Sorting and pagination
  query = query.order(sortBy, { ascending: sortDir === 'asc' })
  query = query.range(offset, offset + perPage - 1)

  const { data, error, count } = await query

  if (error) return errorResponse(`Failed to list leads: ${error.message}`, 500)

  return jsonResponse({
    items: data ?? [],
    total: count ?? 0,
    page,
    per_page: perPage,
  })
}

// ============================================================================
// Action: get_lead
// ============================================================================

async function handleGetLead(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
) {
  const { lead_id } = body
  if (!lead_id) return errorResponse('lead_id is required')

  // Fetch lead
  const { data: lead, error: leadError } = await supabase
    .from('fw_crm_leads')
    .select('*')
    .eq('id', lead_id)
    .single()

  if (leadError) return errorResponse(`Lead not found: ${leadError.message}`, 404)

  // Fetch activities
  const { data: activities } = await supabase
    .from('fw_crm_activities')
    .select('*')
    .eq('lead_id', lead_id)
    .order('created_at', { ascending: false })

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('fw_crm_tasks')
    .select('*')
    .eq('lead_id', lead_id)
    .order('due_at', { ascending: true })

  return jsonResponse({
    lead,
    activities: activities ?? [],
    tasks: tasks ?? [],
  })
}

// ============================================================================
// Action: add_activity
// ============================================================================

async function handleAddActivity(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
  userId: string,
) {
  const { lead_id, activity_type, title, description, metadata } = body
  if (!lead_id) return errorResponse('lead_id is required')
  if (!activity_type) return errorResponse('activity_type is required')
  if (!title) return errorResponse('title is required')

  const { data: activity, error } = await supabase
    .from('fw_crm_activities')
    .insert({
      lead_id,
      activity_type,
      title,
      description: description ?? null,
      metadata: metadata ?? null,
      performed_by: userId,
    })
    .select()
    .single()

  if (error) return errorResponse(`Failed to add activity: ${error.message}`, 500)

  // Update last_contacted_at on the lead
  await supabase
    .from('fw_crm_leads')
    .update({ last_contacted_at: new Date().toISOString() })
    .eq('id', lead_id)

  return jsonResponse({ activity })
}

// ============================================================================
// Action: create_task
// ============================================================================

async function handleCreateTask(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
  userId: string,
) {
  const { lead_id, title, task_type, description, priority, due_at, assigned_to } = body
  if (!lead_id) return errorResponse('lead_id is required')
  if (!title) return errorResponse('title is required')

  const { data: task, error } = await supabase
    .from('fw_crm_tasks')
    .insert({
      lead_id,
      title,
      task_type: task_type ?? 'follow_up',
      description: description ?? null,
      priority: priority ?? 'medium',
      due_at: due_at ?? null,
      assigned_to: assigned_to ?? userId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return errorResponse(`Failed to create task: ${error.message}`, 500)

  return jsonResponse({ task })
}

// ============================================================================
// Action: complete_task
// ============================================================================

async function handleCompleteTask(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
  userId: string,
) {
  const { task_id } = body
  if (!task_id) return errorResponse('task_id is required')

  const { data: task, error } = await supabase
    .from('fw_crm_tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', task_id)
    .select()
    .single()

  if (error) return errorResponse(`Failed to complete task: ${error.message}`, 500)

  // Log activity on the associated lead
  if (task.lead_id) {
    await logActivity(
      supabase,
      task.lead_id,
      'task_completed',
      `Task completed: ${task.title}`,
      null,
      { task_id: task.id },
      userId,
    )
  }

  return jsonResponse({ task })
}

// ============================================================================
// Action: send_invite
// ============================================================================

async function handleSendInvite(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
  userId: string,
) {
  const { lead_id, template_key, custom_message } = body
  if (!lead_id) return errorResponse('lead_id is required')

  // Fetch lead
  const { data: lead, error: leadError } = await supabase
    .from('fw_crm_leads')
    .select('*')
    .eq('id', lead_id)
    .single()

  if (leadError) return errorResponse(`Lead not found: ${leadError.message}`, 404)

  // Generate or refresh invite code if needed
  let inviteCode = lead.invite_code
  let landingUrl = lead.invite_landing_url

  if (!inviteCode) {
    const { data: codeResult, error: codeError } = await supabase.rpc('fw_generate_invite_code')
    if (codeError) return errorResponse(`Failed to generate invite code: ${codeError.message}`, 500)

    inviteCode = codeResult as string
    landingUrl = `https://world.fintutto.com/invite/${inviteCode}`

    // Update lead with new invite code
    await supabase
      .from('fw_crm_leads')
      .update({ invite_code: inviteCode, invite_landing_url: landingUrl })
      .eq('id', lead_id)

    // Store invite code
    await supabase.from('fw_crm_invite_codes').insert({
      code: inviteCode,
      lead_id: lead.id,
      landing_url: landingUrl,
    })
  }

  // Fetch segment name
  const { data: segment } = await supabase
    .from('fw_segments')
    .select('name')
    .eq('id', lead.segment_id)
    .single()

  const segmentName = segment?.name ?? ''

  // Look up email template
  let emailSubject = `Invitation to Fintutto World`
  let emailBody = custom_message ?? `Hello {{contact_name}},\n\nYou are invited to join Fintutto World.\n\nVisit your personalized page: {{landing_url}}\n\nBest regards,\nFintutto Team`

  const effectiveTemplateKey = template_key ?? 'default_invite'

  const { data: tmpl } = await supabase
    .from('fw_crm_email_templates')
    .select('*')
    .eq('template_key', effectiveTemplateKey)
    .eq('segment_id', lead.segment_id)
    .single()

  if (tmpl) {
    emailSubject = tmpl.subject ?? emailSubject
    emailBody = tmpl.body ?? emailBody
  }

  // Build template variables
  const contactName = [lead.contact_first_name, lead.contact_last_name].filter(Boolean).join(' ')
  const templateVars: Record<string, string> = {
    company_name: lead.company_name ?? '',
    contact_name: contactName,
    invite_code: inviteCode,
    landing_url: landingUrl,
    segment_name: segmentName,
  }

  const renderedSubject = renderTemplate(emailSubject, templateVars)
  const renderedBody = renderTemplate(emailBody, templateVars)

  // Update invite_sent_at on lead
  await supabase
    .from('fw_crm_leads')
    .update({ invite_sent_at: new Date().toISOString() })
    .eq('id', lead_id)

  // Log activity
  await logActivity(
    supabase,
    lead_id,
    'invite_sent',
    `Invite sent to ${lead.contact_email}`,
    null,
    { invite_code: inviteCode, template_key: effectiveTemplateKey },
    userId,
  )

  // Send email via send-email Edge Function (Resend)
  let emailSent = false
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        to: lead.contact_email,
        subject: renderedSubject,
        body: renderedBody,
      }),
    })
    emailSent = emailRes.ok
  } catch {
    // Email sending failed — non-blocking, invite is still recorded
  }

  return jsonResponse({
    success: true,
    invite_code: inviteCode,
    landing_url: landingUrl,
    email_sent: emailSent,
    rendered_email: {
      to: lead.contact_email,
      subject: renderedSubject,
      body: renderedBody,
    },
  })
}

// ============================================================================
// Action: track_invite (public, no auth required)
// ============================================================================

async function handleTrackInvite(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
) {
  const { code, event, user_id } = body
  if (!code) return errorResponse('code is required')
  if (!event || !['visited', 'registered'].includes(event)) {
    return errorResponse("event must be 'visited' or 'registered'")
  }

  // Find invite code
  const { data: invite, error: inviteError } = await supabase
    .from('fw_crm_invite_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (inviteError) return errorResponse('Invite code not found', 404)

  // Update invite code counters
  const updateFields: Record<string, unknown> = {}
  if (event === 'visited') {
    updateFields.visit_count = (invite.visit_count ?? 0) + 1
    updateFields.last_visited_at = new Date().toISOString()
  } else if (event === 'registered') {
    updateFields.registration_count = (invite.registration_count ?? 0) + 1
    updateFields.registered_at = new Date().toISOString()
    if (user_id) updateFields.registered_user_id = user_id
  }

  await supabase
    .from('fw_crm_invite_codes')
    .update(updateFields)
    .eq('id', invite.id)

  // Update lead tracking fields
  if (invite.lead_id) {
    const leadUpdate: Record<string, unknown> = {}
    if (event === 'visited') {
      leadUpdate.invite_visited_at = new Date().toISOString()
    } else if (event === 'registered') {
      leadUpdate.invite_registered_at = new Date().toISOString()
      if (user_id) leadUpdate.converted_user_id = user_id
      leadUpdate.status = 'converted'
    }

    await supabase
      .from('fw_crm_leads')
      .update(leadUpdate)
      .eq('id', invite.lead_id)

    // Log activity
    const activityTitle = event === 'visited'
      ? 'Invite link visited'
      : 'User registered via invite'

    await logActivity(
      supabase,
      invite.lead_id,
      event === 'visited' ? 'invite_visited' : 'invite_registered',
      activityTitle,
      null,
      { code, event, user_id: user_id ?? null },
    )
  }

  return jsonResponse({ success: true, event })
}

// ============================================================================
// Action: create_campaign
// ============================================================================

async function handleCreateCampaign(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
  userId: string,
) {
  const campaign = body.campaign
  if (!campaign) return errorResponse('campaign object is required')
  if (!campaign.name) return errorResponse('campaign name is required')
  if (!campaign.campaign_type) return errorResponse('campaign_type is required')
  if (!campaign.target_segments || campaign.target_segments.length === 0) {
    return errorResponse('target_segments is required')
  }

  const { data, error } = await supabase
    .from('fw_crm_campaigns')
    .insert({
      name: campaign.name,
      campaign_type: campaign.campaign_type,
      target_segments: campaign.target_segments,
      description: campaign.description ?? null,
      email_subject: campaign.email_subject ?? null,
      email_template: campaign.email_template ?? null,
      created_by: userId,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return errorResponse(`Failed to create campaign: ${error.message}`, 500)

  return jsonResponse({ campaign: data })
}

// ============================================================================
// Action: pipeline_stats
// ============================================================================

async function handlePipelineStats(
  supabase: ReturnType<typeof createClient>,
  body: CrmRequest,
) {
  const { segment_id } = body

  // Leads grouped by status
  let query = supabase
    .from('fw_crm_leads')
    .select('status, proposed_monthly_eur')

  if (segment_id) query = query.eq('segment_id', segment_id)

  const { data: leads, error } = await query

  if (error) return errorResponse(`Failed to fetch stats: ${error.message}`, 500)

  const allLeads = leads ?? []

  // Count by status
  const statusCounts: Record<string, number> = {}
  let totalDealValue = 0
  let dealCount = 0
  let convertedCount = 0

  for (const lead of allLeads) {
    const st = lead.status ?? 'unknown'
    statusCounts[st] = (statusCounts[st] ?? 0) + 1

    if (lead.proposed_monthly_eur) {
      totalDealValue += Number(lead.proposed_monthly_eur)
      dealCount++
    }

    if (st === 'converted' || st === 'won') {
      convertedCount++
    }
  }

  const totalLeads = allLeads.length
  const conversionRate = totalLeads > 0 ? convertedCount / totalLeads : 0
  const avgDealValue = dealCount > 0 ? totalDealValue / dealCount : 0

  return jsonResponse({
    leads_by_status: statusCounts,
    total_leads: totalLeads,
    conversion_rate: Math.round(conversionRate * 10000) / 100, // percentage with 2 decimals
    avg_deal_value_eur: Math.round(avgDealValue * 100) / 100,
  })
}

// ============================================================================
// Action: dashboard
// ============================================================================

async function handleDashboard(
  supabase: ReturnType<typeof createClient>,
) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Fetch all leads
  const { data: allLeads, error: leadsError } = await supabase
    .from('fw_crm_leads')
    .select('id, status, segment_id, proposed_monthly_eur, created_at')

  if (leadsError) return errorResponse(`Failed to fetch leads: ${leadsError.message}`, 500)

  const leads = allLeads ?? []
  const totalLeads = leads.length

  // Leads this month
  const leadsThisMonth = leads.filter(l => l.created_at >= startOfMonth).length

  // By segment
  const leadsBySegment: Record<string, number> = {}
  for (const l of leads) {
    const seg = l.segment_id ?? 'unknown'
    leadsBySegment[seg] = (leadsBySegment[seg] ?? 0) + 1
  }

  // By status
  const leadsByStatus: Record<string, number> = {}
  let convertedCount = 0
  let pipelineValue = 0

  for (const l of leads) {
    const st = l.status ?? 'unknown'
    leadsByStatus[st] = (leadsByStatus[st] ?? 0) + 1

    if (st === 'converted' || st === 'won') {
      convertedCount++
    }

    // Pipeline value: sum proposed_monthly_eur for active leads (not lost/converted)
    if (!['lost', 'converted', 'won', 'disqualified'].includes(st) && l.proposed_monthly_eur) {
      pipelineValue += Number(l.proposed_monthly_eur)
    }
  }

  const conversionRate = totalLeads > 0 ? convertedCount / totalLeads : 0

  // Avg deal value from converted/won leads
  const wonLeads = leads.filter(
    l => ['converted', 'won'].includes(l.status) && l.proposed_monthly_eur
  )
  const avgDealValue = wonLeads.length > 0
    ? wonLeads.reduce((sum, l) => sum + Number(l.proposed_monthly_eur), 0) / wonLeads.length
    : 0

  // Overdue tasks
  const { count: overdueCount } = await supabase
    .from('fw_crm_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .lt('due_at', now.toISOString())

  // Upcoming follow-ups (next 7 days)
  const { data: upcomingTasks } = await supabase
    .from('fw_crm_tasks')
    .select('*')
    .eq('status', 'pending')
    .gte('due_at', now.toISOString())
    .lte('due_at', sevenDaysFromNow)
    .order('due_at', { ascending: true })
    .limit(20)

  return jsonResponse({
    total_leads: totalLeads,
    leads_this_month: leadsThisMonth,
    leads_by_segment: leadsBySegment,
    leads_by_status: leadsByStatus,
    conversion_rate: Math.round(conversionRate * 10000) / 100,
    avg_deal_value_eur: Math.round(avgDealValue * 100) / 100,
    pipeline_value_eur: Math.round(pipelineValue * 100) / 100,
    overdue_tasks: overdueCount ?? 0,
    upcoming_followups: upcomingTasks ?? [],
  })
}

// ============================================================================
// Auth Helper
// ============================================================================

async function authenticateUser(
  supabase: ReturnType<typeof createClient>,
): Promise<{ userId: string; error?: never } | { userId?: never; error: Response }> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: errorResponse('Unauthorized', 401) }
  }

  // Check role in gt_users
  const { data: gtUser, error: roleError } = await supabase
    .from('gt_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || !gtUser) {
    return { error: errorResponse('User not found in gt_users', 403) }
  }

  if (!['admin', 'sales_agent'].includes(gtUser.role)) {
    return { error: errorResponse('Insufficient permissions. Required role: admin or sales_agent', 403) }
  }

  return { userId: user.id }
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405)
    }

    const body: CrmRequest = await req.json()

    if (!body.action) {
      return errorResponse('action is required')
    }

    // track_invite is a public endpoint — no auth required
    if (body.action === 'track_invite') {
      // Use service role client for public tracking
      const serviceSupabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      return await handleTrackInvite(serviceSupabase, body)
    }

    // All other actions require authentication
    const auth = await authenticateUser(supabase)
    if (auth.error) return auth.error

    const userId = auth.userId

    switch (body.action) {
      case 'create_lead':
        return await handleCreateLead(supabase, body, userId)
      case 'update_lead':
        return await handleUpdateLead(supabase, body, userId)
      case 'list_leads':
        return await handleListLeads(supabase, body)
      case 'get_lead':
        return await handleGetLead(supabase, body)
      case 'add_activity':
        return await handleAddActivity(supabase, body, userId)
      case 'create_task':
        return await handleCreateTask(supabase, body, userId)
      case 'complete_task':
        return await handleCompleteTask(supabase, body, userId)
      case 'send_invite':
        return await handleSendInvite(supabase, body, userId)
      case 'create_campaign':
        return await handleCreateCampaign(supabase, body, userId)
      case 'pipeline_stats':
        return await handlePipelineStats(supabase, body)
      case 'dashboard':
        return await handleDashboard(supabase)
      default:
        return errorResponse(`Unknown action: ${body.action}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return errorResponse(message, 500)
  }
})
