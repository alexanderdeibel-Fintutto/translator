import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPreTranslation } from '@/lib/session-management-api'
import {
  PRE_TRANSLATION_TYPES,
  type PreTranslation,
  type PreTranslationType,
  type SessionParticipant,
} from '@/lib/admin-types'
import { useUser } from '@/context/UserContext'

interface PreTranslationUploadProps {
  sessionId: string
  participants: SessionParticipant[]
  sourceLanguage: string
  onSaved: (doc: PreTranslation) => void
  onCancel: () => void
}

export default function PreTranslationUpload({
  sessionId,
  participants,
  sourceLanguage,
  onSaved,
  onCancel,
}: PreTranslationUploadProps) {
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<PreTranslationType>('speech')
  const [content, setContent] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setContent(text)
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, ''))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    try {
      const doc = await createPreTranslation({
        session_id: sessionId,
        participant_id: participantId || null,
        title,
        type,
        content,
        source_language: sourceLanguage,
        translations: {},
        translation_status: 'pending',
        uploaded_by: user?.id ?? null,
      })
      onSaved(doc)
    } catch (err) {
      console.error('Save pre-translation failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="pt-title">Titel *</Label>
          <Input id="pt-title" value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="z.B. Keynote-Rede Prof. Mueller" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-type">Dokumenttyp</Label>
          <Select value={type} onValueChange={v => setType(v as PreTranslationType)}>
            <SelectTrigger id="pt-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRE_TRANSLATION_TYPES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pt-participant">Zugeordneter Teilnehmer</Label>
          <Select value={participantId} onValueChange={setParticipantId}>
            <SelectTrigger id="pt-participant">
              <SelectValue placeholder="Keiner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Keiner</SelectItem>
              {participants.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name} ({p.role})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Datei hochladen (optional)</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Textdatei auswaehlen (.txt, .md, .csv)
              </span>
              <input
                type="file"
                accept=".txt,.md,.csv,.text"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="pt-content">
            Inhalt * {content.length > 0 && (
              <span className="text-muted-foreground font-normal">
                ({content.length.toLocaleString('de-DE')} Zeichen)
              </span>
            )}
          </Label>
          <Textarea
            id="pt-content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Fuegen Sie hier den Text des Vortrags, der Fragen, der Biografie oder des Glossars ein...

Durch Pre-Translation werden Uebersetzungen vorab vorbereitet. Das verbessert die Qualitaet erheblich und spart Kosten, da die Live-Uebersetzung auf vorbereitete Texte zurueckgreifen kann."
            rows={10}
            required
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
        <strong>Tipp:</strong> Je mehr Kontext Sie bereitstellen, desto besser wird die Uebersetzung.
        Laden Sie Vortraege, Biografien, Fachbegriffe und Moderationsfragen hoch.
        Die Texte werden vorab uebersetzt und stehen waehrend der Live-Session als Referenz zur Verfuegung.
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button type="submit" disabled={saving || !content.trim()}>
          {saving ? 'Speichern...' : 'Dokument speichern'}
        </Button>
      </div>
    </form>
  )
}
