'use client'

// ============================================================================
// Art Guide Portal – Supabase Data Hooks
// All data fetching and mutation logic for the CMS
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from './supabase-client'
import type {
  Museum, Artwork, ArtworkStatus, ImportJob, ImportItem,
  ImportMode, ImportSourceType, ImportTargetType, Lang, DashboardStats
} from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ'

// ============================================================================
// useMuseum – load the museum for the current user
// ============================================================================
export function useMuseum() {
  const [museum, setMuseum] = useState<Museum | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMuseum(null); setLoading(false); return }

      // Get museum via cms_members join
      const { data, error: err } = await supabase
        .from('ag_cms_members')
        .select('museum_id, ag_museums(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (err) {
        // Fallback: try direct museum ownership
        const { data: direct, error: err2 } = await supabase
          .from('ag_museums')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .single()
        if (err2) throw err2
        setMuseum(direct as Museum)
      } else {
        setMuseum((data as any).ag_museums as Museum)
      }
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden des Museums')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { museum, loading, error, reload: load }
}

// ============================================================================
// useArtworks – list artworks for a museum
// ============================================================================
export function useArtworks(museumId: string | null | undefined, opts?: {
  status?: ArtworkStatus | 'all'
  search?: string
  roomId?: string
  limit?: number
  offset?: number
}) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!museumId) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      let query = supabase
        .from('ag_artworks')
        .select('*, room:ag_rooms(id, name), venue:ag_venues(id, name)', { count: 'exact' })
        .eq('museum_id', museumId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (opts?.status && opts.status !== 'all') {
        query = query.eq('status', opts.status)
      }
      if (opts?.search) {
        query = query.or(`artist_name.ilike.%${opts.search}%,inventory_number.ilike.%${opts.search}%`)
      }
      if (opts?.roomId) {
        query = query.eq('room_id', opts.roomId)
      }
      if (opts?.limit) {
        query = query.limit(opts.limit)
      }
      if (opts?.offset) {
        query = query.range(opts.offset, (opts.offset + (opts.limit || 50)) - 1)
      }

      const { data, error: err, count } = await query
      if (err) throw err
      setArtworks((data || []) as Artwork[])
      setTotal(count || 0)
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Kunstwerke')
    } finally {
      setLoading(false)
    }
  }, [museumId, opts?.status, opts?.search, opts?.roomId, opts?.limit, opts?.offset])

  useEffect(() => { load() }, [load])

  return { artworks, total, loading, error, reload: load }
}

// ============================================================================
// useArtwork – single artwork with all details
// ============================================================================
export function useArtwork(artworkId: string | null | undefined) {
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!artworkId) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('ag_artworks')
        .select('*, room:ag_rooms(id, name), venue:ag_venues(id, name), audio_files:ag_audio_files(*), images:ag_artwork_images(*)')
        .eq('id', artworkId)
        .single()
      if (err) throw err
      setArtwork(data as Artwork)
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden des Kunstwerks')
    } finally {
      setLoading(false)
    }
  }, [artworkId])

  useEffect(() => { load() }, [load])

  const update = useCallback(async (updates: Partial<Artwork>) => {
    if (!artworkId) return
    const supabase = createClient()
    const { error: err } = await supabase
      .from('ag_artworks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', artworkId)
    if (err) throw err
    await load()
  }, [artworkId, load])

  return { artwork, loading, error, reload: load, update }
}

// ============================================================================
// useImportJobs – list import jobs for a museum
// ============================================================================
export function useImportJobs(museumId: string | null | undefined) {
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!museumId) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('ag_import_jobs')
        .select('*')
        .eq('museum_id', museumId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (err) throw err
      setJobs((data || []) as ImportJob[])
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden der Import-Jobs')
    } finally {
      setLoading(false)
    }
  }, [museumId])

  useEffect(() => { load() }, [load])

  return { jobs, loading, error, reload: load }
}

// ============================================================================
// useImportJob – single import job with items
// ============================================================================
export function useImportJob(jobId: string | null | undefined) {
  const [job, setJob] = useState<ImportJob | null>(null)
  const [items, setItems] = useState<ImportItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!jobId) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const [jobRes, itemsRes] = await Promise.all([
        supabase.from('ag_import_jobs').select('*').eq('id', jobId).single(),
        supabase.from('ag_import_items').select('*').eq('job_id', jobId).order('row_number', { ascending: true }).limit(500),
      ])
      if (jobRes.error) throw jobRes.error
      setJob(jobRes.data as ImportJob)
      setItems((itemsRes.data || []) as ImportItem[])
    } catch (e: any) {
      setError(e.message || 'Fehler beim Laden des Import-Jobs')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => { load() }, [load])

  // Subscribe to realtime updates on the job
  useEffect(() => {
    if (!jobId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`import-job-${jobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ag_import_jobs',
        filter: `id=eq.${jobId}`,
      }, (payload) => {
        setJob(payload.new as ImportJob)
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ag_import_items',
        filter: `job_id=eq.${jobId}`,
      }, () => {
        load()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [jobId, load])

  const updateItemStatus = useCallback(async (itemId: string, status: ImportItem['status'], notes?: string) => {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('ag_import_items')
      .update({ status, review_notes: notes || null })
      .eq('id', itemId)
    if (err) throw err
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i))
  }, [])

  return { job, items, loading, error, reload: load, updateItemStatus }
}

// ============================================================================
// useDashboardStats – aggregated stats for the dashboard
// ============================================================================
export function useDashboardStats(museumId: string | null | undefined) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!museumId) return
    setLoading(true)
    const supabase = createClient()

    Promise.all([
      supabase.from('ag_artworks').select('status', { count: 'exact', head: false }).eq('museum_id', museumId),
      supabase.from('ag_artworks').select('id', { count: 'exact', head: true }).eq('museum_id', museumId).eq('status', 'published'),
      supabase.from('ag_artworks').select('id', { count: 'exact', head: true }).eq('museum_id', museumId).eq('status', 'draft'),
      supabase.from('ag_artworks').select('id', { count: 'exact', head: true }).eq('museum_id', museumId).eq('status', 'review'),
      supabase.from('ag_import_jobs').select('id', { count: 'exact', head: true }).eq('museum_id', museumId),
      supabase.from('ag_import_jobs').select('id', { count: 'exact', head: true }).eq('museum_id', museumId).eq('status', 'completed'),
    ]).then(([all, published, draft, review, jobs, jobsDone]) => {
      setStats({
        artworks_total: all.count || 0,
        artworks_published: published.count || 0,
        artworks_draft: draft.count || 0,
        artworks_review: review.count || 0,
        audio_files_total: 0,
        import_jobs_total: jobs.count || 0,
        import_jobs_completed: jobsDone.count || 0,
        visitors_total: 0,
        scans_total: 0,
      })
    }).finally(() => setLoading(false))
  }, [museumId])

  return { stats, loading }
}

// ============================================================================
// importActions – upload file, trigger analysis, trigger enrichment
// ============================================================================
export const importActions = {
  /**
   * Upload a file to Supabase Storage and create an import job
   */
  async uploadAndCreateJob(params: {
    museumId: string
    file: File
    importMode: ImportMode
    targetType: ImportTargetType
  }): Promise<ImportJob> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Nicht eingeloggt')

    // 1. Upload file to storage
    const ext = params.file.name.split('.').pop()?.toLowerCase() || 'bin'
    const storagePath = `imports/${params.museumId}/${Date.now()}_${params.file.name}`
    const { error: uploadErr } = await supabase.storage
      .from('artguide-imports')
      .upload(storagePath, params.file, { upsert: false })
    if (uploadErr) throw uploadErr

    // 2. Determine source type
    const sourceType: ImportSourceType =
      ext === 'csv' ? 'csv' :
      ext === 'xlsx' || ext === 'xls' ? 'excel' :
      ext === 'pdf' ? 'pdf' :
      'manual'

    // 3. Create import job
    const { data: job, error: jobErr } = await supabase
      .from('ag_import_jobs')
      .insert({
        museum_id: params.museumId,
        created_by: user.id,
        source_type: sourceType,
        source_files: [{
          name: params.file.name,
          storage_path: storagePath,
          size_bytes: params.file.size,
          mime_type: params.file.type,
          uploaded_at: new Date().toISOString(),
        }],
        target_type: params.targetType,
        import_mode: params.importMode,
        status: 'uploaded',
      })
      .select()
      .single()
    if (jobErr) throw jobErr
    return job as ImportJob
  },

  /**
   * Trigger AI analysis via Edge Function
   */
  async triggerAnalysis(jobId: string): Promise<void> {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/content-extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ job_id: jobId, action: 'analyze' }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Analyse fehlgeschlagen: ${err}`)
    }
  },

  /**
   * Save field mapping and trigger enrichment
   */
  async saveMapping(jobId: string, fieldMapping: Record<string, string>): Promise<void> {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('ag_import_jobs')
      .update({ field_mapping: fieldMapping, status: 'mapping' })
      .eq('id', jobId)
    if (err) throw err
  },

  /**
   * Trigger AI enrichment via Edge Function
   */
  async triggerEnrichment(jobId: string, config: {
    languages: Lang[]
    enrichments: string[]
    generateAudio: boolean
  }): Promise<void> {
    const supabase = createClient()
    // Update enrichment config
    const { error: updateErr } = await supabase
      .from('ag_import_jobs')
      .update({
        status: 'enriching',
        enrichment_config: {
          generate_descriptions: true,
          description_levels: config.enrichments,
          languages: config.languages,
          generate_audio: config.generateAudio,
          generate_fun_facts: config.enrichments.includes('fun_facts'),
          generate_historical_context: config.enrichments.includes('historical_context'),
          auto_categorize: true,
          fetch_external_data: true,
        }
      })
      .eq('id', jobId)
    if (updateErr) throw updateErr

    // Call enrichment Edge Function
    const res = await fetch(`${SUPABASE_URL}/functions/v1/content-enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ job_id: jobId }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anreicherung fehlgeschlagen: ${err}`)
    }
  },

  /**
   * Finalize import: create artworks from approved items
   */
  async finalizeImport(jobId: string): Promise<{ imported: number; errors: number }> {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/content-extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ job_id: jobId, action: 'import' }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Import fehlgeschlagen: ${err}`)
    }
    return res.json()
  },
}

// ============================================================================
// artworkActions – create, update, publish, generate QR, generate audio
// ============================================================================
export const artworkActions = {
  async create(museumId: string, data: Partial<Artwork>): Promise<Artwork> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: artwork, error: err } = await supabase
      .from('ag_artworks')
      .insert({ ...data, museum_id: museumId, created_by: user?.id })
      .select()
      .single()
    if (err) throw err
    return artwork as Artwork
  },

  async update(artworkId: string, data: Partial<Artwork>): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error: err } = await supabase
      .from('ag_artworks')
      .update({ ...data, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq('id', artworkId)
    if (err) throw err
  },

  async publish(artworkId: string): Promise<void> {
    await artworkActions.update(artworkId, {
      status: 'published',
      published_at: new Date().toISOString(),
    })
  },

  async generateQrCode(artworkId: string): Promise<string> {
    const supabase = createClient()
    const qrCode = `ag-${artworkId.replace(/-/g, '').substring(0, 12)}`
    const { error: err } = await supabase
      .from('ag_artworks')
      .update({ qr_code: qrCode })
      .eq('id', artworkId)
    if (err) throw err
    return qrCode
  },

  async generateAudio(artworkId: string, languages: Lang[], field = 'description_standard'): Promise<void> {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/artguide-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        action: 'generate_batch',
        content_ids: [artworkId],
        languages,
        field,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Audio-Generierung fehlgeschlagen: ${err}`)
    }
  },

  async generateAiContent(artworkId: string, field: string, language: Lang): Promise<string> {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/artguide-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        action: 'generate_content',
        artwork_id: artworkId,
        target_field: field,
        language,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`KI-Generierung fehlgeschlagen: ${err}`)
    }
    const data = await res.json()
    return data.content || ''
  },
}
