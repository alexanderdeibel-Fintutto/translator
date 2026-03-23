// Fintutto Art Guide — BLE Anchor & Indoor Positioning Management
// CRUD for BLE beacons, GPS zones, WiFi fingerprints
// Used by museum admins to configure indoor positioning
//
// Actions:
//   list_anchors      — List all BLE anchors for a venue
//   create_anchor     — Add a new BLE anchor
//   update_anchor     — Update anchor position/config
//   delete_anchor     — Remove an anchor
//   list_zones        — List GPS geofence zones
//   create_zone       — Create a geofence zone
//   update_zone       — Update zone boundaries
//   delete_zone       — Remove a zone
//   calibrate         — Store WiFi fingerprint for a position

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PositioningRequest {
  action: string
  museum_id?: string
  venue_id?: string
  floor_id?: string
  anchor_id?: string
  zone_id?: string
  data?: Record<string, unknown>
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401)

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    // Verify user is staff of this museum
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401)

    const body: PositioningRequest = await req.json()

    // Verify museum access
    if (body.museum_id) {
      const { data: access } = await supabase
        .from('ag_museum_users')
        .select('role_id')
        .eq('museum_id', body.museum_id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!access) return jsonResponse({ error: 'No access to this museum' }, 403)
    }

    switch (body.action) {
      // ── BLE Anchors ──────────────────────────────────────────────────

      case 'list_anchors': {
        let query = supabase.from('ag_ble_anchors').select('*')
        if (body.venue_id) query = query.eq('venue_id', body.venue_id)
        if (body.floor_id) query = query.eq('floor_id', body.floor_id)
        if (body.museum_id) query = query.eq('museum_id', body.museum_id)
        const { data, error } = await query.order('created_at')
        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse(data)
      }

      case 'create_anchor': {
        const d = body.data || {}
        const { data, error } = await supabase.from('ag_ble_anchors').insert({
          museum_id: body.museum_id,
          venue_id: body.venue_id,
          floor_id: body.floor_id,
          uuid: d.uuid,
          major: d.major,
          minor: d.minor,
          label: d.label || null,
          x: d.x || 0,
          y: d.y || 0,
          z: d.z || 0,
          tx_power: d.tx_power || -59,
          signal_propagation_constant: d.signal_propagation_constant || 2.0,
          is_active: true,
          battery_level: d.battery_level || null,
          firmware_version: d.firmware_version || null,
        }).select().single()

        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse(data)
      }

      case 'update_anchor': {
        if (!body.anchor_id) return jsonResponse({ error: 'anchor_id required' }, 400)
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        const d = body.data || {}
        if (d.label !== undefined) updates.label = d.label
        if (d.x !== undefined) updates.x = d.x
        if (d.y !== undefined) updates.y = d.y
        if (d.z !== undefined) updates.z = d.z
        if (d.tx_power !== undefined) updates.tx_power = d.tx_power
        if (d.signal_propagation_constant !== undefined) updates.signal_propagation_constant = d.signal_propagation_constant
        if (d.is_active !== undefined) updates.is_active = d.is_active
        if (d.battery_level !== undefined) updates.battery_level = d.battery_level

        const { data, error } = await supabase
          .from('ag_ble_anchors')
          .update(updates)
          .eq('id', body.anchor_id)
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse(data)
      }

      case 'delete_anchor': {
        if (!body.anchor_id) return jsonResponse({ error: 'anchor_id required' }, 400)
        const { error } = await supabase.from('ag_ble_anchors').delete().eq('id', body.anchor_id)
        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse({ success: true })
      }

      // ── GPS Zones ────────────────────────────────────────────────────

      case 'list_zones': {
        let query = supabase.from('ag_gps_zones').select('*')
        if (body.museum_id) query = query.eq('museum_id', body.museum_id)
        const { data, error } = await query.order('created_at')
        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse(data)
      }

      case 'create_zone': {
        const d = body.data || {}
        const { data, error } = await supabase.from('ag_gps_zones').insert({
          museum_id: body.museum_id,
          label: d.label || 'Zone',
          zone_type: d.zone_type || 'geofence', // geofence, venue_boundary, poi_trigger
          center_lat: d.center_lat,
          center_lng: d.center_lng,
          radius_meters: d.radius_meters || 50,
          polygon: d.polygon || null, // GeoJSON polygon for complex shapes
          trigger_action: d.trigger_action || 'notify', // notify, auto_play, show_info
          linked_content_id: d.linked_content_id || null,
          is_active: true,
        }).select().single()

        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse(data)
      }

      case 'update_zone': {
        if (!body.zone_id) return jsonResponse({ error: 'zone_id required' }, 400)
        const d = body.data || {}
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        for (const key of ['label', 'center_lat', 'center_lng', 'radius_meters', 'polygon', 'trigger_action', 'linked_content_id', 'is_active', 'zone_type']) {
          if (d[key] !== undefined) updates[key] = d[key]
        }

        const { data, error } = await supabase
          .from('ag_gps_zones')
          .update(updates)
          .eq('id', body.zone_id)
          .select()
          .single()

        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse(data)
      }

      case 'delete_zone': {
        if (!body.zone_id) return jsonResponse({ error: 'zone_id required' }, 400)
        const { error } = await supabase.from('ag_gps_zones').delete().eq('id', body.zone_id)
        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse({ success: true })
      }

      // ── WiFi Calibration ─────────────────────────────────────────────

      case 'calibrate': {
        const d = body.data || {}
        const { data, error } = await supabase.from('ag_wifi_fingerprints').insert({
          museum_id: body.museum_id,
          venue_id: body.venue_id,
          floor_id: body.floor_id,
          x: d.x,
          y: d.y,
          bssid_rssi: d.bssid_rssi, // { "AA:BB:CC:DD:EE:FF": -55, ... }
          measured_by: user.id,
        }).select().single()

        if (error) return jsonResponse({ error: error.message }, 400)
        return jsonResponse(data)
      }

      default:
        return jsonResponse({ error: `Unknown action: ${body.action}` }, 400)
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500)
  }
})

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
