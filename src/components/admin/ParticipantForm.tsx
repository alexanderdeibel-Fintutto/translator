import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createSessionParticipant } from '@/lib/session-management-api'
import { PARTICIPANT_ROLES, type SessionParticipant, type ParticipantRole } from '@/lib/admin-types'

interface ParticipantFormProps {
  sessionId: string
  onSaved: (participant: SessionParticipant) => void
  onCancel: () => void
}

export default function ParticipantForm({ sessionId, onSaved, onCancel }: ParticipantFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ParticipantRole>('speaker')
  const [organization, setOrganization] = useState('')
  const [biography, setBiography] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const participant = await createSessionParticipant({
        session_id: sessionId,
        name,
        email: email || null,
        role,
        organization: organization || null,
        biography: biography || null,
        notes: notes || null,
        sort_order: 0,
      })
      onSaved(participant)
    } catch (err) {
      console.error('Save participant failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="part-name">Name *</Label>
          <Input id="part-name" value={name} onChange={e => setName(e.target.value)} required
            placeholder="Vor- und Nachname" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="part-role">Rolle</Label>
          <Select value={role} onValueChange={v => setRole(v as ParticipantRole)}>
            <SelectTrigger id="part-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PARTICIPANT_ROLES.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="part-email">E-Mail</Label>
          <Input id="part-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="part-org">Organisation</Label>
          <Input id="part-org" value={organization} onChange={e => setOrganization(e.target.value)}
            placeholder="z.B. Firmenname" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="part-bio">Biografie</Label>
          <Textarea id="part-bio" value={biography} onChange={e => setBiography(e.target.value)}
            placeholder="Kurzbiografie des Teilnehmers (verbessert die Übersetzungsqualität)..." rows={3} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="part-notes">Notizen</Label>
          <Textarea id="part-notes" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Interne Notizen..." rows={2} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Speichern...' : 'Hinzufügen'}</Button>
      </div>
    </form>
  )
}
