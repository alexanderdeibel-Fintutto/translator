// Admin CRM API — Supabase queries for leads, notes, calculations, and contact requests.

import { supabase } from './supabase'
import type {
  Lead,
  LeadNote,
  Calculation,
  ContactRequest,
  PipelineStage,
  AdminStatsData,
  UserActivity,
} from './admin-types'

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function fetchLeads(filters?: {
  segment?: string
  stage?: string
  search?: string
  tag?: string
}): Promise<Lead[]> {
  let query = supabase
    .from('gt_leads')
    .select('*')
    .order('updated_at', { ascending: false })

  if (filters?.segment) query = query.eq('segment', filters.segment)
  if (filters?.stage) query = query.eq('pipeline_stage', filters.stage)
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
  }
  if (filters?.tag) query = query.contains('tags', [filters.tag])

  const { data, error } = await query
  if (error) throw error
  return data as Lead[]
}

export async function fetchLead(id: string): Promise<Lead> {
  const { data, error } = await supabase
    .from('gt_leads')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Lead
}

export async function createLead(lead: Partial<Lead>): Promise<Lead> {
  const { data, error } = await supabase
    .from('gt_leads')
    .insert(lead)
    .select()
    .single()
  if (error) throw error
  return data as Lead
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<void> {
  const { error } = await supabase
    .from('gt_leads')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function bulkUpdateStage(ids: string[], stage: PipelineStage): Promise<void> {
  const { error } = await supabase
    .from('gt_leads')
    .update({ pipeline_stage: stage })
    .in('id', ids)
  if (error) throw error
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase
    .from('gt_leads')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function fetchNotes(leadId: string): Promise<LeadNote[]> {
  const { data, error } = await supabase
    .from('gt_lead_notes')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as LeadNote[]
}

export async function createNote(note: Omit<LeadNote, 'id' | 'created_at'>): Promise<LeadNote> {
  const { data, error } = await supabase
    .from('gt_lead_notes')
    .insert(note)
    .select()
    .single()
  if (error) throw error
  return data as LeadNote
}

// ---------------------------------------------------------------------------
// Calculations
// ---------------------------------------------------------------------------

export async function fetchCalculations(leadId?: string): Promise<Calculation[]> {
  let query = supabase
    .from('gt_calculations')
    .select('*')
    .order('created_at', { ascending: false })
  if (leadId) query = query.eq('lead_id', leadId)
  const { data, error } = await query
  if (error) throw error
  return data as Calculation[]
}

export async function saveCalculation(calc: Omit<Calculation, 'id' | 'created_at'>): Promise<Calculation> {
  const { data, error } = await supabase
    .from('gt_calculations')
    .insert(calc)
    .select()
    .single()
  if (error) throw error
  return data as Calculation
}

// ---------------------------------------------------------------------------
// Contact Requests
// ---------------------------------------------------------------------------

export async function fetchContactRequests(status?: string): Promise<ContactRequest[]> {
  let query = supabase
    .from('gt_contact_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data as ContactRequest[]
}

export async function updateContactRequestStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('gt_contact_requests')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function createContactRequest(req: Omit<ContactRequest, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('gt_contact_requests')
    .insert(req)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Invite Tokens
// ---------------------------------------------------------------------------

export async function generateInviteToken(leadId: string): Promise<string> {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(9)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 12)

  await updateLead(leadId, {
    invite_token: token,
    pipeline_stage: 'eingeladen',
  })

  return token
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// User Activity (admin only)
// ---------------------------------------------------------------------------

export async function fetchUserActivity(userId?: string): Promise<UserActivity[]> {
  const { data, error } = await supabase.rpc('admin_get_user_activity', {
    p_user_id: userId ?? null,
  })
  if (error) throw error
  return (data ?? []) as UserActivity[]
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function fetchAdminStats(): Promise<AdminStatsData> {
  const [leads, calculations, requests] = await Promise.all([
    supabase.from('gt_leads').select('pipeline_stage'),
    supabase.from('gt_calculations').select('id', { count: 'exact', head: true }),
    supabase.from('gt_contact_requests').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  const allLeads = (leads.data ?? []) as { pipeline_stage: string }[]
  const lostStages = ['verloren']
  const wonStages = ['gewonnen']
  const demoAngebotStages = ['demo', 'angebot']

  return {
    totalLeads: allLeads.length,
    activePipeline: allLeads.filter(l => !lostStages.includes(l.pipeline_stage) && !wonStages.includes(l.pipeline_stage)).length,
    demoAngebot: allLeads.filter(l => demoAngebotStages.includes(l.pipeline_stage)).length,
    gewonnen: allLeads.filter(l => wonStages.includes(l.pipeline_stage)).length,
    verloren: allLeads.filter(l => lostStages.includes(l.pipeline_stage)).length,
    calculations: calculations.count ?? 0,
    openRequests: requests.count ?? 0,
  }
}
