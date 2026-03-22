// Fintutto World — Status Timeline
// Zeigt die Aenderungshistorie eines Content-Eintrags
// Visualisiert Status-Wechsel, Bearbeitungen und KI-Aktionen chronologisch

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock, FileText, Send, Archive, Sparkles, Languages,
  Image, Volume2, Edit3, User, Bot, Loader2, RefreshCw,
  CheckCircle2, AlertCircle, ArrowRight,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ───────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string
  content_id: string
  event_type: 'status_change' | 'content_edit' | 'ai_enrich' | 'ai_translate' | 'media_upload' | 'audio_generate' | 'created' | 'note'
  from_value?: string
  to_value?: string
  field_name?: string
  details?: string
  actor_type: 'user' | 'system' | 'ai'
  actor_name?: string
  created_at: string
}

interface StatusTimelineProps {
  /** Content item ID */
  contentId: string
  /** Max events to show (default 20) */
  limit?: number
  /** Compact mode for embedding in cards */
  compact?: boolean
}

// ── Event display config ────────────────────────────────────────────

const EVENT_CONFIG: Record<string, {
  icon: typeof Clock
  label: string
  color: string
  bgColor: string
}> = {
  status_change: { icon: Send, label: 'Status geaendert', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  content_edit: { icon: Edit3, label: 'Inhalt bearbeitet', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  ai_enrich: { icon: Sparkles, label: 'KI-Anreicherung', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ai_translate: { icon: Languages, label: 'KI-Uebersetzung', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  media_upload: { icon: Image, label: 'Medien hochgeladen', color: 'text-green-600', bgColor: 'bg-green-100' },
  audio_generate: { icon: Volume2, label: 'Audio generiert', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  created: { icon: FileText, label: 'Erstellt', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  note: { icon: AlertCircle, label: 'Notiz', color: 'text-orange-600', bgColor: 'bg-orange-100' },
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  review: 'Review',
  published: 'Live',
  archived: 'Archiviert',
}

// ── Component ───────────────────────────────────────────────────────

export default function StatusTimeline({ contentId, limit = 20, compact = false }: StatusTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (contentId) loadTimeline()
  }, [contentId])

  async function loadTimeline() {
    setLoading(true)

    // Try loading from fw_content_timeline table
    const { data, error } = await supabase
      .from('fw_content_timeline')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!error && data && data.length > 0) {
      setEvents(data as TimelineEvent[])
    } else {
      // Fallback: construct timeline from content item metadata
      const { data: item } = await supabase
        .from('fw_content_items')
        .select('id, status, created_at, updated_at, ai_generated_at, ai_auto_translate_status, cover_image_url')
        .eq('id', contentId)
        .single()

      if (item) {
        const fallbackEvents: TimelineEvent[] = []

        // Created event
        fallbackEvents.push({
          id: `${item.id}-created`,
          content_id: item.id,
          event_type: 'created',
          to_value: 'draft',
          actor_type: 'system',
          created_at: item.created_at,
        })

        // AI enrichment
        if (item.ai_generated_at) {
          fallbackEvents.push({
            id: `${item.id}-ai`,
            content_id: item.id,
            event_type: 'ai_enrich',
            details: 'KI-Inhalte generiert',
            actor_type: 'ai',
            actor_name: 'Claude Sonnet',
            created_at: item.ai_generated_at,
          })
        }

        // AI translation
        if (item.ai_auto_translate_status === 'completed') {
          fallbackEvents.push({
            id: `${item.id}-translate`,
            content_id: item.id,
            event_type: 'ai_translate',
            details: 'Automatische Uebersetzung abgeschlossen',
            actor_type: 'ai',
            created_at: item.updated_at,
          })
        }

        // Media
        if (item.cover_image_url) {
          fallbackEvents.push({
            id: `${item.id}-media`,
            content_id: item.id,
            event_type: 'media_upload',
            details: 'Titelbild gesetzt',
            actor_type: 'user',
            created_at: item.updated_at,
          })
        }

        // Current status
        if (item.status !== 'draft') {
          fallbackEvents.push({
            id: `${item.id}-status`,
            content_id: item.id,
            event_type: 'status_change',
            from_value: 'draft',
            to_value: item.status,
            actor_type: 'user',
            created_at: item.updated_at,
          })
        }

        // Sort descending
        fallbackEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setEvents(fallbackEvents)
      }
    }

    setLoading(false)
  }

  // ── Render helpers ────────────────────────────────────────────────

  function renderEventContent(event: TimelineEvent) {
    const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.note

    switch (event.event_type) {
      case 'status_change':
        return (
          <span className="text-sm">
            Status:{' '}
            <Badge variant="outline" className="text-[10px]">
              {STATUS_LABELS[event.from_value || ''] || event.from_value || '?'}
            </Badge>
            <ArrowRight className="h-3 w-3 inline mx-1" />
            <Badge variant="default" className="text-[10px]">
              {STATUS_LABELS[event.to_value || ''] || event.to_value || '?'}
            </Badge>
          </span>
        )

      case 'content_edit':
        return (
          <span className="text-sm">
            {event.field_name ? `Feld "${event.field_name}" bearbeitet` : 'Inhalt bearbeitet'}
            {event.details && <span className="text-muted-foreground"> — {event.details}</span>}
          </span>
        )

      case 'ai_enrich':
      case 'ai_translate':
        return (
          <span className="text-sm">
            {config.label}
            {event.details && <span className="text-muted-foreground"> — {event.details}</span>}
          </span>
        )

      default:
        return (
          <span className="text-sm">
            {config.label}
            {event.details && <span className="text-muted-foreground"> — {event.details}</span>}
          </span>
        )
    }
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    return d.toLocaleDateString('de-AT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ── Loading state ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={`text-center ${compact ? 'py-4' : 'py-8'}`}>
        <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Noch keine Aenderungen erfasst.</p>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Aenderungsverlauf
          </h3>
          <Button variant="ghost" size="sm" onClick={loadTimeline}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Aktualisieren
          </Button>
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

        <div className="space-y-3">
          {events.map((event, idx) => {
            const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.note
            const Icon = config.icon
            const ActorIcon = event.actor_type === 'ai' ? Bot : event.actor_type === 'system' ? CheckCircle2 : User

            return (
              <div key={event.id} className="relative flex items-start gap-3 pl-0">
                {/* Icon dot */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} flex-shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${compact ? 'pb-1' : 'pb-2'}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderEventContent(event)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{formatDate(event.created_at)}</span>
                    <span className="flex items-center gap-0.5">
                      <ActorIcon className="h-3 w-3" />
                      {event.actor_name || (event.actor_type === 'ai' ? 'KI' : event.actor_type === 'system' ? 'System' : 'Benutzer')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Helper: Log timeline event ──────────────────────────────────────

export async function logTimelineEvent(event: Omit<TimelineEvent, 'id' | 'created_at'>): Promise<void> {
  try {
    await supabase.from('fw_content_timeline').insert({
      content_id: event.content_id,
      event_type: event.event_type,
      from_value: event.from_value || null,
      to_value: event.to_value || null,
      field_name: event.field_name || null,
      details: event.details || null,
      actor_type: event.actor_type,
      actor_name: event.actor_name || null,
    })
  } catch {
    // Non-critical — don't block the main operation
    console.warn('Failed to log timeline event')
  }
}
