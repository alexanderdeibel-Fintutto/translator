import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createNote } from '@/lib/admin-api'
import { NOTE_TYPES, FOLLOW_UP_PRESETS, type NoteType, type LeadNote } from '@/lib/admin-types'
import { useUser } from '@/context/UserContext'

interface NoteFormProps {
  leadId: string
  onCreated: (note: LeadNote) => void
}

export default function NoteForm({ leadId, onCreated }: NoteFormProps) {
  const { user } = useUser()
  const [content, setContent] = useState('')
  const [type, setType] = useState<NoteType>('note')
  const [followUpDays, setFollowUpDays] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    try {
      const followUpAt = followUpDays
        ? new Date(Date.now() + followUpDays * 86_400_000).toISOString()
        : null
      const note = await createNote({
        lead_id: leadId,
        author_id: user?.id ?? null,
        type,
        content: content.trim(),
        follow_up_at: followUpAt,
      })
      onCreated(note)
      setContent('')
      setFollowUpDays(null)
    } catch (err) {
      console.error('Create note failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label>Typ</Label>
          <Select value={type} onValueChange={v => setType(v as NoteType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label>Follow-up</Label>
          <Select value={followUpDays?.toString() ?? '__none__'} onValueChange={v => setFollowUpDays(v === '__none__' ? null : parseInt(v, 10))}>
            <SelectTrigger>
              <SelectValue placeholder="Kein Follow-up" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Kein Follow-up</SelectItem>
              {FOLLOW_UP_PRESETS.map(p => (
                <SelectItem key={p.days} value={p.days.toString()}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Notiz schreiben..."
        rows={3}
      />
      <Button type="submit" size="sm" disabled={saving || !content.trim()}>
        {saving ? 'Speichern...' : 'Notiz hinzufuegen'}
      </Button>
    </form>
  )
}
