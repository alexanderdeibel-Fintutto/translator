import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, QrCode, Users, FileText,
  UserPlus, Plus, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  fetchEventSession,
  fetchSessionParticipants,
  fetchPreTranslations,
  deleteEventSession,
  updateSessionStatus,
} from '@/lib/session-management-api'
import {
  EVENT_SESSION_STATUSES,
  EVENT_SESSION_TYPES,
  PARTICIPANT_ROLES,
  type EventSession,
  type EventSessionStatus,
  type SessionParticipant,
  type PreTranslation,
} from '@/lib/admin-types'
import { LANGUAGES } from '@/lib/languages'
import { getSessionUrl } from '@/lib/session'
import SessionForm from './SessionForm'
import ParticipantForm from './ParticipantForm'
import PreTranslationUpload from './PreTranslationUpload'
import SessionQRCode from '@/components/live/SessionQRCode'

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<EventSession | null>(null)
  const [participants, setParticipants] = useState<SessionParticipant[]>([])
  const [preTranslations, setPreTranslations] = useState<PreTranslation[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showParticipantForm, setShowParticipantForm] = useState(false)
  const [showPreTranslation, setShowPreTranslation] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    participants: true,
    preTranslations: true,
  })

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [sess, parts, docs] = await Promise.all([
        fetchEventSession(id),
        fetchSessionParticipants(id),
        fetchPreTranslations(id),
      ])
      setSession(sess)
      setParticipants(parts)
      setPreTranslations(docs)
    } catch (err) {
      console.error('Load session failed:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  async function handleDelete() {
    if (!session || !confirm('Session wirklich löschen?')) return
    await deleteEventSession(session.id)
    navigate('/admin/sessions')
  }

  async function handleStatusChange(status: EventSessionStatus) {
    if (!session) return
    await updateSessionStatus(session.id, status)
    setSession(prev => prev ? { ...prev, status } : null)
  }

  function toggleSection(key: keyof typeof expandedSections) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Lade Session...</div>
  }

  if (!session) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Session nicht gefunden</div>
  }

  const status = EVENT_SESSION_STATUSES.find(s => s.id === session.status)
  const type = EVENT_SESSION_TYPES.find(t => t.id === session.type)
  const sourceLang = LANGUAGES.find(l => l.code === session.source_language)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 mb-1"
            onClick={() => navigate('/admin/sessions')}>
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Button>
          <h2 className="text-xl font-bold">{session.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{type?.label ?? session.type}</Badge>
            <div className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', status?.color ?? 'bg-gray-400')} />
              <span className="text-sm">{status?.label ?? session.status}</span>
            </div>
            {session.session_code && (
              <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                {session.session_code}
              </code>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {session.session_code && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowQR(true)}>
              <QrCode className="h-4 w-4" /> QR-Code
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowEditForm(true)}>
            <Edit2 className="h-4 w-4" /> Bearbeiten
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" /> Löschen
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Zeitplan</h3>
          {session.scheduled_start ? (
            <>
              <p className="text-sm">
                {new Date(session.scheduled_start).toLocaleDateString('de-DE', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(session.scheduled_start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                {session.scheduled_end && ` - ${new Date(session.scheduled_end).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Noch nicht geplant</p>
          )}
          {session.venue && <p className="text-sm">{session.venue}</p>}
        </Card>

        <Card className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Sprachen</h3>
          <p className="text-sm">Quelle: {sourceLang?.flag} {sourceLang?.name ?? session.source_language}</p>
          <div className="flex flex-wrap gap-1">
            {session.target_languages.map(code => {
              const lang = LANGUAGES.find(l => l.code === code)
              return (
                <Badge key={code} variant="outline" className="text-xs">
                  {lang?.flag} {lang?.name ?? code}
                </Badge>
              )
            })}
            {session.target_languages.length === 0 && (
              <span className="text-sm text-muted-foreground">Noch keine Zielsprachen</span>
            )}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Status ändern</h3>
          <Select value={session.status} onValueChange={v => handleStatusChange(v as EventSessionStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_SESSION_STATUSES.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', s.color)} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {session.description && (
            <p className="text-sm text-muted-foreground">{session.description}</p>
          )}
        </Card>
      </div>

      {/* Participants */}
      <Card className="overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection('participants')}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <h3 className="font-semibold">Teilnehmer ({participants.length})</h3>
          </div>
          {expandedSections.participants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expandedSections.participants && (
          <div className="px-4 pb-4 space-y-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowParticipantForm(true)}>
              <UserPlus className="h-4 w-4" /> Teilnehmer hinzufügen
            </Button>

            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Teilnehmer hinzugefügt
              </p>
            ) : (
              <div className="space-y-2">
                {participants.map(p => {
                  const role = PARTICIPANT_ROLES.find(r => r.id === p.role)
                  return (
                    <div key={p.id} className="flex items-start justify-between border rounded-lg p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{p.name}</span>
                          <Badge variant="secondary" className="text-xs">{role?.label ?? p.role}</Badge>
                        </div>
                        {p.organization && (
                          <p className="text-xs text-muted-foreground">{p.organization}</p>
                        )}
                        {p.email && (
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        )}
                        {p.biography && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.biography}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Pre-Translations */}
      <Card className="overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
          onClick={() => toggleSection('preTranslations')}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <h3 className="font-semibold">Pre-Translation Dokumente ({preTranslations.length})</h3>
          </div>
          {expandedSections.preTranslations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expandedSections.preTranslations && (
          <div className="px-4 pb-4 space-y-3">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowPreTranslation(true)}>
              <Plus className="h-4 w-4" /> Dokument hinzufügen
            </Button>

            {preTranslations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Dokumente hochgeladen. Laden Sie Vorträge, Fragen oder Biografien hoch, um die Übersetzungsqualität zu verbessern und Kosten zu sparen.
              </p>
            ) : (
              <div className="space-y-2">
                {preTranslations.map(doc => {
                  const participant = participants.find(p => p.id === doc.participant_id)
                  const translatedCount = Object.keys(doc.translations).length
                  const targetCount = session.target_languages.length
                  return (
                    <div key={doc.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{doc.title}</span>
                            <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                          </div>
                          {participant && (
                            <p className="text-xs text-muted-foreground">
                              Zugeordnet: {participant.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={doc.translation_status === 'completed' ? 'default' : 'outline'}
                            className={cn(
                              'text-xs',
                              doc.translation_status === 'completed' && 'bg-emerald-500',
                              doc.translation_status === 'error' && 'bg-red-500 text-white',
                              doc.translation_status === 'translating' && 'bg-blue-500 text-white',
                            )}
                          >
                            {doc.translation_status === 'completed' ? 'Fertig' :
                             doc.translation_status === 'translating' ? 'Wird übersetzt...' :
                             doc.translation_status === 'error' ? 'Fehler' : 'Ausstehend'}
                          </Badge>
                          {targetCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {translatedCount}/{targetCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{doc.content}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {session.notes && (
        <Card className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Interne Notizen</h3>
          <p className="text-sm whitespace-pre-wrap">{session.notes}</p>
        </Card>
      )}

      {/* Dialogs */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session bearbeiten</DialogTitle>
          </DialogHeader>
          <SessionForm
            session={session}
            onSaved={updated => {
              setSession(updated)
              setShowEditForm(false)
            }}
            onCancel={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showParticipantForm} onOpenChange={setShowParticipantForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teilnehmer hinzufügen</DialogTitle>
          </DialogHeader>
          <ParticipantForm
            sessionId={session.id}
            onSaved={p => {
              setParticipants(prev => [...prev, p])
              setShowParticipantForm(false)
            }}
            onCancel={() => setShowParticipantForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPreTranslation} onOpenChange={setShowPreTranslation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pre-Translation Dokument hinzufügen</DialogTitle>
          </DialogHeader>
          <PreTranslationUpload
            sessionId={session.id}
            participants={participants}
            sourceLanguage={session.source_language}
            onSaved={doc => {
              setPreTranslations(prev => [doc, ...prev])
              setShowPreTranslation(false)
            }}
            onCancel={() => setShowPreTranslation(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session QR-Code</DialogTitle>
          </DialogHeader>
          {session.session_code && (
            <SessionQRCode
              code={session.session_code}
              sessionUrl={getSessionUrl(session.session_code)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
