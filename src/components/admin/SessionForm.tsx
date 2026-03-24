import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createEventSession, updateEventSession } from '@/lib/session-management-api'
import { EVENT_SESSION_TYPES, type EventSession, type EventSessionType } from '@/lib/admin-types'
import { LANGUAGES } from '@/lib/languages'
import { useUser } from '@/context/UserContext'

interface SessionFormProps {
  session?: EventSession
  onSaved: (session: EventSession) => void
  onCancel: () => void
}

export default function SessionForm({ session, onSaved, onCancel }: SessionFormProps) {
  const { user } = useUser()
  const [title, setTitle] = useState(session?.title ?? '')
  const [description, setDescription] = useState(session?.description ?? '')
  const [type, setType] = useState<EventSessionType>(session?.type ?? 'session')
  const [sourceLanguage, setSourceLanguage] = useState(session?.source_language ?? 'de')
  const [targetLanguages, setTargetLanguages] = useState<string[]>(session?.target_languages ?? [])
  const [scheduledStart, setScheduledStart] = useState(
    session?.scheduled_start ? session.scheduled_start.slice(0, 16) : ''
  )
  const [scheduledEnd, setScheduledEnd] = useState(
    session?.scheduled_end ? session.scheduled_end.slice(0, 16) : ''
  )
  const [venue, setVenue] = useState(session?.venue ?? '')
  const [notes, setNotes] = useState(session?.notes ?? '')
  const [saving, setSaving] = useState(false)

  function toggleTargetLang(code: string) {
    setTargetLanguages(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title,
        description: description || null,
        type,
        source_language: sourceLanguage,
        target_languages: targetLanguages,
        scheduled_start: scheduledStart ? new Date(scheduledStart).toISOString() : null,
        scheduled_end: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
        venue: venue || null,
        notes: notes || null,
      }

      if (session) {
        await updateEventSession(session.id, payload)
        onSaved({ ...session, ...payload } as EventSession)
      } else {
        const created = await createEventSession({
          ...payload,
          created_by: user!.id,
        })
        onSaved(created)
      }
    } catch (err) {
      console.error('Save session failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const availableTargetLangs = LANGUAGES.filter(l => l.code !== sourceLanguage)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="session-title">Titel *</Label>
          <Input id="session-title" value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="z.B. Keynote - Digitalisierung im Tourismus" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="session-type">Typ</Label>
          <Select value={type} onValueChange={v => setType(v as EventSessionType)}>
            <SelectTrigger id="session-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_SESSION_TYPES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="session-venue">Ort / Raum</Label>
          <Input id="session-venue" value={venue} onChange={e => setVenue(e.target.value)}
            placeholder="z.B. Saal A, Kongresszentrum" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="session-start">Beginn</Label>
          <Input id="session-start" type="datetime-local" value={scheduledStart}
            onChange={e => setScheduledStart(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="session-end">Ende</Label>
          <Input id="session-end" type="datetime-local" value={scheduledEnd}
            onChange={e => setScheduledEnd(e.target.value)} />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="session-desc">Beschreibung</Label>
          <Textarea id="session-desc" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Kurze Beschreibung der Session..." rows={3} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="session-source-lang">Quellsprache</Label>
          <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
            <SelectTrigger id="session-source-lang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => (
                <SelectItem key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Zielsprachen ({targetLanguages.length} gewaehlt)</Label>
          <div className="border rounded-md p-2 max-h-[160px] overflow-y-auto space-y-1">
            {availableTargetLangs.map(lang => (
              <label key={lang.code} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded px-1">
                <input
                  type="checkbox"
                  checked={targetLanguages.includes(lang.code)}
                  onChange={() => toggleTargetLang(lang.code)}
                />
                <span>{lang.flag} {lang.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="session-notes">Interne Notizen</Label>
          <Textarea id="session-notes" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Interne Notizen (nicht oeffentlich)..." rows={2} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Speichern...' : session ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  )
}
