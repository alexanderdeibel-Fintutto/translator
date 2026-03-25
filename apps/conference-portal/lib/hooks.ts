'use client'
// ============================================================================
// Conference Portal – Supabase Data Hooks
// ============================================================================
import { useState, useEffect, useCallback } from 'react'
import { createClient } from './supabase-client'
import type { Organization, Conference, ConferenceDashboardStats } from './types'

// ----------------------------------------------------------------------------
// useOrganization – load the organization for the current user
// ----------------------------------------------------------------------------
export function useOrganization() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setOrganization(null); setLoading(false); return }
      const { data, error: err } = await supabase
        .from('cp_organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single()
      if (err && err.code !== 'PGRST116') throw err
      setOrganization(data ?? null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  return { organization, loading, error, reload: load }
}

// ----------------------------------------------------------------------------
// useConferences – list all conferences for the current organization
// ----------------------------------------------------------------------------
export function useConferences(organizationId: string | null) {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!organizationId) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('cp_conferences')
      .select('*')
      .eq('organization_id', organizationId)
      .order('start_date', { ascending: false })
      .then(({ data }) => {
        setConferences(data ?? [])
        setLoading(false)
      })
  }, [organizationId])

  return { conferences, loading }
}

// ----------------------------------------------------------------------------
// useDashboardStats – aggregate stats for the dashboard
// ----------------------------------------------------------------------------
export function useDashboardStats(organizationId: string | null) {
  const [stats, setStats] = useState<ConferenceDashboardStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!organizationId) return
    setLoading(true)
    const supabase = createClient()
    Promise.all([
      supabase.from('cp_sessions').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
      supabase.from('cp_speakers').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
      supabase.from('cp_attendees').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
      supabase.from('cp_translation_sessions').select('minutes_used').eq('organization_id', organizationId),
      supabase.from('cp_import_jobs').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).in('status', ['pending', 'processing']),
    ]).then(([sessions, speakers, attendees, translations, jobs]) => {
      const minutes = (translations.data ?? []).reduce((sum: number, t: { minutes_used: number }) => sum + (t.minutes_used ?? 0), 0)
      setStats({
        sessionsTotal: sessions.count ?? 0,
        sessionsLive: 0,
        speakersTotal: speakers.count ?? 0,
        attendeesTotal: attendees.count ?? 0,
        translationMinutesUsed: minutes,
        importJobsRunning: jobs.count ?? 0,
      })
      setLoading(false)
    })
  }, [organizationId])

  return { stats, loading }
}
