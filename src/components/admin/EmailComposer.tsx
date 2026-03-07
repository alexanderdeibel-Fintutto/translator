import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { createNote } from '@/lib/admin-api'
import { useUser } from '@/context/UserContext'
import type { Lead, LeadNote } from '@/lib/admin-types'
import type { EmailTemplate } from '@/lib/email-templates'
import { EMAIL_TEMPLATES, renderTemplate } from '@/lib/email-templates'
import { Send } from 'lucide-react'

interface EmailComposerProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  onSent: (note: LeadNote) => void
}

export default function EmailComposer({ lead, open, onOpenChange, onSent }: EmailComposerProps) {
  const { user } = useUser()
  const [templateIdx, setTemplateIdx] = useState('0')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function applyTemplate(idx: string) {
    setTemplateIdx(idx)
    const template = EMAIL_TEMPLATES[parseInt(idx, 10)]
    if (!template) return
    const vars: Record<string, string> = {
      name: lead.name,
      company: lead.company ?? '',
      link: lead.invite_token
        ? `${window.location.origin}/sales/${lead.segment}?invite=${lead.invite_token}`
        : `${window.location.origin}/sales/${lead.segment}`,
    }
    const rendered = renderTemplate(template, vars)
    setSubject(rendered.subject)
    setBody(rendered.body)
  }

  async function handleSend() {
    setSending(true)
    setError(null)
    try {
      const { error: fnError } = await supabase.functions.invoke('send-email', {
        body: { to: lead.email, subject, body },
      })
      if (fnError) throw fnError

      const note = await createNote({
        lead_id: lead.id,
        author_id: user?.id ?? null,
        type: 'email',
        content: `Betreff: ${subject}\n\n${body}`,
        follow_up_at: null,
      })
      onSent(note)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>E-Mail an {lead.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Vorlage</Label>
            <Select value={templateIdx} onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Vorlage wählen..." />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map((t, i) => (
                  <SelectItem key={i} value={i.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>An</Label>
            <Input value={lead.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Betreff</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Nachricht</Label>
            <Textarea value={body} onChange={e => setBody(e.target.value)} rows={8} />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleSend} disabled={sending || !subject || !body} className="gap-1.5">
            <Send className="h-4 w-4" />
            {sending ? 'Sende...' : 'Senden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
