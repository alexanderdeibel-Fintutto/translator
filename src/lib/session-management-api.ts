// Session Management API — Supabase queries for event sessions,
// participants, pre-translations, and session manager assignments.

import { supabase } from './supabase'
import { generateSessionCode } from './session'
import type {
  EventSession,
  SessionParticipant,
  PreTranslation,
  SessionManager,
  ManagedUser,
  EventSessionStatus,
} from './admin-types'

// ---------------------------------------------------------------------------
// Event Sessions
// ---------------------------------------------------------------------------

export async function fetchEventSessions(filters?: {
  status?: string
  type?: string
  search?: string
}): Promise<EventSession[]> {
  let query = supabase
    .from('gt_event_sessions')
    .select('*')
    .order('scheduled_start', { ascending: true, nullsFirst: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,venue.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as EventSession[]
}

export async function fetchEventSession(id: string): Promise<EventSession> {
  const { data, error } = await supabase
    .from('gt_event_sessions')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as EventSession
}

export async function createEventSession(
  session: Partial<EventSession> & { title: string; created_by: string }
): Promise<EventSession> {
  const sessionCode = generateSessionCode()
  const { data, error } = await supabase
    .from('gt_event_sessions')
    .insert({ ...session, session_code: sessionCode })
    .select()
    .single()
  if (error) throw error
  return data as EventSession
}

export async function updateEventSession(
  id: string,
  updates: Partial<EventSession>
): Promise<void> {
  const { error } = await supabase
    .from('gt_event_sessions')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteEventSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('gt_event_sessions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function updateSessionStatus(
  id: string,
  status: EventSessionStatus
): Promise<void> {
  const { error } = await supabase
    .from('gt_event_sessions')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Session Participants
// ---------------------------------------------------------------------------

export async function fetchSessionParticipants(
  sessionId: string
): Promise<SessionParticipant[]> {
  const { data, error } = await supabase
    .from('gt_session_participants')
    .select('*')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as SessionParticipant[]
}

export async function createSessionParticipant(
  participant: Omit<SessionParticipant, 'id' | 'created_at'>
): Promise<SessionParticipant> {
  const { data, error } = await supabase
    .from('gt_session_participants')
    .insert(participant)
    .select()
    .single()
  if (error) throw error
  return data as SessionParticipant
}

export async function updateSessionParticipant(
  id: string,
  updates: Partial<SessionParticipant>
): Promise<void> {
  const { error } = await supabase
    .from('gt_session_participants')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deleteSessionParticipant(id: string): Promise<void> {
  const { error } = await supabase
    .from('gt_session_participants')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Pre-Translations
// ---------------------------------------------------------------------------

export async function fetchPreTranslations(
  sessionId: string
): Promise<PreTranslation[]> {
  const { data, error } = await supabase
    .from('gt_pre_translations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as PreTranslation[]
}

export async function createPreTranslation(
  doc: Omit<PreTranslation, 'id' | 'created_at' | 'updated_at'>
): Promise<PreTranslation> {
  const { data, error } = await supabase
    .from('gt_pre_translations')
    .insert(doc)
    .select()
    .single()
  if (error) throw error
  return data as PreTranslation
}

export async function updatePreTranslation(
  id: string,
  updates: Partial<PreTranslation>
): Promise<void> {
  const { error } = await supabase
    .from('gt_pre_translations')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function deletePreTranslation(id: string): Promise<void> {
  const { error } = await supabase
    .from('gt_pre_translations')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Session Manager Assignments
// ---------------------------------------------------------------------------

export async function fetchSessionManagers(
  sessionId: string
): Promise<(SessionManager & { user_email?: string; user_name?: string })[]> {
  const { data, error } = await supabase
    .from('gt_session_managers')
    .select('*, gt_users:user_id(email, display_name)')
    .eq('session_id', sessionId)

  if (error) throw error

  return (data ?? []).map((row: Record<string, unknown>) => {
    const user = row.gt_users as { email?: string; display_name?: string } | null
    return {
      ...row,
      user_email: user?.email ?? undefined,
      user_name: user?.display_name ?? undefined,
      gt_users: undefined,
    }
  }) as unknown as (SessionManager & { user_email?: string; user_name?: string })[]
}

export async function assignSessionManager(
  sessionId: string,
  userId: string,
  assignedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('gt_session_managers')
    .upsert({
      session_id: sessionId,
      user_id: userId,
      assigned_by: assignedBy,
      can_edit: true,
      can_invite: true,
    }, { onConflict: 'user_id,session_id' })
  if (error) throw error
}

export async function removeSessionManager(
  sessionId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('gt_session_managers')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Managed Users (session_manager role users)
// ---------------------------------------------------------------------------

export async function fetchManagedUsers(): Promise<ManagedUser[]> {
  const { data, error } = await supabase
    .from('gt_users')
    .select('id, email, display_name, role, created_at')
    .in('role', ['session_manager', 'admin', 'sales_agent', 'tester'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ManagedUser[]
}

export async function fetchAllUsers(): Promise<ManagedUser[]> {
  const { data, error } = await supabase
    .from('gt_users')
    .select('id, email, display_name, role, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ManagedUser[]
}

export async function createManagedUser(
  email: string,
  password: string,
  displayName: string,
  role: 'session_manager' | 'admin' | 'sales_agent' | 'tester' = 'session_manager'
): Promise<ManagedUser> {
  // Edge Function always returns HTTP 200 with { success, error? } in body,
  // because supabase-js discards the response body on non-2xx status codes.
  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: { email, password, displayName, role },
  })

  // Network-level or invocation error (function not found, CORS, etc.)
  if (error) {
    console.error('[createManagedUser] invoke error:', error.message)
    throw new Error(error.message || 'Edge Function konnte nicht aufgerufen werden')
  }

  // Application-level error from the Edge Function
  if (!data?.success) {
    const detail = data?.error || 'Unbekannter Fehler bei der Benutzererstellung'
    console.error('[createManagedUser] function error:', detail)
    throw new Error(detail)
  }

  return data as ManagedUser
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<void> {
  const { error } = await supabase
    .from('gt_users')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Session Stats
// ---------------------------------------------------------------------------

export interface SessionStats {
  totalSessions: number
  draftSessions: number
  preparedSessions: number
  activeSessions: number
  completedSessions: number
  totalParticipants: number
  totalPreTranslations: number
  pendingTranslations: number
}

export async function fetchSessionStats(): Promise<SessionStats> {
  const [sessions, participants, translations] = await Promise.all([
    supabase.from('gt_event_sessions').select('status'),
    supabase.from('gt_session_participants').select('id', { count: 'exact', head: true }),
    supabase.from('gt_pre_translations').select('translation_status'),
  ])

  const allSessions = (sessions.data ?? []) as { status: string }[]
  const allTranslations = (translations.data ?? []) as { translation_status: string }[]

  return {
    totalSessions: allSessions.length,
    draftSessions: allSessions.filter(s => s.status === 'draft').length,
    preparedSessions: allSessions.filter(s => s.status === 'prepared').length,
    activeSessions: allSessions.filter(s => s.status === 'active').length,
    completedSessions: allSessions.filter(s => s.status === 'completed').length,
    totalParticipants: participants.count ?? 0,
    totalPreTranslations: allTranslations.length,
    pendingTranslations: allTranslations.filter(t => t.translation_status === 'pending').length,
  }
}
