// Fintutto World — Visitor Profile Manager
// Manages the universal visitor profile: load, save, sync, onboarding
// Works offline-first with localStorage cache

import { supabase } from '../supabase'
import type { UniversalVisitorProfile, AgeGroup, KnowledgeLevel, BudgetLevel, MobilityLevel, TravelMode, GroupSize } from './types'

const PROFILE_CACHE_KEY = 'fw_visitor_profile'

// ============================================================================
// Profile CRUD
// ============================================================================

/** Get or create the visitor profile for the current user */
export async function getOrCreateProfile(): Promise<UniversalVisitorProfile | null> {
  // Try cache first
  const cached = getCachedProfile()

  try {
    const { data, error } = await supabase.rpc('fw_get_or_create_profile')

    if (error) {
      console.warn('[FW Profile] RPC failed:', error.message)
      return cached
    }

    if (!data) return cached

    const profile = mapDbToProfile(data)
    cacheProfile(profile)
    return profile
  } catch {
    // Offline — return cached
    return cached
  }
}

/** Update profile fields */
export async function updateProfile(
  profileId: string,
  updates: Partial<ProfileUpdateFields>,
): Promise<boolean> {
  const dbUpdates = mapUpdateToDb(updates)

  const { error } = await supabase
    .from('fw_visitor_profiles')
    .update(dbUpdates)
    .eq('id', profileId)

  if (error) {
    console.warn('[FW Profile] Update failed:', error.message)
    return false
  }

  // Update cache
  const cached = getCachedProfile()
  if (cached && cached.id === profileId) {
    const merged = { ...cached, ...updates }
    cacheProfile(merged as UniversalVisitorProfile)
  }

  return true
}

/** Update current location */
export async function updateLocation(
  profileId: string,
  lat: number,
  lng: number,
): Promise<void> {
  await supabase
    .from('fw_visitor_profiles')
    .update({
      current_lat: lat,
      current_lng: lng,
      current_location_updated_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    })
    .eq('id', profileId)
}

/** Update current context (what museum/city/region the visitor is in) */
export async function updateContext(
  profileId: string,
  contextType: string,
  contextId: string,
  venueId?: string,
  roomId?: string,
): Promise<void> {
  await supabase
    .from('fw_visitor_profiles')
    .update({
      current_context_type: contextType,
      current_context_id: contextId,
      current_venue_id: venueId || null,
      current_room_id: roomId || null,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', profileId)
}

/** Set travel context */
export async function updateTravelContext(
  profileId: string,
  travel: {
    mode: TravelMode
    startDate?: string
    endDate?: string
    partySize?: number
    withChildren?: boolean
    childrenAges?: number[]
  },
): Promise<void> {
  await supabase
    .from('fw_visitor_profiles')
    .update({
      travel_mode: travel.mode,
      travel_start_date: travel.startDate || null,
      travel_end_date: travel.endDate || null,
      travel_party_size: travel.partySize ?? 1,
      travel_with_children: travel.withChildren ?? false,
      travel_children_ages: travel.childrenAges ?? [],
    })
    .eq('id', profileId)
}

/** Mark onboarding as completed */
export async function completeOnboarding(profileId: string): Promise<void> {
  await supabase
    .from('fw_visitor_profiles')
    .update({
      onboarding_completed: true,
      onboarding_step: 99,
    })
    .eq('id', profileId)
}

/** Increment visit/interaction counters */
export async function incrementCounters(
  profileId: string,
  counters: { visits?: number; pois?: number; conversations?: number },
): Promise<void> {
  // Use RPC or raw SQL for atomic increment would be ideal,
  // but for now we read-modify-write
  const { data } = await supabase
    .from('fw_visitor_profiles')
    .select('total_visits, total_pois_viewed, total_ai_conversations')
    .eq('id', profileId)
    .single()

  if (!data) return

  await supabase
    .from('fw_visitor_profiles')
    .update({
      total_visits: (data.total_visits || 0) + (counters.visits || 0),
      total_pois_viewed: (data.total_pois_viewed || 0) + (counters.pois || 0),
      total_ai_conversations: (data.total_ai_conversations || 0) + (counters.conversations || 0),
      last_active_at: new Date().toISOString(),
    })
    .eq('id', profileId)
}

// ============================================================================
// Cache (offline-first)
// ============================================================================

function cacheProfile(profile: UniversalVisitorProfile): void {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
  } catch { /* quota exceeded */ }
}

export function getCachedProfile(): UniversalVisitorProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UniversalVisitorProfile
  } catch {
    return null
  }
}

export function clearCachedProfile(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY)
  } catch { /* */ }
}

// ============================================================================
// DB ↔ TypeScript Mapping
// ============================================================================

interface ProfileUpdateFields {
  displayName: string | null
  preferredSalutation: string | null
  ageGroup: AgeGroup
  primaryLanguage: string
  secondaryLanguages: string[]
  knowledgeLevel: KnowledgeLevel
  interests: string[]
  favoriteCategories: string[]
  dietaryPreferences: string[]
  budgetLevel: BudgetLevel
  mobilityLevel: MobilityLevel
  accessibilityNeeds: string[]
  preferredTourDepth: 'quick' | 'standard' | 'deep_dive'
  preferredContentStyle: string
  preferredGroupSize: GroupSize
  typicalVisitDurationMinutes: number | null
  aiPersonalityTone: string
  aiDetailLevel: string
  aiIncludeAnecdotes: boolean
  aiIncludeComparisons: boolean
  aiProactiveSuggestions: boolean
  aiQuestionFrequency: string
  notificationsEnabled: boolean
  notifyNearbyPois: boolean
  notifyNearbyOffers: boolean
  notifyTimeWarnings: boolean
  notifyRecommendations: boolean
  notificationRadiusMeters: number
  notificationCooldownMinutes: number
  preferredVoiceGender: string
  preferredVoiceAge: string
  audioSpeed: number
  autoPlayAudio: boolean
}

// Row shape matches the fw_visitor_profiles table columns (snake_case)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToProfile(row: any): UniversalVisitorProfile {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    preferredSalutation: row.preferred_salutation,
    avatarUrl: row.avatar_url,
    ageGroup: row.age_group || 'adult',
    birthYear: row.birth_year,
    gender: row.gender,
    countryOfOrigin: row.country_of_origin,
    countryOfResidence: row.country_of_residence,
    primaryLanguage: row.primary_language || 'de',
    secondaryLanguages: row.secondary_languages || [],
    uiLanguage: row.ui_language || 'de',
    knowledgeLevel: row.knowledge_level || 'casual',
    interests: row.interests || [],
    favoriteCategories: row.favorite_categories || [],
    favoriteEpochs: row.favorite_epochs || [],
    favoriteArtists: row.favorite_artists || [],
    dietaryPreferences: row.dietary_preferences || [],
    budgetLevel: row.budget_level || 'medium',
    mobilityLevel: row.mobility_level || 'full',
    accessibilityNeeds: row.accessibility_needs || [],
    preferredTourDepth: row.preferred_tour_depth || 'standard',
    preferredContentStyle: row.preferred_content_style || 'narrative',
    preferredGroupSize: row.preferred_group_size || 'solo',
    typicalVisitDurationMinutes: row.typical_visit_duration_minutes,
    prefersIndoor: row.prefers_indoor ?? true,
    prefersOutdoor: row.prefers_outdoor ?? true,
    preferredVoiceGender: row.preferred_voice_gender || 'female',
    preferredVoiceAge: row.preferred_voice_age || 'middle',
    preferredVoicePreset: row.preferred_voice_preset,
    audioSpeed: Number(row.audio_speed) || 1.0,
    autoPlayAudio: row.auto_play_audio ?? true,
    aiPersonalityTone: row.ai_personality_tone || 'warm',
    aiDetailLevel: row.ai_detail_level || 'standard',
    aiIncludeAnecdotes: row.ai_include_anecdotes ?? true,
    aiIncludeComparisons: row.ai_include_comparisons ?? true,
    aiIncludeTechnique: row.ai_include_technique ?? false,
    aiChildMode: row.ai_child_mode ?? false,
    aiProactiveSuggestions: row.ai_proactive_suggestions ?? true,
    aiQuestionFrequency: row.ai_question_frequency || 'moderate',
    notificationsEnabled: row.notifications_enabled ?? true,
    notifyNearbyPois: row.notify_nearby_pois ?? true,
    notifyNearbyOffers: row.notify_nearby_offers ?? true,
    notifyTimeWarnings: row.notify_time_warnings ?? true,
    notifyRecommendations: row.notify_recommendations ?? true,
    notificationRadiusMeters: row.notification_radius_meters ?? 100,
    notificationCooldownMinutes: row.notification_cooldown_minutes ?? 5,
    currentLat: row.current_lat,
    currentLng: row.current_lng,
    currentContextType: row.current_context_type,
    currentContextId: row.current_context_id,
    travelMode: row.travel_mode,
    travelStartDate: row.travel_start_date,
    travelEndDate: row.travel_end_date,
    travelPartySize: row.travel_party_size ?? 1,
    travelWithChildren: row.travel_with_children ?? false,
    travelChildrenAges: row.travel_children_ages || [],
    onboardingCompleted: row.onboarding_completed ?? false,
    totalVisits: row.total_visits ?? 0,
    totalPoisViewed: row.total_pois_viewed ?? 0,
    totalAiConversations: row.total_ai_conversations ?? 0,
    lastActiveAt: row.last_active_at || row.created_at,
  }
}

function mapUpdateToDb(updates: Partial<ProfileUpdateFields>): Record<string, unknown> {
  const map: Record<string, string> = {
    displayName: 'display_name',
    preferredSalutation: 'preferred_salutation',
    ageGroup: 'age_group',
    primaryLanguage: 'primary_language',
    secondaryLanguages: 'secondary_languages',
    knowledgeLevel: 'knowledge_level',
    interests: 'interests',
    favoriteCategories: 'favorite_categories',
    dietaryPreferences: 'dietary_preferences',
    budgetLevel: 'budget_level',
    mobilityLevel: 'mobility_level',
    accessibilityNeeds: 'accessibility_needs',
    preferredTourDepth: 'preferred_tour_depth',
    preferredContentStyle: 'preferred_content_style',
    preferredGroupSize: 'preferred_group_size',
    typicalVisitDurationMinutes: 'typical_visit_duration_minutes',
    aiPersonalityTone: 'ai_personality_tone',
    aiDetailLevel: 'ai_detail_level',
    aiIncludeAnecdotes: 'ai_include_anecdotes',
    aiIncludeComparisons: 'ai_include_comparisons',
    aiProactiveSuggestions: 'ai_proactive_suggestions',
    aiQuestionFrequency: 'ai_question_frequency',
    notificationsEnabled: 'notifications_enabled',
    notifyNearbyPois: 'notify_nearby_pois',
    notifyNearbyOffers: 'notify_nearby_offers',
    notifyTimeWarnings: 'notify_time_warnings',
    notifyRecommendations: 'notify_recommendations',
    notificationRadiusMeters: 'notification_radius_meters',
    notificationCooldownMinutes: 'notification_cooldown_minutes',
    preferredVoiceGender: 'preferred_voice_gender',
    preferredVoiceAge: 'preferred_voice_age',
    audioSpeed: 'audio_speed',
    autoPlayAudio: 'auto_play_audio',
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = map[key]
    if (dbKey) result[dbKey] = value
  }
  result['updated_at'] = new Date().toISOString()
  return result
}
