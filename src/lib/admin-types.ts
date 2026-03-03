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
  converted_user_id: string | null
  converted_at: string | null
  created_at: string
  updated_at: string
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
  created_at: string
}

// ---------------------------------------------------------------------------
// Tag presets per segment
// ---------------------------------------------------------------------------

export const SEGMENT_TAG_PRESETS: Record<Segment | 'all', string[]> = {
  all: ['VIP', 'Pilot-Kandidat', 'Bestandskunde', 'Prioritaet-Hoch'],
  personal: [],
  guide: ['Stadtfuehrer', 'Freelancer', 'Tourismus-Verband'],
  agency: ['Reiseagentur', 'Tour-Operator', 'DMC'],
  event: ['Konferenz', 'Messe', 'Workshop', 'Verband'],
  cruise: ['AIDA', 'MSC', 'TUI Cruises', 'Hapag-Lloyd', 'Costa', 'Norwegian', 'Royal Caribbean', 'Celebrity'],
}

// ---------------------------------------------------------------------------
// Follow-up presets
// ---------------------------------------------------------------------------

export const FOLLOW_UP_PRESETS = [
  { label: 'Morgen', days: 1 },
  { label: 'In 3 Tagen', days: 3 },
  { label: 'Naechste Woche', days: 7 },
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

export type UserRole = 'user' | 'admin' | 'sales_agent'
