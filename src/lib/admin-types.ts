// Admin CRM Type Definitions
// Types for leads, notes, calculations, contact requests, and pipeline management.

import type { Segment } from './tiers'

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export type PipelineStage =
  | 'neu' | 'eingeladen' | 'registriert' | 'kalkulation'
  | 'demo' | 'angebot' | 'verhandlung' | 'gewonnen' | 'verloren'

export const PIPELINE_STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'neu', label: 'Neu', color: 'bg-slate-500' },
  { id: 'eingeladen', label: 'Eingeladen', color: 'bg-blue-500' },
  { id: 'registriert', label: 'Registriert', color: 'bg-cyan-500' },
  { id: 'kalkulation', label: 'Kalkulation', color: 'bg-indigo-500' },
  { id: 'demo', label: 'Demo', color: 'bg-violet-500' },
  { id: 'angebot', label: 'Angebot', color: 'bg-amber-500' },
  { id: 'verhandlung', label: 'Verhandlung', color: 'bg-orange-500' },
  { id: 'gewonnen', label: 'Gewonnen', color: 'bg-emerald-500' },
  { id: 'verloren', label: 'Verloren', color: 'bg-red-500' },
]

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export type NoteType = 'note' | 'call' | 'email' | 'meeting'

export const NOTE_TYPES: { id: NoteType; label: string }[] = [
  { id: 'note', label: 'Notiz' },
  { id: 'call', label: 'Anruf' },
  { id: 'email', label: 'E-Mail' },
  { id: 'meeting', label: 'Meeting' },
]

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface Lead {
  id: string
  name: string
  email: string
  company: string | null
  role: string | null
  phone: string | null
  fleet_size: number | null
  segment: Segment
  pipeline_stage: PipelineStage
  tags: string[]
  invite_token: string | null
  assigned_to: string | null
  created_by: string | null
  converted_user_id: string | null
  converted_at: string | null
  source: string | null
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// User Activity (admin RPC)
// ---------------------------------------------------------------------------

export interface UserActivity {
  user_id: string
  email: string
  display_name: string | null
  role: string
  total_sessions: number
  total_duration_minutes: number
  total_translations: number
  last_session_at: string | null
  current_month_minutes: number
  current_month_translations: number
  lead_count: number
  created_at: string
}

export interface LeadNote {
  id: string
  lead_id: string
  author_id: string | null
  type: NoteType
  content: string
  follow_up_at: string | null
  created_at: string
}

export interface Calculation {
  id: string
  lead_id: string | null
  segment: string
  params: Record<string, unknown>
  result: Record<string, unknown>
  name: string | null
  created_at: string
}

export interface ContactRequest {
  id: string
  lead_id: string | null
  name: string
  email: string
  company: string | null
  message: string | null
  type: 'contact' | 'proposal' | 'demo'
  segment: string | null
  status: 'new' | 'responded' | 'closed'
  source: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Tag presets per segment
// ---------------------------------------------------------------------------

export const SEGMENT_TAG_PRESETS: Partial<Record<Segment | 'all', string[]>> & { all: string[] } = {
  all: ['VIP', 'Tester', 'Pilot-Kandidat', 'Bestandskunde', 'Prioritaet-Hoch'],
  guide: ['Stadtfuehrer', 'Freelancer', 'Tourismus-Verband'],
  agency: ['Reiseagentur', 'Tour-Operator', 'DMC'],
  event: ['Konferenz', 'Messe', 'Workshop', 'Verband'],
  cruise: ['AIDA', 'MSC', 'TUI Cruises', 'Hapag-Lloyd', 'Costa', 'Norwegian', 'Royal Caribbean', 'Celebrity'],
  internal: ['Admin', 'Entwickler', 'QA', 'Sales-Team'],
}

// ---------------------------------------------------------------------------
// Follow-up presets
// ---------------------------------------------------------------------------

export const FOLLOW_UP_PRESETS = [
  { label: 'Morgen', days: 1 },
  { label: 'In 3 Tagen', days: 3 },
  { label: 'Nächste Woche', days: 7 },
  { label: 'In 2 Wochen', days: 14 },
]

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

export interface EmailTemplate {
  name: string
  subject: string
  body: string
}

// ---------------------------------------------------------------------------
// Admin stats
// ---------------------------------------------------------------------------

export interface AdminStatsData {
  totalLeads: number
  activePipeline: number
  demoAngebot: number
  gewonnen: number
  verloren: number
  calculations: number
  openRequests: number
}

export type UserRole = 'user' | 'admin' | 'sales_agent' | 'session_manager' | 'tester'

// ---------------------------------------------------------------------------
// Commission Tracking
// ---------------------------------------------------------------------------

export type CommissionStatus = 'earned' | 'approved' | 'paid' | 'clawed_back'

export interface Commission {
  id: string
  lead_id: string | null
  sales_agent_id: string
  customer_user_id: string | null
  tier_id: string
  segment: string
  commission_pct: number
  monthly_revenue_eur: number
  commission_eur: number
  period_month: string
  status: CommissionStatus
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CommissionRate {
  id: string
  segment: string
  tier_id: string | null
  commission_pct: number
  recurring_months: number
  clawback_days: number
  created_at: string
  updated_at: string
}

export interface SalesPerformance {
  sales_agent_id: string
  agent_email: string
  agent_name: string | null
  leads_created: number
  leads_converted: number
  conversion_rate: number
  active_customers: number
  total_mrr_eur: number
  total_commissions_earned_eur: number
  total_commissions_paid_eur: number
  current_month_commission_eur: number
}

// ---------------------------------------------------------------------------
// Event Session Management
// ---------------------------------------------------------------------------

export type EventSessionType = 'session' | 'panel' | 'tour' | 'conference' | 'workshop'

export const EVENT_SESSION_TYPES: { id: EventSessionType; label: string }[] = [
  { id: 'session', label: 'Session / Vortrag' },
  { id: 'panel', label: 'Panel-Diskussion' },
  { id: 'tour', label: 'Tour / Führung' },
  { id: 'conference', label: 'Konferenz' },
  { id: 'workshop', label: 'Workshop' },
]

export type EventSessionStatus = 'draft' | 'prepared' | 'active' | 'completed' | 'archived'

export const EVENT_SESSION_STATUSES: { id: EventSessionStatus; label: string; color: string }[] = [
  { id: 'draft', label: 'Entwurf', color: 'bg-slate-500' },
  { id: 'prepared', label: 'Vorbereitet', color: 'bg-blue-500' },
  { id: 'active', label: 'Aktiv', color: 'bg-emerald-500' },
  { id: 'completed', label: 'Abgeschlossen', color: 'bg-violet-500' },
  { id: 'archived', label: 'Archiviert', color: 'bg-gray-400' },
]

export interface EventSession {
  id: string
  organization_id: string | null
  created_by: string
  title: string
  description: string | null
  type: EventSessionType
  status: EventSessionStatus
  session_code: string | null
  source_language: string
  target_languages: string[]
  scheduled_start: string | null
  scheduled_end: string | null
  venue: string | null
  notes: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ParticipantRole = 'speaker' | 'moderator' | 'panelist' | 'interpreter' | 'guest'

export const PARTICIPANT_ROLES: { id: ParticipantRole; label: string }[] = [
  { id: 'speaker', label: 'Sprecher/in' },
  { id: 'moderator', label: 'Moderator/in' },
  { id: 'panelist', label: 'Panelist/in' },
  { id: 'interpreter', label: 'Dolmetscher/in' },
  { id: 'guest', label: 'Gast' },
]

export interface SessionParticipant {
  id: string
  session_id: string
  name: string
  email: string | null
  role: ParticipantRole
  biography: string | null
  organization: string | null
  notes: string | null
  sort_order: number
  created_at: string
}

export type PreTranslationType = 'speech' | 'questions' | 'biography' | 'glossary' | 'agenda' | 'notes'

export const PRE_TRANSLATION_TYPES: { id: PreTranslationType; label: string }[] = [
  { id: 'speech', label: 'Vortrag / Rede' },
  { id: 'questions', label: 'Fragen' },
  { id: 'biography', label: 'Biografie' },
  { id: 'glossary', label: 'Glossar / Fachbegriffe' },
  { id: 'agenda', label: 'Agenda / Programm' },
  { id: 'notes', label: 'Notizen' },
]

export type TranslationStatus = 'pending' | 'translating' | 'completed' | 'error'

export interface PreTranslation {
  id: string
  session_id: string
  participant_id: string | null
  title: string
  type: PreTranslationType
  content: string
  source_language: string
  translations: Record<string, string>
  translation_status: TranslationStatus
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface SessionManager {
  id: string
  user_id: string
  session_id: string
  can_edit: boolean
  can_invite: boolean
  assigned_by: string | null
  created_at: string
}

export interface ManagedUser {
  id: string
  email: string | null
  display_name: string | null
  role: UserRole
  created_at: string
}
