// Usage Sync — Periodically syncs local usage data to Supabase.
// The local tracker (usage-tracker.ts) is the UI source for instant enforcement.
// The server (Supabase) is the billing authority for invoicing.

import { supabase } from './supabase'
import { getUsage } from './usage-tracker'

let syncInterval: ReturnType<typeof setInterval> | null = null
let lastSyncedAt = 0
const SYNC_INTERVAL_MS = 60_000 // 1 minute

/**
 * Start periodic usage sync to Supabase.
 * Call once when the app starts and the user is authenticated.
 */
export function startUsageSync(userId: string): void {
  if (syncInterval) return

  // Immediate first sync
  syncUsageToServer(userId)

  syncInterval = setInterval(() => {
    syncUsageToServer(userId)
  }, SYNC_INTERVAL_MS)
}

/**
 * Stop usage sync (on logout or unmount).
 */
export function stopUsageSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

/**
 * Force-sync usage now (e.g., before checkout or at session end).
 */
export async function syncUsageNow(userId: string): Promise<void> {
  await syncUsageToServer(userId)
}

async function syncUsageToServer(userId: string): Promise<void> {
  const usage = getUsage()

  // Skip if nothing changed since last sync
  const fingerprint = usage.sessionMinutesUsed + usage.translationsCount + usage.peakListeners
  if (fingerprint === lastSyncedAt) return

  try {
    const { error } = await supabase.rpc('upsert_usage', {
      p_user_id: userId,
      p_session_minutes: usage.sessionMinutesUsed,
      p_translation_chars: usage.translationCharsUsed,
      p_translations: usage.translationsCount,
      p_tts_chars: 0,
      p_stt_minutes: 0,
      p_peak_listeners: usage.peakListeners,
      p_languages: usage.languagesUsed,
    })

    if (error) {
      console.warn('[UsageSync] Failed to sync:', error.message)
      return
    }

    lastSyncedAt = fingerprint
  } catch (err) {
    console.warn('[UsageSync] Network error:', err)
  }
}
