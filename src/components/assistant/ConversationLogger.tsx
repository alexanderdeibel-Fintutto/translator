/**
 * ConversationLogger — DSGVO-konformes Gesprächs-Protokoll
 *
 * Speichert Gesprächs-METADATEN (kein Inhalt!) für:
 * - Übergabe an Kollegen
 * - Qualitätssicherung
 * - Statistiken (wie viele Gespräche, welche Sprachen)
 *
 * DSGVO-Konformität:
 * - Opt-in: Mitarbeiter muss explizit zustimmen
 * - Kein Gesprächsinhalt wird gespeichert
 * - Automatische Löschung nach 90 Tagen
 * - Mitarbeiter kann Protokolle jederzeit löschen
 *
 * Verwendung:
 * const logger = useConversationLogger()
 * logger.start({ context: 'hotel-checkin', guestLang: 'fr' })
 * logger.trackSmartReply()
 * logger.trackPhrase()
 * logger.end({ handoverNote: '...', followUpTasks: [...] })
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Shield, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ── Typen ────────────────────────────────────────────────────────────────────

export interface ConversationLogEntry {
  id: string
  started_at: string
  ended_at?: string
  duration_seconds?: number
  staff_language: string
  guest_language?: string
  context_template?: string
  message_count: number
  handover_note?: string
  follow_up_tasks: string[]
  smart_replies_used: number
  phrases_used: number
  emergency_triggered: boolean
  delete_after: string
}

interface StartOptions {
  context?: string
  guestLang?: string
  staffLang?: string
  teamId?: string
  location?: string
}

interface EndOptions {
  messageCount: number
  handoverNote?: string
  followUpTasks?: string[]
  smartRepliesUsed?: number
  phrasesUsed?: number
  emergencyTriggered?: boolean
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useConversationLogger() {
  const { user } = useUser()
  const [logId, setLogId] = useState<string | null>(null)
  const [consent, setConsent] = useState<boolean>(() => {
    return localStorage.getItem('fintutto_log_consent') === 'true'
  })
  const startTimeRef = useRef<number>(0)
  const countersRef = useRef({ smartReplies: 0, phrases: 0, emergency: false })

  const start = useCallback(async (opts: StartOptions = {}) => {
    if (!consent || !user) return
    countersRef.current = { smartReplies: 0, phrases: 0, emergency: false }
    startTimeRef.current = Date.now()
    try {
      const { data, error } = await supabase
        .from('conversation_logs')
        .insert({
          staff_user_id: user.id,
          team_id: opts.teamId || user.user_metadata?.team_id,
          location: opts.location,
          staff_language: opts.staffLang || 'de',
          guest_language: opts.guestLang,
          context_template: opts.context,
          staff_consent: true,
        })
        .select('id')
        .single()
      if (error) throw error
      setLogId(data.id)
    } catch (e) {
      // Protokollierung schlägt still fehl — Gespräch läuft trotzdem
      console.warn('Protokollierung fehlgeschlagen:', e)
    }
  }, [consent, user])

  const trackSmartReply = useCallback(() => {
    countersRef.current.smartReplies++
  }, [])

  const trackPhrase = useCallback(() => {
    countersRef.current.phrases++
  }, [])

  const trackEmergency = useCallback(() => {
    countersRef.current.emergency = true
  }, [])

  const end = useCallback(async (opts: EndOptions) => {
    if (!logId) return
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    try {
      await supabase
        .from('conversation_logs')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
          message_count: opts.messageCount,
          handover_note: opts.handoverNote,
          follow_up_tasks: opts.followUpTasks || [],
          smart_replies_used: opts.smartRepliesUsed ?? countersRef.current.smartReplies,
          phrases_used: opts.phrasesUsed ?? countersRef.current.phrases,
          emergency_triggered: opts.emergencyTriggered ?? countersRef.current.emergency,
        })
        .eq('id', logId)
      setLogId(null)
    } catch (e) {
      console.warn('Protokoll-Ende fehlgeschlagen:', e)
    }
  }, [logId])

  const updateConsent = useCallback((value: boolean) => {
    setConsent(value)
    localStorage.setItem('fintutto_log_consent', String(value))
  }, [])

  return {
    logId,
    consent,
    setConsent: updateConsent,
    start,
    end,
    trackSmartReply,
    trackPhrase,
    trackEmergency,
  }
}

// ── Einwilligungs-Banner ─────────────────────────────────────────────────────

export function ConsentBanner({ onAccept, onDecline }: {
  onAccept: () => void
  onDecline: () => void
}) {
  return (
    <Card className="p-4 border-blue-500/30 bg-blue-500/5 space-y-3">
      <div className="flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm">Gesprächs-Protokoll aktivieren?</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Wir speichern <strong>keine Gesprächsinhalte</strong> — nur Metadaten wie Dauer,
            Sprache und Anzahl der Nachrichten. Protokolle werden nach 90 Tagen automatisch
            gelöscht. Sie können jederzeit widerrufen.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAccept} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
          <Shield className="h-3.5 w-3.5" />
          Aktivieren
        </Button>
        <Button variant="ghost" size="sm" onClick={onDecline}>
          Nein danke
        </Button>
      </div>
    </Card>
  )
}

// ── Protokoll-Liste ──────────────────────────────────────────────────────────

export function ConversationLogList() {
  const { user } = useUser()
  const [logs, setLogs] = useState<ConversationLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    loadLogs()
  }, [user])

  async function loadLogs() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('conversation_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50)
      if (error) throw error
      setLogs(data || [])
    } finally {
      setLoading(false)
    }
  }

  async function deleteLog(id: string) {
    if (!confirm('Protokoll-Eintrag löschen?')) return
    try {
      const { error } = await supabase.from('conversation_logs').delete().eq('id', id)
      if (error) throw error
      setLogs(prev => prev.filter(l => l.id !== id))
      toast.success('Protokoll gelöscht')
    } catch (e: any) {
      toast.error('Fehler: ' + e.message)
    }
  }

  async function deleteAllLogs() {
    if (!confirm('Alle Protokolle unwiderruflich löschen?')) return
    try {
      const { error } = await supabase
        .from('conversation_logs')
        .delete()
        .eq('staff_user_id', user?.id)
      if (error) throw error
      setLogs([])
      toast.success('Alle Protokolle gelöscht')
    } catch (e: any) {
      toast.error('Fehler: ' + e.message)
    }
  }

  function formatDuration(seconds?: number) {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground text-sm">Laden...</div>

  if (logs.length === 0) return (
    <div className="text-center py-8 text-muted-foreground text-sm">
      Noch keine Protokolle. Protokollierung ist aktiviert — das nächste Gespräch wird erfasst.
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{logs.length} Protokolle</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteAllLogs}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Alle löschen
        </Button>
      </div>

      {logs.map(log => (
        <Card key={log.id} className="overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
            className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-left">
                <div className="text-sm font-medium">
                  {log.context_template
                    ? log.context_template.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : 'Allgemeines Gespräch'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(log.started_at)} · {formatDuration(log.duration_seconds)} · {log.message_count} Nachrichten
                  {log.guest_language && ` · ${log.guest_language.toUpperCase()}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {log.emergency_triggered && (
                <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                  Notfall
                </span>
              )}
              {expanded === log.id ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {expanded === log.id && (
            <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Smart Replies genutzt:</span>
                  <span className="ml-1 font-medium">{log.smart_replies_used}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phrasen genutzt:</span>
                  <span className="ml-1 font-medium">{log.phrases_used}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Automatische Löschung:</span>
                  <span className="ml-1 font-medium">
                    {new Date(log.delete_after).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>

              {log.handover_note && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Übergabe-Notiz:</div>
                  <div className="text-xs bg-muted rounded-lg p-2 whitespace-pre-wrap">
                    {log.handover_note}
                  </div>
                </div>
              )}

              {log.follow_up_tasks && log.follow_up_tasks.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Folgeaufgaben:</div>
                  <ul className="space-y-1">
                    {log.follow_up_tasks.map((task, i) => (
                      <li key={i} className="text-xs flex items-start gap-1.5">
                        <span className="text-muted-foreground">☐</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteLog(log.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-1.5 w-full"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Diesen Eintrag löschen
              </Button>
            </div>
          )}
        </Card>
      ))}

      <p className="text-xs text-center text-muted-foreground">
        <Shield className="h-3 w-3 inline mr-1" />
        Alle Einträge werden automatisch nach 90 Tagen gelöscht. Kein Gesprächsinhalt gespeichert.
      </p>
    </div>
  )
}
