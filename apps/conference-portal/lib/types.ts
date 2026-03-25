// ============================================================================
// Conference Portal – TypeScript Types
// ============================================================================

export type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'nl' | 'pl' | 'cs' | 'zh' | 'ja' | 'ko' | 'ar'
export type MultiLang = Partial<Record<Lang, string>>
export type SessionStatus = 'draft' | 'confirmed' | 'live' | 'done' | 'cancelled'
export type AttendeeStatus = 'registered' | 'checked_in' | 'cancelled'
export type ImportJobStatus = 'pending' | 'processing' | 'done' | 'error'

export interface Organization {
  id: string
  name: string
  slug: string
  description: MultiLang
  logo_url: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: { street?: string; city?: string; zip?: string; country?: string }
  tier_id: string
  created_at: string
  updated_at: string
}

export interface Conference {
  id: string
  organization_id: string
  name: string
  slug: string
  description: MultiLang
  start_date: string
  end_date: string
  venue_name: string | null
  cover_image_url: string | null
  languages: Lang[]
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  conference_id: string
  title: MultiLang
  description: MultiLang
  speaker_ids: string[]
  room: string | null
  track: string | null
  start_time: string
  end_time: string
  date: string
  status: SessionStatus
  languages: Lang[]
  created_at: string
  updated_at: string
}

export interface Speaker {
  id: string
  conference_id: string
  name: string
  title: string | null
  organization: string | null
  bio: MultiLang
  photo_url: string | null
  email: string | null
  created_at: string
}

export interface Attendee {
  id: string
  conference_id: string
  name: string
  email: string
  organization: string | null
  preferred_language: Lang
  status: AttendeeStatus
  checked_in_at: string | null
  created_at: string
}

export interface Room {
  id: string
  organization_id: string
  name: string
  capacity: number | null
  floor: string | null
  features: string[]
  created_at: string
}

export interface TranslationSession {
  id: string
  conference_id: string
  session_id: string | null
  name: string
  source_language: Lang
  target_languages: Lang[]
  status: 'active' | 'paused' | 'ended'
  join_code: string
  minutes_used: number
  started_at: string
  ended_at: string | null
}

export interface ImportJob {
  id: string
  organization_id: string
  conference_id: string | null
  source_type: 'pdf' | 'url' | 'excel' | 'manual'
  source_url: string | null
  status: ImportJobStatus
  progress: number
  result_summary: { sessions_found?: number; speakers_found?: number; errors?: string[] } | null
  created_at: string
  updated_at: string
}

export interface ConferenceDashboardStats {
  sessionsTotal: number
  sessionsLive: number
  speakersTotal: number
  attendeesTotal: number
  translationMinutesUsed: number
  importJobsRunning: number
}
