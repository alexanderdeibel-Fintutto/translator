// ContactPage — Kontaktformular mit Demo-Anfrage-Support
// Route: /kontakt · /kontakt?type=demo

import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Send, Mail, Phone, MapPin, Building, Clock, ChevronRight,
  ArrowRight, Check, ExternalLink
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const PRODUCTS = [
  'GuideTranslator',
  'SmartGuide',
  'itour City Guide',
  'Smart Streaming / Voicetra',
  'River Guide',
  'Enterprise / Kreuzfahrt',
  'Allgemeine Anfrage',
]

const REQUEST_TYPES = [
  { value: 'demo', label: 'Demo vereinbaren' },
  { value: 'quote', label: 'Angebot anfragen' },
  { value: 'support', label: 'Technischer Support' },
  { value: 'partnership', label: 'Partnerschaft / Kooperation' },
  { value: 'other', label: 'Sonstiges' },
]

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type') || ''
  const productParam = searchParams.get('product') || ''

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    product: productParam || '',
    requestType: typeParam || '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.firstName || !form.message) {
      toast.error('Bitte fuellen Sie alle Pflichtfelder aus.')
      return
    }
    setSubmitting(true)
    try {
      // Submit to lead registration endpoint
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Fehler beim Senden')
      setSubmitted(true)
      toast.success('Nachricht gesendet! Wir melden uns innerhalb von 24 Stunden.')
    } catch {
      // Fallback: mailto link
      const subject = encodeURIComponent(`[${form.requestType || 'Kontakt'}] ${form.product || 'Allgemein'} — ${form.company || form.firstName}`)
      const body = encodeURIComponent(`Name: ${form.firstName} ${form.lastName}\nE-Mail: ${form.email}\nUnternehmen: ${form.company}\nTelefon: ${form.phone}\n\n${form.message}`)
      window.open(`mailto:info@itour.guide?subject=${subject}&body=${body}`)
      toast.info('E-Mail-Programm wird geoeffnet...')
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const isDemo = typeParam === 'demo' || form.requestType === 'demo'

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold">Vielen Dank!</h1>
        <p className="text-muted-foreground">
          Ihre Nachricht wurde gesendet. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="gap-2">
              Zum Uebersetzer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/solutions">
            <Button variant="outline" className="gap-2">
              Loesungen ansehen
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold">
          {isDemo ? 'Demo anfragen' : 'Sprechen Sie mit uns.'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {isDemo
            ? 'Vereinbaren Sie eine persoenliche Demo — wir zeigen Ihnen GuideTranslator live und beantworten alle Fragen.'
            : 'Ob Demo, individuelles Angebot oder technische Frage — wir antworten innerhalb von 24 Stunden.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="sm:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Vorname *</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Max"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nachname</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">E-Mail *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="max@firma.de"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Telefon</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="+49 ..."
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Unternehmen</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Firma GmbH (optional)"
                />
              </div>

              {/* Product + Request Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Interesse an</label>
                  <select
                    value={form.product}
                    onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Bitte waehlen...</option>
                    {PRODUCTS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Art der Anfrage</label>
                  <select
                    value={form.requestType}
                    onChange={e => setForm(f => ({ ...f, requestType: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Bitte waehlen...</option>
                    {REQUEST_TYPES.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Nachricht *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder={isDemo
                    ? 'Beschreiben Sie kurz Ihren Anwendungsfall — wir bereiten die Demo entsprechend vor.'
                    : 'Ihre Nachricht...'
                  }
                />
              </div>

              {/* DSGVO */}
              <p className="text-xs text-muted-foreground">
                Ihre Daten werden nur zur Bearbeitung Ihrer Anfrage verwendet.
                Mehr in unserer{' '}
                <Link to="/datenschutz" className="underline hover:text-foreground">
                  Datenschutzerklaerung
                </Link>.
              </p>

              {/* Submit */}
              <Button type="submit" disabled={submitting} className="w-full gap-2">
                <Send className="w-4 h-4" />
                {submitting ? 'Wird gesendet...' : (isDemo ? 'Demo anfragen' : 'Nachricht senden')}
              </Button>
            </form>
          </Card>
        </div>

        {/* Contact info sidebar */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold">Direktkontakt</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Allgemein</p>
                  <a href="mailto:info@itour.guide" className="text-muted-foreground hover:text-foreground text-xs">
                    info@itour.guide
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Enterprise</p>
                  <a href="mailto:enterprise@itour.guide" className="text-muted-foreground hover:text-foreground text-xs">
                    enterprise@itour.guide
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Telefon</p>
                  <a href="tel:+493044040740" className="text-muted-foreground hover:text-foreground text-xs">
                    +49 30 440 40 740
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Adresse</p>
                  <p className="text-xs text-muted-foreground">
                    ai tour UG (haftungsbeschraenkt)<br />
                    Kolonie 2<br />
                    18317 Saal<br />
                    Deutschland
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-sm">Ansprechpartner</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">Alexander Deibel</p>
                <p className="text-xs text-muted-foreground">CEO/CTO</p>
                <a href="mailto:alexander.deibel@itour.guide" className="text-xs text-primary hover:underline">
                  alexander.deibel@itour.guide
                </a>
              </div>
              <div className="text-sm">
                <p className="font-medium">Ulrich Berger</p>
                <p className="text-xs text-muted-foreground">CMO</p>
                <a href="mailto:ulrich.berger@itour.guide" className="text-xs text-primary hover:underline">
                  ulrich.berger@itour.guide
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Antwortzeit</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Wir antworten in der Regel innerhalb von 24 Stunden.
              Fuer Enterprise-Anfragen oft noch am selben Tag.
            </p>
          </Card>

          {/* Enterprise sales link */}
          <a
            href="https://sales.guidetranslator.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="p-5 space-y-2 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Enterprise Sales Tool</h3>
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                ROI berechnen und individuelle Angebote fuer Flotten und Grossunternehmen erhalten.
              </p>
            </Card>
          </a>
        </div>
      </div>
    </div>
  )
}
