// API key validation for incoming events
import { createHash } from 'crypto'
import { supabaseAdmin } from './supabase-admin'

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function validateApiKey(key: string | null): Promise<boolean> {
  if (!key) return false

  const hash = hashApiKey(key)
  const { data } = await supabaseAdmin
    .from('analytics_api_keys')
    .select('id, is_active')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .single()

  if (data) {
    // Update last_used_at (fire and forget)
    supabaseAdmin
      .from('analytics_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id)
      .then()
  }

  return !!data
}

// Helper: Generate and register a new API key
export async function createApiKey(name: string, source: string): Promise<string> {
  const key = `fta_${crypto.randomUUID().replace(/-/g, '')}`
  const hash = hashApiKey(key)

  await supabaseAdmin.from('analytics_api_keys').insert({
    key_hash: hash,
    name,
    source,
  })

  return key // Return the raw key — this is the only time it's visible
}
