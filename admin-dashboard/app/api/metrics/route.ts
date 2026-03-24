// GET /api/metrics — Dashboard metrics endpoint
// Query params: ?range=7d|30d|90d&metric=overview|translations|errors|vitals|sessions
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { validateApiKey } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Validate API key
  const apiKey = request.headers.get('x-api-key')
  const isValid = await validateApiKey(apiKey)
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const range = searchParams.get('range') || '7d'
  const metric = searchParams.get('metric') || 'overview'

  const days = range === '90d' ? 90 : range === '30d' ? 30 : 7
  const since = new Date(Date.now() - days * 86400000).toISOString()

  switch (metric) {
    case 'overview':
      return NextResponse.json(await getOverview(since))
    case 'translations':
      return NextResponse.json(await getTranslationMetrics(since))
    case 'errors':
      return NextResponse.json(await getErrorMetrics(since))
    case 'vitals':
      return NextResponse.json(await getVitalsMetrics(since))
    case 'sessions':
      return NextResponse.json(await getSessionMetrics(since))
    default:
      return NextResponse.json({ error: 'Unknown metric' }, { status: 400 })
  }
}

async function getOverview(since: string) {
  const [totalEvents, uniqueSessions, totalErrors, translations] = await Promise.all([
    supabaseAdmin
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since),
    supabaseAdmin.rpc('count_unique_sessions', { since_date: since }).single(),
    supabaseAdmin
      .from('analytics_errors')
      .select('id', { count: 'exact', head: true })
      .gte('last_seen', since),
    supabaseAdmin
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('event', 'translation')
      .gte('created_at', since),
  ])

  // Daily trend from aggregation table
  const { data: dailyTrend } = await supabaseAdmin
    .from('analytics_daily')
    .select('date, event, count, unique_sessions')
    .gte('date', since.split('T')[0])
    .order('date', { ascending: true })

  return {
    totalEvents: totalEvents.count || 0,
    uniqueSessions: uniqueSessions.data?.count || 0,
    totalErrors: totalErrors.count || 0,
    totalTranslations: translations.count || 0,
    dailyTrend: dailyTrend || [],
  }
}

async function getTranslationMetrics(since: string) {
  const { data: events } = await supabaseAdmin
    .from('analytics_events')
    .select('params, created_at')
    .eq('event', 'translation')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (!events?.length) return { translations: [], byLang: [], byProvider: [], byMode: [] }

  // Aggregate by language pair
  const langMap = new Map<string, number>()
  const providerMap = new Map<string, number>()
  const modeMap = new Map<string, number>()
  const latencies: number[] = []

  for (const e of events) {
    const p = e.params as Record<string, unknown>
    const langPair = `${p.source_lang}→${p.target_lang}`
    langMap.set(langPair, (langMap.get(langPair) || 0) + 1)
    providerMap.set(p.provider as string, (providerMap.get(p.provider as string) || 0) + 1)
    modeMap.set(p.mode as string, (modeMap.get(p.mode as string) || 0) + 1)
    if (p.latency_ms) latencies.push(p.latency_ms as number)
  }

  latencies.sort((a, b) => a - b)

  return {
    total: events.length,
    byLang: [...langMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pair, count]) => ({ pair, count })),
    byProvider: [...providerMap.entries()].map(([name, count]) => ({ name, count })),
    byMode: [...modeMap.entries()].map(([name, count]) => ({ name, count })),
    latency: latencies.length > 0 ? {
      avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
      p50: latencies[Math.floor(latencies.length * 0.5)],
      p95: latencies[Math.floor(latencies.length * 0.95)],
      p99: latencies[Math.floor(latencies.length * 0.99)],
    } : null,
  }
}

async function getErrorMetrics(since: string) {
  const { data: errors } = await supabaseAdmin
    .from('analytics_errors')
    .select('*')
    .gte('last_seen', since)
    .order('last_seen', { ascending: false })
    .limit(100)

  const { data: errorTrend } = await supabaseAdmin
    .from('analytics_daily')
    .select('date, count')
    .eq('event', 'app_error')
    .gte('date', since.split('T')[0])
    .order('date', { ascending: true })

  return {
    errors: errors || [],
    trend: errorTrend || [],
    total: errors?.length || 0,
  }
}

async function getVitalsMetrics(since: string) {
  const metrics = ['LCP', 'CLS', 'INP', 'FCP', 'TTFB']
  const results: Record<string, unknown> = {}

  for (const m of metrics) {
    const { data } = await supabaseAdmin
      .from('analytics_web_vitals')
      .select('value, rating, created_at')
      .eq('metric', m)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500)

    if (!data?.length) {
      results[m] = { avg: null, p75: null, good: 0, needsImprovement: 0, poor: 0 }
      continue
    }

    const values = data.map(d => d.value).sort((a, b) => a - b)
    results[m] = {
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) / 100,
      p75: values[Math.floor(values.length * 0.75)],
      good: data.filter(d => d.rating === 'good').length,
      needsImprovement: data.filter(d => d.rating === 'needs-improvement').length,
      poor: data.filter(d => d.rating === 'poor').length,
      total: data.length,
    }
  }

  return results
}

async function getSessionMetrics(since: string) {
  const { data: sessions } = await supabaseAdmin
    .from('analytics_events')
    .select('params, created_at')
    .eq('event', 'live_session')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500)

  if (!sessions?.length) return { sessions: [], byMode: [], total: 0 }

  const modeMap = new Map<string, number>()
  const actionMap = new Map<string, number>()

  for (const s of sessions) {
    const p = s.params as Record<string, unknown>
    modeMap.set(p.connection_mode as string, (modeMap.get(p.connection_mode as string) || 0) + 1)
    actionMap.set(p.action as string, (actionMap.get(p.action as string) || 0) + 1)
  }

  return {
    total: sessions.length,
    byMode: [...modeMap.entries()].map(([name, count]) => ({ name, count })),
    byAction: [...actionMap.entries()].map(([name, count]) => ({ name, count })),
  }
}
