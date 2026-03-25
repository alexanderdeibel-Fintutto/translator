// ============================================================================
// Art Guide Portal – TypeScript Types
// Aligned with Supabase schema (migrations 013–026)
// ============================================================================

export type Lang = 'de' | 'en' | 'fr' | 'it' | 'es' | 'nl' | 'pl' | 'cs' | 'zh' | 'ja' | 'ko' | 'ar'
export type MultiLang = Partial<Record<Lang, string>>

// ----------------------------------------------------------------------------
// Museum
// ----------------------------------------------------------------------------
export interface Museum {
  id: string
  name: string
  slug: string
  description: MultiLang
  logo_url: string | null
  cover_image_url: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: {
    street?: string
    city?: string
    zip?: string
    country?: string
    lat?: number
    lng?: number
  }
  tier_id: string
  subscription_status: string
  default_language: Lang
  supported_languages: Lang[]
  positioning_mode: 'manual' | 'qr' | 'ble' | 'wifi' | 'gps'
  branding: {
    primaryColor?: string
    accentColor?: string
    fontFamily?: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------------------
// Artwork
// ----------------------------------------------------------------------------
export type ArtworkStatus = 'draft' | 'review' | 'published' | 'archived'

export interface Artwork {
  id: string
  museum_id: string
  room_id: string | null
  venue_id: string | null
  inventory_number: string | null
  title: MultiLang
  artist_name: string | null
  artist_birth_year: number | null
  artist_death_year: number | null
  year_created: string | null
  medium: string | null
  dimensions: string | null
  style: string | null
  epoch: string | null
  origin: string | null
  position_on_floorplan: { x: number; y: number } | null
  position_gps: { lat: number; lng: number } | null
  position_description: MultiLang
  description_brief: MultiLang
  description_standard: MultiLang
  description_detailed: MultiLang
  description_children: MultiLang
  description_youth: MultiLang
  fun_facts: MultiLang
  historical_context: MultiLang
  technique_details: MultiLang
  ai_generated_at: string | null
  qr_code: string | null
  nfc_tag_id: string | null
  status: ArtworkStatus
  is_highlight: boolean
  sort_order: number
  tags: string[]
  created_by: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // Joined
  room?: { id: string; name: MultiLang } | null
  venue?: { id: string; name: MultiLang } | null
  audio_files?: AudioFile[]
  images?: ArtworkImage[]
}

// ----------------------------------------------------------------------------
// Audio
// ----------------------------------------------------------------------------
export interface AudioFile {
  id: string
  artwork_id: string | null
  language: Lang
  voice_gender: 'male' | 'female'
  content_field: string
  storage_path: string
  public_url: string | null
  duration_seconds: number | null
  file_size_bytes: number | null
  tts_provider: string
  voice_id: string | null
  created_at: string
}

// ----------------------------------------------------------------------------
// Images
// ----------------------------------------------------------------------------
export interface ArtworkImage {
  id: string
  artwork_id: string
  storage_path: string
  public_url: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

// ----------------------------------------------------------------------------
// Import Job
// ----------------------------------------------------------------------------
export type ImportStatus =
  | 'uploaded'
  | 'analyzing'
  | 'mapping'
  | 'enriching'
  | 'review'
  | 'importing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type ImportMode = 'museum' | 'city' | 'conference' | 'fair' | 'region'
export type ImportSourceType = 'csv' | 'excel' | 'pdf' | 'url' | 'api' | 'google_places' | 'osm' | 'manual'
export type ImportTargetType = 'artworks' | 'pois' | 'partners' | 'tours' | 'sessions' | 'exhibitors' | 'speakers'

export interface ImportJob {
  id: string
  museum_id: string | null
  city_id: string | null
  created_by: string | null
  source_type: ImportSourceType
  source_url: string | null
  source_files: Array<{
    name: string
    storage_path: string
    size_bytes: number
    mime_type: string
    uploaded_at: string
  }>
  target_type: ImportTargetType
  import_mode: ImportMode
  status: ImportStatus
  ai_analysis: {
    detected_items?: number
    detected_type?: string
    confidence?: number
    detected_columns?: string[]
    sample_rows?: string[][]
    suggestions?: Record<string, string>
  }
  field_mapping: Record<string, string>
  enrichment_config: {
    generate_descriptions: boolean
    description_levels: string[]
    languages: Lang[]
    generate_audio: boolean
    generate_fun_facts: boolean
    generate_historical_context: boolean
    auto_categorize: boolean
    fetch_external_data: boolean
  }
  items_total: number
  items_analyzed: number
  items_enriched: number
  items_approved: number
  items_imported: number
  items_rejected: number
  error_log: Array<{ message: string; row?: number; timestamp: string }>
  created_at: string
  analyzed_at: string | null
  enriched_at: string | null
  completed_at: string | null
}

export interface ImportItem {
  id: string
  job_id: string
  row_number: number | null
  source_data: Record<string, unknown>
  mapped_data: Record<string, unknown>
  enriched_data: Record<string, unknown>
  ai_generated: Record<string, MultiLang>
  target_entity_type: string | null
  target_entity_id: string | null
  status: 'pending' | 'analyzed' | 'enriched' | 'approved' | 'rejected' | 'imported' | 'error'
  review_notes: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------------------
// Dashboard Stats
// ----------------------------------------------------------------------------
export interface DashboardStats {
  artworks_total: number
  artworks_published: number
  artworks_draft: number
  artworks_review: number
  audio_files_total: number
  import_jobs_total: number
  import_jobs_completed: number
  visitors_total: number
  scans_total: number
}
