// POST /api/events — Receive batched analytics events from the translator
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { validateApiKey } from '@/lib/auth'

interface IncomingEvent {
  event: string
  params: Record<string, unknown>
  timestamp: number
  sessionId: string
  url: string
  userAgent: string
}

interface EventPayload {
  source: string
  events: IncomingEvent[]
}

export async function POST(request: NextRequest) {
  // 1. Validate API key
  const apiKey = request.headers.get('x-api-key')
  const isValid = await validateApiKey(apiKey)
  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: EventPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.events?.length) {
    return NextResponse.json({ error: 'No events provided' }, { status: 400 })
  }

  // 3. Limit batch size
  const events = body.events.slice(0, 500)

  // 4. Separate events by type for optimized storage
  const regularEvents: Array<Record<string, unknown>> = []
  const errorEvents: Array<Record<string, unknown>> = []
  const vitalEvents: Array<Record<string, unknown>> = []

  const country = request.headers.get('x-vercel-ip-country') || request.geo?.country || null

  for (const evt of events) {
    const base = {
      source: body.source || 'translator',
      session_id: evt.sessionId,
      url: evt.url,
      user_agent: evt.userAgent,
      country,
      created_at: new Date(evt.timestamp).toISOString(),
    }

    if (evt.event === 'app_error') {
      errorEvents.push({
        error_type: evt.params.error_type as string,
        message: (evt.params.error_message as string || '').slice(0, 1000),
        stack: (evt.params.stack as string || '').slice(0, 5000),
        source: evt.params.error_source as string,
        session_id: evt.sessionId,
        url: evt.url,
        user_agent: evt.userAgent,
      })
    } else if (evt.event === 'web_vital_detail') {
      vitalEvents.push({
        metric: evt.params.name as string,
        value: evt.params.value as number,
        rating: evt.params.rating as string,
        session_id: evt.sessionId,
        url: evt.url,
        navigation_type: evt.params.navigationType as string,
        created_at: base.created_at,
      })
    }

    // All events also go to the main events table
    regularEvents.push({
      ...base,
      event: evt.event,
      params: evt.params,
    })
  }

  // 5. Insert in parallel
  const results = await Promise.allSettled([
    regularEvents.length > 0
      ? supabaseAdmin.from('analytics_events').insert(regularEvents)
      : Promise.resolve({ error: null }),
    errorEvents.length > 0
      ? supabaseAdmin.from('analytics_errors').insert(errorEvents)
      : Promise.resolve({ error: null }),
    vitalEvents.length > 0
      ? supabaseAdmin.from('analytics_web_vitals').insert(vitalEvents)
      : Promise.resolve({ error: null }),
  ])

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason)

  if (errors.length > 0) {
    console.error('[Events API] Insert errors:', errors)
    return NextResponse.json(
      { error: 'Partial failure', inserted: events.length - errors.length },
      { status: 207 }
    )
  }

  return NextResponse.json({ ok: true, inserted: events.length })
}
