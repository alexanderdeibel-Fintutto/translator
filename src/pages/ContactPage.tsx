// ContactPage — Kontaktformular mit Demo-Anfrage-Support
// Route: /kontakt · /kontakt?type=demo

import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Send, Mail, Building, Check, ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const PRODUCTS = [
  'Fintutto / GuideTranslator',
  'SmartGuide',
  'itour City Guide',
  'Smart Streaming / Voicetra',
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

const INPUT_CLASS = 'w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60'
const SELECT_CLASS = 'w-full rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-400/60'

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
      toast.error('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Fehler beim Senden')
      setSubmitted(true)
      toast.success('Nachricht gesendet! Wir melden uns innerhalb von 24 Stunden.')
    } catch {
      const subject = encodeURIComponent(`[${form.requestType || 'Kontakt'}] ${form.product || 'Allgemein'} — ${form.company || form.firstName}`)
      const body = encodeURIComponent(`Name: ${form.firstName} ${form.lastName}\nE-Mail: ${form.email}\nUnternehmen: ${form.company}\nTelefon: ${form.phone}\n\n${form.message}`)
      window.open(`mailto:info@itour.guide?subject=${subject}&body=${body}`)
      toast.info('E-Mail-Programm wird geöffnet...')
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const isDemo = typeParam === 'demo' || form.requestType === 'demo'

  if (submitted) {
    return (
      <div className="relative max-w-2xl mx-auto py-16 px-4 text-center text-white space-y-6">
        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold drop-shadow-lg">Vielen Dank!</h1>
          <p className="text-white/70">
            Ihre Nachricht wurde gesendet. Wir melden uns innerhalb von 24 Stunden.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/"><Button className="gap-2">Zum Übersetzer <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/solutions"><Button variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">Lösungen <ChevronRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative max-w-2xl mx-auto space-y-6 py-6 px-4 text-white">


      {/* Hero */}
      <div className="relative text-center space-y-3 py-8 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[220px] h-[220px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Kontakt
          </span>
          <h1 className="text-3xl font-bold drop-shadow-lg">
            {isDemo ? 'Demo anfragen' : 'Sprechen Sie mit uns.'}
          </h1>
          <p className="text-sm text-white/75 max-w-sm mx-auto drop-shadow">
            {isDemo
              ? 'Wir zeigen Ihnen Fintutto live — persönlich und auf Ihren Anwendungsfall zugeschnitten.'
              : 'Ob Demo, Angebot oder technische Frage — Antwort innerhalb von 24 Stunden.'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/80">Vorname *</label>
              <input type="text" required value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className={INPUT_CLASS} placeholder="Max" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/80">Nachname</label>
              <input type="text" value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className={INPUT_CLASS} placeholder="Mustermann" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/80">E-Mail *</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={INPUT_CLASS} placeholder="max@firma.de" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/80">Telefon</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className={INPUT_CLASS} placeholder="+49 ..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/80">Unternehmen</label>
            <input type="text" value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              className={INPUT_CLASS} placeholder="Firma GmbH (optional)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/80">Interesse an</label>
              <select value={form.product}
                onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                className={SELECT_CLASS}>
                <option value="">Bitte wählen...</option>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/80">Art der Anfrage</label>
              <select value={form.requestType}
                onChange={e => setForm(f => ({ ...f, requestType: e.target.value }))}
                className={SELECT_CLASS}>
                <option value="">Bitte wählen...</option>
                {REQUEST_TYPES.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-white/80">Nachricht *</label>
            <textarea required rows={4} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className={`${INPUT_CLASS} resize-none`}
              placeholder={isDemo
                ? 'Beschreiben Sie kurz Ihren Anwendungsfall — wir bereiten die Demo entsprechend vor.'
                : 'Ihre Nachricht...'
              }
            />
          </div>

          <p className="text-[11px] text-white/50">
            Ihre Daten werden nur zur Bearbeitung Ihrer Anfrage verwendet.{' '}
            <Link to="/datenschutz" className="underline hover:text-white/80">Datenschutzerklärung</Link>
          </p>

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {submitting ? 'Wird gesendet...' : (isDemo ? 'Demo anfragen' : 'Nachricht senden')}
          </Button>
        </form>
      </div>

      {/* Direct contact */}
      <div className="grid grid-cols-2 gap-2">
        <a href="mailto:info@itour.guide" className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 hover:bg-black/35 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-3.5 h-3.5 text-sky-300" />
            <span className="text-xs font-semibold">Allgemein</span>
          </div>
          <p className="text-[11px] text-sky-400">info@itour.guide</p>
        </a>
        <a href="mailto:enterprise@itour.guide" className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 hover:bg-black/35 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-3.5 h-3.5 text-sky-300" />
            <span className="text-xs font-semibold">Enterprise</span>
          </div>
          <p className="text-[11px] text-sky-400">enterprise@itour.guide</p>
        </a>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-2">
        <Link to="/solutions" className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 hover:bg-black/35 transition-colors text-center">
          <p className="text-xs font-semibold">Lösungen</p>
          <p className="text-[11px] text-white/60 mt-0.5">Alle Branchen</p>
        </Link>
        <Link to="/pricing" className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 hover:bg-black/35 transition-colors text-center">
          <p className="text-xs font-semibold">Preise</p>
          <p className="text-[11px] text-white/60 mt-0.5">Alle Pläne</p>
        </Link>
        <Link to="/features" className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 hover:bg-black/35 transition-colors text-center">
          <p className="text-xs font-semibold">Features</p>
          <p className="text-[11px] text-white/60 mt-0.5">Was wir können</p>
        </Link>
      </div>

    </div>
  )
}
