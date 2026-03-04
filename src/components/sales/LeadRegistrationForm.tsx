import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { CheckCircle2, UserPlus, LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createContactRequest } from '@/lib/admin-api'
import { useUser } from '@/context/UserContext'

interface LeadRegistrationFormProps {
  segment: string
  inviteToken?: string | null
  source?: string | null
}

interface InvitedLead {
  id: string
  name: string
  email: string
  company: string | null
}

export default function LeadRegistrationForm({ segment, inviteToken, source }: LeadRegistrationFormProps) {
  const { isAuthenticated } = useUser()
  const navigate = useNavigate()

  const [lead, setLead] = useState<InvitedLead | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mode: "register" if invite token → create account; "contact" if no token → just submit form
  const mode = inviteToken ? 'register' : 'contact'

  // Fetch lead data from invite token
  useEffect(() => {
    if (!inviteToken) return
    supabase
      .from('gt_leads')
      .select('id, name, email, company')
      .eq('invite_token', inviteToken)
      .single()
      .then(({ data }) => {
        if (data) {
          setLead(data as InvitedLead)
          setName(data.name)
          setEmail(data.email)
          setCompany(data.company ?? '')
        }
      })
  }, [inviteToken])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      if (mode === 'register') {
        // Create real account
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        })
        if (signUpError) throw signUpError

        // Update lead pipeline stage to 'registriert'
        if (lead) {
          await supabase
            .from('gt_leads')
            .update({
              pipeline_stage: 'registriert',
              ...(source ? { source } : {}),
            })
            .eq('id', lead.id)
        }

        // Also create contact request for tracking
        await createContactRequest({
          name,
          email,
          company: company || null,
          message: message || null,
          type: 'contact',
          segment,
          status: 'new',
          lead_id: lead?.id ?? null,
          source: source ?? null,
        })

        setSent(true)
      } else {
        // Contact form only (no invite token)
        await createContactRequest({
          name,
          email,
          company: company || null,
          message: message || null,
          type: 'contact',
          segment,
          status: 'new',
          lead_id: null,
          source: source ?? null,
        })
        setSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden')
    } finally {
      setSending(false)
    }
  }

  // Already logged in
  if (isAuthenticated) {
    return (
      <Card className="p-6 text-center space-y-3">
        <LogIn className="h-8 w-8 text-primary mx-auto" />
        <h3 className="text-sm font-medium">Sie sind bereits angemeldet.</h3>
        <Button size="sm" variant="outline" onClick={() => navigate('/account')}>
          Zum Konto
        </Button>
      </Card>
    )
  }

  if (sent) {
    return (
      <Card className="p-6 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
        <h3 className="text-lg font-semibold">
          {mode === 'register' ? 'Konto erstellt!' : 'Vielen Dank!'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {mode === 'register'
            ? 'Bitte bestaetigen Sie Ihre E-Mail-Adresse. Danach koennen Sie sich anmelden und die App testen.'
            : 'Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden bei Ihnen.'}
        </p>
        {mode === 'register' && (
          <Button size="sm" onClick={() => navigate('/auth')}>Zur Anmeldung</Button>
        )}
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">
          {mode === 'register' ? 'Testzugang erstellen' : 'Persoenliche Beratung anfordern'}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {mode === 'register'
          ? 'Erstellen Sie Ihr kostenloses Konto und testen Sie die App sofort.'
          : 'Wir erstellen Ihnen ein individuelles Angebot und zeigen Ihnen die Loesung in einer kurzen Demo.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Name *</Label>
            <Input id="reg-name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">E-Mail *</Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              readOnly={!!lead}
            />
          </div>
          <div className="col-span-full space-y-1.5">
            <Label htmlFor="reg-company">Firma</Label>
            <Input id="reg-company" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
        </div>
        {mode === 'register' && (
          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Passwort *</Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mind. 8 Zeichen"
            />
          </div>
        )}
        {mode === 'contact' && (
          <div className="space-y-1.5">
            <Label htmlFor="reg-message">Nachricht (optional)</Label>
            <Textarea
              id="reg-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Erzaehlen Sie uns kurz ueber Ihren Anwendungsfall..."
            />
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        <Button type="submit" className="w-full" disabled={sending}>
          {sending
            ? 'Wird verarbeitet...'
            : mode === 'register'
              ? 'Konto erstellen & testen'
              : 'Anfrage senden'}
        </Button>
      </form>
      {source && (
        <div className="text-[10px] text-muted-foreground text-right">
          Quelle: {source}
        </div>
      )}
    </Card>
  )
}
