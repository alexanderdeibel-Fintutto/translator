// Fintutto World — Notification Service
// Handles geofence-triggered, time-based, and AI-recommended notifications
// Works across all domains: Museums, Cities, Regions, Cruise Ships
//
// Architecture:
// 1. Location watcher feeds GPS updates → geofence checks
// 2. Nearby POI detection triggers contextual notifications
// 3. AI recommendations trigger proactive suggestions
// 4. Time-based warnings (closing times, tour duration)
// 5. Rate limiting prevents notification fatigue

import { supabase } from '../supabase'

// ============================================================================
// Types
// ============================================================================

export interface NotificationConfig {
  enabled: boolean
  nearbyPois: boolean
  nearbyOffers: boolean
  timeWarnings: boolean
  recommendations: boolean
  radiusMeters: number
  cooldownMinutes: number
  quietHoursStart?: string  // "22:00"
  quietHoursEnd?: string    // "08:00"
}

export interface FwNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  icon?: string
  imageUrl?: string
  // Trigger
  triggerType: 'geofence' | 'time' | 'ai_recommendation' | 'system' | 'schedule'
  triggerPoiType?: string
  triggerPoiId?: string
  triggerLat?: number
  triggerLng?: number
  // Action
  actionType: 'navigate' | 'open_dialog' | 'open_tour' | 'open_offer' | 'dismiss'
  actionTarget?: string
  actionData?: Record<string, unknown>
  // State
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'delivered' | 'read' | 'acted' | 'dismissed' | 'expired'
  createdAt: string
}

export type NotificationType =
  | 'nearby_poi'
  | 'nearby_offer'
  | 'time_warning'
  | 'recommendation'
  | 'tour_suggestion'
  | 'closing_soon'
  | 'weather_alert'
  | 'event_start'
  | 'welcome'
  | 'feedback_request'

// ============================================================================
// Geofence Manager
// ============================================================================

interface GeofenceZone {
  id: string
  lat: number
  lng: number
  radiusMeters: number
  poiType: string
  poiId: string
  poiName: string
  triggerAction: 'notify' | 'auto_play' | 'show_info'
  notificationTitle?: string
  notificationBody?: string
}

interface GeofenceState {
  insideZones: Set<string>
  lastCheck: number
}

const geofenceState: GeofenceState = {
  insideZones: new Set(),
  lastCheck: 0,
}

/** Calculate distance between two GPS coordinates in meters (Haversine) */
export function distanceMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Check which geofence zones the visitor is inside */
export function checkGeofences(
  lat: number,
  lng: number,
  zones: GeofenceZone[],
  radiusOverride?: number,
): { entered: GeofenceZone[]; exited: string[]; inside: GeofenceZone[] } {
  const inside: GeofenceZone[] = []
  const entered: GeofenceZone[] = []
  const exited: string[] = []

  for (const zone of zones) {
    const dist = distanceMeters(lat, lng, zone.lat, zone.lng)
    const radius = radiusOverride ?? zone.radiusMeters
    const isInside = dist <= radius

    if (isInside) {
      inside.push(zone)
      if (!geofenceState.insideZones.has(zone.id)) {
        entered.push(zone)
        geofenceState.insideZones.add(zone.id)
      }
    } else if (geofenceState.insideZones.has(zone.id)) {
      exited.push(zone.id)
      geofenceState.insideZones.delete(zone.id)
    }
  }

  geofenceState.lastCheck = Date.now()
  return { entered, exited, inside }
}

// ============================================================================
// Notification Rate Limiter
// ============================================================================

const notificationTimestamps: Map<string, number> = new Map()

/** Check if we can send a notification (respects cooldown & quiet hours) */
export function canSendNotification(
  dedupKey: string,
  config: NotificationConfig,
): boolean {
  if (!config.enabled) return false

  // Quiet hours check
  if (config.quietHoursStart && config.quietHoursEnd) {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes

    const [startH, startM] = config.quietHoursStart.split(':').map(Number)
    const [endH, endM] = config.quietHoursEnd.split(':').map(Number)
    const startTime = startH * 60 + startM
    const endTime = endH * 60 + endM

    if (startTime > endTime) {
      // Crosses midnight: 22:00 - 08:00
      if (currentTime >= startTime || currentTime < endTime) return false
    } else {
      if (currentTime >= startTime && currentTime < endTime) return false
    }
  }

  // Cooldown check
  const lastSent = notificationTimestamps.get(dedupKey)
  if (lastSent && Date.now() - lastSent < config.cooldownMinutes * 60 * 1000) {
    return false
  }

  return true
}

/** Record that a notification was sent */
export function recordNotificationSent(dedupKey: string): void {
  notificationTimestamps.set(dedupKey)

  // Clean old entries (older than 24h)
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  for (const [key, ts] of notificationTimestamps) {
    if (ts < cutoff) notificationTimestamps.delete(key)
  }
}

// ============================================================================
// Notification Builder
// ============================================================================

/** Build a nearby POI notification */
export function buildNearbyPoiNotification(
  zone: GeofenceZone,
  language: string,
): Omit<FwNotification, 'id' | 'createdAt' | 'status'> {
  const titles: Record<string, string> = {
    de: `${zone.poiName} in der Naehe`,
    en: `${zone.poiName} nearby`,
    fr: `${zone.poiName} a proximite`,
    es: `${zone.poiName} cerca`,
  }

  const bodies: Record<string, string> = {
    de: 'Tippen Sie fuer mehr Informationen und personalisierte Beschreibung.',
    en: 'Tap for more information and personalized description.',
    fr: 'Appuyez pour plus d\'informations et une description personnalisee.',
    es: 'Toque para mas informacion y descripcion personalizada.',
  }

  const langPrefix = language.split('-')[0]

  return {
    type: 'nearby_poi',
    title: titles[langPrefix] || titles.en || zone.poiName,
    body: bodies[langPrefix] || bodies.en || '',
    icon: 'map-pin',
    triggerType: 'geofence',
    triggerPoiType: zone.poiType,
    triggerPoiId: zone.poiId,
    triggerLat: zone.lat,
    triggerLng: zone.lng,
    actionType: 'open_dialog',
    actionTarget: `/${zone.poiType}/${zone.poiId}`,
    actionData: { poiName: zone.poiName },
    priority: 'normal',
  }
}

/** Build a closing-soon warning notification */
export function buildClosingSoonNotification(
  venueName: string,
  minutesLeft: number,
  language: string,
): Omit<FwNotification, 'id' | 'createdAt' | 'status'> {
  const langPrefix = language.split('-')[0]

  const titles: Record<string, string> = {
    de: `${venueName} schliesst in ${minutesLeft} Minuten`,
    en: `${venueName} closes in ${minutesLeft} minutes`,
  }

  const bodies: Record<string, string> = {
    de: minutesLeft <= 15
      ? 'Hier sind die wichtigsten Highlights die Sie noch sehen sollten:'
      : 'Planen Sie Ihren restlichen Besuch.',
    en: minutesLeft <= 15
      ? 'Here are the key highlights you should still see:'
      : 'Plan the rest of your visit.',
  }

  return {
    type: 'closing_soon',
    title: titles[langPrefix] || titles.en || '',
    body: bodies[langPrefix] || bodies.en || '',
    icon: 'clock',
    triggerType: 'time',
    actionType: minutesLeft <= 15 ? 'open_tour' : 'navigate',
    actionTarget: '/highlights',
    priority: minutesLeft <= 15 ? 'high' : 'normal',
  }
}

/** Build an AI recommendation notification */
export function buildRecommendationNotification(
  title: string,
  body: string,
  poiType: string,
  poiId: string,
  actionTarget: string,
): Omit<FwNotification, 'id' | 'createdAt' | 'status'> {
  return {
    type: 'recommendation',
    title,
    body,
    icon: 'sparkles',
    triggerType: 'ai_recommendation',
    triggerPoiType: poiType,
    triggerPoiId: poiId,
    actionType: 'open_dialog',
    actionTarget,
    priority: 'low',
  }
}

// ============================================================================
// Notification Persistence (Supabase)
// ============================================================================

/** Save a notification to the database */
export async function persistNotification(
  visitorId: string,
  notification: Omit<FwNotification, 'id' | 'createdAt' | 'status'>,
  dedupKey?: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('fw_notifications')
    .insert({
      visitor_id: visitorId,
      notification_type: notification.type,
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      image_url: notification.imageUrl,
      trigger_type: notification.triggerType,
      trigger_poi_type: notification.triggerPoiType,
      trigger_poi_id: notification.triggerPoiId,
      trigger_lat: notification.triggerLat,
      trigger_lng: notification.triggerLng,
      trigger_radius_meters: 100,
      action_type: notification.actionType,
      action_target: notification.actionTarget,
      action_data: notification.actionData || {},
      channel: 'in_app',
      priority: notification.priority,
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      dedup_key: dedupKey,
    })
    .select('id')
    .single()

  if (error) {
    console.warn('[Notification] Failed to persist:', error.message)
    return null
  }

  return data?.id ?? null
}

/** Mark a notification as read */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await supabase
    .from('fw_notifications')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('id', notificationId)
}

/** Mark a notification as acted upon */
export async function markNotificationActed(notificationId: string): Promise<void> {
  await supabase
    .from('fw_notifications')
    .update({ status: 'acted', acted_at: new Date().toISOString() })
    .eq('id', notificationId)
}

/** Dismiss a notification */
export async function dismissNotification(notificationId: string): Promise<void> {
  await supabase
    .from('fw_notifications')
    .update({ status: 'dismissed', dismissed_at: new Date().toISOString() })
    .eq('id', notificationId)
}

/** Fetch unread notifications for a visitor */
export async function getUnreadNotifications(
  visitorId: string,
  limit = 20,
): Promise<FwNotification[]> {
  const { data, error } = await supabase
    .from('fw_notifications')
    .select('*')
    .eq('visitor_id', visitorId)
    .in('status', ['delivered', 'pending'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    type: row.notification_type,
    title: row.title,
    body: row.body,
    icon: row.icon,
    imageUrl: row.image_url,
    triggerType: row.trigger_type,
    triggerPoiType: row.trigger_poi_type,
    triggerPoiId: row.trigger_poi_id,
    triggerLat: row.trigger_lat,
    triggerLng: row.trigger_lng,
    actionType: row.action_type,
    actionTarget: row.action_target,
    actionData: row.action_data,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
  }))
}

// ============================================================================
// Location Watcher (ties everything together)
// ============================================================================

let watchId: number | null = null

export interface LocationWatcherCallbacks {
  onNotification: (notification: FwNotification) => void
  onPositionUpdate: (lat: number, lng: number) => void
  onError: (error: GeolocationPositionError) => void
}

/** Start watching location and triggering geofence checks */
export function startLocationWatcher(
  visitorId: string,
  config: NotificationConfig,
  zones: GeofenceZone[],
  callbacks: LocationWatcherCallbacks,
): void {
  if (watchId !== null) return
  if (!navigator.geolocation) {
    console.warn('[Location] Geolocation not available')
    return
  }

  watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude: lat, longitude: lng } = position.coords
      callbacks.onPositionUpdate(lat, lng)

      // Check geofences
      const { entered } = checkGeofences(lat, lng, zones, config.radiusMeters)

      // Trigger notifications for newly entered zones
      for (const zone of entered) {
        const dedupKey = `nearby_${zone.poiType}_${zone.poiId}`

        if (!canSendNotification(dedupKey, config)) continue
        if (!config.nearbyPois && zone.triggerAction === 'notify') continue

        const notifData = buildNearbyPoiNotification(zone, 'de')
        const id = await persistNotification(visitorId, notifData, dedupKey)
        recordNotificationSent(dedupKey)

        if (id) {
          callbacks.onNotification({
            ...notifData,
            id,
            status: 'delivered',
            createdAt: new Date().toISOString(),
          })
        }
      }
    },
    (error) => {
      callbacks.onError(error)
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10_000,
      timeout: 15_000,
    },
  )
}

/** Stop the location watcher */
export function stopLocationWatcher(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  geofenceState.insideZones.clear()
}
