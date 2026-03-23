// Fintutto Art Guide — Museum API Client
// CRUD operations for all museum entities via Supabase
// Handles permissions, versioning, and audit logging

import { supabase } from '../supabase'
import type {
  Museum, Venue, Floor, Room, Artwork, ArtworkMedia,
  Tour, TourStop, ArtworkStatus, MuseumUser, MuseumRoleId,
  VisitorProfile, AiTourSuggestion, MultilingualText,
} from './types'

// ============================================================================
// Museums
// ============================================================================

export async function getMuseumBySlug(slug: string): Promise<Museum | null> {
  const { data, error } = await supabase
    .from('ag_museums')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data as Museum
}

export async function getMuseumById(id: string): Promise<Museum | null> {
  const { data, error } = await supabase
    .from('ag_museums')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Museum
}

export async function listMuseums(options?: {
  search?: string
  limit?: number
  offset?: number
}): Promise<{ museums: Museum[]; total: number }> {
  let query = supabase
    .from('ag_museums')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('name')

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }
  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1)

  const { data, count, error } = await query
  if (error) return { museums: [], total: 0 }
  return { museums: (data || []) as Museum[], total: count || 0 }
}

export async function updateMuseum(id: string, updates: Partial<Museum>): Promise<Museum | null> {
  const { data, error } = await supabase
    .from('ag_museums')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return null
  return data as Museum
}

// ============================================================================
// Venues, Floors, Rooms
// ============================================================================

export async function getVenues(museumId: string): Promise<Venue[]> {
  const { data } = await supabase
    .from('ag_venues')
    .select('*')
    .eq('museum_id', museumId)
    .eq('is_active', true)
    .order('sort_order')

  return (data || []) as Venue[]
}

export async function getFloors(venueId: string): Promise<Floor[]> {
  const { data } = await supabase
    .from('ag_floors')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true)
    .order('floor_number')

  return (data || []) as Floor[]
}

export async function getRooms(venueId: string): Promise<Room[]> {
  const { data } = await supabase
    .from('ag_rooms')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true)
    .order('sort_order')

  return (data || []) as Room[]
}

export async function createVenue(venue: Partial<Venue>): Promise<Venue | null> {
  const { data, error } = await supabase.from('ag_venues').insert(venue).select().single()
  if (error) return null
  return data as Venue
}

export async function createFloor(floor: Partial<Floor>): Promise<Floor | null> {
  const { data, error } = await supabase.from('ag_floors').insert(floor).select().single()
  if (error) return null
  return data as Floor
}

export async function createRoom(room: Partial<Room>): Promise<Room | null> {
  const { data, error } = await supabase.from('ag_rooms').insert(room).select().single()
  if (error) return null
  return data as Room
}

// ============================================================================
// Artworks (CRUD + workflow)
// ============================================================================

export async function getArtworks(museumId: string, options?: {
  status?: ArtworkStatus
  roomId?: string
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
}): Promise<{ artworks: Artwork[]; total: number }> {
  let query = supabase
    .from('ag_artworks')
    .select('*', { count: 'exact' })
    .eq('museum_id', museumId)
    .order('sort_order')

  if (options?.status) query = query.eq('status', options.status)
  if (options?.roomId) query = query.eq('room_id', options.roomId)
  if (options?.search) {
    query = query.or(`artist_name.ilike.%${options.search}%,inventory_number.ilike.%${options.search}%`)
  }
  if (options?.tags?.length) query = query.overlaps('tags', options.tags)
  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1)

  const { data, count, error } = await query
  if (error) return { artworks: [], total: 0 }
  return { artworks: (data || []) as Artwork[], total: count || 0 }
}

export async function getArtwork(id: string): Promise<Artwork | null> {
  const { data, error } = await supabase.from('ag_artworks').select('*').eq('id', id).single()
  if (error) return null
  return data as Artwork
}

export async function createArtwork(artwork: Partial<Artwork>): Promise<Artwork | null> {
  const user = (await supabase.auth.getUser()).data.user
  const { data, error } = await supabase
    .from('ag_artworks')
    .insert({ ...artwork, created_by: user?.id, updated_by: user?.id })
    .select()
    .single()

  if (error) return null

  // Create initial version
  if (data) {
    await createContentVersion('artwork', data.id, data, 'Erstellt')
  }

  return data as Artwork
}

export async function updateArtwork(id: string, updates: Partial<Artwork>): Promise<Artwork | null> {
  const user = (await supabase.auth.getUser()).data.user
  const { data, error } = await supabase
    .from('ag_artworks')
    .update({ ...updates, updated_by: user?.id })
    .eq('id', id)
    .select()
    .single()

  if (error) return null

  // Create version snapshot
  if (data) {
    await createContentVersion('artwork', id, data, 'Aktualisiert')
  }

  return data as Artwork
}

export async function deleteArtwork(id: string): Promise<boolean> {
  const { error } = await supabase.from('ag_artworks').delete().eq('id', id)
  return !error
}

/** Change artwork status with workflow tracking */
export async function changeArtworkStatus(
  id: string,
  newStatus: ArtworkStatus,
  comment?: string,
): Promise<boolean> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return false

  // Get current status
  const { data: artwork } = await supabase
    .from('ag_artworks')
    .select('status, museum_id')
    .eq('id', id)
    .single()

  if (!artwork) return false

  // Update status
  const updates: Partial<Artwork> = { status: newStatus }
  if (newStatus === 'published') updates.published_at = new Date().toISOString()

  const { error } = await supabase
    .from('ag_artworks')
    .update(updates)
    .eq('id', id)

  if (error) return false

  // Log workflow transition
  await supabase.from('ag_workflow_transitions').insert({
    entity_type: 'artwork',
    entity_id: id,
    from_status: artwork.status,
    to_status: newStatus,
    changed_by: user.id,
    comment,
  })

  // Audit log
  await logAudit(artwork.museum_id, user.id, newStatus === 'published' ? 'publish' : 'update', 'artwork', id, {
    from_status: artwork.status,
    to_status: newStatus,
    comment,
  })

  return true
}

// ============================================================================
// Artwork Media
// ============================================================================

export async function getArtworkMedia(artworkId: string): Promise<ArtworkMedia[]> {
  const { data } = await supabase
    .from('ag_artwork_media')
    .select('*')
    .eq('artwork_id', artworkId)
    .order('sort_order')

  return (data || []) as ArtworkMedia[]
}

export async function uploadArtworkMedia(
  artworkId: string,
  file: File,
  options?: { isPrimary?: boolean; caption?: MultilingualText },
): Promise<ArtworkMedia | null> {
  const user = (await supabase.auth.getUser()).data.user

  // Upload to Supabase Storage
  const ext = file.name.split('.').pop()
  const path = `artworks/${artworkId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('artguide-media')
    .upload(path, file)

  if (uploadError) return null

  const { data: urlData } = supabase.storage
    .from('artguide-media')
    .getPublicUrl(path)

  // Create media record
  const { data, error } = await supabase
    .from('ag_artwork_media')
    .insert({
      artwork_id: artworkId,
      media_type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
      url: urlData.publicUrl,
      is_primary: options?.isPrimary ?? false,
      caption: options?.caption ?? {},
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: user?.id,
    })
    .select()
    .single()

  if (error) return null
  return data as ArtworkMedia
}

// ============================================================================
// Tours
// ============================================================================

export async function getTours(museumId: string, options?: {
  status?: ArtworkStatus
}): Promise<Tour[]> {
  let query = supabase
    .from('ag_tours')
    .select('*, ag_tour_stops(*)')
    .eq('museum_id', museumId)
    .order('created_at', { ascending: false })

  if (options?.status) query = query.eq('status', options.status)

  const { data } = await query
  return (data || []) as Tour[]
}

export async function createTour(tour: Partial<Tour>): Promise<Tour | null> {
  const user = (await supabase.auth.getUser()).data.user
  const { data, error } = await supabase
    .from('ag_tours')
    .insert({ ...tour, created_by: user?.id })
    .select()
    .single()

  if (error) return null
  return data as Tour
}

export async function updateTourStops(tourId: string, stops: Partial<TourStop>[]): Promise<boolean> {
  // Delete existing stops and re-insert
  await supabase.from('ag_tour_stops').delete().eq('tour_id', tourId)

  const stopsWithTour = stops.map((stop, i) => ({
    ...stop,
    tour_id: tourId,
    stop_number: i + 1,
  }))

  const { error } = await supabase.from('ag_tour_stops').insert(stopsWithTour)
  return !error
}

// ============================================================================
// Museum Staff (Team Management)
// ============================================================================

export async function getMuseumStaff(museumId: string): Promise<MuseumUser[]> {
  const { data } = await supabase
    .from('ag_museum_users')
    .select('*, gt_users(email, display_name)')
    .eq('museum_id', museumId)
    .order('created_at')

  return (data || []) as MuseumUser[]
}

export async function inviteStaffMember(
  museumId: string,
  email: string,
  roleId: MuseumRoleId,
): Promise<{ success: boolean; error?: string }> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return { success: false, error: 'Nicht authentifiziert' }

  const { error } = await supabase.from('ag_museum_invites').insert({
    museum_id: museumId,
    email,
    role_id: roleId,
    invited_by: user.id,
  })

  if (error) return { success: false, error: error.message }

  // Fetch museum name for email
  const { data: museum } = await supabase
    .from('ag_museums')
    .select('name')
    .eq('id', museumId)
    .single()

  // Send invitation email via send-email Edge Function
  try {
    await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: `Einladung: ${museum?.name || 'Museum'} — Fintutto Art Guide`,
        body: [
          `Hallo,`,
          ``,
          `Sie wurden als ${roleId} zum Team von "${museum?.name || 'Museum'}" eingeladen.`,
          ``,
          `Bitte registrieren Sie sich unter folgendem Link:`,
          `${window.location.origin}/auth?invite=museum&museum_id=${museumId}&role=${roleId}`,
          ``,
          `Mit freundlichen Gruessen,`,
          `Fintutto Art Guide`,
        ].join('\n'),
      },
    })
  } catch {
    // Email send failure is non-blocking — invite record was already created
    console.warn('[Museum API] Email send failed for invite:', email)
  }

  return { success: true }
}

export async function updateStaffRole(
  museumUserId: string,
  newRoleId: MuseumRoleId,
): Promise<boolean> {
  const { error } = await supabase
    .from('ag_museum_users')
    .update({ role_id: newRoleId })
    .eq('id', museumUserId)

  return !error
}

export async function removeStaffMember(museumUserId: string): Promise<boolean> {
  const { error } = await supabase
    .from('ag_museum_users')
    .update({ is_active: false })
    .eq('id', museumUserId)

  return !error
}

// ============================================================================
// Visitor Profiles
// ============================================================================

export async function getOrCreateVisitorProfile(userId?: string): Promise<VisitorProfile | null> {
  if (userId) {
    const { data } = await supabase
      .from('ag_visitors')
      .select('*')
      .eq('user_id', userId)
      .is('museum_id', null)
      .single()

    if (data) return data as VisitorProfile
  }

  // Create new profile
  const { data, error } = await supabase
    .from('ag_visitors')
    .insert({ user_id: userId || null })
    .select()
    .single()

  if (error) return null
  return data as VisitorProfile
}

export async function updateVisitorProfile(
  visitorId: string,
  updates: Partial<VisitorProfile>,
): Promise<VisitorProfile | null> {
  const { data, error } = await supabase
    .from('ag_visitors')
    .update(updates)
    .eq('id', visitorId)
    .select()
    .single()

  if (error) return null
  return data as VisitorProfile
}

// ============================================================================
// AI Tour Suggestions
// ============================================================================

export async function getTourSuggestions(museumId: string): Promise<AiTourSuggestion[]> {
  const { data } = await supabase
    .from('ag_ai_tour_suggestions')
    .select('*')
    .eq('museum_id', museumId)
    .order('created_at', { ascending: false })

  return (data || []) as AiTourSuggestion[]
}

export async function convertSuggestionToTour(
  suggestion: AiTourSuggestion,
): Promise<Tour | null> {
  const tour = await createTour({
    museum_id: suggestion.museum_id,
    title: suggestion.title,
    description: suggestion.description,
    tour_type: 'ai_generated',
    target_audience: suggestion.target_audience as any,
    estimated_duration_minutes: suggestion.estimated_duration_minutes || 60,
    status: 'draft',
  })

  if (!tour) return null

  // Create stops
  const stops = suggestion.suggested_stops.map((stop, i) => ({
    tour_id: tour.id,
    artwork_id: stop.artwork_id,
    stop_number: i + 1,
    custom_narration: { de: stop.narration_hint },
    duration_seconds: 120,
  }))

  await updateTourStops(tour.id, stops)

  // Mark suggestion as converted
  await supabase
    .from('ag_ai_tour_suggestions')
    .update({ status: 'converted', converted_tour_id: tour.id })
    .eq('id', suggestion.id)

  return tour
}

// ============================================================================
// Analytics
// ============================================================================

export async function getAnalytics(museumId: string, options?: {
  dateFrom?: string
  dateTo?: string
}): Promise<Record<string, unknown>[]> {
  let query = supabase
    .from('ag_analytics_daily')
    .select('*')
    .eq('museum_id', museumId)
    .order('date', { ascending: false })

  if (options?.dateFrom) query = query.gte('date', options.dateFrom)
  if (options?.dateTo) query = query.lte('date', options.dateTo)

  const { data } = await query
  return data || []
}

export async function getTopArtworks(museumId: string, limit = 10): Promise<Array<{ artwork_id: string; views: number; avg_duration: number }>> {
  const { data } = await supabase.rpc('ag_get_top_artworks', {
    p_museum_id: museumId,
    p_limit: limit,
  })

  return data || []
}

// ============================================================================
// Bulk Import
// ============================================================================

export interface BulkImportRow {
  title_de?: string
  title_en?: string
  artist_name?: string
  year_created?: string
  medium?: string
  dimensions?: string
  style?: string
  epoch?: string
  room?: string
  inventory_number?: string
  description_de?: string
  description_en?: string
  tags?: string
}

export async function bulkImportArtworks(
  museumId: string,
  rows: BulkImportRow[],
): Promise<{ imported: number; errors: string[] }> {
  const user = (await supabase.auth.getUser()).data.user
  let imported = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      const artwork: Partial<Artwork> = {
        museum_id: museumId,
        title: {
          ...(row.title_de ? { de: row.title_de } : {}),
          ...(row.title_en ? { en: row.title_en } : {}),
        },
        artist_name: row.artist_name || null,
        year_created: row.year_created || null,
        medium: row.medium || null,
        dimensions: row.dimensions || null,
        style: row.style || null,
        epoch: row.epoch || null,
        inventory_number: row.inventory_number || null,
        description_standard: {
          ...(row.description_de ? { de: row.description_de } : {}),
          ...(row.description_en ? { en: row.description_en } : {}),
        },
        tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
        status: 'draft',
        created_by: user?.id,
        updated_by: user?.id,
      }

      const { error } = await supabase.from('ag_artworks').insert(artwork)
      if (error) {
        errors.push(`Zeile ${i + 1}: ${error.message}`)
      } else {
        imported++
      }
    } catch (err) {
      errors.push(`Zeile ${i + 1}: Unbekannter Fehler`)
    }
  }

  return { imported, errors }
}

/** Parse CSV string into BulkImportRow[] */
export function parseCSV(csvString: string): BulkImportRow[] {
  const lines = csvString.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(';').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))

  return lines.slice(1).map(line => {
    const values = line.split(';').map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      if (values[i]) row[h] = values[i]
    })
    return row as BulkImportRow
  })
}

// ============================================================================
// Content Versioning & Audit
// ============================================================================

async function createContentVersion(
  entityType: string,
  entityId: string,
  data: Record<string, unknown>,
  summary: string,
): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return

  // Get current version number
  const { data: versions } = await supabase
    .from('ag_content_versions')
    .select('version_number')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version_number', { ascending: false })
    .limit(1)

  const nextVersion = (versions?.[0]?.version_number || 0) + 1

  try {
    await supabase.from('ag_content_versions').insert({
      entity_type: entityType,
      entity_id: entityId,
      version_number: nextVersion,
      data,
      changed_by: user.id,
      change_summary: summary,
    })
  } catch { /* non-critical */ }
}

async function logAudit(
  museumId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    await supabase.from('ag_audit_log').insert({
      museum_id: museumId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || {},
    })
  } catch { /* non-critical */ }
}
