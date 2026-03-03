import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Building, Ship, Edit, Send, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { fetchLead, fetchNotes, updateLead } from '@/lib/admin-api'
import { PIPELINE_STAGES, SEGMENT_TAG_PRESETS, type Lead, type LeadNote, type PipelineStage } from '@/lib/admin-types'
import NoteForm from './NoteForm'
import NoteTimeline from './NoteTimeline'
import InviteGenerator from './InviteGenerator'
import EmailComposer from './EmailComposer'
import LeadConvert from './LeadConvert'
import LeadForm from './LeadForm'

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [convertOpen, setConvertOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([fetchLead(id), fetchNotes(id)])
      .then(([l, n]) => {
        setLead(l)
        setNotes(n)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleStageChange(stage: PipelineStage) {
    if (!lead) return
    await updateLead(lead.id, { pipeline_stage: stage })
    setLead({ ...lead, pipeline_stage: stage })
  }

  async function toggleTag(tag: string) {
    if (!lead) return
    const newTags = lead.tags.includes(tag)
      ? lead.tags.filter(t => t !== tag)
      : [...lead.tags, tag]
    await updateLead(lead.id, { tags: newTags })
    setLead({ ...lead, tags: newTags })
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Lade Lead...</div>
  }
  if (!lead) {
    return <div className="text-sm text-destructive py-8 text-center">Lead nicht gefunden</div>
  }

  const stageInfo = PIPELINE_STAGES.find(s => s.id === lead.pipeline_stage)
  const availableTags = [
    ...SEGMENT_TAG_PRESETS.all,
    ...(SEGMENT_TAG_PRESETS[lead.segment] ?? []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/leads">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{lead.name}</h2>
          {lead.company && <div className="text-sm text-muted-foreground">{lead.company}</div>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
          <Edit className="h-3.5 w-3.5" /> Bearbeiten
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEmailOpen(true)} className="gap-1.5">
          <Send className="h-3.5 w-3.5" /> E-Mail
        </Button>
        {lead.pipeline_stage === 'gewonnen' && !lead.converted_user_id && (
          <Button size="sm" onClick={() => setConvertOpen(true)} className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Konvertieren
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: Info + Pipeline */}
        <Card className="p-4 space-y-4 md:col-span-1">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{lead.company}</span>
              </div>
            )}
            {lead.fleet_size && (
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span>{lead.fleet_size} Schiffe</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Pipeline stage */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Pipeline-Stufe</div>
            <Select value={lead.pipeline_stage} onValueChange={v => handleStageChange(v as PipelineStage)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', stageInfo?.color ?? 'bg-gray-400')} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', s.color)} />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Tags</div>
            <div className="flex flex-wrap gap-1">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={lead.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Invite */}
          <InviteGenerator
            leadId={lead.id}
            segment={lead.segment}
            existingToken={lead.invite_token}
            onTokenGenerated={token => setLead({ ...lead, invite_token: token, pipeline_stage: 'eingeladen' })}
          />
        </Card>

        {/* Right: Notes */}
        <Card className="p-4 space-y-4 md:col-span-2">
          <h3 className="text-sm font-semibold">Notizen & Aktivitaeten</h3>
          <NoteForm leadId={lead.id} onCreated={note => setNotes(prev => [note, ...prev])} />
          <Separator />
          <NoteTimeline notes={notes} />
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lead bearbeiten</DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={lead}
            onSaved={updated => {
              setLead(updated)
              setEditing(false)
            }}
            onCancel={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Email composer */}
      <EmailComposer
        lead={lead}
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSent={note => setNotes(prev => [note, ...prev])}
      />

      {/* Lead conversion */}
      <LeadConvert
        lead={lead}
        open={convertOpen}
        onOpenChange={setConvertOpen}
        onConverted={userId => setLead(prev => prev ? { ...prev, converted_user_id: userId, converted_at: new Date().toISOString() } : prev)}
      />
    </div>
  )
}
