// Fintutto Art Guide — Core Type Definitions
// Shared between visitor app, CMS portal, and API

// ============================================================================
// Museum & Venue
// ============================================================================

export type MultilingualText = Record<string, string> // { de: "...", en: "...", ... }

export interface Museum {
  id: string
  name: string
  slug: string
  description: MultilingualText
  logo_url: string | null
  cover_image_url: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: MuseumAddress
  opening_hours: Record<string, { open: string; close: string }>
  tier_id: ArtGuideTierId
  default_language: string
  supported_languages: string[]
  positioning_mode: PositioningMode
  branding: MuseumBranding
  white_label_config: WhiteLabelConfig | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MuseumAddress {
  street?: string
  city?: string
  zip?: string
  country?: string
  lat?: number
  lng?: number
}

export interface MuseumBranding {
  primaryColor?: string
  accentColor?: string
  fontFamily?: string
  headerStyle?: 'default' | 'minimal' | 'immersive'
}

export interface WhiteLabelConfig {
  appName: string
  bundleId: string
  appStoreId?: string
  playStoreId?: string
  splashScreenUrl?: string
  iconUrl?: string
  poweredByVisible: boolean // "powered by Fintutto Art Guide"
}

export type PositioningMode = 'manual' | 'qr' | 'ble' | 'wifi' | 'gps'

export type VenueType = 'indoor' | 'outdoor' | 'mixed'

export interface Venue {
  id: string
  museum_id: string
  name: MultilingualText
  description: MultilingualText
  venue_type: VenueType
  address: MuseumAddress
  center_lat: number | null
  center_lng: number | null
  bounds: GeoJSON.Polygon | null
  map_style_url: string | null
  sort_order: number
  is_active: boolean
}

export interface Floor {
  id: string
  venue_id: string
  name: MultilingualText
  floor_number: number
  floorplan_url: string | null
  floorplan_width: number | null
  floorplan_height: number | null
  sort_order: number
  is_active: boolean
}

export interface Room {
  id: string
  floor_id: string | null
  venue_id: string
  name: MultilingualText
  description: MultilingualText
  floorplan_x: number | null
  floorplan_y: number | null
  floorplan_polygon: Array<{ x: number; y: number }> | null
  gps_polygon: GeoJSON.Polygon | null
  sort_order: number
  is_active: boolean
}

// ============================================================================
// Artworks
// ============================================================================

export type ArtworkStatus = 'draft' | 'review' | 'published' | 'archived'

export interface Artwork {
  id: string
  museum_id: string
  room_id: string | null
  venue_id: string | null
  inventory_number: string | null
  title: MultilingualText
  artist_name: string | null
  artist_birth_year: number | null
  artist_death_year: number | null
  year_created: string | null
  medium: string | null
  dimensions: string | null
  style: string | null
  epoch: string | null
  origin: string | null

  // Position
  position_on_floorplan: { x: number; y: number } | null
  position_gps: { lat: number; lng: number } | null
  position_description: MultilingualText

  // Content layers (personalization selects the right one)
  description_brief: MultilingualText
  description_standard: MultilingualText
  description_detailed: MultilingualText
  description_children: MultilingualText
  description_youth: MultilingualText
  fun_facts: MultilingualText
  historical_context: MultilingualText
  technique_details: MultilingualText

  // AI
  ai_generated_at: string | null
  ai_base_knowledge: Record<string, unknown> | null

  // Identification
  qr_code: string | null
  nfc_tag_id: string | null

  // Status
  status: ArtworkStatus
  is_highlight: boolean
  sort_order: number
  tags: string[]
  published_at: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface ArtworkMedia {
  id: string
  artwork_id: string
  media_type: 'image' | 'video' | 'audio' | 'model_3d'
  url: string
  thumbnail_url: string | null
  caption: MultilingualText
  alt_text: MultilingualText
  sort_order: number
  is_primary: boolean
  width: number | null
  height: number | null
}

// ============================================================================
// Tours
// ============================================================================

export type TourType = 'curated' | 'ai_generated' | 'thematic'
export type TargetAudience = 'general' | 'children' | 'youth' | 'expert' | 'accessibility'
export type DifficultyLevel = 'quick' | 'standard' | 'deep_dive'

export interface Tour {
  id: string
  museum_id: string
  title: MultilingualText
  description: MultilingualText
  cover_image_url: string | null
  tour_type: TourType
  target_audience: TargetAudience
  estimated_duration_minutes: number
  difficulty_level: DifficultyLevel
  tags: string[]
  status: ArtworkStatus
  is_featured: boolean
  stops?: TourStop[]
}

export interface TourStop {
  id: string
  tour_id: string
  artwork_id: string
  stop_number: number
  transition_text: MultilingualText
  custom_narration: MultilingualText
  duration_seconds: number
  artwork?: Artwork // populated on fetch
}

// ============================================================================
// Visitor Personalization (the heart of the experience)
// ============================================================================

export type AgeGroup = 'child' | 'youth' | 'young_adult' | 'adult' | 'senior'
export type KnowledgeLevel = 'beginner' | 'casual' | 'enthusiast' | 'expert' | 'professional'
export type ContentStyle = 'factual' | 'narrative' | 'storytelling' | 'academic'
export type AiTone = 'formal' | 'warm' | 'casual' | 'enthusiastic' | 'academic'
export type AiDetailLevel = 'minimal' | 'standard' | 'detailed' | 'exhaustive'
export type VoiceGender = 'male' | 'female' | 'neutral'
export type VoiceAge = 'child' | 'young' | 'middle' | 'mature'

export interface VisitorProfile {
  id: string
  user_id: string | null
  museum_id: string | null

  // Demographics
  display_name: string | null
  preferred_salutation: string | null
  age_group: AgeGroup
  gender: string | null
  birth_year: number | null

  // Knowledge
  knowledge_level: KnowledgeLevel
  interests: string[]
  favorite_epochs: string[]
  favorite_artists: string[]
  accessibility_needs: string[]

  // Visit prefs
  typical_visit_duration_minutes: number | null
  preferred_tour_depth: DifficultyLevel
  preferred_content_style: ContentStyle
  language: string
  secondary_languages: string[]

  // Voice
  preferred_voice_gender: VoiceGender
  preferred_voice_age: VoiceAge
  preferred_voice_preset: string | null
  audio_speed: number
  auto_play_audio: boolean

  // AI
  ai_personality_tone: AiTone
  ai_detail_level: AiDetailLevel
  ai_include_anecdotes: boolean
  ai_include_comparisons: boolean
  ai_include_technique: boolean
  ai_child_mode: boolean

  // Session state
  current_museum_id: string | null
  current_venue_id: string | null
  current_room_id: string | null
  active_tour_id: string | null
}

/** Context object sent to AI for personalized responses */
export interface PersonalizationContext {
  age_group: AgeGroup
  knowledge_level: KnowledgeLevel
  preferred_salutation: string | null
  content_style: ContentStyle
  tour_depth: DifficultyLevel
  language: string
  ai_tone: AiTone
  ai_detail_level: AiDetailLevel
  include_anecdotes: boolean
  include_comparisons: boolean
  include_technique: boolean
  child_mode: boolean
  accessibility_needs: string[]
  voice_gender: VoiceGender
  voice_age: VoiceAge
  voice_preset: string | null
  audio_speed: number
}

// ============================================================================
// CMS Roles
// ============================================================================

export type MuseumRoleId = 'museum_admin' | 'redakteur' | 'rechercheur' | 'fotograf' | 'buchhaltung'

export interface MuseumRole {
  id: MuseumRoleId
  name: MultilingualText
  description: MultilingualText
  permissions: string[]
  is_system: boolean
}

export interface MuseumUser {
  id: string
  museum_id: string
  user_id: string
  role_id: MuseumRoleId
  display_name: string | null
  avatar_url: string | null
  is_active: boolean
}

// Permission strings
export type Permission =
  | 'artworks.read' | 'artworks.write' | 'artworks.publish' | 'artworks.delete'
  | 'tours.read' | 'tours.write' | 'tours.publish' | 'tours.delete'
  | 'media.read' | 'media.write' | 'media.delete'
  | 'categories.read' | 'categories.write'
  | 'ai.generate'
  | 'analytics.read' | 'analytics.export'
  | 'billing.read' | 'billing.manage'
  | 'users.read' | 'users.write' | 'users.invite'
  | 'settings.read' | 'settings.write'
  | 'positioning.read' | 'positioning.write'
  | '*' // admin wildcard

// ============================================================================
// Positioning
// ============================================================================

export interface Beacon {
  id: string
  museum_id: string
  venue_id: string
  room_id: string | null
  beacon_uuid: string
  major: number
  minor: number
  label: string | null
  floor_id: string | null
  position_x: number | null
  position_y: number | null
  tx_power: number
  signal_threshold: number
  is_active: boolean
}

export interface GpsZone {
  id: string
  museum_id: string
  venue_id: string
  room_id: string | null
  name: MultilingualText
  zone_type: 'area' | 'point' | 'path'
  geometry: GeoJSON.Geometry
  center_lat: number
  center_lng: number
  trigger_radius_meters: number
  trigger_artwork_id: string | null
  trigger_action: 'notify' | 'auto_play' | 'show_info'
  notification_text: MultilingualText
  is_active: boolean
}

export interface PositioningConfig {
  venue_id: string
  methods_enabled: PositioningMode[]
  primary_method: PositioningMode
  ble_scan_interval_ms: number
  ble_smoothing_window: number
  wifi_scan_interval_ms: number
  gps_accuracy_threshold_meters: number
  gps_update_interval_ms: number
  auto_trigger_enabled: boolean
  proximity_threshold_meters: number
}

// ============================================================================
// Analytics
// ============================================================================

export interface VisitSummary {
  id: string
  visitor_id: string
  museum_id: string
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  artworks_viewed: number
  audio_plays: number
  tour_completed: boolean
  overall_rating: number | null
}

export interface ArtworkViewEvent {
  artwork_id: string
  viewed_at: string
  duration_seconds: number | null
  detection_method: string
  audio_played: boolean
  ai_chat_started: boolean
  favorited: boolean
  rating: number | null
}

// ============================================================================
// AI Tour Suggestions
// ============================================================================

export interface AiTourSuggestion {
  id: string
  museum_id: string
  title: MultilingualText
  description: MultilingualText
  target_audience: TargetAudience
  estimated_duration_minutes: number
  suggested_stops: Array<{
    artwork_id: string
    reason: string
    narration_hint: string
  }>
  theme: string | null
  reasoning: string | null
  status: 'suggested' | 'accepted' | 'rejected' | 'converted'
  converted_tour_id: string | null
}

// ============================================================================
// GeoJSON helper types (minimal, no external dep needed)
// ============================================================================

export declare namespace GeoJSON {
  interface Point {
    type: 'Point'
    coordinates: [number, number]
  }
  interface Polygon {
    type: 'Polygon'
    coordinates: Array<Array<[number, number]>>
  }
  interface LineString {
    type: 'LineString'
    coordinates: Array<[number, number]>
  }
  type Geometry = Point | Polygon | LineString
}

// ============================================================================
// Art Guide Tier IDs
// ============================================================================

export type ArtGuideTierId =
  | 'artguide_starter'
  | 'artguide_professional'
  | 'artguide_enterprise'
