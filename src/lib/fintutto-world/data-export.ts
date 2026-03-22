// DSGVO Art. 20 — Data Export for Visitors
// Exports all visitor data as downloadable JSON

import { supabase } from '@/lib/supabase'

export interface ExportedData {
  profile: Record<string, unknown> | null
  visits: Record<string, unknown>[]
  interactions: Record<string, unknown>[]
  dialogs: Record<string, unknown>[]
  favorites: Record<string, unknown>[]
  notifications: Record<string, unknown>[]
  exportedAt: string
}

/**
 * Export all data for the current visitor (DSGVO Art. 20).
 */
export async function exportVisitorData(visitorId: string): Promise<ExportedData> {
  const [profileRes, visitsRes, interactionsRes, dialogsRes, favoritesRes, notificationsRes] = await Promise.all([
    supabase.from('fw_visitor_profiles').select('*').eq('id', visitorId).single(),
    supabase.from('fw_visit_history').select('*').eq('visitor_id', visitorId).order('started_at', { ascending: false }),
    supabase.from('fw_poi_interactions').select('*').eq('visitor_id', visitorId).order('created_at', { ascending: false }),
    supabase.from('fw_ai_dialogs').select('*').eq('visitor_id', visitorId).order('created_at', { ascending: false }),
    supabase.from('fw_favorites').select('*').eq('visitor_id', visitorId),
    supabase.from('fw_notifications').select('*').eq('visitor_id', visitorId).order('created_at', { ascending: false }),
  ])

  return {
    profile: profileRes.data || null,
    visits: visitsRes.data || [],
    interactions: interactionsRes.data || [],
    dialogs: dialogsRes.data || [],
    favorites: favoritesRes.data || [],
    notifications: notificationsRes.data || [],
    exportedAt: new Date().toISOString(),
  }
}

/**
 * Download exported data as JSON file.
 */
export function downloadExportedData(data: ExportedData, filename?: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `visitor-data-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Request data deletion (DSGVO Art. 17 — Right to Erasure).
 */
export async function requestDataDeletion(visitorId: string): Promise<{ success: boolean; error?: string }> {
  // Delete in reverse dependency order
  const tables = ['fw_notifications', 'fw_favorites', 'fw_ai_dialogs', 'fw_poi_interactions', 'fw_visit_history', 'fw_visitor_profiles']

  for (const table of tables) {
    const col = table === 'fw_visitor_profiles' ? 'id' : 'visitor_id'
    const { error } = await supabase.from(table).delete().eq(col, visitorId)
    if (error) return { success: false, error: `Failed to delete from ${table}: ${error.message}` }
  }

  return { success: true }
}
