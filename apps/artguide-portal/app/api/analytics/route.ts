import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/analytics?range=7d|30d|90d
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '30d'
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30

  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { data, error } = await supabaseAdmin
      .from('ag_analytics_daily')
      .select('*')
      .gte('date', since)
      .order('date', { ascending: true })
    if (error) throw error
    return NextResponse.json({ analytics: data || [], demo: false })
  } catch {
    // Return realistic demo data
    return NextResponse.json({ analytics: generateDemoAnalytics(days), demo: true })
  }
}

function generateDemoAnalytics(days: number) {
  const data = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const base = isWeekend ? 85 : 42
    const visitors = Math.floor(base + Math.random() * 40)
    data.push({
      date: date.toISOString().split('T')[0],
      visitors_total: visitors,
      visitors_app: Math.floor(visitors * 0.45),
      visitors_qr: Math.floor(visitors * 0.38),
      visitors_web: Math.floor(visitors * 0.17),
      audio_plays: Math.floor(visitors * 1.8),
      avg_session_minutes: Math.round((12 + Math.random() * 8) * 10) / 10,
      artworks_viewed: Math.floor(visitors * 3.2),
      tours_started: Math.floor(visitors * 0.28),
      tours_completed: Math.floor(visitors * 0.19),
    })
  }
  return data
}
