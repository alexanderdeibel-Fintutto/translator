import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { CheckCircle2, UserPlus } from 'lucide-react'
import { createContactRequest } from '@/lib/admin-api'

interface LeadRegistrationFormProps {
  segment: string
  prefill?: { name?: string; email?: string; company?: string }
}

export default function LeadRegistrationForm({ segment, prefill }: LeadRegistrationFormProps) {
  const [name, setName] = useState(prefill?.name ?? '')
  const [email, setEmail] = useState(prefill?.email ?? '')
  const [company, setCompany] = useState(prefill?.company ?? '')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      await createContactRequest({
        name,
        email,
        company: company || null,
        message: message || null,
        type: 'contact',
        segment,
        status: 'new',
        lead_id: null,
      })
      setSent(true)
    } catch (err) {
      console.error('Contact request failed:', err)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <Card className="p-6 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
        <h3 className="text-lg font-semibold">Vielen Dank!</h3>
        <p className="text-sm text-muted-foreground">
          Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Persoenliche Beratung anfordern</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Wir erstellen Ihnen ein individuelles Angebot und zeigen Ihnen die Loesung in einer kurzen Demo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Name *</Label>
            <Input id="reg-name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">E-Mail *</Label>
            <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="col-span-full space-y-1.5">
            <Label htmlFor="reg-company">Firma</Label>
            <Input id="reg-company" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-message">Nachricht (optional)</Label>
          <Textarea id="reg-message" value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Erzaehlen Sie uns kurz ueber Ihren Anwendungsfall..." />
        </div>
        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? 'Wird gesendet...' : 'Anfrage senden'}
        </Button>
      </form>
    </Card>
  )
}
